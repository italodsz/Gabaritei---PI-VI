"""Carrega e valida os arquivos congelados que alimentam a API."""
import hashlib
import json
import re
import unicodedata

from .common import ROOT, finite

DATASET_SHA256 = "6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f"
CATALOGO_SHA256 = "c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb"
AREAS = dict(LC="linguagens", CH="humanas", CN="natureza", MT="matematica")
MATERIAS = {
    "Língua Portuguesa": ("portugues", "LC"), "Literatura": ("literatura", "LC"),
    "Artes": ("artes", "LC"), "Educação Física": ("educacao-fisica", "LC"),
    "Tecnologias da informação e comunicação": ("tecnologias", "LC"),
    "História": ("historia", "CH"), "Geografia": ("geografia", "CH"),
    "Filosofia": ("filosofia", "CH"), "Sociologia": ("sociologia", "CH"),
    "Física": ("fisica", "CN"), "Química": ("quimica", "CN"),
    "Biologia": ("biologia", "CN"), "Matemática": ("matematica", "MT"),
}


def sem_acentos(texto):
    return "".join(c for c in unicodedata.normalize("NFD", texto) if not unicodedata.category(c).startswith("M"))


def ordem_pt(item):
    nome = item["name"]
    return sem_acentos(nome).casefold(), nome.casefold(), nome


def slug(texto):
    return re.sub(r"[^a-z0-9]+", "-", sem_acentos(texto).lower()).strip("-")


def texto(valor):
    return ("" if valor is None else str(valor)).replace(r"\n", "\n").replace("\r\n", "\n").strip()


def triar(questao, config):
    limites = config["triagem"]
    if questao.get("application_format") not in limites["formatos"] or questao.get("application_type") not in limites["aplicacoes"]:
        return None
    tri = questao.get("tri") or {}
    a, b, c = (tri.get(k) for k in ("a", "b", "c"))
    if not all(finite(v) for v in (a, b, c)):
        return None
    if a >= limites["a_min"] and limites["b_min"] <= b <= limites["b_max"] and 0 <= c <= limites["c_max"]:
        return dict(a=a, b=b, c=c)
    return None


class Acervo:
    def __init__(self, raiz=ROOT, *, mostrar_imagens=True):
        base = raiz / "Dataset/base_trabalho"
        rec = raiz / "recomendador/rrf-tfidf-minilm-J"
        dados = (base / "data/questions.jsonl").read_bytes()
        catalogo = (rec / "catalogo/recomendacoes_titulo_area.json").read_bytes()
        sha = hashlib.sha256(dados).hexdigest()
        catalog_sha = hashlib.sha256(catalogo).hexdigest()
        if sha != DATASET_SHA256:
            raise ValueError("Dataset diferente do registrado: atualize e confira o catálogo antes de iniciar.")
        if catalog_sha != CATALOGO_SHA256:
            raise ValueError("Catálogo diferente do resultado conferido. Confira e registre a nova versão antes de iniciar.")
        if json.loads((rec / "indice/config.json").read_bytes())["base_sha256"] != sha:
            raise ValueError("Índices e dataset não correspondem.")
        cfg = json.loads((raiz / "backend/config/dificuldade_v1.json").read_bytes())
        self.catalogo = json.loads(catalogo)
        self.rows = {q["id"]: q for q in map(json.loads, dados.strip().splitlines())}
        self.splits = json.loads((base / "ids_elegiveis.json").read_bytes())
        self.ids = [id_ for split in self.splits.values() for id_ in split]
        metas = self.catalogo["questoes"]
        sugestoes = self.catalogo["recomendacoes"]
        if (len(set(self.ids)) != len(self.ids) or len(self.ids) != len(metas)
                or any(i not in self.rows or i not in metas or not isinstance(sugestoes.get(i), list) for i in self.ids)):
            raise ValueError("Os IDs do catálogo não correspondem aos elegíveis do dataset.")
        taxonomia = {}
        self.questions = []
        for id_ in self.ids:
            m = metas[id_]
            if m.get("defeito") or m.get("duplicata") or not m.get("materia") or not m.get("titulo"):
                continue
            self.questions.append(self._questao(self.rows[id_], m, taxonomia, cfg))
        self.by_id = {q["id"]: q for q in self.questions}
        for id_ in self.ids:
            familias = {self.rows[id_]["content_family_id"]}
            for candidato in sugestoes[id_]:
                if candidato == id_ or candidato not in self.by_id or not self._compativel(id_, candidato, familias):
                    raise ValueError(f"Sugestão incompatível no catálogo: {id_} -> {candidato}")
                familias.add(self.rows[candidato]["content_family_id"])
        materias = sorted(taxonomia.values(), key=ordem_pt)
        for materia in materias:
            materia["topics"].sort(key=ordem_pt)
        self.info = dict(datasetCommit="e6712a8", recommenderCommit="d10f5a3", sha256=sha,
                         catalogSha256=catalog_sha, method="titulo_area", total=len(self.rows),
                         eligible=len(self.ids), available=len(self.questions),
                         blocked=len(self.ids) - len(self.questions),
                         emptyRecommendationLists=sum(not sugestoes[i] for i in self.ids),
                         splits={k: len(v) for k, v in self.splits.items()}, database=False)
        self.bootstrap = dict(info=self.info, subjects=materias, questions=self.questions,
                              years=sorted({q["year"] for q in self.questions}, reverse=True))
        if mostrar_imagens:
            from .media import Midia

            self.midia = Midia(base / "media", self)
            for q in self.questions:
                q["images"] = self.midia.por_questao[q["id"]]

    def _compativel(self, id_, candidato, familias):
        q, c = self.rows[id_], self.rows[candidato]
        m, cm = (self.catalogo["questoes"][i] for i in (id_, candidato))
        idioma, outro = q.get("language"), c.get("language")
        estrangeiro = {"en", "es"}
        return (c["content_family_id"] not in familias and q["area"] == c["area"]
                and (m.get("materia"), m.get("titulo")) == (cm.get("materia"), cm.get("titulo"))
                and (idioma == outro or (idioma not in estrangeiro and outro not in estrangeiro)))

    @staticmethod
    def _questao(q, m, taxonomia, cfg):
        nome = m["materia"]
        idioma = q.get("language")
        if nome == "Língua estrangeira (inglês ou espanhol)":
            nome = "Espanhol" if idioma == "es" else "Inglês"
            materia_id, area = nome.lower().replace("ê", "e"), "LC"
        elif nome in MATERIAS:
            materia_id, area = MATERIAS[nome]
        else:
            raise ValueError(f"Matéria sem correspondência no app: {nome}")
        if q.get("answer") not in {"A", "B", "C", "D", "E"} or len(q["options"]) != 5:
            raise ValueError(f"Gabarito ou alternativas inválidos: {q['id']}")
        materia = taxonomia.setdefault(materia_id, dict(id=materia_id, name=nome, areaId=AREAS[area], topics=[]))
        titulo = m["titulo"]
        topico_id = f"{materia_id}-{slug(titulo)}"
        topico = next((t for t in materia["topics"] if t["id"] == topico_id), None)
        if topico is None:
            topico = dict(id=topico_id, subjectId=materia_id, name=titulo, subtopics=[])
            materia["topics"].append(topico)
        assunto = m.get("assunto")
        sub_id = f"{topico_id}.{slug(assunto or m.get('grande_tema') or 'geral')}"
        if not any(t["id"] == sub_id for t in topico["subtopics"]):
            topico["subtopics"].append(dict(id=sub_id, name=assunto or titulo))
        resultado = dict(
            id=q["id"], areaId=AREAS[q["area"]], subjectId=materia_id, topicId=topico_id, subtopicId=sub_id,
            year=q["year"], origin="oficial", difficulty=m.get("nivel") or "media", difficultyKnown=bool(m.get("nivel")),
            skill=f"Habilidade {q['skill']} do INEP" if q.get("skill") else assunto,
            prompt=texto(q["question"]),
            descriptions=[t for d in q.get("descriptions", []) if d.get("use_for_recommender") is True
                          and (t := texto(d.get("text")))],
            alternatives=[dict(letter=a["label"], text=texto(a.get("text")))
                          for a in sorted(q["options"], key=lambda a: a["label"])],
            correct=q["answer"], explanation=f"Gabarito oficial: alternativa {q['answer']}. Resolução comentada ainda não disponível.",
            familyId=q["content_family_id"], sourcePosition=(q.get("official_reference") or {}).get("position"),
            sourceArea=q["area"], warning=m.get("alerta_texto") or None, tri=triar(q, cfg),
        )
        if idioma in {"en", "es"}:
            resultado["foreignLanguage"] = "ingles" if idioma == "en" else "espanhol"
        return resultado

    def recommendations(self, id_, excluir, limite):
        ids = set(excluir)
        familias = {self.by_id[i]["familyId"] for i in ids if i in self.by_id and self.by_id[i]["familyId"]}
        return [i for i in self.catalogo["recomendacoes"][id_]
                if i not in ids and self.by_id[i]["familyId"] not in familias][:limite]
