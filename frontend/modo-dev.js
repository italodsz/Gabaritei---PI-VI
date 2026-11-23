// Modo dev: painel dos recomendadores dentro da tela da questão, só para a conta de desenvolvedor
// (o servidor marca usuario.dev; as rotas /api/dev recusam as outras contas). Substitui a antiga
// página /dev. Duas abas: "Esta questão" (TRI, chance e as parecidas do titulo_area, com os escores
// do ranking sob demanda) e "Ao vivo" (perfil TRI, o que foi aprendido a cada resposta e o
// aprendizado do sistema, reaproveitando dev-ao-vivo.js).
import * as Dif from './dificuldade-cliente.js';
import { usuarioAtual } from './conta.js';
import { criarAoVivo } from './dev-ao-vivo.js';

const CHAVE = 'gabaritei:modo-dev:v1';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');
const num = (v, d = 2) => (Number.isFinite(v) ? Number(v).toFixed(d).replace('.', ',') : '—');
const NOMES = { tfidf: 'TF-IDF', qwen: 'Qwen', minilm: 'MiniLM' };

export const disponivel = () => !!usuarioAtual()?.dev;
export function ligado() {
  if (!disponivel()) return false;
  try { return localStorage.getItem(CHAVE) === '1'; } catch { return false; }
}
export function definirLigado(v) { try { localStorage.setItem(CHAVE, v ? '1' : '0'); } catch { /* sem armazenamento */ } }

async function api(caminho, opcoes = {}) {
  const r = await fetch(caminho, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opcoes });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(dados.error || `HTTP ${r.status}`);
  return dados;
}

/** Monta o painel em `raiz`. `abrir(id)` leva a questão para a lista atual (opcional). */
export function criarPainel(raiz, { E, abrir = null }) {
  let aba = 'questao', q = null, resumo = null, aoVivo = null, token = 0;

  function nome(id) {
    const x = E.questionRepository.getById(id);
    if (!x) return esc(id);
    const topico = E.TOPIC_BY_ID[x.topicId]?.name;
    return `${esc(E.SUBJECT_BY_ID[x.subjectId]?.name ?? '')}${topico ? ` › ${esc(topico)}` : ''} <small>ENEM ${x.year}</small>`;
  }
  const linkQ = id => (abrir ? `<button type="button" class="md-link" data-abrir="${esc(id)}">${esc(id)}</button>` : `<code>${esc(id)}</code>`);

  function dadosHTML() {
    const t = q.tri, chance = Dif.chanceDe(q);
    const linhas = [
      ['ID', `<code>${esc(q.id)}</code>`],
      ['Matéria › tema', nome(q.id)],
      ['Parâmetros TRI (INEP)', t ? `a = ${num(t.a)} · b = ${num(t.b)} · c = ${num(t.c)}` : 'fora da triagem: sem chance estimada'],
      ['Chance estimada agora', `${pct(chance)}${Dif.deltaDe(Dif.areaDe(q)) ? ` <small>com δ ${num(Dif.deltaDe(Dif.areaDe(q)))}</small>` : ''}`],
      ['Faixa no acervo', q.difficultyKnown === false ? 'não informada' : ({ facil: 'Fácil', media: 'Média', dificil: 'Difícil' }[q.difficulty] ?? '—')],
    ];
    return `<dl class="md-dados">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  }

  async function parecidas(meu) {
    const box = raiz.querySelector('#md-parecidas'); if (!box) return;
    try {
      const r = await api(`/api/questoes/${encodeURIComponent(q.id)}/recomendacoes?limite=10`);
      if (meu !== token) return;
      box.innerHTML = r.ids.length
        ? `<table class="md-tabela"><thead><tr><th>#</th><th>Questão</th><th>Matéria › tema</th><th class="n">Chance</th></tr></thead><tbody>${r.ids.map((id, i) => `<tr><td>${i + 1}</td><td>${linkQ(id)}</td><td>${nome(id)}</td><td class="n">${pct(Dif.chanceDe(E.questionRepository.getById(id)))}</td></tr>`).join('')}</tbody></table>`
        : `<p class="md-nota">${esc(r.reason || 'Sem parecidas no catálogo.')}</p>`;
    } catch (e) { if (meu === token) box.innerHTML = `<p class="md-erro">${esc(e.message)}</p>`; }
  }

  async function escores() {
    const box = raiz.querySelector('#md-escores'), meu = token; if (!box) return;
    box.innerHTML = '<p class="md-nota">Calculando sobre os índices (a primeira vez carrega os índices, sem GPU)…</p>';
    try {
      const d = await api('/api/dev/diagnostico', { method: 'POST', body: JSON.stringify({ questionId: q.id, limit: 10 }) });
      if (meu !== token) return;
      const cols = ['tfidf', 'qwen'].filter(k => d.results[0]?.components?.[k]);
      box.innerHTML = `<p class="md-nota">Escore = soma de peso ÷ (${d.rrfK} + posição em cada sinal). Não é chance de acerto.${d.subjectPriority ? ' Mesmo assunto vem primeiro.' : ''}</p>
        <table class="md-tabela"><thead><tr><th>#</th><th>Questão</th><th>Assunto</th>${cols.map(k => `<th class="n">${NOMES[k]}</th>`).join('')}<th class="n">Escore</th></tr></thead><tbody>${d.results.map(r => `<tr><td>${r.rank}</td><td>${linkQ(r.id)}</td><td>${esc(r.assunto ?? '')}${r.sameSubject ? ' <small>mesmo assunto</small>' : ''}</td>${cols.map(k => `<td class="n">${num(r.components[k].value, 4)}</td>`).join('')}<td class="n">${num(r.score, 5)}</td></tr>`).join('')}</tbody></table>`;
      ligarLinks(box);
    } catch (e) { if (meu === token) box.innerHTML = `<p class="md-erro">${esc(e.message)}</p>`; }
  }

  function ligarLinks(el) { if (abrir) el.querySelectorAll('[data-abrir]').forEach(b => { b.onclick = () => abrir(b.dataset.abrir); }); }

  async function mostrarAoVivo() {
    const alvo = raiz.querySelector('#md-aovivo'); if (!alvo) return;
    try { resumo ||= await api('/api/dev/resumo'); } catch (e) { alvo.innerHTML = `<p class="md-erro">${esc(e.message)}</p>`; return; }
    aoVivo?.esconder();
    aoVivo = criarAoVivo({ root: alvo, summary: resumo, abrirQuestao: id => abrir?.(id) });
    aoVivo.mostrar();
  }

  function render() {
    if (!q) { raiz.innerHTML = ''; return; }
    const meu = ++token;
    aoVivo?.esconder(); aoVivo = null;
    raiz.innerHTML = `<section class="md-dev" aria-label="Modo dev">
      <div class="md-abas" role="tablist">${[['questao', 'Esta questão'], ['aovivo', 'Ao vivo']].map(([v, l]) => `<button type="button" role="tab" aria-selected="${aba === v}" data-aba="${v}">${l}</button>`).join('')}</div>
      ${aba === 'questao'
        ? `${dadosHTML()}
          <h3>Parecidas no titulo_area</h3><div id="md-parecidas"><p class="md-nota">Carregando…</p></div>
          <div id="md-escores"><button type="button" class="md-botao" id="md-calcular">Ver escores do ranking</button></div>`
        : '<div id="md-aovivo" class="md-aovivo"><p class="md-nota">Carregando…</p></div>'}
    </section>`;
    raiz.querySelectorAll('[data-aba]').forEach(b => { b.onclick = () => { aba = b.dataset.aba; render(); }; });
    if (aba === 'questao') { parecidas(meu).then(() => ligarLinks(raiz)); raiz.querySelector('#md-calcular').onclick = escores; }
    else mostrarAoVivo();
  }

  return {
    mostrar(questao) { q = questao; render(); },
    esconder() { token++; aoVivo?.esconder(); aoVivo = null; q = null; raiz.innerHTML = ''; },
  };
}
