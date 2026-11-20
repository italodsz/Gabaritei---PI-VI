"""Transactional, idempotent state engine with an explicit experimental skill gate."""
from contextlib import contextmanager
import hashlib
import json
import re
import sqlite3
import uuid

from .common import ROOT,load,sha,utc
from .inferencia import step,validate_parameters
from .politica import LEVELS,suggest


def identity(value,name):
    if not isinstance(value,str) or not value or len(value)>128 or not re.fullmatch(r"[A-Za-z0-9_.:-]+",value):
        raise ValueError(f"{name} inválido.")
    return value


def payload_hash(payload):
    return hashlib.sha256(json.dumps(payload,sort_keys=True,separators=(",",":")).encode()).hexdigest()


class Motor:
    def __init__(self,database,models=None,eligibility=None,policy=None):
        self.database=str(database)
        self.models=load(ROOT/"models/parametros_originais.json")["skills"] if models is None else models
        self.eligibility=load(ROOT/"models/elegibilidade_integracao.json")["skills"] if eligibility is None else eligibility
        self.policy=load(ROOT/"models/politica_selecionada.json") if policy is None else policy
        for entry in self.models.values():
            validate_parameters(entry["parameters"])
        self.version="bkt04-"+payload_hash({"models":self.models,"gate":self.eligibility,"policy":self.policy})[:24]
        with self.transaction() as conn:
            schema="""
              CREATE TABLE IF NOT EXISTS states(
                student TEXT, namespace TEXT, skill TEXT, version TEXT, mastery REAL,
                correct INTEGER NOT NULL, total INTEGER NOT NULL, last_order INTEGER NOT NULL,
                choice TEXT NOT NULL, revision INTEGER NOT NULL, last_offer_order INTEGER,
                PRIMARY KEY(student,namespace,skill,version));
              CREATE TABLE IF NOT EXISTS receipts(
                id TEXT PRIMARY KEY, payload_sha256 TEXT NOT NULL, response TEXT NOT NULL);
              CREATE TABLE IF NOT EXISTS offers(
                id TEXT PRIMARY KEY, student TEXT, namespace TEXT, skill TEXT, version TEXT,
                revision INTEGER, level TEXT, status TEXT NOT NULL, resolution TEXT);
            """
            for statement in schema.split(";"):
                if statement.strip():
                    conn.execute(statement)
            columns={r["name"] for r in conn.execute("PRAGMA table_info(states)")}
            if "last_offer_count" not in columns:
                conn.execute("ALTER TABLE states ADD COLUMN last_offer_count INTEGER")
                for receipt in conn.execute("SELECT response FROM receipts").fetchall():
                    old=json.loads(receipt["response"])
                    if old.get("recommendation",{}).get("offer_id"):
                        conn.execute("""UPDATE states SET last_offer_count=?
                             WHERE student=? AND namespace=? AND skill=? AND version=? AND last_offer_order=?""",
                             (old["evidence_count"],old["student_id"],old["skill_namespace"],old["skill_id"],
                              old["model_version"],old["event_order"]))

    @contextmanager
    def transaction(self):
        conn=sqlite3.connect(self.database,timeout=10,isolation_level=None)
        conn.row_factory=sqlite3.Row
        conn.execute("PRAGMA busy_timeout=10000")
        conn.execute("BEGIN IMMEDIATE")
        try:
            yield conn
            conn.commit()
        except BaseException:
            conn.rollback()
            raise
        finally:
            conn.close()

    def eligibility_for(self,namespace,skill):
        if namespace!="assistments_2009_2010":
            return False,["mapeamento_ENEM_nao_validado"]
        gate=self.eligibility.get(skill)
        if not gate:
            return False,["habilidade_sem_modelo"]
        if skill not in self.models:
            return False,["modelo_ausente"]
        p=self.models[skill]["parameters"]
        if p["G"]>=.5 or p["S"]>=.5:
            return False,["emissao_sem_plausibilidade_para_politica"]
        if not gate["eligible_for_experimental_difficulty"]:
            return False,gate["reasons"]
        return True,[]

    def key(self,student,namespace,skill):
        return (identity(student,"Estudante"),identity(namespace,"Namespace"),identity(skill,"Habilidade"),self.version)

    def state_row(self,conn,key):
        row=conn.execute("SELECT * FROM states WHERE student=? AND namespace=? AND skill=? AND version=?",key).fetchone()
        if row:
            return dict(row)
        allowed,_=self.eligibility_for(key[1],key[2])
        mastery=self.models[key[2]]["parameters"]["L0"] if allowed else None
        conn.execute("""INSERT INTO states(student,namespace,skill,version,mastery,correct,total,last_order,
                        choice,revision,last_offer_order,last_offer_count)
                        VALUES(?,?,?,?,?,0,0,0,'media',0,NULL,NULL)""",(*key,mastery))
        return dict(conn.execute("SELECT * FROM states WHERE student=? AND namespace=? AND skill=? AND version=?",key).fetchone())

    def receipt(self,conn,identifier,payload):
        row=conn.execute("SELECT * FROM receipts WHERE id=?",(identifier,)).fetchone()
        if row:
            if row["payload_sha256"]!=payload_hash(payload):
                raise ValueError("Identificador já usado com outro conteúdo ou estudante.")
            return json.loads(row["response"])
        return None

    def write_receipt(self,conn,identifier,payload,response):
        conn.execute("INSERT INTO receipts VALUES(?,?,?)",(identifier,payload_hash(payload),json.dumps(response,sort_keys=True)))

    def respond(self,student,namespace,skill,attempt_id,correct,order,inventory):
        key=self.key(student,namespace,skill)
        identity(attempt_id,"Tentativa")
        if type(correct) is not int or correct not in (0,1) or type(order) is not int or order<=0:
            raise ValueError("Resposta ou ordem inválidas.")
        if not isinstance(inventory,dict) or set(inventory)!=set(LEVELS) or any(type(v) is not int or v<0 for v in inventory.values()):
            raise ValueError("Inventário deve informar as três faixas com inteiros não negativos.")
        payload={"operation":"respond","key":key,"attempt_id":attempt_id,"correct":correct,"order":order,"inventory":inventory}
        with self.transaction() as conn:
            prior=self.receipt(conn,attempt_id,payload)
            if prior is not None:
                return prior
            state=self.state_row(conn,key)
            if order<=state["last_order"]:
                raise ValueError("Evento fora de ordem.")
            allowed,reasons=self.eligibility_for(namespace,skill)
            old_total,old_hits=state["total"],state["correct"]
            if allowed:
                update=step(state["mastery"],correct,self.models[skill]["parameters"])
                mastery=update["mastery_updated"]
                predicted=update["predicted_correct"]
                before=update["mastery_before"]
                posterior=update["mastery_posterior"]
                strategy="bkt"
                score=mastery
            else:
                predicted=(old_hits+1)/(old_total+2)
                before=posterior=mastery=None
                strategy="historico_suavizado"
                score=(old_hits+correct+1)/(old_total+3)
            total=old_total+1
            revision=state["revision"]+1
            if self.policy.get("enabled") is False:
                recommendation={"suggested":None,"reason":"politica_sem_configuracao_validada","choice":state["choice"]}
            else:
                recommendation=suggest(score,total,state["choice"],inventory,self.policy,state["last_offer_count"],total)
            offer_id=None
            last_offer=state["last_offer_order"]
            last_offer_count=state["last_offer_count"]
            if recommendation["suggested"]:
                offer_id=str(uuid.uuid4())
                last_offer=order
                last_offer_count=total
                conn.execute("INSERT INTO offers VALUES(?,?,?,?,?,?,?,'pending',NULL)",
                             (offer_id,*key,revision,recommendation["suggested"]))
            conn.execute("""UPDATE states SET mastery=?,correct=?,total=?,last_order=?,revision=?,last_offer_order=?,last_offer_count=?
                            WHERE student=? AND namespace=? AND skill=? AND version=?""",
                         (mastery,old_hits+correct,total,order,revision,last_offer,last_offer_count,*key))
            response={"student_id":student,"skill_namespace":namespace,"skill_id":skill,"attempt_id":attempt_id,
                      "event_order":order,"mastery_before":before,"predicted_correct":predicted,
                      "mastery_posterior":posterior,"mastery_updated":mastery,"model_version":self.version,
                      "eligibility":"eligible_external_experiment" if allowed else "fallback_required",
                      "eligibility_reasons":reasons,"strategy":strategy,"evidence_count":total,
                      "recommendation":{**recommendation,"offer_id":offer_id},"recorded_utc":utc()}
            self.write_receipt(conn,attempt_id,payload,response)
            return response

    def resolve_offer(self,student,offer_id,accept):
        identity(student,"Estudante")
        if not isinstance(offer_id,str) or type(accept) is not bool:
            raise ValueError("Aceite inválido.")
        with self.transaction() as conn:
            offer=conn.execute("SELECT * FROM offers WHERE id=?",(offer_id,)).fetchone()
            if offer is None or offer["student"]!=student or offer["version"]!=self.version:
                raise ValueError("Oferta inexistente para este estudante e versão.")
            status="accepted" if accept else "declined"
            if offer["status"]!="pending":
                if offer["status"]!=status:
                    raise ValueError("Oferta já resolvida com outra decisão.")
                return json.loads(offer["resolution"])
            key=(offer["student"],offer["namespace"],offer["skill"],self.version)
            state=self.state_row(conn,key)
            if state["revision"]!=offer["revision"]:
                raise ValueError("Oferta desatualizada.")
            choice=offer["level"] if accept else state["choice"]
            if accept:
                conn.execute("UPDATE states SET choice=?,revision=revision+1 WHERE student=? AND namespace=? AND skill=? AND version=?",
                             (choice,*key))
            result={"offer_id":offer_id,"accepted":accept,"choice":choice,"student_id":student}
            conn.execute("UPDATE offers SET status=?,resolution=? WHERE id=?",(status,json.dumps(result,sort_keys=True),offer_id))
            return result

    def choose_level(self,student,namespace,skill,choice,event_id):
        key=self.key(student,namespace,skill)
        identity(event_id,"Evento da preferência")
        if choice not in LEVELS:
            raise ValueError("Faixa inválida.")
        payload={"operation":"manual_choice","key":key,"choice":choice}
        with self.transaction() as conn:
            previous=self.receipt(conn,event_id,payload)
            if previous is not None:
                return previous
            state=self.state_row(conn,key)
            conn.execute("UPDATE states SET choice=?,revision=revision+1 WHERE student=? AND namespace=? AND skill=? AND version=?",
                         (choice,*key))
            result={"choice":choice,"student_id":student,"model_version":self.version}
            self.write_receipt(conn,event_id,payload,result)
            return result

    def inspect(self,student,namespace,skill):
        key=self.key(student,namespace,skill)
        with self.transaction() as conn:
            row=conn.execute("SELECT * FROM states WHERE student=? AND namespace=? AND skill=? AND version=?",key).fetchone()
            return dict(row) if row else None
