"""Prepara o ambiente local e inicia o recomendador no terminal."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import subprocess
import sys
import venv

ROOT = Path(__file__).resolve().parent
LOCAL = Path(os.environ.get('GABARITEI_LOCAL') or
             str(Path(os.environ.get('LOCALAPPDATA', str(Path.home() / '.local' / 'share'))) / 'GabariteiRecomendador'))


def main() -> int:
    if sys.version_info < (3, 11):
        print('Instale Python 3.11 ou superior e abra iniciar.cmd novamente.')
        return 1
    environment = LOCAL / 'ambiente'
    python = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not python.exists():
        print('Preparando o ambiente local. Isso e necessario apenas na primeira execucao.', flush=True)
        venv.EnvBuilder(with_pip=True).create(environment)
    requirements = ROOT / 'requirements.txt'
    fingerprint = hashlib.sha256(requirements.read_bytes()).hexdigest()
    stamp = environment / '.dependencias'
    check = subprocess.run([str(python), '-c', 'import numpy, sqlalchemy'], capture_output=True)
    if not stamp.exists() or stamp.read_text(encoding='utf-8') != fingerprint or check.returncode:
        print('Instalando as dependencias do recomendador...', flush=True)
        result = subprocess.run([str(python), '-m', 'pip', 'install', '--disable-pip-version-check',
                                 '-r', str(requirements)])
        if result.returncode:
            print('Instalacao nao concluida. Confira sua conexao e tente novamente.')
            return result.returncode
        stamp.write_text(fingerprint, encoding='utf-8')
    env = dict(os.environ, PYTHONPATH=str(ROOT), PYTHONUTF8='1', PYTHONDONTWRITEBYTECODE='1')
    if sys.argv[1:] == ['--verificar']:
        script = ('from gabaritei_rec.catalogo import Catalogo; '
                  'from gabaritei_rec.config import carregar_config,versao_politica; '
                  'c=Catalogo.carregar(); print("Catalogo: "+str(len(c.ofertaveis()))+" questoes elegiveis"); '
                  'print("Politica: "+versao_politica(carregar_config()))')
        return subprocess.call([str(python), '-X', 'utf8', '-c', script], env=env, cwd=ROOT)
    command = [str(python), '-X', 'utf8', '-m', 'gabaritei_rec.terminal', '--sem-gabarito',
               '--perfis-dir', str(LOCAL / 'dados_usuario' / 'perfis'),
               '--saida', str(LOCAL / 'dados_usuario' / 'sessoes'), *sys.argv[1:]]
    return subprocess.call(command, env=env, cwd=ROOT)


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except (OSError, subprocess.SubprocessError) as exc:
        print(f'Nao foi possivel iniciar: {exc}')
        raise SystemExit(1)
