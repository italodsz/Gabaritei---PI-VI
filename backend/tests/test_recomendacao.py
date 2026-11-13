"""Politica de recomendacao (sem banco): filtros, bloqueios, duplicacao, falta de candidatos, adaptativo."""
from __future__ import annotations

import itertools

import pytest

from gabaritei_rec.perfil import estimar_perfil_area
from gabaritei_rec.psicometria import Evidencia
from gabaritei_rec.recomendacao import Contexto, Pedido, recomendar

AREAS = ("CH", "CN", "LC", "MT")


@pytest.mark.parametrize("area,dif,lingua", list(itertools.product(AREAS, ("facil", "media", "dificil"), ("pt", "en", "es"))))
def test_filtros_area_lingua_dificuldade(cat, cfg, area, dif, lingua):
    r = recomendar(cat, Pedido("nivel", area, 10, lingua=lingua, dificuldade=dif), Contexto(), cfg, 7)
    for s in r.itens:
        it = s.item
        assert (it.area, it.lingua, it.faixa) == (area, lingua, dif)
        assert it.ofertavel and not it.motivos_indisponivel and not it.triagem_excluir
    if lingua != "pt" and area != "LC":
        assert r.status == "sem_candidatos" and r.limitacao["etapa_mais_restritiva"] == "lingua"


def test_filtro_formato_e_habilidade(cat, cfg):
    r = recomendar(cat, Pedido("nivel", "MT", 8, dificuldade="media", formatos=["adapted_accessible"]), Contexto(), cfg, 1)
    assert r.itens and all(s.item.formato == "adapted_accessible" for s in r.itens)
    hab = next(it.habilidade_chave for it in cat.ofertaveis() if it.area == "MT" and it.habilidade_chave)
    r = recomendar(cat, Pedido("nivel", "MT", 20, dificuldade="facil", habilidade=hab), Contexto(), cfg, 1)
    assert all(s.item.habilidade_chave == hab for s in r.itens)


def test_sem_duplicacao_de_grupo_e_sem_recentes(cat, cfg):
    recentes = [it for it in cat.ofertaveis() if it.area == "CH" and it.faixa == "facil"][:30]
    ctx = Contexto(recentes_ids={it.id for it in recentes}, recentes_grupos={it.grupo_conteudo for it in recentes})
    r = recomendar(cat, Pedido("nivel", "CH", 20, dificuldade="facil"), ctx, cfg, 3)
    grupos = [s.item.grupo_conteudo for s in r.itens]
    assert len(grupos) == len(set(grupos))
    assert not ({s.item.id for s in r.itens} & ctx.recentes_ids)
    assert not (set(grupos) & ctx.recentes_grupos)


def test_falta_de_candidatos_nao_troca_nivel(cat, cfg):
    # LC em ingles, dificil: poucos itens -> parcial, sem completar com outro nivel/lingua
    r = recomendar(cat, Pedido("nivel", "LC", 20, lingua="en", dificuldade="dificil"), Contexto(), cfg, 5)
    assert r.status in ("parcial", "sem_candidatos")
    assert r.limitacao["solicitado"] == 20 and r.limitacao["entregue"] == len(r.itens) < 20
    assert all(s.item.faixa == "dificil" and s.item.lingua == "en" for s in r.itens)
    # esgotando via exposicao recente: nada de itens bloqueados para completar
    todos = [it for it in cat.itens.values() if it.area == "LC" and it.lingua == "en"]
    ctx = Contexto(recentes_ids={it.id for it in todos if it.ofertavel})
    r2 = recomendar(cat, Pedido("nivel", "LC", 5, lingua="en", dificuldade="dificil"), ctx, cfg, 5)
    assert r2.status == "sem_candidatos" and r2.itens == []


def test_deterministico_com_semente(cat, cfg):
    p = Pedido("nivel", "CN", 10, dificuldade="media")
    a = [s.item.id for s in recomendar(cat, p, Contexto(), cfg, 42).itens]
    b = [s.item.id for s in recomendar(cat, p, Contexto(), cfg, 42).itens]
    assert a == b


def test_pedido_invalido(cat, cfg):
    assert recomendar(cat, Pedido("nivel", "XX", 5, dificuldade="facil"), Contexto(), cfg, 1).status == "pedido_invalido"
    assert recomendar(cat, Pedido("nivel", "MT", 5), Contexto(), cfg, 1).status == "pedido_invalido"
    assert recomendar(cat, Pedido("nivel", "MT", 0, dificuldade="facil"), Contexto(), cfg, 1).status == "pedido_invalido"


def _ctx_com_perfil(cat, cfg, area, n, acerta_ate_b):
    itens = [it for it in cat.ofertaveis() if it.area == area and it.formato == "standard" and it.tipo_aplicacao == "regular"][:n]
    ev = [Evidencia(it.a, it.b, it.c, it.b <= acerta_ate_b) for it in itens]
    estado, est = estimar_perfil_area(area, ev, cfg)
    return Contexto(perfil={area: estado}, estimativas={area: est}), estado


def test_adaptativo_exige_aceite_experimental(cat, cfg):
    r = recomendar(cat, Pedido("adaptativo", "MT", 5), Contexto(), cfg, 1)
    assert r.status == "adaptativo_indisponivel" and r.itens == []


def test_adaptativo_historico_vazio(cat, cfg):
    estado, est = estimar_perfil_area("MT", [], cfg)
    ctx = Contexto(perfil={"MT": estado}, estimativas={"MT": est})
    r = recomendar(cat, Pedido("adaptativo", "MT", 5, aceitar_experimental=True), ctx, cfg, 1)
    assert r.status == "perfil_insuficiente" and r.itens == []
    assert "diagnostico" in " ".join(r.limitacao["opcoes"])
    d = recomendar(cat, Pedido("diagnostico", "MT", 6), ctx, cfg, 1)
    assert d.status == "ok" and len({s.item.faixa for s in d.itens}) == 3


def test_adaptativo_respeita_faixa_de_probabilidade(cat, cfg):
    ctx, estado = _ctx_com_perfil(cat, cfg, "CH", 40, acerta_ate_b=1.0)
    assert estado.status == "suficiente"
    r = recomendar(cat, Pedido("adaptativo", "CH", 10, aceitar_experimental=True), ctx, cfg, 9)
    lo, hi = cfg["recomendacao"]["faixa_prob_alvo"]
    assert r.experimental and r.itens
    for s in r.itens:
        assert lo <= s.prob_prevista <= hi
        assert s.item.formato == "standard" and s.item.tipo_aplicacao == "regular"
        assert s.razao["experimental"] is True


def test_razao_registrada(cat, cfg):
    r = recomendar(cat, Pedido("nivel", "MT", 3, dificuldade="dificil"), Contexto(), cfg, 2)
    for s in r.itens:
        assert s.razao["modo"] == "nivel" and "faixa_pedida=dificil" in s.razao["criterios"]
        assert s.razao["cortes_versao"] == cat.cortes["versao"]
