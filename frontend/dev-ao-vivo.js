// Laboratório › Recomendadores ao vivo: o perfil TRI de quem está usando o app, o que o recomendador
// aprendeu a cada resposta, como o titulo_area e a dificuldade escolheram cada próxima questão e o
// aprendizado do sistema (calibração e ajuste δ por área, com as respostas de todos os alunos).
// Atualiza sozinho quando o app (em outra aba) registra uma resposta.
import * as T from './dificuldade.js';
import { aprendizadoHTML, AREA_NOME } from './aprendizado-ui.js';
import { aprendizados, mostrarAprendizado, definirMostrarAprendizado } from './dificuldade-cliente.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');
const n2 = v => (Number.isFinite(v) ? Number(v).toFixed(2).replace('.', ',') : '—');
const hora = iso => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const FONTE = { titulo_area: 'titulo_area (parecida)', assunto: 'mesmo assunto', acervo: 'acervo' };

async function json(path) { const r = await fetch(path, { credentials: 'same-origin' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }

export function criarAoVivo({ root, summary, abrirQuestao }) {
  let cfg = null, timer = null;

  async function perfis() {
    try { const v = await json('/api/eu/perfil-tri'); if (v?.perfis) return { origem: 'conta', perfis: v.perfis }; } catch { /* sem login */ }
    try { const l = JSON.parse(localStorage.getItem('gabaritei:perfil-tri:v1')); if (l?.perfis) return { origem: 'navegador', perfis: l.perfis }; } catch { /* vazio */ }
    return { origem: 'inicial', perfis: Object.fromEntries(T.AREAS.map(a => [a, T.perfilInicial(a, cfg)])) };
  }

  function perfilHTML({ origem, perfis: ps }, sistema) {
    const linhas = T.AREAS.map(a => {
      const p = ps[a] ?? T.perfilInicial(a, cfg), { media, dp } = T.momentos(p, cfg), r = T.resumoNota(p, cfg), aj = sistema?.porArea?.[a];
      return `<tr><th>${AREA_NOME[a]}</th><td>${r.status === 'calibrando' ? `calibrando (${p.n || 0}/15)` : `<b>${r.nota}</b> <small>${r.min}–${r.max}</small>`}</td><td class="number">${n2(media)} ± ${n2(dp)}</td><td class="number">${p.n || 0}</td><td class="number">${pct(p.pstar ?? T.metaDe(cfg.desafio_padrao, cfg))}</td><td class="number">${aj?.ativo ? `${aj.delta > 0 ? '+' : ''}${n2(aj.delta)}` : `— <small>(${aj?.n ?? 0}/${cfg.aprendizado_sistema.min_eventos})</small>`}</td></tr>`;
    }).join('');
    return `<section class="panel full"><h2>Perfil TRI agora</h2><p>Fonte: ${origem === 'conta' ? 'conta logada (banco do servidor)' : origem === 'navegador' ? 'este navegador (sem login)' : 'ponto de partida populacional (ainda sem respostas)'}. O nível θ é uma distribuição em 161 pontos por área; a nota é a média dessa distribuição convertida pela tabela θ→nota do ENEM; a faixa cobre ~80%.</p>
      <table class="stat-table"><thead><tr><th>Área</th><th>Nota estimada</th><th>θ ± incerteza</th><th>Respostas válidas</th><th>Meta de acerto (controlador)</th><th>Ajuste do sistema δ</th></tr></thead><tbody>${linhas}</tbody></table></section>`;
  }

  function decisaoHTML(d) {
    return `<article class="lv-item lv-dec"><header><span class="tag blue">PRÓXIMA QUESTÃO</span><small>${hora(d.em)}</small></header>
      <p>Fonte: <b>${esc(FONTE[d.fonte] ?? d.fonte)}</b>${d.fonte === 'titulo_area' ? ` · a partir de <button class="lv-link" data-q="${esc(d.ref)}">${esc(d.ref)}</button> · ${d.candidatas} parecidas novas · escolhida a <b>${d.posicao}ª</b>${d.posicao > 1 ? ' (a dificuldade trocou a ordem)' : ' (ordem do titulo_area mantida)'}` : ` · ${d.candidatas} candidatas`} · chance prevista <b>${pct(d.chance)}</b> · <button class="lv-link" data-q="${esc(d.escolhida)}">abrir escolhida</button></p>
      ${d.top?.length ? `<ol class="lv-top">${d.top.map((t, i) => `<li class="${t.id === d.escolhida ? 'is-pick' : ''}"><span>${i + 1}ª</span><button class="lv-link" data-q="${esc(t.id)}">${esc(t.id.slice(0, 14))}…</button><b>${pct(t.chance)}</b></li>`).join('')}</ol>` : ''}</article>`;
  }
  function simuladoHTML(s) {
    return `<article class="lv-item"><header><span class="tag orange">SIMULADO</span><small>${hora(s.em)} · ${s.respostas} respostas com peso de prova</small></header>
      <p>${T.AREAS.filter(a => s.areas[a]?.antes && s.areas[a].depois && s.areas[a].antes.n !== s.areas[a].depois.n).map(a => `${AREA_NOME[a]}: nota ${s.areas[a].antes.nota} → <b>${s.areas[a].depois.nota}</b>, θ ${n2(s.areas[a].antes.theta)} → ${n2(s.areas[a].depois.theta)}`).join(' · ') || 'Nenhuma área mudou.'}</p></article>`;
  }

  function feedHTML() {
    const f = aprendizados().reverse().slice(0, 40);
    const dec = aprendizados().filter(x => x.tipo === 'decisao' && x.fonte === 'titulo_area');
    const mudou = dec.filter(d => d.posicao > 1).length;
    const resp = aprendizados().filter(x => x.tipo === 'resposta');
    const contaram = resp.filter(r => r.conta).length;
    return `<section class="panel full"><div class="lv-head"><div><h2>O que o recomendador aprendeu</h2><p>Uma linha por resposta dada no app (neste navegador), da mais nova para a mais antiga, e cada escolha da próxima questão na prática sob medida.</p></div>
        <label class="lv-toggle"><input type="checkbox" id="lv-mostrar" ${mostrarAprendizado() ? 'checked' : ''}> Mostrar este card depois de cada resposta no app</label></div>
      <div class="lv-kpis"><div><b>${resp.length}</b><span>respostas registradas</span></div><div><b>${contaram}</b><span>entraram no θ</span></div><div><b>${dec.length}</b><span>próximas escolhidas pelo titulo_area</span></div><div><b>${dec.length ? pct(mudou / dec.length) : '—'}</b><span>com a ordem trocada pela dificuldade</span></div></div>
      ${(() => { const c = resp.filter(r => Number.isFinite(r.chanceAntes) && !r.apoio); if (c.length < 3) return ''; const prev = c.reduce((n, r) => n + r.chanceAntes, 0) / c.length, obs = c.filter(r => r.acertou).length / c.length; return `<p class="lv-cal">Neste navegador: chance média prevista <b>${pct(prev)}</b> × acerto real <b>${pct(obs)}</b> em ${c.length} respostas sem apoio. Nas próximas escolhas, “—” na lista indica questão sem parâmetros TRI do INEP.</p>`; })()}
      <div class="lv-feed">${f.length ? f.map(x => x.tipo === 'resposta' ? `<article class="lv-item"><header><span class="tag ${x.acertou ? 'green' : 'red'}">${x.acertou ? 'ACERTOU' : 'ERROU'}</span><small>${hora(x.em)} · <button class="lv-link" data-q="${esc(x.questaoId)}">${esc(x.questaoId)}</button> · b = ${n2(x.b)}${x.tempoMs ? ` · ${Math.round(x.tempoMs / 1000)} s` : ''}${x.apoio ? ' · com apoio' : ''}</small></header>${aprendizadoHTML(x, { titulo: 'Leitura do recomendador' })}</article>` : x.tipo === 'decisao' ? decisaoHTML(x) : simuladoHTML(x)).join('') : '<p class="empty-inline">Ainda não há respostas neste navegador. Abra o app (outra aba), responda uma questão e volte aqui: esta lista atualiza sozinha.</p>'}</div></section>`;
  }

  function sistemaHTML(d) {
    if (!d) return '';
    const s = d.aprendizadoSistema;
    return `<section class="panel"><h2>Aprendizado do sistema</h2><p>Com as respostas válidas de todos os alunos com conta, o sistema estima por área um deslocamento δ (em logit) que corrige a chance prevista quando os alunos acertam sistematicamente mais ou menos do que o modelo do INEP previu. Começa em zero, só liga com ${s.config.min_eventos}+ respostas na área, encolhe para zero com poucos dados (prior ±${n2(s.config.dp_prior)}) e é limitado a ±${n2(s.config.limite)}. Recalculado a cada 10 respostas novas. Última atualização: ${hora(s.atualizadoEm)}.</p>
      <table class="stat-table"><thead><tr><th>Área</th><th>Respostas</th><th>Válidas</th><th>Chance média prevista</th><th>Acerto observado</th><th>δ</th></tr></thead><tbody>${s.porArea.map(r => `<tr><th>${AREA_NOME[r.area]}</th><td>${r.respostas}</td><td>${r.contam}</td><td>${pct(r.chanceMediaPrevista)}</td><td>${pct(r.acertoObservado)}</td><td>${r.ajuste?.ativo ? `<b>${r.ajuste.delta > 0 ? '+' : ''}${n2(r.ajuste.delta)}</b>` : `inativo (${r.ajuste?.n ?? 0})`}</td></tr>`).join('')}</tbody></table></section>
      <section class="panel"><h2>Calibração: previsto × observado</h2><p>${d.eventos} respostas de ${d.usuarios} ${d.usuarios === 1 ? 'aluno' : 'alunos'} com conta (sem apoio). Se o modelo está bem calibrado, as duas colunas ficam próximas em cada faixa.</p>
      <table class="stat-table"><thead><tr><th>Faixa prevista</th><th>Respostas</th><th>Prevista</th><th>Observada</th></tr></thead><tbody>${d.calibracao.map(f => `<tr><td>${f.faixa}</td><td>${f.n}</td><td>${pct(f.prevista)}</td><td>${pct(f.observada)}</td></tr>`).join('') || '<tr><td colspan="4">Sem respostas registradas ainda.</td></tr>'}</tbody></table>
      ${d.motivosNaoConta.length ? `<p>Não entraram no θ: ${d.motivosNaoConta.map(m => `${esc(m.motivo)} (${m.n})`).join(' · ')}.</p>` : ''}</section>`;
  }

  function tituloAreaHTML() {
    const c = summary.catalog;
    return `<section class="panel full"><h2>Como os dois trabalham juntos</h2><p><b>titulo_area</b> (o recomendador de semelhança do projeto) decide <i>quais</i> questões são parecidas: para cada questão, uma lista pronta de até 50 parecidas da mesma área e título, ordenada pelo RRF de TF-IDF e Qwen. O catálogo tem ${c.lists} listas (mediana ${c.median}, ${c.empty} vazias). Ele não muda com as respostas: é o conhecimento fixo do conteúdo.</p>
      <p><b>Dificuldade</b> (TRI) decide <i>em que ordem</i>, entre as 20 primeiras, usando a chance de acerto de cada aluno: score = R(posição) × (0,5 + 0,5 × adequação ao desafio). Ele aprende a cada resposta (θ do aluno e meta) e com o conjunto dos alunos (δ por área). Para ver o ranking com os escores de uma questão, use “Explorar questões”.</p></section>`;
  }

  async function render() {
    if (root.hidden) return;
    try { cfg ||= await json('/api/dificuldade/config'); } catch { root.innerHTML = '<p class="message error">Recomendador de dificuldade indisponível.</p>'; return; }
    const [p, d] = await Promise.all([perfis(), json('/api/dev/dificuldade').catch(() => null)]);
    root.innerHTML = `<div class="stats-grid lv">${perfilHTML(p, cfg.ajuste)}${feedHTML()}${sistemaHTML(d)}${tituloAreaHTML()}</div>`;
    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => abrirQuestao(b.dataset.q));
    const t = root.querySelector('#lv-mostrar'); if (t) t.onchange = () => definirMostrarAprendizado(t.checked);
  }
  window.addEventListener('storage', e => { if (e.key?.startsWith('gabaritei:aprendizado') || e.key?.startsWith('gabaritei:perfil-tri')) render(); });
  return {
    mostrar() { render(); clearInterval(timer); timer = setInterval(() => { if (!root.hidden && document.visibilityState === 'visible') render(); }, 8000); },
    esconder() { clearInterval(timer); },
  };
}
