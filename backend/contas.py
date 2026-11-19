"""Cadastro e sessões persistidos no SQLite."""
import re
from datetime import datetime, timedelta, timezone
from secrets import token_hex, token_urlsafe
from uuid import uuid4

from fastapi import APIRouter, Request
from sqlalchemy.exc import IntegrityError
from starlette.concurrency import run_in_threadpool

from .auth import COOKIE, DURACAO_SESSAO, LimiteTentativas, conferir_senha, hash_senha, hash_token
from .common import ApiError, body, finite, reply
from .db import transacao
from .repositorio import BLOCOS, Repositorio

router = APIRouter()


def _iso(data):
    return data.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _agora():
    return datetime.now(timezone.utc)


def _publico(usuario):
    return {
        **{k: usuario[k] for k in ("id", "nome", "apelido", "email", "escola", "cidade", "bio")},
        "criadoEm": usuario["criado_em"],
    }


def _usuario(conexao, id_):
    return conexao.exec_driver_sql("SELECT * FROM usuario WHERE id=?", (id_,)).mappings().one()


class Contas:
    def __init__(self, banco, seguro=False):
        self.banco = banco
        self.repo = Repositorio(banco)
        self.seguro = seguro
        self.por_email = LimiteTentativas(8)
        self.por_ip = LimiteTentativas(30)
        self.cadastros = LimiteTentativas(20, 3600)
        self.hash_falso = hash_senha(token_hex(16))

    def _sessao(self, conexao, uid, agente):
        token = token_urlsafe(32)
        agora = _agora()
        data = _iso(agora)
        expira = _iso(agora + timedelta(seconds=DURACAO_SESSAO))
        conexao.exec_driver_sql("DELETE FROM sessao_login WHERE expira_em < ?", (data,))
        conexao.exec_driver_sql(
            """INSERT INTO sessao_login (token_hash,usuario_id,criada_em,expira_em,ultimo_uso,agente)
               VALUES (?,?,?,?,?,?)""",
            (hash_token(token), uid, data, expira, data, agente[:200]),
        )
        return token

    def cadastrar(self, nome, email, senha_hash, agente):
        uid, agora = str(uuid4()), _iso(_agora())
        with transacao(self.banco) as conexao:
            try:
                conexao.exec_driver_sql(
                    """INSERT INTO usuario (id,email,nome,senha_hash,criado_em,atualizado_em)
                       VALUES (?,?,?,?,?,?)""",
                    (uid, email, nome, senha_hash, agora, agora),
                )
            except IntegrityError as erro:
                if "usuario.email" in str(erro.orig):
                    raise ApiError(409, "Já existe uma conta com esse e-mail.") from None
                raise
            return _publico(_usuario(conexao, uid)), self._sessao(conexao, uid, agente)

    def por_identidade(self, email):
        with self.banco.connect() as conexao:
            return conexao.exec_driver_sql("SELECT * FROM usuario WHERE email=?", (email,)).mappings().first()

    def entrar(self, usuario, agente):
        with transacao(self.banco) as conexao:
            atual = conexao.exec_driver_sql(
                "SELECT * FROM usuario WHERE id=?", (usuario["id"],),
            ).mappings().first()
            if not atual or atual["senha_hash"] != usuario["senha_hash"]:
                raise ApiError(401, "E-mail ou senha incorretos.")
            return _publico(atual), self._sessao(conexao, atual["id"], agente)

    def atual(self, token):
        if not token:
            return None
        chave, agora = hash_token(token), _agora()
        with self.banco.begin() as conexao:
            sessao = conexao.exec_driver_sql(
                """SELECT u.*, s.ultimo_uso FROM sessao_login s JOIN usuario u ON s.usuario_id=u.id
                   WHERE s.token_hash=? AND s.expira_em >= ?""", (chave, _iso(agora)),
            ).mappings().first()
            if not sessao:
                return None
            ultimo = datetime.fromisoformat(sessao["ultimo_uso"])
            if (agora - ultimo).total_seconds() > 3600:
                conexao.exec_driver_sql("UPDATE sessao_login SET ultimo_uso=? WHERE token_hash=?", (_iso(agora), chave))
            return _publico(sessao)

    def sair(self, token):
        if token:
            with self.banco.begin() as conexao:
                conexao.exec_driver_sql("DELETE FROM sessao_login WHERE token_hash=?", (hash_token(token),))

    def atualizar_senha(self, uid, anterior, novo, agente):
        with transacao(self.banco) as cx:
            mudou = cx.exec_driver_sql(
                "UPDATE usuario SET senha_hash=?,atualizado_em=? WHERE id=? AND senha_hash=?",
                (novo, _iso(_agora()), uid, anterior),
            )
            if not mudou.rowcount:
                raise ApiError(403, "Senha atual incorreta.")
            cx.exec_driver_sql("DELETE FROM sessao_login WHERE usuario_id=?", (uid,))
            return self._sessao(cx, uid, agente)

    def excluir(self, uid, senha_hash):
        with transacao(self.banco) as cx:
            mudou = cx.exec_driver_sql("DELETE FROM usuario WHERE id=? AND senha_hash=?", (uid, senha_hash))
            if not mudou.rowcount:
                raise ApiError(403, "Senha incorreta.")

    def com_cookie(self, resposta, token, *, limpar=False):
        resposta.set_cookie(COOKIE, token, max_age=0 if limpar else DURACAO_SESSAO, httponly=True,
                            secure=self.seguro, samesite="lax", path="/")
        return resposta

    def resposta(self, usuario, token, status):
        return self.com_cookie(reply({"usuario": usuario}, status), token)


async def _dados(request):
    dados = await body(request)
    return dados if isinstance(dados, dict) else {}


def _ip(request):
    return request.client.host if request.client else ""


@router.post("/api/auth/registrar", status_code=201)
async def registrar(request: Request):
    contas = request.app.state.contas
    ip = _ip(request)
    if contas.cadastros.bloqueado(ip):
        raise ApiError(429, "Muitos cadastros deste computador. Tente novamente mais tarde.")
    dados = await _dados(request)
    nome, email, senha = (dados.get(k) for k in ("nome", "email", "senha"))
    if not isinstance(nome, str) or not 2 <= len(nome.strip()) <= 80:
        raise ApiError(400, "Informe seu nome (2 a 80 caracteres).")
    if not isinstance(email, str) or len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]{2,}", email.strip()):
        raise ApiError(400, "Informe um e-mail válido.")
    if not isinstance(senha, str) or not 8 <= len(senha) <= 200:
        raise ApiError(400, "A senha precisa ter de 8 a 200 caracteres.")
    senha_hash = await run_in_threadpool(hash_senha, senha)
    usuario, token = contas.cadastrar(nome.strip(), email.strip().lower(), senha_hash, request.headers.get("user-agent", ""))
    contas.cadastros.registrar_falha(ip)
    return contas.resposta(usuario, token, 201)


@router.post("/api/auth/entrar")
async def entrar(request: Request):
    contas = request.app.state.contas
    dados = await _dados(request)
    ip = _ip(request)
    email, senha = dados.get("email"), dados.get("senha")
    email = email.strip().lower() if isinstance(email, str) else ""
    if contas.por_email.bloqueado(email) or contas.por_ip.bloqueado(ip):
        raise ApiError(429, "Muitas tentativas. Aguarde alguns minutos.")
    usuario = contas.por_identidade(email) if email and isinstance(senha, str) and len(senha) <= 200 else None
    senha = senha[:200] if isinstance(senha, str) else ""
    ok = await run_in_threadpool(conferir_senha, senha, usuario["senha_hash"] if usuario else contas.hash_falso)
    if not usuario or not ok:
        contas.por_email.registrar_falha(email)
        contas.por_ip.registrar_falha(ip)
        raise ApiError(401, "E-mail ou senha incorretos.")
    publico, token = contas.entrar(usuario, request.headers.get("user-agent", ""))
    contas.por_email.zerar(email)
    return contas.resposta(publico, token, 200)


@router.post("/api/auth/sair")
async def sair(request: Request):
    contas = request.app.state.contas
    contas.sair(request.cookies.get(COOKIE))
    return contas.com_cookie(reply({"ok": True}), "", limpar=True)


@router.get("/api/eu")
async def eu(request: Request):
    return reply({"usuario": usuario_atual(request)})


def usuario_atual(request, *, exigir=False):
    usuario = request.app.state.contas.atual(request.cookies.get(COOKIE))
    if exigir and not usuario:
        raise ApiError(401, "Entre na sua conta para continuar.")
    return usuario


async def _conferir_senha_atual(contas, usuario, senha, mensagem):
    completo = contas.por_identidade(usuario["email"])
    if not isinstance(senha, str) or not completo or not await run_in_threadpool(
        conferir_senha, senha[:200], completo["senha_hash"],
    ):
        raise ApiError(403, mensagem)
    return completo["senha_hash"]


@router.post("/api/eu/senha")
async def senha(request: Request):
    usuario = usuario_atual(request, exigir=True)
    contas = request.app.state.contas
    dados = await _dados(request)
    anterior = await _conferir_senha_atual(contas, usuario, dados.get("atual"), "Senha atual incorreta.")
    nova = dados.get("nova")
    if not isinstance(nova, str) or not 8 <= len(nova) <= 200:
        raise ApiError(400, "A nova senha precisa ter de 8 a 200 caracteres.")
    novo = await run_in_threadpool(hash_senha, nova)
    token = contas.atualizar_senha(usuario["id"], anterior, novo, request.headers.get("user-agent", ""))
    return contas.com_cookie(reply({"ok": True}), token)


@router.delete("/api/eu")
async def excluir(request: Request):
    usuario = usuario_atual(request, exigir=True)
    contas = request.app.state.contas
    dados = await _dados(request)
    senha_hash = await _conferir_senha_atual(contas, usuario, dados.get("senha"), "Senha incorreta.")
    contas.excluir(usuario["id"], senha_hash)
    return contas.com_cookie(reply({"ok": True}), "", limpar=True)


@router.get("/api/eu/exportar")
def exportar(request: Request):
    usuario = usuario_atual(request, exigir=True)
    dados = request.app.state.contas.repo.exportar(usuario["id"])
    return reply({"exportadoEm": _iso(_agora()), "usuario": usuario, **dados})


def ler_bloco(request: Request):
    uid = usuario_atual(request, exigir=True)["id"]
    bloco = request.url.path.rsplit("/", 1)[1]
    return reply(request.app.state.contas.repo.obter(uid, bloco))


async def salvar_bloco(request: Request):
    uid = usuario_atual(request, exigir=True)["id"]
    bloco = request.url.path.rsplit("/", 1)[1]
    dados = await body(request, 8_000_000)
    if not isinstance(dados, dict) or "data" not in dados:
        raise ApiError(400, 'Envie { "data": ..., "baseRevisao": n }.')
    base = dados.get("baseRevisao")
    if base is not None and (not finite(base) or base != int(base)):
        raise ApiError(400, "baseRevisao inválida.")
    resultado = await run_in_threadpool(request.app.state.contas.repo.salvar, uid, bloco, dados["data"], base)
    return reply(resultado)


for bloco in BLOCOS:
    router.add_api_route(f"/api/eu/{bloco}", ler_bloco, methods=["GET"], name=f"ler_{bloco}")
    router.add_api_route(f"/api/eu/{bloco}", salvar_bloco, methods=["PUT"], name=f"salvar_{bloco}")
