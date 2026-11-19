"""Sincronização dos dados do aluno no esquema SQLite compartilhado com Node."""
from collections import defaultdict
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
import json
import re

from .common import ApiError, finite
from .db import transacao

BLOCOS = ("estudos", "plano", "notas")
LISTAS_ESTUDO = {
    "favorites": ("favorita", "questao_id"),
    "reviewMarks": ("marca_revisao", "questao_id"),
    "celebratedAchievements": ("conquista_celebrada", "conquista_id"),
}
PERFIL = {"name": ("nome", 80), "nickname": ("apelido", 40), "school": ("escola", 120),
          "city": ("cidade", 80), "bio": ("bio", 500)}


def agora():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _json(valor):
    return json.dumps(valor, ensure_ascii=False, separators=(",", ":"))


def _extra(obj, *chaves):
    return {k: v for k, v in obj.items() if k not in chaves}


def _obj(valor, mensagem):
    if not isinstance(valor, dict):
        raise ApiError(400, mensagem)
    return valor


def _texto(valor, limite, campo, *, opcional=False):
    if valor is None and opcional:
        return None
    if not isinstance(valor, str) or len(valor) > limite:
        raise ApiError(400, f"Campo inválido: {campo}.")
    return valor


def _int(valor, campo, maximo=10**12):
    if not finite(valor) or not 0 <= valor <= maximo:
        raise ApiError(400, f"Campo inválido: {campo}.")
    return int(valor)


def _lista(valor, limite, campo):
    if not isinstance(valor, list) or len(valor) > limite:
        raise ApiError(400, f"Lista inválida: {campo}.")
    return valor


def _ids(valor, limite, campo):
    return [_texto(i, 80, campo) for i in _lista(valor, limite, campo)]


def _unicos(ids, mensagem):
    if len(ids) != len(set(ids)):
        raise ApiError(400, mensagem)


class _TextoNota(HTMLParser):
    tags = frozenset("b strong i em u br div p ul ol li span font".split())
    cor = re.compile(r"#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)", re.I)

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.partes = []

    def handle_data(self, texto):
        self.partes.append(texto.replace("<", "&lt;"))

    def handle_entityref(self, nome):
        self.partes.append(f"&{nome};")

    def handle_charref(self, nome):
        self.partes.append(f"&#{nome};")

    def handle_starttag(self, tag, attrs):
        self._tag(tag, attrs)

    def handle_startendtag(self, tag, attrs):
        self._tag(tag, attrs, " /")

    def handle_endtag(self, tag):
        if tag in self.tags:
            self.partes.append(f"</{tag}>")

    def _tag(self, tag, attrs, fecho=""):
        if tag not in self.tags:
            return
        atributo = ""
        if tag in ("span", "font"):
            campos = dict(attrs)
            estilo = campos.get("style") or ""
            cor = re.search(r"(?:^|;)\s*color\s*:\s*([^;]+)", estilo, re.I)
            if cor and self.cor.fullmatch(cor[1].strip()):
                atributo = f' style="color: {escape(cor[1].strip())}"'
            elif tag == "font" and re.fullmatch(r"#[0-9a-f]{3,8}", campos.get("color") or "", re.I):
                atributo = f' color="{escape(campos["color"])}"'
        self.partes.append(f"<{tag}{atributo}{fecho}>")


def limpar_html(texto):
    parser = _TextoNota()
    parser.feed(texto)
    parser.close()
    return "".join(parser.partes)


def _atividades(dados):
    valor = _obj(dados, "Plano inválido.")
    linhas = []
    for bruto in _lista(valor.get("activities"), 500, "activities"):
        a = _obj(bruto, "Atividade inválida.")
        dados_json = _json(a)
        if len(dados_json) > 50_000:
            raise ApiError(413, "Atividade muito grande.")
        linhas.append((_texto(a.get("id"), 80, "id"), _texto(a.get("title"), 300, "title"),
                       _texto(a.get("area"), 40, "area"), _texto(a.get("createdAt"), 40, "createdAt", opcional=True),
                       _texto(a.get("updatedAt"), 40, "updatedAt", opcional=True), dados_json))
    _unicos([l[0] for l in linhas], "Atividades com id repetido.")
    return linhas


def _notas(dados):
    valor = _obj(dados, "Notas inválidas.")
    linhas = []
    for bruto in _lista(valor.get("blocks"), 1000, "blocks"):
        b = _obj(bruto, "Bloco inválido.")
        id_, tipo = _texto(b.get("id"), 80, "id"), b.get("type")
        if tipo == "text":
            html = limpar_html(_texto(b.get("html"), 100_000, "html"))
            linhas.append((id_, tipo, html, None, None, _json(_extra(b, "id", "type", "html"))))
        elif tipo == "ref" and isinstance(b.get("ref"), dict):
            ref = b["ref"]
            rid = ref.get("id")
            if isinstance(rid, bool):
                rid = str(rid).lower()
            linhas.append((id_, tipo, None, _texto(ref.get("kind"), 40, "ref.kind"),
                           _texto("" if rid is None else str(rid), 120, "ref.id"), _json(_extra(b, "id", "type", "ref"))))
        else:
            raise ApiError(400, "Tipo de bloco desconhecido.")
    _unicos([l[0] for l in linhas], "Blocos com id repetido.")
    return linhas


def _ler_notas(linhas):
    blocos = []
    for linha in linhas:
        bloco = {**json.loads(linha["dados"]), "id": linha["id"], "type": linha["tipo"]}
        if linha["tipo"] == "text":
            bloco["html"] = linha["html"]
        else:
            bloco["ref"] = dict(kind=linha["ref_tipo"], id=linha["ref_id"])
        blocos.append(bloco)
    return blocos


def _respostas(dados, pratica, nome):
    if not isinstance(dados, dict) or len(dados) > 3000:
        raise ApiError(400, f"Respostas inválidas em {nome}.")
    for id_, bruto in dados.items():
        a = _obj(bruto, f"Resposta inválida em {nome}.")
        _texto(id_, 80, "questionId")
        if "questionId" in a and a["questionId"] != id_:
            raise ApiError(400, f"Resposta com identificador divergente em {nome}.")
        alt = a.get("selected")
        if alt is not None and alt not in ("A", "B", "C", "D", "E"):
            raise ApiError(400, f"Alternativa inválida em {nome}.")
        campos = ["questionId", "selected", "answeredAt", "timeSpentMs"]
        base = (id_, alt, _texto(a.get("answeredAt"), 40, "answeredAt", opcional=True),
                _int(a.get("timeSpentMs", 0) if a.get("timeSpentMs") is not None else 0, "timeSpentMs"))
        if pratica:
            campos.extend(("confirmed", "correct"))
            base = (*base[:2], int(bool(a.get("confirmed"))),
                    int(bool(a["correct"])) if a.get("correct") is not None else None, *base[2:])
        yield (*base, _json(_extra(a, *campos)))


def _sessao(bruto, pratica):
    nome = "practiceSessions" if pratica else "simulations"
    s = _obj(bruto, f"Item inválido em {nome}.")
    if s.get("status") not in ("in_progress", "completed"):
        raise ApiError(400, "Status inválido.")
    configuracao = s.get("filters" if pratica else "config")
    if not isinstance(s.get("clock"), dict) or not isinstance(configuracao, dict):
        raise ApiError(400, f"Item incompleto em {nome}.")
    campos = ["id", "kind", "title", "status", "createdAt", "updatedAt", "completedAt", "questionIds",
              "answers", "currentIndex", "clock", "cursorElapsedMs"]
    id_ = _texto(s.get("id"), 80, "id")
    base = (_texto(s.get("title"), 300, "title"), s["status"], _texto(s.get("createdAt"), 40, "createdAt"),
            _texto(s.get("updatedAt"), 40, "updatedAt"), _texto(s.get("completedAt"), 40, "completedAt", opcional=True))
    questoes = _json(_ids(s.get("questionIds"), 3000, "questionIds"))
    indice, cursor = (_int(0 if s.get(k) is None else s[k], k) for k in ("currentIndex", "cursorElapsedMs"))
    tempo = (indice, _json(s["clock"]), cursor)
    if pratica:
        campos.extend(("mode", "filters", "timerVisible"))
        valores = (_texto(s.get("mode"), 30, "mode"), *base, _json(configuracao), questoes, *tempo,
                   int(s.get("timerVisible") is not False))
    else:
        campos.extend(("finishReason", "config", "sections", "marked", "timerHidden"))
        valores = (*base, _texto(s.get("finishReason"), 20, "finishReason", opcional=True),
                   _json(configuracao), questoes, _json(_lista([] if s.get("sections") is None else s["sections"], 20, "sections")),
                   _json(_ids([] if s.get("marked") is None else s["marked"], 3000, "marked")),
                   *tempo, int(bool(s.get("timerHidden"))))
    return id_, (*valores, _json(_extra(s, *campos))), list(_respostas(s.get("answers"), pratica, nome))


def _estudos(dados):
    d = _obj(dados, "Dados de estudo inválidos.")
    p = _obj(d.get("profile"), "Perfil ausente.")
    onboarding = _obj(d.get("onboarding"), "Preferências ausentes.")
    preferencias = _obj(d.get("study"), "Preferências ausentes.")
    schema = _int(1 if d.get("schemaVersion") is None else d["schemaVersion"], "schemaVersion", 10_000)
    perfil = [_texto(p.get(k) if k == "name" else ("" if p.get(k) is None else p[k]), limite, f"profile.{k}")
              for k, (_, limite) in PERFIL.items()]
    perfil[0] = perfil[0].strip() or "Estudante"
    sessoes = [_sessao(s, True) for s in _lista(d.get("practiceSessions"), 3000, "practiceSessions")]
    simulados = [_sessao(s, False) for s in _lista(d.get("simulations"), 500, "simulations")]
    ids = [s[0] for s in sessoes]
    _unicos(ids, "Identificador repetido em práticas.")
    _unicos(ids + [s[0] for s in simulados], "Identificador repetido em simulados.")
    listas = {k: list(dict.fromkeys(_ids(d.get(k), 5000, k))) for k in LISTAS_ESTUDO}
    metas = []
    for bruto in _lista(d.get("goals"), 20, "goals"):
        g = _obj(bruto, "Meta inválida.")
        metas.append((_texto(g.get("kind"), 40, "goal.kind"),
                      g["target"] if finite(g.get("target")) else 0, int(bool(g.get("enabled")))))
    _unicos([m[0] for m in metas], "Metas repetidas.")
    extra = _extra(d, "schemaVersion", "profile", "onboarding", "study", "practiceSessions", "simulations",
                   "goals", *LISTAS_ESTUDO)
    return perfil, (schema, _json(onboarding), _json(preferencias), _json(extra)), sessoes, simulados, listas, metas


def _ler_sessoes(cx, uid, pratica):
    tabela, tabela_resp, chave = ("sessao_pratica", "resposta_pratica", "sessao_id") if pratica else (
        "simulado", "resposta_simulado", "simulado_id")
    respostas = defaultdict(dict)
    sql = f"SELECT * FROM {tabela_resp} WHERE {chave} IN (SELECT id FROM {tabela} WHERE usuario_id=?) ORDER BY rowid"
    for a in cx.exec_driver_sql(sql, (uid,)).mappings():
        questao = a["questao_id"]
        resposta = {**json.loads(a["extra"]), "questionId": questao, "selected": a["selecionada"],
                    "answeredAt": a["respondida_em"], "timeSpentMs": a["tempo_ms"]}
        if pratica:
            resposta.update(confirmed=bool(a["confirmada"]), correct=None if a["correta"] is None else bool(a["correta"]))
        respostas[a[chave]][questao] = resposta
    sessoes = []
    for s in cx.exec_driver_sql(f"SELECT * FROM {tabela} WHERE usuario_id=? ORDER BY ordem", (uid,)).mappings():
        sessao = {**json.loads(s["extra"]), "id": s["id"], "title": s["titulo"], "status": s["status"],
                  "questionIds": json.loads(s["questoes"]), "answers": respostas[s["id"]],
                  "currentIndex": s["indice_atual"], "clock": json.loads(s["relogio"]), "cursorElapsedMs": s["cursor_ms"]}
        if pratica:
            sessao.update(kind="practice", mode=s["modo"], filters=json.loads(s["filtros"]), createdAt=s["criada_em"],
                          updatedAt=s["atualizada_em"], completedAt=s["concluida_em"], timerVisible=bool(s["cronometro_visivel"]))
        else:
            sessao.update(kind="simulation", config=json.loads(s["configuracao"]), sections=json.loads(s["secoes"]),
                          marked=json.loads(s["marcadas"]), createdAt=s["criado_em"], updatedAt=s["atualizado_em"],
                          completedAt=s["concluido_em"], finishReason=s["motivo_fim"], timerHidden=bool(s["cronometro_oculto"]))
        sessoes.append(sessao)
    return sessoes


def _ler_estudos(cx, uid):
    ce = cx.exec_driver_sql("SELECT * FROM conta_estudos WHERE usuario_id=?", (uid,)).mappings().first()
    if not ce:
        return None
    u = cx.exec_driver_sql("SELECT * FROM usuario WHERE id=?", (uid,)).mappings().one()
    perfil = {k: u[col] for k, (col, _) in PERFIL.items()}
    perfil.update(id=uid, kind="registered", email=u["email"], createdAt=u["criado_em"])
    dados = {**json.loads(ce["extra"]), "schemaVersion": ce["schema_version"], "profile": perfil,
             "onboarding": json.loads(ce["onboarding"]), "study": json.loads(ce["preferencias"]),
             "practiceSessions": _ler_sessoes(cx, uid, True), "simulations": _ler_sessoes(cx, uid, False),
             "goals": [dict(kind=k, target=v, enabled=bool(a)) for k, v, a in
                       cx.exec_driver_sql("SELECT tipo,alvo,ativa FROM meta WHERE usuario_id=? ORDER BY ordem", (uid,))]}
    for chave, (tabela, coluna) in LISTAS_ESTUDO.items():
        dados[chave] = list(cx.exec_driver_sql(
            f"SELECT {coluna} FROM {tabela} WHERE usuario_id=? ORDER BY ordem", (uid,),
        ).scalars())
    return dados


def _inserir_sessoes(cx, uid, sessoes, pratica):
    tabela, tabela_resp, item, colunas, cols_resp = (
        ("sessao_pratica", "resposta_pratica", "prática", 16, 8) if pratica else
        ("simulado", "resposta_simulado", "simulado", 18, 6)
    )
    for ordem, (id_, valores, respostas) in enumerate(sessoes):
        if cx.exec_driver_sql(f"SELECT 1 FROM {tabela} WHERE id=?", (id_,)).first():
            raise ApiError(409, f"Identificador de {item} já usado.")
        cx.exec_driver_sql(f"INSERT INTO {tabela} VALUES ({','.join('?' * colunas)})", (id_, uid, ordem, *valores))
        if respostas:
            cx.exec_driver_sql(f"INSERT INTO {tabela_resp} VALUES ({','.join('?' * cols_resp)})",
                               [(id_, *r) for r in respostas])


def _salvar_estudos(cx, uid, dados):
    perfil, conta, sessoes, simulados, listas, metas = dados
    if not cx.exec_driver_sql("SELECT 1 FROM conta_estudos WHERE usuario_id=?", (uid,)).first():
        perfil[0] = cx.exec_driver_sql("SELECT nome FROM usuario WHERE id=?", (uid,)).scalar_one()
    cx.exec_driver_sql("UPDATE usuario SET nome=?,apelido=?,escola=?,cidade=?,bio=?,atualizado_em=? WHERE id=?",
                       (*perfil, agora(), uid))
    cx.exec_driver_sql(
        """INSERT INTO conta_estudos VALUES (?,?,?,?,?) ON CONFLICT(usuario_id) DO UPDATE
           SET schema_version=excluded.schema_version,onboarding=excluded.onboarding,
               preferencias=excluded.preferencias,extra=excluded.extra""", (uid, *conta),
    )
    colunas = [tabela for tabela, _ in LISTAS_ESTUDO.values()]
    for tabela in ("sessao_pratica", "simulado", "meta", *colunas):
        cx.exec_driver_sql(f"DELETE FROM {tabela} WHERE usuario_id=?", (uid,))
    _inserir_sessoes(cx, uid, sessoes, True)
    _inserir_sessoes(cx, uid, simulados, False)
    for chave, (tabela, _) in LISTAS_ESTUDO.items():
        if listas[chave]:
            cx.exec_driver_sql(f"INSERT INTO {tabela} VALUES (?,?,?)", [(uid, id_, i) for i, id_ in enumerate(listas[chave])])
    if metas:
        cx.exec_driver_sql("INSERT INTO meta VALUES (?,?,?,?,?)", [(uid, *m, i) for i, m in enumerate(metas)])


class Repositorio:
    def __init__(self, banco):
        self.banco = banco

    @staticmethod
    def _rev(cx, uid, bloco):
        return cx.exec_driver_sql("SELECT revisao FROM estado_usuario WHERE usuario_id=? AND chave=?",
                                  (uid, bloco)).scalar() or 0

    def _obter(self, cx, uid, bloco):
        revisao = self._rev(cx, uid, bloco)
        if bloco == "estudos":
            dados = _ler_estudos(cx, uid)
        elif bloco == "plano":
            atividades = [json.loads(linha) for linha in cx.exec_driver_sql(
                "SELECT dados FROM atividade_plano WHERE usuario_id=? ORDER BY ordem", (uid,),
            ).scalars()]
            dados = {"activities": atividades} if revisao or atividades else None
        else:
            notas = _ler_notas(cx.exec_driver_sql(
                "SELECT * FROM nota_bloco WHERE usuario_id=? ORDER BY ordem", (uid,),
            ).mappings())
            dados = {"blocks": notas} if revisao or notas else None
        return {"revisao": revisao, "data": dados}

    def obter(self, uid, bloco):
        with transacao(self.banco) as cx:
            return self._obter(cx, uid, bloco)

    def exportar(self, uid):
        with transacao(self.banco) as cx:
            return {bloco: self._obter(cx, uid, bloco)["data"] for bloco in BLOCOS}

    def salvar(self, uid, bloco, dados, base):
        dados = {"estudos": _estudos, "plano": _atividades, "notas": _notas}[bloco](dados)
        with transacao(self.banco) as cx:
            atual = self._rev(cx, uid, bloco)
            if base is not None and base != atual:
                raise ApiError(409, "Seus dados foram alterados em outra aba ou dispositivo. Recarregue para continuar.",
                               revisao=atual)
            if bloco == "estudos":
                _salvar_estudos(cx, uid, dados)
            else:
                tabela = "atividade_plano" if bloco == "plano" else "nota_bloco"
                cx.exec_driver_sql(f"DELETE FROM {tabela} WHERE usuario_id=?", (uid,))
                if dados:
                    cx.exec_driver_sql(f"INSERT INTO {tabela} VALUES (?,?,?,?,?,?,?,?)",
                                       [(id_, uid, i, *resto) for i, (id_, *resto) in enumerate(dados)])
            nova = atual + 1
            cx.exec_driver_sql(
                """INSERT INTO estado_usuario VALUES (?,?,?,?) ON CONFLICT(usuario_id,chave) DO UPDATE
                   SET revisao=excluded.revisao,atualizado_em=excluded.atualizado_em""", (uid, bloco, nova, agora()),
            )
        return {"revisao": nova}
