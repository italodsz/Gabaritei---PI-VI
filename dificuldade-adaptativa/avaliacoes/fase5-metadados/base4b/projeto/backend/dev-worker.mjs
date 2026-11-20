import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve, basename } from 'node:path';
import { PROJECT_ROOT } from './acervo.mjs';

export function pythonDoLaboratorio() {
  if (process.env.GABARITEI_PYTHON) return process.env.GABARITEI_PYTHON;
  const executable = process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python';
  const paths = [resolve(PROJECT_ROOT, '.venv', executable), resolve(PROJECT_ROOT, 'recomendador/rrf-tfidf-minilm-J/.venv', executable),
    resolve(PROJECT_ROOT, '../Gabaritei---PI-VI/recomendador/rrf-tfidf-minilm-J/.venv', executable)];
  return paths.find(p => existsSync(p)) || 'python';
}

export class DevWorker {
  constructor() { this.process = null; this.pending = new Map(); this.sequence = 0; this.state = 'aguardando'; this.lastError = null; this.stderr = ''; }
  status() { return { state: this.state, error: this.lastError, python: basename(pythonDoLaboratorio()), gpuRequired: false }; }
  fail(message, child = this.process) {
    if (child !== this.process) return;
    this.state = 'indisponivel'; this.lastError = message;
    for (const entry of this.pending.values()) { clearTimeout(entry.timer); entry.reject(Object.assign(new Error(message), { status: 503 })); }
    this.pending.clear(); this.process = null;
    if (child && !child.killed) child.kill();
  }
  start() {
    if (this.process) return;
    this.state = 'carregando'; this.stderr = ''; this.lastError = null;
    const child = spawn(pythonDoLaboratorio(), ['-u', '-X', 'utf8', resolve(PROJECT_ROOT, 'backend/recomendador_debug.py')], {
      cwd: PROJECT_ROOT, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PYTHONUTF8: '1', OMP_NUM_THREADS: '2', OPENBLAS_NUM_THREADS: '2' },
    });
    this.process = child;
    child.stderr.on('data', chunk => { this.stderr = (this.stderr + chunk.toString()).slice(-6000); });
    child.on('error', error => this.fail(`Diagnóstico Python indisponível: ${error.message}. Configure GABARITEI_PYTHON com o ambiente que contém numpy, scipy e scikit-learn.`, child));
    child.on('exit', code => this.fail(`O diagnóstico Python encerrou (${code}). ${this.stderr.trim() || 'Confira o ambiente GABARITEI_PYTHON.'}`, child));
    child.stdin.on('error', error => this.fail(`Não foi possível enviar a consulta ao diagnóstico: ${error.message}`, child));
    createInterface({ input: child.stdout }).on('line', line => {
      let message;
      try { message = JSON.parse(line); } catch { this.fail('O diagnóstico retornou uma resposta inválida.', child); return; }
      if (child !== this.process) return;
      if (message.event === 'ready') { this.state = 'pronto'; return; }
      const entry = this.pending.get(message.id); if (!entry) return;
      clearTimeout(entry.timer); this.pending.delete(message.id);
      if (message.ok) entry.resolve(message.result);
      else entry.reject(Object.assign(new Error(message.error || 'Falha no diagnóstico.'), { status: 422 }));
    });
  }
  diagnose(input) {
    if (this.pending.size >= 8) return Promise.reject(Object.assign(new Error('Há consultas em andamento. Aguarde e tente novamente.'), { status: 429 }));
    this.start();
    return new Promise((resolveRequest, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => this.fail('O diagnóstico excedeu 45 segundos. Confira o ambiente Python e tente novamente.'), 45_000);
      this.pending.set(id, { resolve: resolveRequest, reject, timer });
      this.process.stdin.write(JSON.stringify({ ...input, id }) + '\n');
    });
  }
  close() { if (this.process) this.fail('Diagnóstico encerrado com o servidor.'); }
}
