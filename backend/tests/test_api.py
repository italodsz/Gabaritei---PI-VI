"""API e servico: gabarito, correcao no servidor, idempotencia, concorrencia, perfil, tipos de tentativa, versoes.
Todos os alunos e respostas aqui sao SINTETICOS."""
from __future__ import annotations

import dataclasses
import json
import threading

import pytest
from sqlalchemy import func, select

from gabaritei_rec.catalogo import Catalogo
from gabaritei_rec.db import Perfil, Tentativa, criar_engine, criar_fabrica
from gabaritei_rec.perfil import estimar_perfil_area
from gabaritei_rec.psicometria import Evidencia
from gabaritei_rec.recomendacao import Pedido
from gabaritei_rec.servico import ErroServico, Servico

from .conftest import item_escala


def _sessao(client, modo="nivel"):
    return client.post("/sessoes", json={"modo": modo}).json()


def _rec(client, sid, **kw):
    body = {"area": "MT", "dificuldade": "media", "quantidade": 3, "semente": 1, **kw}
    return client.post(f"/sessoes/{sid}/recomendacoes", json=body).json()


def _apresentar(client, rec_item_id):
    return client.post("/apresentacoes", json={"recomendacao_item_id": rec_item_id}).json()


def test_gabarito_nao_exposto_antes_do_envio(client, cat):
    s = _sessao(client)
    r = _rec(client, s["sessao_id"])
    texto_rec = json.dumps(r)
    assert '"gabarito"' not in texto_rec and '"answer"' not in texto_rec
    ap = _apresentar(client, r["itens"][0]["recomendacao_item_id"])
    assert "gabarito" not in json.dumps(ap) and "answer" not in json.dumps(ap)
    assert set(ap["questao"]) == {"questao_id", "versao_id", "area", "lingua", "formato", "ano", "habilidade", "faixa",
                                  "enunciado", "alternativas"}
    # apos o envio o gabarito e devolvido
    out = client.post(f"/apresentacoes/{ap['apresentacao_id']}/resposta", json={"alternativa": "A"}).json()
    assert out["gabarito"] == cat.itens[ap["questao"]["questao_id"]].gabarito


def test_correcao_no_servidor_e_rejeita_is_correct(client, cat):
    s = _sessao(client)
    r = _rec(client, s["sessao_id"])
    ap = _apresentar(client, r["itens"][0]["recomendacao_item_id"])
    it = cat.itens[ap["questao"]["questao_id"]]
    errada = next(l for l in "ABCDE" if l != it.gabarito)
    resp = client.post(f"/apresentacoes/{ap['apresentacao_id']}/resposta",
                       json={"alternativa": errada, "is_correct": True})
    assert resp.status_code == 422
    resp = client.post(f"/apresentacoes/{ap['apresentacao_id']}/resposta", json={"alternativa": errada, "correta": True})
    assert resp.status_code == 422
    out = client.post(f"/apresentacoes/{ap['apresentacao_id']}/resposta", json={"alternativa": errada}).json()
    assert out["correta"] is False
    ap2 = _apresentar(client, r["itens"][1]["recomendacao_item_id"])
    it2 = cat.itens[ap2["questao"]["questao_id"]]
    out2 = client.post(f"/apresentacoes/{ap2['apresentacao_id']}/resposta", json={"alternativa": it2.gabarito}).json()
    assert out2["correta"] is True


def _apresentar_escala(svc, sid, it):
    return svc.apresentar_questao(sid, it.id)["apresentacao_id"]


def test_idempotencia_resposta(svc, cat):
    s = svc.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = _apresentar_escala(svc, s["sessao_id"], it)
    o1 = svc.responder(ap, it.gabarito, chave_idempotencia="k-1")
    assert o1["conta_para_perfil"] and not o1["replay_idempotente"]
    v1 = o1["perfil_area"]["versao"]
    o2 = svc.responder(ap, it.gabarito, chave_idempotencia="k-1")
    assert o2["replay_idempotente"] and o2["tentativa_id"] == o1["tentativa_id"]
    with svc.fabrica() as db:
        assert db.scalar(select(func.count()).select_from(Tentativa)) == 1
        p = db.get(Perfil, (s["aluno_id"], it.area))
        assert p.versao == v1 and p.n_evidencias == 1
    with pytest.raises(ErroServico) as e:
        svc.responder(ap, next(l for l in "ABCDE" if l != it.gabarito))
    assert e.value.codigo == 409


def test_concorrencia_mesma_resposta(tmp_path, cat, cfg):
    svc = Servico(cat, cfg, criar_fabrica(criar_engine(f"sqlite:///{tmp_path / 'c.db'}")))
    s = svc.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = _apresentar_escala(svc, s["sessao_id"], it)
    resultados, erros = [], []

    def enviar():
        try:
            resultados.append(svc.responder(ap, it.gabarito))
        except Exception as e:  # pragma: no cover
            erros.append(e)

    th = [threading.Thread(target=enviar) for _ in range(8)]
    [t.start() for t in th]
    [t.join() for t in th]
    assert not erros
    assert sum(1 for r in resultados if not r["replay_idempotente"]) == 1
    with svc.fabrica() as db:
        assert db.scalar(select(func.count()).select_from(Tentativa)) == 1
        assert db.get(Perfil, (s["aluno_id"], it.area)).n_evidencias == 1


def test_concorrencia_respostas_diferentes_mesma_area(tmp_path, cat, cfg):
    svc = Servico(cat, cfg, criar_fabrica(criar_engine(f"sqlite:///{tmp_path / 'd.db'}")))
    s = svc.criar_sessao(None, "nivel")
    itens = list({it.grupo_conteudo: it for it in cat.ofertaveis()
                  if it.area == "CH" and it.formato == "standard" and it.tipo_aplicacao == "regular"}.values())[:6]
    aps = [_apresentar_escala(svc, s["sessao_id"], it) for it in itens]
    erros = []

    def enviar(ap, it):
        try:
            svc.responder(ap, it.gabarito)
        except Exception as e:  # pragma: no cover
            erros.append(e)

    th = [threading.Thread(target=enviar, args=(ap, it)) for ap, it in zip(aps, itens)]
    [t.start() for t in th]
    [t.join() for t in th]
    assert not erros
    with svc.fabrica() as db:
        p = db.get(Perfil, (s["aluno_id"], "CH"))
        assert p.n_evidencias == 6  # nenhuma atualizacao perdida
        est, _ = estimar_perfil_area("CH", [Evidencia(it.a, it.b, it.c, True) for it in itens], cfg)
        assert p.theta == pytest.approx(est.theta, abs=1e-6)


def test_perfil_consistente_com_recalculo(svc, cat, cfg):
    s = svc.criar_sessao(None, "nivel")
    itens, grupos = [], set()
    for it in cat.ofertaveis():  # grupos distintos: variantes do mesmo grupo seriam (corretamente) "exposicao"
        if (it.area, it.lingua, it.formato, it.tipo_aplicacao) == ("LC", "pt", "standard", "regular") and it.grupo_conteudo not in grupos:
            itens.append(it)
            grupos.add(it.grupo_conteudo)
    itens = itens[:12]
    ev = []
    for k, it in enumerate(itens):
        ap = _apresentar_escala(svc, s["sessao_id"], it)
        alt = it.gabarito if k % 3 else next(l for l in "ABCDE" if l != it.gabarito)
        svc.responder(ap, alt)
        ev.append(Evidencia(it.a, it.b, it.c, alt == it.gabarito))
    prog = svc.progresso(s["aluno_id"])["por_area"]
    est, _ = estimar_perfil_area("LC", ev, cfg)
    assert prog["LC"]["perfil"]["theta"] == pytest.approx(est.theta, abs=1e-6)
    assert prog["LC"]["perfil"]["n_evidencias"] == 12
    assert prog["MT"]["perfil"]["status"] == "sem_historico"  # areas nao se misturam


def test_variante_do_mesmo_grupo_nao_conta_apos_exposicao(svc, cat):
    import collections
    por_grupo = collections.defaultdict(list)
    for it in cat.ofertaveis():
        por_grupo[it.grupo_conteudo].append(it)
    x, y = next(v for v in por_grupo.values() if len(v) > 1)[:2]
    s = svc.criar_sessao(None, "nivel")
    svc.responder(svc.apresentar_questao(s["sessao_id"], x.id)["apresentacao_id"], x.gabarito)
    o = svc.responder(svc.apresentar_questao(s["sessao_id"], y.id)["apresentacao_id"], y.gabarito)
    assert o["tipo"] == "repeticao" and not o["conta_para_perfil"] and o["gabarito_exposto_antes"] and o["gabarito_exposto_antes"]


def test_historico_vazio(client):
    s = _sessao(client, "adaptativo")
    prog = client.get(f"/alunos/{s['aluno_id']}/progresso").json()
    assert all(v["perfil"]["status"] == "sem_historico" for v in prog["por_area"].values())
    r = client.post(f"/sessoes/{s['sessao_id']}/recomendacoes",
                    json={"area": "CN", "modo": "adaptativo", "quantidade": 5, "aceitar_experimental": True}).json()
    assert r["status"] == "perfil_insuficiente" and r["itens"] == []
    d = client.post(f"/sessoes/{s['sessao_id']}/recomendacoes",
                    json={"area": "CN", "modo": "diagnostico", "quantidade": 6}).json()
    assert d["status"] == "ok" and len(d["itens"]) == 6


def test_primeira_dica_revisao_exposicao_e_pulo(svc, cat):
    s = svc.criar_sessao(None, "nivel")
    sid = s["sessao_id"]
    pool = list({it.grupo_conteudo: it for it in cat.ofertaveis()
                 if it.area == "MT" and it.formato == "standard" and it.tipo_aplicacao == "regular"}.values())
    a, b, c, d = pool[:4]
    # pulo nao e erro e nao consome a "primeira tentativa"
    ap = _apresentar_escala(svc, sid, a)
    pul = svc.pular(ap)
    assert pul["pulada"] and pul["tipo"] == "pulada" and not pul["conta_para_perfil"] and "correta" not in pul
    assert svc.pular(ap)["replay_idempotente"]
    o = svc.responder(_apresentar_escala(svc, sid, a), a.gabarito)
    assert o["tipo"] == "primeira_sem_ajuda" and o["conta_para_perfil"]
    # repeticao
    o = svc.responder(_apresentar_escala(svc, sid, a), a.gabarito)
    assert o["tipo"] == "repeticao" and not o["conta_para_perfil"] and o["gabarito_exposto_antes"]
    # dica (registrada no servidor)
    ap = _apresentar_escala(svc, sid, b)
    svc.registrar_dica(ap)
    o = svc.responder(ap, b.gabarito)
    assert o["tipo"] == "primeira_com_dica" and not o["conta_para_perfil"]
    # exposicao previa ao gabarito
    ap = _apresentar_escala(svc, sid, c)
    assert svc.revelar_gabarito(ap)["gabarito"] == c.gabarito
    o = svc.responder(ap, c.gabarito)
    assert o["tipo"] == "apos_exposicao_gabarito" and not o["conta_para_perfil"]
    # primeira sem ajuda normal
    assert svc.responder(_apresentar_escala(svc, sid, d), "A")["tipo"] == "primeira_sem_ajuda"
    prog = svc.progresso(s["aluno_id"])["por_area"]["MT"]
    assert prog["perfil"]["n_evidencias"] == 2
    assert prog["puladas"] == 1


def test_pulo_depois_de_resposta_conflita(svc, cat):
    s = svc.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = _apresentar_escala(svc, s["sessao_id"], it)
    svc.responder(ap, "B")
    with pytest.raises(ErroServico) as e:
        svc.pular(ap)
    assert e.value.codigo == 409


def test_preserva_versao_apresentada(cat, cfg):
    """Se o catalogo muda (novo gabarito => nova versao), a tentativa usa a versao apresentada."""
    fabrica = criar_fabrica(criar_engine("sqlite://"))
    svc1 = Servico(cat, cfg, fabrica)
    s = svc1.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = svc1.apresentar_questao(s["sessao_id"], it.id)
    assert ap["questao"]["versao_id"] == it.versao_id
    novo_gab = next(l for l in "ABCDE" if l != it.gabarito)
    it2 = dataclasses.replace(it, gabarito=novo_gab, versao_id=it.versao_id.rsplit(":", 1)[0] + ":novaversao")
    itens2 = [it2 if x.id == it.id else x for x in cat.itens.values()]
    svc2 = Servico(Catalogo(itens2, cat.manifesto, cat.cortes), cfg, fabrica)
    out = svc2.responder(ap["apresentacao_id"], it.gabarito)  # gabarito da versao ORIGINAL
    assert out["correta"] is True and out["versao_id"] == it.versao_id
    with fabrica() as db:
        t = db.scalars(select(Tentativa)).one()
        assert t.versao_item_id == it.versao_id and t.politica_versao == svc1.politica


def test_recomendacao_registra_versoes_e_razao(svc):
    s = svc.criar_sessao(None, "nivel")
    r = svc.recomendar(s["sessao_id"], Pedido("nivel", "CN", 4, dificuldade="facil"), semente=11)
    assert r["status"] == "ok" and r["semente"] == 11
    assert r["politica_versao"] == svc.politica and r["cortes_versao"] == svc.cat.cortes["versao"]
    assert all(i["razao"]["modo"] == "nivel" for i in r["itens"])
    # a mesma sessao nao recebe itens repetidos em pedidos seguintes
    r2 = svc.recomendar(s["sessao_id"], Pedido("nivel", "CN", 4, dificuldade="facil"), semente=11)
    assert not ({i["questao_id"] for i in r["itens"]} & {i["questao_id"] for i in r2["itens"]})


def test_prob_prevista_registrada_antes_da_resposta(svc, cat):
    s = svc.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = svc.apresentar_questao(s["sessao_id"], it.id)["apresentacao_id"]
    out = svc.responder(ap, it.gabarito)
    assert out["prob_prevista_antes"] is not None and 0 < out["prob_prevista_antes"] < 1


def test_progresso_e_saude(client):
    assert client.get("/saude").json()["adaptativo"]["D_confirmado"] is False
    assert client.get("/alunos/inexistente/progresso").status_code == 404
