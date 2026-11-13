"""Perfil do aluno: classificacao das tentativas e proficiencia por area (EAP, experimental).

Tipos de tentativa (precedencia de cima para baixo):
  repeticao                o aluno ja respondeu esta questao (ou uma variante do mesmo grupo)
  apos_exposicao_gabarito  sem resposta anterior, mas o gabarito (da questao ou variante) ja foi exposto
                           (ex.: revelacao explicita). Exposicao tambem fica em flag propria na tentativa.
  primeira_com_dica        primeira resposta, mas com uso de dica
  primeira_sem_ajuda       primeira resposta, sem ajuda   -> unica evidencia que conta por padrao
Pular nao e erro: gera registro `pulada`, sem efeito na proficiencia.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

from .psicometria import AREAS, Evidencia, estimar_eap


def classificar_tentativa(ja_respondeu_grupo: bool, gabarito_exposto: bool, usou_dica: bool) -> str:
    if ja_respondeu_grupo:
        return "repeticao"
    if gabarito_exposto:
        return "apos_exposicao_gabarito"
    if usou_dica:
        return "primeira_com_dica"
    return "primeira_sem_ajuda"


def item_na_escala_adaptativa(formato: str, tipo_aplicacao: str, triagem_excluir: bool, cfg_irt: dict[str, Any]) -> bool:
    if triagem_excluir:
        return False
    return any(g["application_format"] == formato and g["application_type"] == tipo_aplicacao
               for g in cfg_irt["grupos_escala_adaptativo"])


def peso_e_motivo(tipo: str, na_escala: bool, cfg_perfil: dict[str, Any]) -> tuple[float, str | None]:
    peso = float(cfg_perfil["pesos"].get(tipo, 0.0))
    if peso <= 0:
        return 0.0, f"tipo_{tipo}"
    if not na_escala:
        return 0.0, "item_fora_do_grupo_de_escala_ou_triado"
    return peso, None


@dataclass
class EstadoPerfil:
    area: str
    theta: float | None
    dp: float | None
    n_evidencias: int
    status: str  # sem_historico | insuficiente | suficiente
    D_usado: float
    experimental: bool = True
    motivos_insuficiencia: tuple[str, ...] = ()
    min_respostas_validas: int | None = None
    dp_max_suficiente: float | None = None

    def como_dict(self) -> dict[str, Any]:
        return {"area": self.area, "theta": self.theta, "dp": self.dp, "n_evidencias": self.n_evidencias,
                "status": self.status, "D_usado": self.D_usado, "experimental": self.experimental,
                "D_confirmado": False, "motivos_insuficiencia": list(self.motivos_insuficiencia),
                "criterios_suficiencia": {"min_respostas_validas": self.min_respostas_validas,
                                          "dp_max_suficiente": self.dp_max_suficiente}}


def estimar_perfil_area(area: str, evidencias: Iterable[Evidencia], cfg: dict[str, Any]) -> tuple[EstadoPerfil, Any]:
    ev = [e for e in evidencias if e.peso > 0]
    D = cfg["irt"]["D_experimental"]
    est = estimar_eap(ev, cfg["irt"], D)
    if not ev:
        status = "sem_historico"
    elif est.n_evidencias < cfg["perfil"]["min_respostas_validas"] or est.dp > cfg["perfil"]["dp_max_suficiente"]:
        status = "insuficiente"
    else:
        status = "suficiente"
    motivos = []
    if not ev:
        motivos.append("sem_historico")
    else:
        if est.n_evidencias < cfg["perfil"]["min_respostas_validas"]:
            motivos.append("poucas_respostas_validas")
        if est.dp > cfg["perfil"]["dp_max_suficiente"]:
            motivos.append("incerteza_acima_do_limite")
    return EstadoPerfil(area=area, theta=round(est.theta, 6), dp=round(est.dp, 6), n_evidencias=est.n_evidencias,
                        status=status, D_usado=D, experimental=not cfg["irt"]["D_confirmado"],
                        motivos_insuficiencia=tuple(motivos),
                        min_respostas_validas=cfg["perfil"]["min_respostas_validas"],
                        dp_max_suficiente=cfg["perfil"]["dp_max_suficiente"]), est


def perfis_vazios(cfg: dict[str, Any]) -> dict[str, EstadoPerfil]:
    return {a: estimar_perfil_area(a, [], cfg)[0] for a in AREAS}
