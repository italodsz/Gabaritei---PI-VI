// Utilidades HTTP compartilhadas pelas rotas: resposta JSON, leitura do corpo e parâmetros inteiros.
export const send = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };

export const integer = (value, fallback, max) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw Object.assign(new Error('Parâmetro numérico inválido.'), { status: 400 });
  return n;
};

export async function body(req, max = 256_000) {
  let bytes = 0; const chunks = [];
  for await (const chunk of req) { bytes += chunk.length; if (bytes > max) throw Object.assign(new Error('Solicitação muito grande.'), { status: 413 }); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('JSON inválido.'), { status: 400 }); }
}

/** Lista de IDs para excluir das sugestões (até 5.000 strings). */
export function listaExclusao(valor) {
  const exclude = valor ?? [];
  if (!Array.isArray(exclude) || exclude.length > 5000 || exclude.some(i => typeof i !== 'string')) throw Object.assign(new Error('Lista de exclusão inválida.'), { status: 400 });
  return exclude;
}
