// Conta e sincronização. Sem login o app funciona como antes (dados só neste navegador).
// Com login, o servidor guarda estudos, plano e notas num banco de dados; o localStorage vira cache.
export const CHAVES = { estudos: 'gabaritei:estudos:oficial:v1', plano: 'gabaritei:plano:oficial:v1', notas: 'gabaritei:notas:v1' };
const PENDENTE = 'gabaritei:sync-pendente:v1';
const BACKUP = 'gabaritei:antes-do-login:v1';
const ATRASO = 700;

let usuario = null;
const revisoes = { estudos: 0, plano: 0, notas: 0 };
const fila = new Map(); // chave -> { valor, timer }
let situacao = 'local'; // local | salvo | salvando | offline | conflito
const ouvintes = new Set();
export const aoMudarSituacao = fn => { ouvintes.add(fn); return () => ouvintes.delete(fn); };
const definir = s => { if (s !== situacao) { situacao = s; ouvintes.forEach(f => f(s)); } };
export const situacaoAtual = () => situacao;
export const usuarioAtual = () => usuario;

const lerLocal = chave => { try { return localStorage.getItem(CHAVES[chave]); } catch { return null; } };
const pendentes = () => { try { return JSON.parse(localStorage.getItem(PENDENTE)) || {}; } catch { return {}; } };
const marcarPendente = (chave, sim) => { try { const p = pendentes(); if (sim) p[chave] = true; else delete p[chave]; localStorage.setItem(PENDENTE, JSON.stringify(p)); } catch { /* sem armazenamento */ } };

async function api(metodo, caminho, dados, extra = {}) {
  const r = await fetch(caminho, { method: metodo, credentials: 'same-origin', signal: AbortSignal.timeout(20000), headers: dados === undefined ? {} : { 'Content-Type': 'application/json' }, body: dados === undefined ? undefined : JSON.stringify(dados), ...extra });
  let corpo = null; try { corpo = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) throw Object.assign(new Error(corpo?.error || 'Não foi possível concluir a solicitação.'), { status: r.status, corpo });
  return corpo;
}

/** Chamada no início do app: descobre se há login e traz os dados do servidor para o cache local. */
export async function iniciarConta() {
  try { usuario = (await api('GET', '/api/eu')).usuario; } catch { usuario = null; return null; }
  if (!usuario) return null;
  try {
    const anteriores = {};
    for (const chave of Object.keys(CHAVES)) {
      const r = await api('GET', `/api/eu/${chave}`);
      revisoes[chave] = r.revisao;
      const local = lerLocal(chave);
      if (r.data && !(pendentes()[chave] && local)) {
        const novo = JSON.stringify(r.data);
        if (local && local !== novo && !pendentes()[chave]) anteriores[chave] = local;
        localStorage.setItem(CHAVES[chave], novo);
      } else if (local) {
        // primeiro login neste navegador, ou alterações que não chegaram ao servidor: o local sobe
        try { revisoes[chave] = (await api('PUT', `/api/eu/${chave}`, { data: JSON.parse(local), baseRevisao: r.revisao })).revisao; marcarPendente(chave, false); }
        catch (e) { if (e.status === 400) console.warn(`Dados locais de ${chave} recusados pelo servidor:`, e.message); else throw e; }
      }
    }
    if (Object.keys(anteriores).length) { try { localStorage.setItem(BACKUP, JSON.stringify({ salvoEm: new Date().toISOString(), dados: anteriores })); } catch { /* sem espaço */ } }
    definir('salvo');
  } catch (e) { console.warn('Sincronização inicial indisponível:', e.message); definir('offline'); }
  return usuario;
}

/** Chamada a cada gravação local. Sem login não faz nada. */
export function espelhar(chave, valor) {
  if (!usuario || situacao === 'conflito') return;
  marcarPendente(chave, true); definir('salvando');
  const item = fila.get(chave) || {};
  clearTimeout(item.timer);
  item.valor = valor; item.timer = setTimeout(() => enviar(chave), ATRASO); fila.set(chave, item);
}

async function enviar(chave, { keepalive = false } = {}) {
  const item = fila.get(chave); if (!item || item.enviando) return;
  const valor = item.valor; item.enviando = true;
  try {
    const corpo = { data: valor, baseRevisao: revisoes[chave] };
    const r = await api('PUT', `/api/eu/${chave}`, corpo, keepalive ? { keepalive: true } : {});
    revisoes[chave] = r.revisao;
    if (item.valor === valor) { fila.delete(chave); marcarPendente(chave, false); } else { item.enviando = false; return enviar(chave); }
    if (!fila.size) definir('salvo');
  } catch (e) {
    item.enviando = false;
    if (e.status === 409) { revisoes[chave] = e.corpo?.revisao ?? revisoes[chave]; definir('conflito'); fila.clear(); aviso('Seus dados foram alterados em outra aba ou dispositivo. Recarregue a página para continuar sincronizando.'); }
    else if (e.status === 401) { definir('offline'); aviso('Sua sessão expirou. Entre novamente para continuar salvando na conta.'); }
    else if (e.status === 400 || e.status === 413) { definir('offline'); console.error(e); aviso('Não foi possível salvar na conta: ' + e.message); }
    else { definir('offline'); item.timer = setTimeout(() => enviar(chave), 15000); }
  }
}
let avisador = () => {};
export const definirAvisador = fn => { avisador = fn; };
const aviso = msg => avisador(msg);

// ao sair da página, tenta enviar o que está na fila (o restante sobe no próximo início, pelo marcador de pendência)
if (typeof document !== 'undefined') {
  const descarregar = () => { for (const chave of fila.keys()) { const item = fila.get(chave); clearTimeout(item.timer); const bytes = JSON.stringify(item.valor).length; if (bytes < 60000) enviar(chave, { keepalive: true }); } };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') descarregar(); });
  addEventListener('pagehide', descarregar);
}

export async function entrar(email, senha) { const r = await api('POST', '/api/auth/entrar', { email, senha }); usuario = r.usuario; return usuario; }
export async function registrar(nome, email, senha) { const r = await api('POST', '/api/auth/registrar', { nome, email, senha }); usuario = r.usuario; return usuario; }
export async function sair() {
  try { await api('POST', '/api/auth/sair', {}); } catch { /* a sessão expira sozinha */ }
  // em computador compartilhado, o próximo usuário não pode ver os dados desta conta
  for (const k of [...Object.values(CHAVES), PENDENTE, BACKUP]) { try { localStorage.removeItem(k); } catch { /* ignora */ } }
  usuario = null;
}
export const excluirConta = async senha => { await api('DELETE', '/api/eu', { senha }); for (const k of [...Object.values(CHAVES), PENDENTE, BACKUP]) { try { localStorage.removeItem(k); } catch { /* ignora */ } } usuario = null; };
export const trocarSenha = (atual, nova) => api('POST', '/api/eu/senha', { atual, nova });
