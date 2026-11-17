// Card "O que o recomendador aprendeu": mostrado depois de cada resposta (tela de questões) e no
// laboratório (/dev). Recebe o registro criado por dificuldade-cliente.js (registrarResposta).
import { MOTIVOS } from './dificuldade-cliente.js';

export const AREA_NOME = { CN: 'Ciências da Natureza', CH: 'Ciências Humanas', LC: 'Linguagens', MT: 'Matemática' };
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');
const sinal = (v, casas = 0) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v).toFixed(casas).replace('.', ',')}`;
const num = (v, casas = 2) => Number(v).toFixed(casas).replace('.', ',');

/** Frase principal: o que a resposta disse ao modelo. */
export function leitura(reg) {
  if (!reg.conta) return `Esta resposta não mudou o seu nível porque ${MOTIVOS[reg.motivo] ?? 'ela não entra no cálculo'}.`;
  const c = reg.chanceAntes;
  if (!Number.isFinite(c)) return reg.acertou ? 'Acerto registrado: o seu nível subiu.' : 'Erro registrado: o seu nível caiu.';
  if (reg.acertou && c < 0.4) return `Você acertou uma questão difícil para o seu nível (ele previa ${pct(c)}): a estimativa subiu bastante.`;
  if (!reg.acertou && c > 0.7) return `Você errou uma questão que ele achava tranquila (${pct(c)}): a estimativa caiu.`;
  if (reg.acertou) return `Acerto dentro do esperado (ele previa ${pct(c)}): o nível subiu um pouco e a dúvida diminuiu.`;
  return `Erro dentro do esperado (ele previa ${pct(c)}): o nível caiu um pouco e a dúvida diminuiu.`;
}

/** Linhas de antes → depois. */
export function linhas(reg) {
  const a = reg.antes, d = reg.depois, out = [];
  if (!a || !d) return out;
  const dTheta = d.theta - a.theta;
  out.push({ rotulo: 'Nível estimado (θ)', valor: `${num(a.theta)} → ${num(d.theta)}`, nota: `${sinal(dTheta, 2)} · incerteza ${num(a.dp)} → ${num(d.dp)}` });
  if (d.status !== 'calibrando') out.push({ rotulo: 'Nota TRI estimada', valor: `${a.nota} → ${d.nota}`, nota: `${sinal(d.nota - a.nota)} pontos${d.faixa ? ` · faixa ${d.faixa[0]}–${d.faixa[1]}` : ''}` });
  else out.push({ rotulo: 'Nota TRI (provisória)', valor: `${a.nota} → ${d.nota}`, nota: `${d.n} de 15 respostas válidas: o app só mostra a nota a partir de 15` });
  if (Number.isFinite(reg.chanceAntes) && Number.isFinite(reg.chanceDepois)) out.push({ rotulo: 'Chance nesta questão', valor: `${pct(reg.chanceAntes)} → ${pct(reg.chanceDepois)}`, nota: 'o que ele preveria agora' });
  if (Math.abs((d.pstar ?? 0) - (a.pstar ?? 0)) >= 0.005) out.push({ rotulo: 'Meta de acerto das listas', valor: `${pct(a.pstar)} → ${pct(d.pstar)}`, nota: 'ajuste pelas últimas 15 respostas' });
  if (reg.delta) out.push({ rotulo: 'Ajuste do sistema na área', valor: `δ ${sinal(reg.delta, 2)}`, nota: 'aprendido com as respostas de todos os alunos' });
  return out;
}

export function aprendizadoHTML(reg, { titulo = 'O que o recomendador aprendeu', extra = '' } = {}) {
  if (!reg) return '';
  return `<section class="apz" aria-label="${esc(titulo)}">
    <header class="apz-head"><span class="apz-dot ${reg.conta ? (reg.acertou ? 'is-up' : 'is-down') : 'is-off'}"></span><strong>${esc(titulo)}</strong><span class="apz-area">${esc(AREA_NOME[reg.area] ?? reg.area)}${reg.servidor ? ' · salvo na conta' : ''}</span></header>
    <p class="apz-leitura">${esc(leitura(reg))}</p>
    ${reg.conta ? `<dl class="apz-grid">${linhas(reg).map(l => `<div><dt>${esc(l.rotulo)}</dt><dd>${esc(l.valor)}</dd><small>${esc(l.nota)}</small></div>`).join('')}</dl>` : ''}
    ${extra}
  </section>`;
}
