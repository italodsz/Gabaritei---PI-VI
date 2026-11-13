import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { carregarAcervo } from './acervo.mjs';
import { DevWorker } from './dev-worker.mjs';
import { criarDadosDev } from './dev-data.mjs';

const frontend = fileURLToPath(new URL('../frontend/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const send = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
const integer = (value, fallback, max) => { if (value === null || value === undefined) return fallback; const n = Number(value); if (!Number.isInteger(n) || n < 0 || n > max) throw Object.assign(new Error('Parâmetro numérico inválido.'), { status: 400 }); return n; };
async function body(req) {
  let bytes = 0, chunks = [];
  for await (const chunk of req) { bytes += chunk.length; if (bytes > 256_000) throw Object.assign(new Error('Solicitação muito grande.'), { status: 413 }); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('JSON inválido.'), { status: 400 }); }
}

export function criarServidor(acervo) {
  const worker = new DevWorker();
  let devData;
  const dev = () => devData ||= criarDadosDev(acervo).catch(error => { devData = null; throw error; });
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname.startsWith('/api/')) {
        if (pathname.startsWith('/api/dev/')) {
          const data = await dev();
          if (req.method === 'GET' && pathname === '/api/dev/resumo') return send(res, 200, { ...data.summary, worker: worker.status() });
          if (req.method === 'GET' && pathname === '/api/dev/questoes') return send(res, 200, data.list({
            area: url.searchParams.get('area') || '', subject: url.searchParams.get('materia') || '', year: url.searchParams.get('ano') || '',
            status: url.searchParams.get('status') ?? 'liberada', split: url.searchParams.get('split') || '', search: url.searchParams.get('busca') || '',
            offset: integer(url.searchParams.get('inicio'), 0, acervo.rows.size), limit: integer(url.searchParams.get('limite'), 20, 100),
          }));
          const detail = pathname.match(/^\/api\/dev\/questoes\/(gq_[a-f0-9]+)$/);
          if (req.method === 'GET' && detail) { const q = data.detail(detail[1]); return send(res, q ? 200 : 404, q || { error: 'Questão não encontrada.' }); }
          if (req.method === 'POST' && pathname === '/api/dev/diagnostico') {
            const input = await body(req);
            const q = typeof input?.questionId === 'string' ? data.detail(input.questionId) : null;
            if (!q) return send(res, 404, { error: 'Questão não encontrada.' });
            if (!q.canAnalyze) return send(res, 422, { error: q.analysisRestriction });
            const exclude = input.exclude ?? [];
            if (!Array.isArray(exclude) || exclude.length > 5000 || exclude.some(i => typeof i !== 'string')) return send(res, 400, { error: 'Lista de exclusão inválida.' });
            const result = await worker.diagnose({ questionId: q.id, limit: integer(input.limit, 20, 50), exclude });
            return send(res, 200, result);
          }
          return send(res, 404, { error: 'Rota de desenvolvimento não encontrada.' });
        }
        if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { status: 'ok', ...acervo.info });
        if (req.method === 'GET' && pathname === '/api/bootstrap') return send(res, 200, acervo.bootstrap);
        if (req.method === 'GET' && pathname === '/api/questoes') {
          const area = url.searchParams.get('area'), subject = url.searchParams.get('materia'), term = url.searchParams.get('busca')?.toLocaleLowerCase('pt-BR');
          const year = url.searchParams.has('ano') ? integer(url.searchParams.get('ano'), null, 2100) : null;
          const limit = integer(url.searchParams.get('limite'), 30, 100), offset = integer(url.searchParams.get('inicio'), 0, acervo.questions.length);
          const found = acervo.questions.filter(q => (!area || q.areaId === area || q.sourceArea === area) && (!subject || q.subjectId === subject) && (!year || q.year === year) && (!term || `${q.prompt} ${q.descriptions.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term)));
          return send(res, 200, { total: found.length, questions: found.slice(offset, offset + limit) });
        }
        const match = pathname.match(/^\/api\/questoes\/(gq_[a-f0-9]+)(?:\/(recomendacoes|responder))?$/);
        if (match) {
          const [, id, action] = match;
          if (!acervo.catalogo.questoes[id]) return send(res, 404, { error: 'Questão não encontrada.' });
          if (req.method === 'GET' && !action) {
            const question = acervo.byId.get(id);
            return send(res, question ? 200 : 422, question ? { question } : { error: 'Questão bloqueada para prática.' });
          }
          if (action === 'recomendacoes' && ['GET', 'POST'].includes(req.method)) {
            const input = req.method === 'POST' ? await body(req) : {};
            const exclude = input?.exclude ?? [];
            if (!Array.isArray(exclude) || exclude.length > 5000 || exclude.some(i => typeof i !== 'string')) return send(res, 400, { error: 'Lista de exclusão inválida.' });
            const limit = integer(input?.limit ?? url.searchParams.get('limite'), 5, 50);
            const ids = acervo.recommendations(id, exclude, limit);
            return send(res, 200, { method: 'titulo_area', questionId: id, ids, questions: ids.map(i => acervo.byId.get(i)), reason: ids.length ? null : 'Não há sugestões compatíveis disponíveis para esta questão.' });
          }
          if (req.method === 'POST' && action === 'responder') {
            const question = acervo.byId.get(id), input = await body(req);
            if (!question) return send(res, 422, { error: 'Questão bloqueada para prática.' });
            if (!/^[A-E]$/.test(input?.selected)) return send(res, 400, { error: 'Escolha uma alternativa de A a E.' });
            return send(res, 200, { questionId: id, selected: input.selected, correct: input.selected === question.correct, answer: question.correct, explanation: question.explanation, persisted: false });
          }
        }
        return send(res, 404, { error: 'Rota não encontrada.' });
      }
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: 'Método não permitido.' });
      const path = resolve(frontend, '.' + (pathname === '/' ? '/index.html' : ['/dev', '/dev/'].includes(pathname) ? '/dev.html' : pathname));
      if (!path.startsWith(frontend.endsWith(sep) ? frontend : frontend + sep) || !types[extname(path)] || pathname.includes('/node_modules/')) return send(res, 404, { error: 'Arquivo não encontrado.' });
      const contents = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : contents);
    } catch (error) {
      const status = error.status || (['ENOENT', 'EISDIR'].includes(error.code) ? 404 : error instanceof URIError ? 400 : 500);
      if (status === 500) console.error(error);
      send(res, status, { error: status === 500 ? 'Não foi possível concluir a solicitação.' : error.message });
    }
  });
  server.on('close', () => worker.close());
  return server;
}

export async function iniciar() {
  const acervo = await carregarAcervo();
  const server = criarServidor(acervo);
  const port = integer(process.env.PORT, 4173, 65535);
  server.on('error', error => { console.error(`Não foi possível abrir o Gabaritei: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Gabaritei\nLocal: http://127.0.0.1:${server.address().port}\n${acervo.info.available} questões disponíveis · recomendador titulo_area · sem banco de dados`));
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await iniciar();
