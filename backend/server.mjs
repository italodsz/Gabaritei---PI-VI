// Servidor do Gabaritei: API (rotas em rotas-*.mjs) e arquivos do front-end, num único processo Node.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { carregarAcervo } from './acervo.mjs';
import { abrirBanco } from './db.mjs';
import { repositorio } from './repositorio.mjs';
import { criarRotasConta } from './rotas-conta.mjs';
import { criarDificuldade } from './rotas-dificuldade.mjs';
import { criarRotasQuestoes } from './rotas-questoes.mjs';
import { criarRotasDev } from './rotas-dev.mjs';
import { origemPermitida } from './auth.mjs';
import { send, body, integer } from './http.mjs';

const frontend = fileURLToPath(new URL('../frontend/', import.meta.url));
const raizFront = frontend.endsWith(sep) ? frontend : frontend + sep;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon' };

export function criarServidor(acervo, { db = abrirBanco(), seguro = process.env.GABARITEI_COOKIE_SEGURO === '1' } = {}) {
  const repo = repositorio(db);
  const dificuldade = criarDificuldade({ db, repo, acervo });
  const dev = criarRotasDev({ acervo });
  // Ordem: conta (/api/auth, /api/eu), dificuldade (/api/eu/perfil-tri, /api/recomendar, /api/dev/dificuldade), dev, acervo.
  const rotas = [criarRotasConta(repo, { seguro }), dificuldade.tratar, dev.tratar, criarRotasQuestoes({ acervo, dificuldade })];

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(req.method) && !origemPermitida(req)) return send(res, 403, { error: 'Origem não permitida.' });
        for (const tratar of rotas) if (await tratar({ req, res, url, pathname, send, body })) return;
        return send(res, 404, { error: 'Rota não encontrada.' });
      }
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: 'Método não permitido.' });
      const path = resolve(frontend, '.' + (pathname === '/' ? '/index.html' : ['/dev', '/dev/'].includes(pathname) ? '/dev.html' : pathname));
      if (!path.startsWith(raizFront) || !types[extname(path)] || pathname.includes('/node_modules/')) return send(res, 404, { error: 'Arquivo não encontrado.' });
      const contents = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : contents);
    } catch (error) {
      const status = error.status || (['ENOENT', 'EISDIR'].includes(error.code) ? 404 : error instanceof URIError ? 400 : 500);
      if (status === 500) console.error(error);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'Não foi possível concluir a solicitação.' : error.message });
    }
  });
  server.on('close', () => { dev.fechar(); try { db.close(); } catch { /* já fechado */ } });
  return server;
}

export async function iniciar() {
  const acervo = await carregarAcervo();
  const server = criarServidor(acervo);
  const port = integer(process.env.PORT, 4173, 65535);
  server.on('error', error => { console.error(`Não foi possível abrir o Gabaritei: ${error.message}`); process.exitCode = 1; });
  // HOST=0.0.0.0 para publicar num servidor; por padrão, só neste computador.
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host, () => console.log(`Gabaritei\nLocal: http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${server.address().port}\n${acervo.info.available} questões disponíveis · recomendador titulo_area · banco SQLite em ${process.env.GABARITEI_DB || 'backend/dados/gabaritei.db'}`));
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await iniciar();
