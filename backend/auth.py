"""Senhas, cookies e limites compatíveis com a versão Node."""
from base64 import b64decode, b64encode
from binascii import Error
from collections import deque
from hashlib import scrypt, sha256
from hmac import compare_digest
from secrets import token_bytes
from threading import Lock
from time import monotonic

COOKIE = "gabaritei_sessao"
DURACAO_SESSAO = 30 * 24 * 3600


def _scrypt(senha, sal):
    return scrypt(senha.encode("utf-8"), salt=sal, n=16384, r=8, p=1,
                  dklen=64, maxmem=64 * 1024 * 1024)


def hash_senha(senha):
    sal = token_bytes(16)
    return "scrypt$16384$8$1$" + "$".join(
        b64encode(valor).decode("ascii") for valor in (sal, _scrypt(senha, sal))
    )


def conferir_senha(senha, guardado):
    if not isinstance(guardado, str):
        return False
    partes = guardado.split("$")
    if len(partes) != 6 or partes[:4] != ["scrypt", "16384", "8", "1"]:
        return False
    try:
        sal, esperado = (b64decode(p, validate=True) for p in partes[4:])
    except (ValueError, Error):
        return False
    return (len(sal) == 16 and len(esperado) == 64
            and compare_digest(_scrypt(senha, sal), esperado))


def hash_token(token):
    return sha256(token.encode("utf-8")).hexdigest()


class LimiteTentativas:
    def __init__(self, maximo=8, janela=15 * 60, relogio=monotonic):
        self.maximo = maximo
        self.janela = janela
        self.relogio = relogio
        self._falhas = {}
        self._lock = Lock()

    def _limpar(self, chave, agora):
        fila = self._falhas.get(chave, deque())
        while fila and agora - fila[0] >= self.janela:
            fila.popleft()
        if not fila:
            self._falhas.pop(chave, None)
        return fila

    def bloqueado(self, chave):
        with self._lock:
            return len(self._limpar(chave, self.relogio())) >= self.maximo

    def registrar_falha(self, chave):
        with self._lock:
            agora = self.relogio()
            fila = self._limpar(chave, agora)
            fila.append(agora)
            self._falhas[chave] = fila

    def zerar(self, chave):
        with self._lock:
            self._falhas.pop(chave, None)
