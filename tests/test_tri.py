import json
import subprocess

import pytest

from backend import tri
from backend.common import ROOT


def test_motor_tri_em_paridade_com_javascript():
    def carregar(caminho):
        return json.loads((ROOT / caminho).read_text(encoding="utf-8"))

    cfg = carregar("backend/config/dificuldade_v1.json")
    casos = carregar("backend/testdata/tri_paridade.json")
    esperado = json.loads(subprocess.check_output(
        ["node", "backend/tri-paridade.test.mjs", "--json"], cwd=ROOT,
    ))
    agora = casos["agoraMs"]
    item = casos["item"]
    for area, referencia in zip(tri.AREAS, esperado["areas"], strict=True):
        perfil = tri.perfil_inicial(area, cfg, nota=600)
        for i, acertou in enumerate(casos["respostas"]):
            perfil = tri.atualizar(perfil, item, acertou, cfg, agora_ms=agora+i, peso=0.8)
            perfil = tri.registrar_acerto(perfil, acertou, cfg, 0.75)
        deriva = tri.alargar(perfil, agora + casos["dias"] * tri.DIA_MS, cfg)
        assert perfil == referencia["perfil"]
        assert deriva == referencia["deriva"]
        assert tri.chance(deriva, item, cfg) == pytest.approx(referencia["chance"], abs=1e-9, rel=0)
        assert tri.momentos(deriva, cfg) == pytest.approx(referencia["momentos"], abs=1e-9, rel=0)
        assert tri.informacao(deriva, item, cfg) == pytest.approx(referencia["informacao"], abs=1e-9, rel=0)
        resumo = tri.resumo_nota(deriva, cfg)
        assert resumo.pop("dp") == pytest.approx(referencia["resumo"].pop("dp"), abs=1e-9, rel=0)
        assert resumo == referencia["resumo"]

    eventos = [dict(p=0.5, y=int(i < 30)) for i in range(40)]
    assert tri.estimar_ajuste(eventos, cfg) == esperado["ajuste"]
    candidatos = casos["candidatos"]
    chances = {c["id"]: c["p"] for c in candidatos}
    assert tri.ordenar_semelhantes(list(chances), chances.get, 0.75, cfg) == esperado["semelhantes"]
    assert tri.montar_lista(candidatos, 5, 0.75, cfg, rng=lambda: 0.25) == esperado["lista"]
