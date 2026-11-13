"""Laboratorio interativo do recomendador: uma pessoa real responde no terminal, em um perfil de teste isolado.

    python -m gabaritei_rec.terminal --perfis-dir PERFIS --saida RELATORIOS [--usuario joao] [--area MT]
    python -m gabaritei_rec.terminal --sem-gabarito ...   # estudo: gabarito so depois da resposta

Usuario e perfil persistentes: o terminal pergunta "Qual e seu usuario?" (ou usa --usuario). Usuario existente
retoma o MESMO aluno_id, perfil e historico (por area); usuario novo e cadastrado e comeca pelo diagnostico.
Cada contexto usa um banco SQLite estavel em --perfis-dir: laboratorio.sqlite (gabarito visivel) e
estudo.sqlite (--sem-gabarito). O mesmo usuario tem perfis separados nos dois. Cada execucao grava ainda uma
pasta propria de relatorio em --saida (sem sobrescrever execucoes anteriores).

Identificacao dos registros (separa QUEM respondeu de COMO respondeu):
  participante        humano (pessoa real) | roteiro (testes automatizados)
  coleta              manual_terminal
  teste_controlado    true no modo padrao: o gabarito fica visivel ANTES da resposta e as escolhas podem ser
                      intencionais (acertar/errar) para observar a reacao do algoritmo
  condicao_resposta   assistida_gabarito_visivel_antes | independente (somente com --sem-gabarito)
Registros controlados atualizam o perfil de teste (banco SQLite proprio desta sessao), mas sao excluidos
explicitamente das metricas independentes deste terminal.
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import shutil
import sqlite3
import sys
import textwrap
import time
import uuid
from collections import Counter, deque
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from .catalogo import Catalogo
from .config import BACKEND_DIR, carregar_config, versao_politica
from .db import criar_engine, criar_fabrica
from .metricas import metricas_binarias
from .recomendacao import Pedido
from .servico import ErroServico, Servico

AREAS = {"MT": "Matematica", "LC": "Linguagens", "CH": "Humanas", "CN": "Natureza"}
MENU = {"1": "MT", "2": "LC", "3": "CH", "4": "CN"}
BANDS = {"facil": "facil", "media": "media", "medio": "media", "dificil": "dificil"}
HELP = (
    "A-E: escolher alternativa | acertar: usar gabarito | errar: usar alternativa errada\n"
    "pular | status | perfil | erros | rever ID | area MT/LC/CH/CN | auto | nivel facil/media/dificil\n"
    "continuar (exploracao) | revisao | pratica | ajuda | sair"
)
HELP_SEM_GABARITO = (
    "A-E: escolher alternativa | pular | dica (registra uso de dica) | revelar (mostra o gabarito; nao conta)\n"
    "status | perfil | erros | rever ID | area MT/LC/CH/CN | auto | continuar (exploracao) | nivel facil/media/dificil | revisao | pratica | ajuda | sair"
)
NOMES_ESTRATEGIA = {
    "diagnostico_inicial": "DIAGNOSTICO INICIAL",
    "diagnostico_direcionado": "DIAGNOSTICO DIRECIONADO",
    "reforco": "REFORCO",
    "adaptativo": "ADAPTACAO",
    "revisao_manual": "REVISAO DE QUESTAO JA RESPONDIDA",
}


CONTEXTOS = {
    "laboratorio": "LABORATORIO (gabarito visivel antes da resposta; perfil de teste separado do estudo)",
    "estudo": "ESTUDO SEM AJUDA (gabarito so depois da resposta; perfil separado do laboratorio)",
}


class Encerrar(Exception):
    pass


def incerteza_txt(dp):
    """Leitura simples do desvio padrao do posterior (limites ilustrativos, nao uma escala oficial)."""
    if dp is None:
        return "desconhecida"
    return "baixa" if dp <= 0.35 else ("moderada" if dp <= 0.6 else "alta")


def plain(value: str) -> str:
    value = html.unescape(re.sub(r"<br\s*/?>", "\n", str(value), flags=re.I))
    return "".join(c if c.isprintable() or c in "\n\t" else " " for c in value)


class TerminalTeste:
    def __init__(self, args, cat, cfg, *, input_fn=input, output_fn=print):
        self.args, self.cat, self.cfg = args, cat, cfg
        self.read, self.write = input_fn, output_fn
        self.area = args.area
        self.mode = args.modo
        self.band = args.dificuldade
        self.objective = args.objetivo
        self.assistido = not args.sem_gabarito
        self.queue = deque()
        self.manual_review_id = None
        self.steps = []
        self.request_count = 0
        self.last_strategy = {}
        self.strategy_changes = []
        # contexto -> banco SQLite ESTAVEL (compartilhado entre execucoes do mesmo contexto)
        self.contexto = "laboratorio" if self.assistido else "estudo"
        perfis = args.perfis_dir.resolve()
        perfis.mkdir(parents=True, exist_ok=True)
        self.db_path = perfis / f"{self.contexto}.sqlite"
        self.engine = criar_engine("sqlite:///" + self.db_path.as_posix())
        try:
            self.svc = Servico(cat, cfg, criar_fabrica(self.engine))  # cria/migra sem apagar dados
            self.write("\nGABARITEI - LABORATORIO DO RECOMENDADOR" if self.assistido else "\nGABARITEI - ESTUDO SEM GABARITO")
            self.write(f"Contexto: {CONTEXTOS[self.contexto]}")
            self.user = self.identify(args.usuario)
            self.aid = self.user["aluno_id"]
            self.exclusoes_laboratorio = self.load_lab_exposures(perfis)
            self.show_profile(inicio=True)
            if self.area is None:
                self.area = self.ask_area()
            self.pending_resume = self.svc.pendencia_terminal(self.aid, self.current_request())
            self.session = (self.pending_resume if self.pending_resume else self.svc.criar_sessao(self.aid, "automatico"))
        except BaseException:
            self.engine.dispose()
            raise
        self.sid = self.session["sessao_id"]
        self.sessoes_usadas = {self.sid}
        self.started_at = datetime.now(timezone.utc)
        self.run_id = self.started_at.strftime("%Y%m%d_%H%M%SZ_") + uuid.uuid4().hex[:8]
        # pasta de relatorio propria desta execucao; o username nao entra no caminho (so o id interno curto)
        self.folder = args.saida.resolve() / f"{self.run_id}_{self.contexto}_{self.aid[:8]}"
        self.folder.mkdir(parents=True, exist_ok=False)
        self.ident = dict(
            participante=args.participante, username=self.user["username"], contexto=self.contexto,
            coleta="manual_terminal" if args.participante == "humano" else "automatizada_roteiro",
            teste_controlado=self.assistido,
            condicao_resposta="assistida_gabarito_visivel_antes" if self.assistido else "independente",
            gabarito_visivel_antes_da_resposta=self.assistido, elegivel_avaliacao_independente=not self.assistido,
            # campos antigos mantidos para compatibilidade com filtros e relatorios anteriores
            cenario="terminal_controlado" if self.assistido else "terminal_sem_ajuda",
            gabarito_visivel_ao_operador=self.assistido, inadequado_para_validacao_real=self.assistido)
        self.meta = dict(origem="real" if args.participante == "humano" else "sintetico", **self.ident,
                         run_id=self.run_id, aluno_id=self.aid, sessao_id=self.sid,
                         usuario_criado_nesta_execucao=self.user["criado"], usuario_criado_em=self.user["criado_em"],
                         sessao_retomada=self.pending_resume is not None, sessoes_usadas=sorted(self.sessoes_usadas),
                         banco=str(self.db_path), iniciado_em=self.started_at.isoformat(),
                         exclusoes_laboratorio=self.exclusoes_laboratorio,
                         politica_versao=versao_politica(cfg), dataset_sha256=cat.manifesto["dataset_sha256"],
                         nota=("Participante humano em coleta manual e teste controlado: o gabarito fica visivel antes da "
                               "resposta e as escolhas podem ser intencionais. Os registros atualizam e persistem o perfil "
                               "DE TESTE (laboratorio.sqlite) e nao entram na avaliacao independente.") if self.assistido else
                              ("Participante responde sem ver o gabarito antes; dica, revelacao, repeticao e pulo seguem as "
                               "regras do servidor. Perfil de estudo persistente em estudo.sqlite, separado do laboratorio."))
        self.log("inicio", **self.meta)
        (self.folder / "metadados.json").write_text(json.dumps(self.meta, ensure_ascii=False, indent=2), encoding="utf-8")
        self.save()

    # ------------------------------------------------------------ usuario e perfil salvo
    def load_lab_exposures(self, perfis):
        """Somente leitura no laboratorio; nunca importa acertos/erros para o perfil de estudo."""
        if self.assistido:
            return None
        username = getattr(self.args, "evitar_gabaritos_de", None) or self.user["username"]
        path = perfis / "laboratorio.sqlite"
        ids, groups = set(), set()
        if path.exists():
            from .servico import normalizar_username
            username = normalizar_username(username)
            with closing(sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)) as conn:
                rows = conn.execute("SELECT ap.questao_id, ap.grupo_conteudo FROM apresentacao ap "
                                    "JOIN aluno a ON a.id=ap.aluno_id WHERE a.username=?", (username,)).fetchall()
            ids = {row[0] for row in rows}
            groups = {row[1] for row in rows}
        self.svc.exposicoes_externas[self.aid] = (ids, groups)
        self.write(f"Filtro de gabaritos vistos: {len(ids)} questoes do laboratorio de '{username}' excluidas do estudo.")
        return {"usuario_laboratorio": username, "questoes": len(ids), "grupos": len(groups),
                "banco_consultado": str(path), "leitura_somente": True}

    def identify(self, given):
        """Pergunta o usuario (salvo com --usuario); criacao/consulta ficam no servico."""
        while True:
            raw = given if given is not None else self.read("Qual e seu usuario? ")
            given = None
            if raw.strip().lower() in ("sair", "exit"):
                raise Encerrar
            try:
                user = self.svc.obter_ou_criar_usuario(raw)
            except ErroServico as exc:
                self.write(exc.mensagem)
                continue
            if user["criado"]:
                self.write(f"Usuario '{user['username']}' cadastrado neste contexto. O diagnostico vai comecar.")
            else:
                self.write(f"Bem-vindo de volta, '{user['username']}'. Perfil e historico recuperados.")
            return user

    def ask_area(self):
        self.write("Escolha a area: 1 Matematica | 2 Linguagens | 3 Humanas | 4 Natureza")
        while True:
            value = self.read("Area [1-4 ou MT/LC/CH/CN; sair para encerrar]: ").strip().upper()
            if value.lower() in ("sair", "s", "q", "exit"):
                raise Encerrar
            area = MENU.get(value, value)
            if area in AREAS:
                return area
            self.write("Area invalida.")

    def show_profile(self, inicio=False):
        """Historico salvo por area e etapa que o automatico usara agora (decidida pelo backend)."""
        res = self.svc.resumo_usuario(self.aid)
        self.write(f"\nPERFIL de '{res['username']}' | contexto {self.contexto} | sessoes anteriores: "
                   f"{res['sessoes'] - (0 if inicio else 1)} | ultima resposta: {res['ultima_resposta_em'] or 'nenhuma'}")
        self.write("(theta e um indice experimental por area; nao e nota do ENEM nem escala 0-10)")
        for area, name in AREAS.items():
            info = res["por_area"][area]
            p = info["perfil"]
            etapa = self.svc.etapa_atual(self.aid, area)["nome"]
            if p["n_evidencias"] == 0:
                txt = "sem respostas ainda"
            else:
                txt = (f"{p['n_evidencias']} respostas validas, {info['primeira_sem_ajuda']['acertos']} acertos | "
                       f"theta {p['theta']:.2f} | incerteza {incerteza_txt(p['dp'])} ({p['dp']:.2f})")
            self.write(f"  {name}: {txt} | etapa agora: {NOMES_ESTRATEGIA.get(etapa, etapa).lower()}")
            self.explain_uncertainty(p)

    def explain_uncertainty(self, profile):
        reasons = profile.get("motivos_insuficiencia", [])
        if "incerteza_acima_do_limite" in reasons:
            self.write("    A estimativa ainda esta incerta. Mais respostas so ajudam se as questoes trouxerem informacao sobre seu nivel.")

    def log(self, event, **data):
        with (self.folder / "eventos.jsonl").open("a", encoding="utf-8") as f:
            f.write(json.dumps(dict(evento=event, registrado_em=datetime.now(timezone.utc).isoformat(), **data), ensure_ascii=False) + "\n")

    def profile(self):
        return self.svc.progresso(self.aid)["por_area"][self.area]["perfil"]

    def save(self):
        interactions = self.svc.exportar_interacoes(origem=self.meta["origem"], metadados=self.ident, aluno_id=self.aid)
        apresentacoes_execucao = {r["apresentacao_id"] for r in self.steps}
        for row in interactions:
            row["execucao_atual"] = row.get("apresentacao_id") in apresentacoes_execucao
            row["run_id_exportacao"] = self.run_id
        with (self.folder / "interacoes_terminal.jsonl").open("w", encoding="utf-8") as f:
            for row in interactions:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        valid = [r for r in self.steps if r["correta"] is not None and r["conta_para_perfil"] and r["prob_antes"] is not None]
        matches = sum((r["prob_antes"] >= .5) == r["correta"] for r in valid)
        evaluation = self.prediction_evaluation(valid)
        answered = [r for r in self.steps if r["correta"] is not None]
        resumo_hist = self.svc.resumo_usuario(self.aid)
        summary = dict(**self.meta, atualizado_em=datetime.now(timezone.utc).isoformat(),
                       nota_contagens="respostas/acertos/erros/pulos/pedidos referem-se SOMENTE a esta execucao; "
                                      "totais_historicos_do_usuario soma todas as sessoes deste usuario neste contexto.",
                       totais_historicos_do_usuario={
                           "sessoes": resumo_hist["sessoes"],
                           "por_area": {a: {"respostas_validas": v["perfil"]["n_evidencias"],
                                            "tentativas_por_tipo": v["tentativas_por_tipo"],
                                            "theta": v["perfil"]["theta"], "dp": v["perfil"]["dp"],
                                            "status": v["perfil"]["status"]}
                                        for a, v in resumo_hist["por_area"].items()}},
                       respostas=len(answered),
                       acertos=sum(r["correta"] is True for r in self.steps), erros=sum(r["correta"] is False for r in self.steps),
                       pulos=sum(r["correta"] is None for r in self.steps), pedidos=self.request_count,
                       respostas_por_estrategia=dict(Counter(r["estrategia"] for r in answered)),
                       itens_fora_da_faixa_alvo=sum(r["na_faixa_alvo"] is False for r in answered),
                       itens_na_faixa_alvo=sum(r["na_faixa_alvo"] is True for r in answered),
                       itens_sem_contrato_de_faixa=sum(r["na_faixa_alvo"] is None for r in answered),
                       mudancas_de_estrategia=self.strategy_changes,
                       previsoes_analisadas=len(valid), previsoes_que_coincidiram=matches,
                       coincidencia_no_roteiro=matches / len(valid) if valid else None,
                       avaliacao_previsao=evaluation,
                       progresso=self.svc.progresso(self.aid),
                       nota_metrica=("Teste com gabarito: coincidencia de escolhas controladas, excluida da avaliacao independente."
                                     if self.assistido else "Previsoes anteriores as respostas nesta sessao. Acuracia de acerto/erro nao mede qualidade pedagogica; compare referencias, Brier e calibracao."))
        (self.folder / "resumo.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
        if self.steps:
            with (self.folder / "passo_a_passo.csv").open("w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=list(self.steps[0]), delimiter=";")
                writer.writeheader()
                writer.writerows(self.steps)

    def prediction_evaluation(self, valid=None):
        if self.assistido:
            return {"status": "teste_controlado", "n": 0,
                    "nota": "Gabarito visivel antes da resposta; nao e avaliacao independente."}
        valid = valid if valid is not None else [r for r in self.steps if r["correta"] is not None
                                                 and r["conta_para_perfil"] and r["prob_antes"] is not None]
        if not valid:
            return {"status": "sem_respostas_validas", "n": 0}
        y, p = [int(r["correta"]) for r in valid], [r["prob_antes"] for r in valid]
        reference = metricas_binarias(y, [0.0] * len(y), .5)
        m = metricas_binarias(y, p, .5)
        return {"status": "descritiva_sem_ajuda", "n": len(y), "modelo": m,
                "referencia_sempre_erro": {"acuracia": reference["acuracia"]},
                "acertos_esperados": sum(p), "acertos_observados": sum(y),
                "diferenca_acuracia_referencia": m["acuracia"] - reference["acuracia"],
                "participante": self.args.participante,
                "nota": "Resultado descritivo desta sessao; nao e eficacia geral do recomendador nem ganho de aprendizagem."}

    def show_status(self):
        all_areas = self.svc.progresso(self.aid)["por_area"]
        self.write("\nSEU PERFIL NESTE TESTE (theta e um indice experimental, nao nota do ENEM)")
        for area, name in AREAS.items():
            p = all_areas[area]["perfil"]
            self.write(f"  {name}: {p['n_evidencias']} respostas validas | theta {p['theta']:.3f} | incerteza {p['dp']:.3f} | {p['status']}")
            self.explain_uncertainty(p)
        m = self.prediction_evaluation()
        if m.get("modelo"):
            self.write(f"Previsao nesta sessao: {m['modelo']['acuracia']:.1%} de acuracia; "
                       f"sempre prever erro: {m['referencia_sempre_erro']['acuracia']:.1%}; Brier: {m['modelo']['brier']:.4f}.")
            self.write("Essas metricas avaliam a previsao de acerto/erro; nao sao nota da qualidade das recomendacoes.")
        last = self.last_strategy.get(self.area)
        self.write(f"Modo do terminal: {self.mode} | objetivo: {self.objective} | area: {self.area}"
                   + (f" | estrategia atual: {NOMES_ESTRATEGIA.get(last, last)}" if last else ""))
        self.write(f"Arquivos: {self.folder}\n")

    def command(self, value):
        value = value.strip().lower()
        if value in ("sair", "s", "q", "exit"):
            raise Encerrar
        if value in ("ajuda", "help", "?"):
            self.write(HELP if self.assistido else HELP_SEM_GABARITO)
            return "keep"
        if value == "status":
            self.show_status()
            return "keep"
        if value == "perfil":
            self.show_profile()
            return "keep"
        if value == "erros":
            history = self.svc.exportar_interacoes(origem=self.meta["origem"], aluno_id=self.aid)
            last = {r["questao_id"]: r for r in history if not r.get("pulada") and r.get("correta") is not None}
            errors = [r for r in last.values() if r["area"] == self.area and r["correta"] is False][-10:]
            if not errors:
                self.write("Nao ha erros salvos nesta area para listar.")
            for r in errors:
                self.write(f"  {r['questao_id']} | {r['area']} | digite: rever {r['questao_id']}")
            self.write("Rever uma questao e pratica: a repeticao nao altera seu nivel nem entra na avaliacao independente.")
            return "keep"
        if value.startswith("rever "):
            qid = value.split(maxsplit=1)[1]
            history = self.svc.exportar_interacoes(origem=self.meta["origem"], aluno_id=self.aid)
            if qid not in self.cat.itens or not any(r["questao_id"] == qid and r.get("correta") is not None for r in history):
                self.write("Escolha uma questao ja respondida neste perfil. Use erros para listar os IDs.")
                return "keep"
            self.manual_review_id = qid
            self.area = self.cat.itens[qid].area
            self.queue.clear()
            self.log("revisao_manual_solicitada", questao_id=qid, area=self.area)
            return "changed"
        previous = dict(area=self.area, modo=self.mode, dificuldade=self.band, objetivo=self.objective)
        if value == "area":
            self.write("1 Matematica | 2 Linguagens | 3 Humanas | 4 Natureza")
            choice = self.read("Escolha a area [1-4 ou MT/LC/CH/CN]: ").strip().upper()
            area = MENU.get(choice, choice)
            if area not in AREAS:
                self.write("Area invalida; a questao atual foi mantida.")
                return "keep"
            self.area = area
        elif value.startswith("area ") and value.split()[-1].upper() in AREAS:
            self.area = value.split()[-1].upper()
        elif value == "auto":
            self.mode = "auto"
        elif value == "continuar":
            self.mode = "diagnostico"
            self.write("Exploracao solicitada: vou priorizar informacao mesmo fora dos limites automaticos de acessibilidade. "
                       "A chance prevista continua visivel; auto retorna ao modo automatico.")
        elif value in ("revisao", "revisão", "pratica", "prática"):
            self.objective = "revisao" if value.startswith("revi") else "pratica"
        elif value.startswith("nivel ") and value.split()[-1] in BANDS:
            self.mode, self.band = "nivel", BANDS[value.split()[-1]]
        else:
            return None
        if previous == dict(area=self.area, modo=self.mode, dificuldade=self.band, objetivo=self.objective):
            self.write("Essa opcao ja esta ativa; a questao atual foi mantida.")
            return "keep"
        self.queue.clear()
        self.log("mudanca_explicita_no_terminal", antes=previous, depois=dict(area=self.area, modo=self.mode, dificuldade=self.band, objetivo=self.objective))
        self.write(f"\nAgora: {AREAS[self.area]} | modo {self.mode} | objetivo {self.objective}.")
        return "changed"

    def explain_strategy(self, response):
        """Explica em linguagem simples quando a estrategia muda (decisao tomada no backend)."""
        estr = response.get("estrategia") or {}
        sondagem = (estr.get("adequacao_catalogo") or {}).get("sondagem")
        if sondagem and sondagem.get("ativa"):
            self.write("    SONDAGEM LIMITADA: questao proxima do limite de acessibilidade para esclarecer seu nivel.")
        name = estr.get("nome")
        if not name:
            return
        before = self.last_strategy.get(self.area)
        sinais = estr.get("sinais", {})
        if name != before:
            self.strategy_changes.append(dict(passo=len(self.steps) + 1, area=self.area, de=before, para=name,
                                              motivo=estr.get("motivo")))
            self.write(f"\n>>> {NOMES_ESTRATEGIA.get(name, name)}: {estr.get('explicacao', '').split(' Nao ha questao')[0]}")
            cmp = sinais.get("desempenho_vs_previsto") or {}
            if name in ("reforco", "adaptativo") and cmp.get("n"):
                self.write(f"    Ultimas {cmp['n']} respostas: {cmp['acertos_observados']} acertos observados x "
                           f"{cmp['acertos_esperados']:.1f} esperados pelas chances previstas (z={cmp['z']:+.2f}; "
                           f"so |z| >= {sinais.get('z_limite')} conta como mudanca consistente).")
            if name == "reforco":
                self.write(f"    Motivo: {estr.get('motivo')} | historico mantido ({sinais.get('n_evidencias')} respostas validas).")
            if estr.get("ajuste_centro_desafio"):
                self.write(f"    Ajuste gradual: centro do desafio em {estr.get('centro_desafio', 0):.0%} (dentro da faixa-alvo).")
            elif name == "diagnostico_direcionado":
                self.write(f"    Motivo: {estr.get('motivo')} | incerteza atual {sinais.get('dp'):.3f} "
                           f"(limite {self.cfg['perfil']['dp_max_suficiente']}).")
            self.log("estrategia_alterada", area=self.area, de=before, para=name, estrategia=estr)
        self.last_strategy[self.area] = name
        alt = estr.get("alternativa")
        if alt:
            self.write(f"    Atencao: {alt['motivo']}")
            self.log("alternativa_fora_da_faixa", area=self.area, alternativa=alt)
        for h in estr.get("habilidades_priorizadas", []):
            self.write(f"    Prioridade de habilidade {h['habilidade']}: {h['acertos']} acerto(s) em {h['respostas']} respostas.")

    def current_request(self):
        mode = "nivel" if self.mode == "nivel" else "diagnostico" if self.mode == "diagnostico" else "automatico"
        return Pedido(mode, self.area, 1, formatos=["standard"],
                      dificuldade=self.band if mode == "nivel" else None,
                      objetivo=self.objective, aceitar_experimental=True)

    def get_question(self):
        if self.manual_review_id:
            qid, self.manual_review_id = self.manual_review_id, None
            return {"questao_id": qid, "revisao_manual": True, "prob_prevista": None,
                    "razao": {"modo": "revisao_manual"}}, "revisao_manual"
        if self.queue:
            return self.queue.popleft()
        request = self.current_request()
        mode = request.modo
        pending = self.pending_resume or self.svc.pendencia_terminal(self.aid, request)
        self.pending_resume = None
        if pending:
            self.sid = pending["sessao_id"]
            self.sessoes_usadas.add(self.sid)
            self.meta.update(sessao_id=self.sid, sessoes_usadas=sorted(self.sessoes_usadas), sessao_retomada=True)
            (self.folder / "metadados.json").write_text(json.dumps(self.meta, ensure_ascii=False, indent=2), encoding="utf-8")
            self.write("\nRetomando a questao pendente; nenhuma nova sondagem foi reservada.")
            self.log("pendencia_retomada", sessao_id=self.sid,
                     recomendacao_item_id=pending["item"]["recomendacao_item_id"], politica_original=pending["politica_original"])
            self.save()
            return pending["item"], (pending.get("estrategia") or {}).get("nome") or mode
        self.request_count += 1
        response = self.svc.recomendar(self.sid, request, semente=self.args.semente + self.request_count)
        self.log("pedido", pedido=request.como_dict(), resposta=response)
        self.save()
        self.explain_strategy(response)
        if not response["itens"]:
            limitacao = response.get("limitacao") or {}
            if limitacao.get("tipo") == "catalogo_insuficiente_para_perfil":
                self.write(f"\nAutomatico em pausa. Estoque restante: {limitacao.get('estoque_restante', 0)} questoes.")
            else:
                self.write(f"\nO algoritmo retornou: {response['status']}.")
            self.write((response.get("limitacao") or {}).get("motivo", "Nenhuma questao foi oferecida."))
            self.write("Nenhuma regra foi alterada para esconder esse resultado.")
            self.write("Escolha: continuar (explorar) | erros | rever ID | area | status | nivel facil (manual) | sair")
            self.log("aguardando_opcao_sem_candidatos", area=self.area, status=response["status"])
            return None
        for item in response["itens"]:
            label = (response.get("estrategia") or {}).get("nome") or mode
            self.queue.append((item, label))
        return self.queue.popleft()

    def present(self, recommended, mode):
        if recommended.get("revisao_manual"):
            self.current = self.svc.apresentar_questao(self.sid, recommended["questao_id"])
            self.write("\nREVISAO: questao ja respondida. Esta pratica nao altera seu nivel.")
        else:
            self.current = self.svc.apresentar(recommended["recomendacao_item_id"])
        self.recommended = recommended
        question = self.current["questao"]
        self.item = self.cat.itens[question["questao_id"]]
        self.before = self.profile()
        self.started = time.monotonic()
        width = max(55, min(110, shutil.get_terminal_size((90, 30)).columns - 2))
        self.write("\n" + "=" * min(width, 85))
        self.write(f"QUESTAO {len(self.steps) + 1} | {AREAS[self.area]} | {question['ano']} | {question['faixa']} | "
                   f"{NOMES_ESTRATEGIA.get(mode, mode).lower()}")
        self.write(f"ID: {self.item.id} | habilidade: {self.item.habilidade_chave or 'nao cadastrada'}")
        self.write(f"Respostas validas acumuladas nesta area: {self.before['n_evidencias']}")
        razao = recommended.get("razao") or {}
        if recommended.get("prob_prevista") is not None:
            extra = ""
            if razao.get("na_faixa_alvo") is True:
                extra = " (dentro da faixa-alvo)"
            elif razao.get("na_faixa_alvo") is False:
                extra = " (FORA da faixa-alvo: melhor alternativa disponivel)"
            self.write(f"Chance prevista na selecao: {recommended['prob_prevista']:.1%}{extra}")
        for line in plain(question["enunciado"]).splitlines():
            self.write(textwrap.fill(line, width=width) if line.strip() else "")
        self.write("")
        for alt in question["alternativas"]:
            self.write(textwrap.fill(f"{alt['letra']}) {plain(alt['texto'])}", width=width, subsequent_indent="   "))
        if self.assistido:
            wrong = next(a for a in "ABCDE" if a != self.item.gabarito)
            self.write(f"\nGABARITO DO CATALOGO: {self.item.gabarito} | exemplo de alternativa errada: {wrong}")
            self.write("Teste manual com gabarito visivel: digite A-E, acertar, errar ou pular.")
            self.write("Outros comandos: status | area | auto | nivel facil/media/dificil | revisao | sair")
        else:
            self.write("\nResponda sem consultar o gabarito: A-E ou pular (dica | revelar | status | sair).")
        self.log("aguardando_resposta", area=self.area, questao_id=self.item.id, modo=mode,
                 gabarito_operador=self.item.gabarito if self.assistido else None, perfil_antes=self.before,
                 prob_prevista_selecao=recommended.get("prob_prevista"), na_faixa_alvo=razao.get("na_faixa_alvo"))

    def submit(self, choice, mode):
        if choice == "pular":
            result = self.svc.pular(self.current["apresentacao_id"])
        else:
            selected = self.item.gabarito if choice == "acertar" else (
                next(a for a in "ABCDE" if a != self.item.gabarito) if choice == "errar" else choice.upper())
            result = self.svc.responder(self.current["apresentacao_id"], selected,
                                       tempo_resposta_ms=int((time.monotonic() - self.started) * 1000))
        after = self.profile()
        razao = self.recommended.get("razao") or {}
        row = dict(origem=self.meta["origem"], participante=self.ident["participante"],
                   run_id=self.run_id, sessao_id=self.sid, apresentacao_id=self.current["apresentacao_id"],
                   condicao_resposta=self.ident["condicao_resposta"], area=self.area, questao_id=self.item.id,
                   ano=self.item.ano, habilidade=self.item.habilidade_chave, faixa=self.item.faixa, tri_b=self.item.b,
                   modo=mode, estrategia=razao.get("estrategia") or razao.get("modo"),
                   na_faixa_alvo=razao.get("na_faixa_alvo"),
                   habilidade_priorizada=(razao.get("habilidade_priorizada") or {}).get("habilidade"),
                   objetivo=self.objective, comando_operador=choice,
                   alternativa=result.get("alternativa"), gabarito=self.item.gabarito,
                   correta=result.get("correta"), prob_antes=result.get("prob_prevista_antes"),
                   theta_antes=self.before["theta"], theta_depois=after["theta"],
                   incerteza_depois=after["dp"], respostas_validas=after["n_evidencias"],
                   estado_perfil=after["status"], conta_para_perfil=result["conta_para_perfil"],
                   motivo_nao_conta=result["motivo_nao_conta"], tipo_tentativa=result.get("tipo"),
                   gabarito_visivel_antes_da_resposta=self.assistido)
        self.steps.append(row)
        self.log("resposta_controlada" if self.assistido else "resposta", passo=row, resultado=result)
        self.save()
        if choice == "pular":
            self.write("\nQuestao pulada. O perfil nao foi penalizado.")
        else:
            self.write(f"\nVoce {'ACERTOU' if result['correta'] else 'ERROU'}: marcou {result['alternativa']}; gabarito {self.item.gabarito}.")
            if result.get("prob_prevista_antes") is not None:
                self.write(f"Antes da resposta, o modelo estimava {result['prob_prevista_antes']:.1%} de chance de acerto.")
        self.write(f"Habilidade estimada (theta): {self.before['theta']:.3f} -> {after['theta']:.3f}")
        self.write(f"Respostas validas: {after['n_evidencias']} | estado: {after['status']} | incerteza: {after['dp']:.3f}")
        if not result["conta_para_perfil"]:
            self.write(f"Esta tentativa nao atualiza o perfil: {result['motivo_nao_conta']}.")

    def extra_action(self, choice):
        """Somente no modo sem gabarito: dica e revelacao seguem o tratamento do servidor."""
        if choice == "dica":
            self.svc.registrar_dica(self.current["apresentacao_id"])
            self.write("Uso de dica registrado: esta resposta nao contara para o perfil (primeira_com_dica).")
            self.log("dica_registrada", questao_id=self.item.id)
            return True
        if choice == "revelar":
            out = self.svc.revelar_gabarito(self.current["apresentacao_id"])
            self.write(f"Gabarito: {out['gabarito']}. {out['nota']}")
            self.log("gabarito_revelado", questao_id=self.item.id)
            return True
        return False

    def run(self):
        if self.assistido:
            self.write("Voce responde e pode consultar o gabarito para provocar acertos e erros.")
            self.write("Registro: participante humano, coleta manual, teste controlado com gabarito visivel antes da resposta.")
        else:
            self.write("Modo sem gabarito: o gabarito aparece somente depois da resposta.")
        self.write("Cada escolha atualiza um perfil de teste isolado; observe as proximas recomendacoes.")
        self.write("O backend decide a estrategia a cada questao (diagnostico, reforco ou adaptacao) e explica a mudanca.")
        self.write(f"Arquivos desta sessao: {self.folder}")
        self.write(HELP if self.assistido else HELP_SEM_GABARITO)
        try:
            while not self.args.max_questoes or len(self.steps) < self.args.max_questoes:
                entry = self.get_question()
                if entry is None:
                    while True:
                        action = self.command(self.read("Opcao: "))
                        if action == "changed":
                            break
                        if action is None:
                            self.write("Use continuar, erros, rever ID, area, status, nivel facil (manual) ou sair.")
                    continue
                item, mode = entry
                self.present(item, mode)
                while True:
                    choice = self.read("Sua escolha: ").strip().lower()
                    allowed = ("acertar", "errar", "pular") if self.assistido else ("pular",)
                    if choice in allowed or choice.upper() in "ABCDE" and len(choice) == 1:
                        self.submit(choice, mode)
                        break
                    if not self.assistido and self.extra_action(choice):
                        continue
                    command = self.command(choice)
                    if command == "changed":
                        self.log("questao_deixada_sem_resposta_por_mudanca", questao_id=self.item.id)
                        break
                    if command is None:
                        self.write("Entrada invalida. Digite uma letra A-E ou use "
                                   + ("acertar, errar, pular" if self.assistido else "pular, dica, revelar")
                                   + ", ajuda ou sair.")
        except (Encerrar, EOFError, StopIteration, KeyboardInterrupt):
            self.write("\nEncerrando o laboratorio...")
        finally:
            try:
                self.save()
                self.log("fim", respostas=len(self.steps))
                self.write(f"\nSessao salva em: {self.folder}")
                self.write("resumo.json | passo_a_passo.csv | eventos.jsonl | interacoes_terminal.jsonl")
                self.write(f"Perfil salvo em: {self.db_path} (use o mesmo usuario para continuar)")
            finally:
                self.engine.dispose()
        return self.folder


def parser():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--area", choices=list(AREAS))
    p.add_argument("--usuario", help="usuario local (sem esta opcao o terminal pergunta); ' JoAo ' = 'joao'")
    p.add_argument("--perfis-dir", type=Path, default=BACKEND_DIR / "resultados" / "perfis_terminal",
                   help="pasta dos bancos persistentes laboratorio.sqlite e estudo.sqlite")
    p.add_argument("--modo", choices=["auto", "nivel", "diagnostico"], default="auto")
    p.add_argument("--dificuldade", choices=["facil", "media", "dificil"], default="facil")
    p.add_argument("--objetivo", choices=["pratica", "revisao"], default="pratica")
    p.add_argument("--semente", type=int, default=20261112)
    p.add_argument("--max-questoes", type=int, default=0, help="0 = ate o operador sair")
    p.add_argument("--participante", choices=["humano", "roteiro"], default="humano",
                   help="humano: pessoa real no terminal; roteiro: entradas automatizadas (testes)")
    p.add_argument("--sem-gabarito", action="store_true",
                   help="nao mostra o gabarito antes da resposta (acertar/errar desativados; dica/revelar disponiveis)")
    p.add_argument("--evitar-gabaritos-de", help="no estudo, exclui questoes apresentadas no laboratorio deste usuario; padrao: mesmo usuario do estudo")
    p.add_argument("--saida", type=Path, default=BACKEND_DIR / "resultados" / "testes_terminal")
    return p


def main(argv=None, *, input_fn=input, output_fn=print, cat=None, cfg=None):
    p = parser()
    args = p.parse_args(argv)
    if args.max_questoes < 0:
        p.error("--max-questoes deve ser >= 0")
    try:
        app = TerminalTeste(args, cat or Catalogo.carregar(), cfg or carregar_config(), input_fn=input_fn, output_fn=output_fn)
    except (Encerrar, EOFError, StopIteration, KeyboardInterrupt):
        output_fn("Encerrado antes da primeira questao; nada foi alterado no perfil.")
        return 0
    except (FileNotFoundError, ErroServico) as exc:
        output_fn(f"Nao foi possivel executar: {exc}")
        return 1
    try:
        app.run()
        return 0
    except (FileNotFoundError, ErroServico) as exc:
        output_fn(f"Nao foi possivel executar: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
