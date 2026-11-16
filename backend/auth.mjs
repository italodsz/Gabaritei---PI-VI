// Senhas (scrypt), sessões de login por cookie e limite de tentativas. Só módulos do Node.
import { scrypt, randomBytes, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const N = 16384, R = 8, P = 1, TAM = 64;
export const COOKIE = 'gabaritei_sessao';
export const DURACAO_SESSAO_MS = 30 * 24 * 3600 * 1000;

export const erro = (status, message) => Object.assign(new Error(message), { status });
export const novoId = () => randomUUID();
export const agora = () => new Date().toISOString();
export const hashToken = token => createHash('sha256').update(token).digest('hex');

export async function hashSenha(senha) {
  const sal = randomBytes(16);
  const h = await scryptAsync(senha, sal, TAM, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${sal.toString('base64')}$${h.toString('base64')}`;
}

export async function conferirSenha(senha, guardado) {
  const partes = String(guardado).split('$');
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false;
  const [, n, r, p, sal, hash] = partes;
  const esperado = Buffer.from(hash, 'base64');
  const obtido = await scryptAsync(senha, Buffer.from(sal, 'base64'), esperado.length, { N: +n, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  return esperado.length === obtido.length && timingSafeEqual(esperado, obtido);
}

export function validarCadastro({ nome, email, senha }) {
  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 80) throw erro(400, 'Informe seu nome (2 a 80 caracteres).');
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) throw erro(400, 'Informe um e-mail válido.');
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 200) throw erro(400, 'A senha precisa ter de 8 a 200 caracteres.');
  return { nome: nome.trim(), email: email.trim().toLowerCase(), senha };
}

export function lerCookie(req, nome = COOKIE) {
  for (const parte of String(req.headers.cookie || '').split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === nome) return decodeURIComponent(parte.slice(i + 1).trim());
  }
  return null;
}

export function cookieSessao(token, { seguro = false } = {}) {
  return `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(DURACAO_SESSAO_MS / 1000)}${seguro ? '; Secure' : ''}`;
}
export const cookieLimpo = () => `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;

/** Bloqueia força bruta: 8 falhas por chave em 15 minutos. */
export class LimiteTentativas {
  constructor(max = 8, janelaMs = 15 * 60 * 1000, relogio = Date.now) { this.max = max; this.janela = janelaMs; this.relogio = relogio; this.falhas = new Map(); }
  _limpar(chave) { const t = this.relogio(); const l = (this.falhas.get(chave) || []).filter(x => t - x < this.janela); if (l.length) this.falhas.set(chave, l); else this.falhas.delete(chave); return l; }
  bloqueado(chave) { return this._limpar(chave).length >= this.max; }
  registrarFalha(chave) { const l = this._limpar(chave); l.push(this.relogio()); this.falhas.set(chave, l); }
  zerar(chave) { this.falhas.delete(chave); }
}

/** Rejeita escrita vinda de outra origem (defesa extra além de SameSite=Lax). */
export function origemPermitida(req) {
  const origem = req.headers.origin;
  if (!origem) return true;
  try { return new URL(origem).host === req.headers.host; } catch { return false; }
}
