from backend.auth import conferir_senha, hash_senha
from backend.db import MIGRACOES, abrir_banco, migrar


def test_migracoes_idempotentes_e_chaves_estrangeiras():
    banco = abrir_banco(":memory:")
    try:
        assert migrar(banco) == []
        with banco.connect() as cx:
            assert cx.exec_driver_sql("PRAGMA foreign_keys").scalar_one() == 1
            assert set(cx.exec_driver_sql("SELECT versao FROM migracao").scalars()) == set(MIGRACOES)
            assert cx.exec_driver_sql("SELECT COUNT(*) FROM perfil_tri").scalar_one() == 0
    finally:
        banco.dispose()


def test_senha_usa_o_formato_legado():
    hash_node = ("scrypt$16384$8$1$DhPAOttlXe8oKgmDOuS9xg==$"
                 "J7V8HbtYNXfeVcvi29OTZ6ognl4zwU2YcSH+sMu3BLyf1xoHhRPMDGJoknq5d5BsB8TIkgt743FiCSWE/iOTeQ==")
    assert conferir_senha("senha de teste", hash_node)
    assert not conferir_senha("outra senha", hash_node)
    atual = hash_senha("senha de teste")
    assert atual.startswith("scrypt$16384$8$1$")
    assert conferir_senha("senha de teste", atual)
