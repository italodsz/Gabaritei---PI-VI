"""Adaptador de ensaio, sem chamada ao recomendador semântico."""
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import sys

import numpy as np

HERE = Path(__file__).resolve().parent
HISTORY = HERE.parent
MODULE = HISTORY.parent
sys.path.insert(0, str(HISTORY))
from rodada import Estimator, old

PROTOCOL = json.loads((HERE/"protocolo.json").read_bytes())
REV = "7e720fa876beb7249adab2f05d3ecf33ae5a2c51"
LEVELS = ("b_relativo_baixo","b_relativo_medio","b_relativo_alto")
ANCHORS = tuple(PROTOCOL["ancoras_provisorias"])
CANDIDATE = PROTOCOL["candidata"]
COOLDOWN, MINIMUM, STEP, MARGIN = PROTOCOL["configuracao_congelada"]
TARGET = PROTOCOL["alvo_acerto"]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Catalog:
    def __init__(self):
        work = HISTORY/"revisao_operacional_bkt"
        path = MODULE/"catalogo_adaptativo_operacional/catalogo_adaptativo_pronto.jsonl"
        expected = json.loads((work/"cobertura.json").read_bytes())
        assert digest(path)==expected["hashes"][f"dificuldade-adaptativa/{path.relative_to(MODULE).as_posix()}"]
        self.ready = {row["id"]:row for row in map(json.loads,path.read_bytes().splitlines())}
        with (work/"itens_por_categoria.csv").open(encoding="utf-8-sig",newline="") as f:
            self.items = {r["id"]:r for r in csv.DictReader(f,delimiter=";")}
        assert len(self.ready)==112 and len(self.items)==2971
        assert set(self.ready)=={i for i,r in self.items.items() if r["categoria"]!="E"}
        for i,r in self.ready.items():
            a = self.items[i]
            assert r["revisao_catalogo_base"]==REV and r["grupo_variantes"]==a["familia"]
            assert r["escala_operacional"]==a["escala"] and r["nivel_dificuldade"]==a["nivel"]
            assert bool(r["apta_selecao_adaptativa"])==(a["categoria"] in "AB")
        assert ANCHORS==tuple(old.DIFF)
        self.hashes = {str(p.relative_to(MODULE)):digest(p) for p in
                       (path,work/"itens_por_categoria.csv",work/"fixtures.json",
                        HISTORY/"rodada.py", MODULE/"viabilidade/fechamento.json",
                        MODULE/"validacao_adaptativa/protocolo.json", HERE/"protocolo.json")}

    def candidates(self, ids, scale, seen=()):
        return tuple(i for i in ids if i in self.ready and self.items[i]["categoria"] in "AB"
                     and self.items[i]["escala"]==scale and self.items[i]["familia"] not in seen)

    def diagnostic(self, ids, revision, scale, preference, mixed=False):
        if revision!=REV:
            return {"motivo":"revisao_invalida","familias_disponiveis":0}
        valid = [self.items[i] for i in self.candidates(ids,scale)]
        families = {r["familia"] for r in valid if mixed or LEVELS.index(r["nivel"])==preference}
        return {"motivo":"diagnostico_disponivel" if len(families)>=10 else "inventario_diagnostico_insuficiente",
                "familias_disponiveis":len(families)}


class Session:
    def __init__(self,catalog,scale,preference,method="bkt", diagnostic=False, session_id="offline"):
        self.catalog = catalog
        self.scale = scale
        self.preference = preference
        self.method = method
        self.diagnostic = diagnostic
        self.session_id = session_id
        self.version = f"{REV}:{CANDIDATE}:{method}"
        self.model = Estimator()
        self.seen = set()
        self.seen_families = set()
        self.general = []
        self.eligible = []
        self.offer_at = -100
        self.previous_direction = (0,-1)
        self.pending = None
        self.serial = 0

    def snapshot(self):
        return {"preferencia":self.preference,"evidencia_elegivel":len(self.eligible),
                "evidencia_bkt":len(self.eligible) if self.method=="bkt" else 0,
                "historico_geral":len(self.general),
                "dominio":float(self.model.states.get(self.scale,(old.R["params_bkt"][0],))[0])
                    if self.method=="bkt" else None,
                "oferta":self.pending["oferta_id"] if self.pending else None}

    def record(self,i,revision,scale,family,answer):
        r = self.catalog.items.get(i)
        if revision!=REV:
            return "revisao_invalida"
        if r is None:
            return "id_desconhecido"
        if family!=r["familia"] or scale!=r["escala"]:
            return "metadado_divergente"
        if i in self.seen or family in self.seen_families:
            return "repeticao"
        if r["categoria"]=="E":
            return "indisponivel_catalogo"
        if answer not in (0,1):
            return "resposta_invalida"
        if scale and scale!=self.scale:
            return "fora_da_escala"
        if self.scale and r["area"]!=self.scale.rsplit("/",1)[-1]:
            return "fora_da_area"
        self.pending = None
        self.seen.add(i)
        self.seen_families.add(family)
        trusted = {field:r[field] for field in ("assunto","subassunto","habilidade")
                   if r[f"estado_{field}"]=="confianca_tecnica_C5"}
        self.general.append({"id":i,"area":r["area"],"escala":scale,"resposta":answer,
                             "rotulos_sustentados":trusted})
        if r["categoria"] in "CD":
            return "historico_contextual" if trusted else "somente_pratica"
        d = ANCHORS[LEVELS.index(r["nivel"])]
        self.eligible.append(answer)
        if self.method=="bkt":
            assert self.model.record(i,family,scale,d,answer)
        return "atualizou_bkt" if self.method=="bkt" else "atualizou_taxa"

    def candidate(self):
        n = len(self.eligible)
        if self.method=="bkt":
            dist = np.abs(np.array([self.model.predict(self.scale,"bkt_item",d) for d in ANCHORS])-TARGET)
            best = int(np.argmin(dist))
            target = self.preference+int(np.clip(best-self.preference,-STEP,STEP))
            if target==self.preference or dist[self.preference]-dist[target] < MARGIN:
                return None,"margem_insuficiente"
            return target,"margem_atingida"
        rate = (sum(self.eligible)+1)/(n+2)
        target = min(2,max(0,self.preference+(1 if rate>.75 else -1 if rate<.45 else 0)))
        direction = target-self.preference
        old_direction, old_n = self.previous_direction
        self.previous_direction = (direction,n)
        if not direction:
            return None,"taxa_mantem_nivel"
        if self.method=="taxa" and (direction!=old_direction or n<=old_n):
            return None,"aguardando_persistencia"
        return target,"limiar_taxa"

    def advise(self,ids,revision):
        self.pending = None
        if revision!=REV:
            return {"motivo":"revisao_invalida"}
        eligible = self.catalog.candidates(ids,self.scale,self.seen_families)
        if not eligible:
            return {"motivo":"sem_candidatos_elegiveis"}
        n = len(self.eligible)
        minimum, cooldown = (8,4) if self.method=="taxa" else (MINIMUM,COOLDOWN)
        target, reason = self.candidate() if self.method!="bkt" else (None,"")
        if self.diagnostic and n<10:
            return {"motivo":"diagnostico_em_curso"}
        if n<minimum:
            return {"motivo":"historico_insuficiente"}
        if n-self.offer_at<cooldown:
            return {"motivo":"intervalo_entre_ofertas"}
        if self.method=="bkt":
            target, reason = self.candidate()
        if target is None:
            return {"motivo":reason}
        if not any(self.catalog.items[i]["nivel"]==LEVELS[target] for i in eligible):
            return {"motivo":"faixa_sugerida_indisponivel"}
        self.serial += 1
        self.offer_at = n
        self.pending = {"nivel":target,"motivo":reason,"versao":self.version,
                        "oferta_id":f"{self.session_id}:{self.serial}"}
        return self.pending.copy()

    def respond(self,offer_id,version,accept,ids,revision):
        offer = self.pending
        if revision!=REV or not offer or offer["oferta_id"]!=offer_id or offer["versao"]!=version:
            return "oferta_invalida"
        self.pending = None
        if accept is not True:
            return "recusada"
        level = offer["nivel"]
        if not any(self.catalog.items[i]["nivel"]==LEVELS[level] for i in
                   self.catalog.candidates(ids,self.scale,self.seen_families)):
            return "faixa_sugerida_indisponivel"
        self.preference = level
        return "aceita"

    def manual(self,level):
        if level not in range(3):
            raise ValueError("faixa inválida")
        self.pending = None
        self.preference = level


def inventory(catalog,scale):
    ids = catalog.candidates(catalog.ready,scale)
    return ids,dict(Counter(catalog.items[i]["nivel"] for i in ids))
