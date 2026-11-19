import { execFileSync } from 'node:child_process';
import { python, raiz } from '../../frontend/python.mjs';

export function carregarAcervo() {
  const script = [
    'import json',
    'from backend.acervo import Acervo',
    'a = Acervo(mostrar_imagens=False)',
    'print(json.dumps(dict(bootstrap=a.bootstrap, catalogo=a.catalogo)))',
  ].join('\n');
  const saida = execFileSync(python, ['-c', script], { cwd: raiz, maxBuffer: 32 * 1024 * 1024 });
  const acervo = JSON.parse(saida);
  const questions = acervo.bootstrap.questions;
  return { ...acervo, questions, byId: new Map(questions.map(q => [q.id, q])) };
}
