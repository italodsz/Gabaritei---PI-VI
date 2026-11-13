"""Importacao, qualidade, elegibilidade, bloqueios, triagem e cortes."""
from __future__ import annotations

import json
import shutil

import pytest

from gabaritei_rec import importacao
from gabaritei_rec.config import sha256_obj
from gabaritei_rec.psicometria import calcular_cortes


def test_auditoria_aprovada_e_contagens(artefatos):
    _, rel = artefatos
    assert rel["resultado"] == "aprovado"
    c = rel["contagens"]
    assert c["catalogo"] == 2971
    assert c["elegiveis"] == {"train": 1801, "validation": 136, "test": 126}
    assert c["por_split"] == {"train": 2616, "validation": 177, "test": 178}
    assert all(ch["status"] != "falha" for ch in rel["checagens"])


def test_bloqueados_e_inelegiveis_nunca_ofertaveis(cat, dataset_bruto):
    eleg = {i for v in dataset_bruto["elegiveis"].values() for i in v}
    bloq = {b["id"] for b in dataset_bruto["bloqueios"]}
    assert bloq, "arquivo de bloqueios deveria ter itens"
    for it in cat.ofertaveis():
        assert it.id in eleg
        assert it.id not in bloq
        assert "alerta_grave_texto" not in it.motivos_indisponivel
    for b in bloq:
        assert not cat.itens[b].ofertavel and "bloqueado" in cat.itens[b].motivos_indisponivel


def test_ready_multimodal_nao_garante_midia(cat, dataset_bruto):
    rows = {r["id"]: r for r in dataset_bruto["rows"]}
    sem_midia = [it for it in cat.itens.values() if "midia_ausente" in it.motivos_indisponivel]
    assert sem_midia, "esperado: itens multimodais sem arquivo local"
    assert any(rows[it.id]["ready_multimodal"] for it in sem_midia)
    assert not any(it.ofertavel for it in sem_midia)


def test_triagem_preserva_valores_e_registra(artefatos, cat):
    _, rel = artefatos
    alvo = "gq_cf15f16c076fceccbc04a730"  # b=61.05, a=0.019
    exc = {e["id"]: e for e in rel["triagem_tri"]["excluidos"]}
    assert alvo in exc and "dificuldade_alta_com_discriminacao_baixa" in exc[alvo]["motivos"]
    it = cat.itens[alvo]
    assert it.b == pytest.approx(61.05459) and it.a == pytest.approx(0.01929)  # nao corrigido
    assert it.faixa is None and not it.ofertavel


def test_cortes_usam_somente_treino_aprovado(artefatos, cat):
    _, rel = artefatos
    cortes = rel["cortes"]
    assert cortes["splits_usados"] == ["train"]
    ids = sorted(it.id for it in cat.itens.values()
                 if it.split == "train" and it.disponivel and not it.triagem_excluir)
    assert cortes["ids_ajuste_sha256"] == sha256_obj(ids)


def test_calcular_cortes_rejeita_validacao_ou_teste(cfg):
    itens = [{"id": f"x{i}", "split": "train", "area": a, "tri": {"b": float(i)}} for a in ("CH", "CN", "LC", "MT") for i in range(6)]
    itens.append({"id": "v", "split": "validation", "area": "MT", "tri": {"b": 9.0}})
    with pytest.raises(ValueError):
        calcular_cortes(itens, cfg["dificuldade"], "sha", "t")


def test_cortes_reprodutiveis(artefatos, tmp_path, cfg):
    d1, rel1 = artefatos
    rel2 = importacao.executar(None, tmp_path, cfg)
    assert rel1["cortes"] == rel2["cortes"]
    c1 = json.load(open(d1 / "catalogo.json", encoding="utf-8"))["itens"]
    c2 = json.load(open(tmp_path / "catalogo.json", encoding="utf-8"))["itens"]
    assert c1 == c2


def test_alterar_validacao_e_teste_nao_muda_cortes(tmp_path, cfg, dataset_bruto):
    """Sem vazamento: mudar b de itens de validacao/teste nao altera os cortes.
    O catalogo de alertas e vinculado ao hash do corpus (deixa de valer num corpus alterado); para isolar
    a variavel, as duas execucoes rodam sem ele."""
    import copy
    cfg = copy.deepcopy(cfg)
    cfg["qualidade"]["usar_alerta_grave_catalogo_conteudo"] = False
    rel = importacao.executar(dataset_bruto["dir"], tmp_path / "base", cfg)
    ds2 = tmp_path / "ds"
    shutil.copytree(dataset_bruto["dir"], ds2)
    linhas = []
    for r in dataset_bruto["rows"]:
        r = dict(r)
        if r["split"] in ("validation", "test"):
            r["tri"] = {**r["tri"], "b": r["tri"]["b"] + 5.0}
        linhas.append(json.dumps(r, ensure_ascii=False))
    (ds2 / "data" / "questions.jsonl").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    rel2 = importacao.executar(ds2, tmp_path / "out", cfg, estrito=False)  # hash difere de proposito
    assert any(c["checagem"] == "sha256_questions_confere" and c["status"] == "falha" for c in rel2["checagens"])
    assert rel2["cortes"]["cortes"] == rel["cortes"]["cortes"]
    assert rel2["cortes"]["ids_ajuste_sha256"] == rel["cortes"]["ids_ajuste_sha256"]


def test_validacao_de_schema():
    ok = {"id": "gq_" + "a" * 24, "area": "MT", "language": "pt", "question": "q", "answer": "B", "year": 2020,
          "split": "train", "tri": {"a": 1.0, "b": 0.0, "c": 0.2},
          "options": [{"label": l, "text": f"t{l}"} for l in "ABCDE"]}
    assert importacao.validar_item(ok) == []
    assert "gabarito_invalido" in importacao.validar_item({**ok, "answer": "F"})
    assert "alternativas_rotulos_invalidos" in importacao.validar_item({**ok, "options": ok["options"][:4]})
    assert "tri_b_nao_finito" in importacao.validar_item({**ok, "tri": {"a": 1, "b": float("nan"), "c": 0.1}})
    assert "lingua_estrangeira_fora_de_LC" in importacao.validar_item({**ok, "language": "en"})
    dup = [{"label": l, "text": "igual"} for l in "ABCDE"]
    assert "alternativas_duplicadas" in importacao.validar_item({**ok, "options": dup})
    # formulas que diferem so por sinal NAO sao duplicadas
    f = [{"label": l, "text": t} for l, t in zip("ABCDE", ["x + 1", "x - 1", "x + 2", "x - 2", "x"])]
    assert importacao.validar_item({**ok, "options": f}) == []


def test_familias_de_conteudo_compartilham_grupo(artefatos):
    import collections
    raw = json.load(open(artefatos[0] / "catalogo.json", encoding="utf-8"))["itens"]
    cf = collections.defaultdict(set)
    for x in raw:
        cf[x["content_family_id"]].add(x["grupo_conteudo"])
    assert all(len(g) == 1 for g in cf.values())  # mesma familia de conteudo => mesmo grupo
    tam = collections.Counter(x["grupo_conteudo"] for x in raw)
    assert any(v > 1 for v in tam.values())
