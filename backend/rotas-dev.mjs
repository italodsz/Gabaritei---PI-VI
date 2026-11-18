// Rotas do laboratório (/dev): listagem e detalhe das questões e o diagnóstico ao vivo do titulo_area (worker Python).
import { send, integer, body, listaExclusao } from './http.mjs';
import { DevWorker } from './dev-worker.mjs';
import { criarDadosDev } from './dev-data.mjs';

export function criarRotasDev({ acervo }) {
  const worker = new DevWorker();
  let devData;
  const dados = () => devData ||= criarDadosDev(acervo).catch(error => { devData = null; throw error; });

  async function tratar({ req, res, url, pathname }) {
    if (!pathname.startsWith('/api/dev/') || pathname === '/api/dev/dificuldade') return false;
    const data = await dados(), m = req.method, p = url.searchParams;
    if (m === 'GET' && pathname === '/api/dev/resumo') { send(res, 200, { ...data.summary, worker: worker.status() }); return true; }
    if (m === 'GET' && pathname === '/api/dev/questoes') {
      send(res, 200, data.list({
        area: p.get('area') || '', subject: p.get('materia') || '', year: p.get('ano') || '', status: p.get('status') ?? 'liberada', split: p.get('split') || '', search: p.get('busca') || '',
        offset: integer(p.get('inicio'), 0, acervo.rows.size), limit: integer(p.get('limite'), 20, 100),
      }));
      return true;
    }
    const detail = pathname.match(/^\/api\/dev\/questoes\/(gq_[a-f0-9]+)$/);
    if (m === 'GET' && detail) { const q = data.detail(detail[1]); send(res, q ? 200 : 404, q || { error: 'Questão não encontrada.' }); return true; }
    if (m === 'POST' && pathname === '/api/dev/diagnostico') {
      const input = await body(req);
      const q = typeof input?.questionId === 'string' ? data.detail(input.questionId) : null;
      if (!q) { send(res, 404, { error: 'Questão não encontrada.' }); return true; }
      if (!q.canAnalyze) { send(res, 422, { error: q.analysisRestriction }); return true; }
      send(res, 200, await worker.diagnose({ questionId: q.id, limit: integer(input.limit, 20, 50), exclude: listaExclusao(input.exclude) }));
      return true;
    }
    send(res, 404, { error: 'Rota de desenvolvimento não encontrada.' }); return true;
  }
  return { tratar, fechar: () => worker.close() };
}
