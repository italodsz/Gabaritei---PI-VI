// Modo dev: painel do recomendador dentro da tela da questão, só para a conta de desenvolvedor
// (o servidor marca usuario.dev; as rotas /api/dev recusam as outras contas). Duas colunas: a
// questão agora (matéria na árvore, nota do aluno, chance de acertar, se acertar/se errar) e a
// próxima questão (pipeline semântica → TRI → escore, top 5 com a escolhida e a meta alcançável).
// O painel só lê o que o sistema já calcula: nunca muda a ordem real nem grava nada.
import * as T from './dificuldade.js';
import * as Dif from './dificuldade-cliente.js';
import { usuarioAtual } from './conta.js';

const CHAVE = 'gabaritei:modo-dev:v1';
const CHAVE_COLUNAS = 'gabaritei:modo-dev:colunas:v1';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');
const num = (v, d = 2) => (Number.isFinite(v) ? Number(v).toFixed(d).replace('.', ',') : '—');
const DESAFIO_NOME = { leve: 'leve', ponto: 'no ponto', puxado: 'puxado' };

export const disponivel = () => !!usuarioAtual()?.dev;
export function ligado() {
  if (!disponivel()) return false;
  try { return localStorage.getItem(CHAVE) === '1'; } catch { return false; }
}
export function definirLigado(v) { try { localStorage.setItem(CHAVE, v ? '1' : '0'); } catch { /* sem armazenamento */ } }

/** Filtro de colunas do painel: uma coluna por vez ou as duas juntas (preferência salva). */
function colunas() { try { return localStorage.getItem(CHAVE_COLUNAS) || 'ambas'; } catch { return 'ambas'; } }
function definirColunas(v) { try { localStorage.setItem(CHAVE_COLUNAS, v); } catch { /* sem armazenamento */ } }

async function api(caminho, opcoes = {}) {
  const r = await fetch(caminho, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opcoes });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(dados.error || `HTTP ${r.status}`);
  return dados;
}

const arredNota = (v, cfg) => Math.round(v / cfg.nota.arredondar) * cfg.nota.arredondar;

/** Monta o painel em `raiz`. `abrir(id)` leva a questão para a lista atual (opcional). */
export function criarPainel(raiz, { E, abrir = null }) {
  let q = null, token = 0;
  let mostrarTodas = false, dadosProxima = null;

  /** Rótulo curto de uma candidata na tabela da próxima questão: o assunto (o que varia de uma
   *  candidata pra outra dentro do mesmo título) e o ano. */
  function rotuloCandidata(x) {
    if (!x) return '?';
    const topico = E.TOPIC_BY_ID[x.topicId];
    const assunto = topico?.subtopics?.find(s => s.id === x.subtopicId)?.name ?? topico?.name ?? '';
    return `${esc(assunto)} <small>ENEM ${x.year}</small>`;
  }
  const linkQ = (id, rotulo) => (abrir
    ? `<button type="button" class="md-link" data-abrir="${esc(id)}">${rotulo ?? esc(id)}</button>`
    : `<span>${rotulo ?? `<code>${esc(id)}</code>`}</span>`);
  function ligarLinks(el) { if (abrir) el.querySelectorAll('[data-abrir]').forEach(b => { b.onclick = () => abrir(b.dataset.abrir); }); }

  /* ------------------------- coluna 1: a questão agora ------------------------- */

  function colunaQuestao() {
    const cfg = Dif.config(), area = Dif.areaDe(q);
    const subj = E.SUBJECT_BY_ID[q.subjectId], topico = E.TOPIC_BY_ID[q.topicId];
    const areaNome = E.AREA_BY_ID?.[q.areaId]?.shortName ?? area ?? '—';
    const assunto = topico?.subtopics?.find(s => s.id === q.subtopicId)?.name;

    const perfil = Dif.perfilAgora(area);
    const resumoN = T.resumoNota(perfil, cfg);
    const priorMedia = cfg.prior[area].media;
    const thetaAgora = perfil ? T.momentos(perfil, cfg).media : priorMedia;
    const notaPrior = arredNota(T.notaDeTheta(area, priorMedia, cfg), cfg);
    const notaAgora = arredNota(T.notaDeTheta(area, thetaAgora, cfg), cfg);
    const n = perfil?.n || 0;

    const tri = q.tri;
    const chanceSemDelta = perfil && tri ? T.chance(perfil, tri, cfg) : null;
    const delta = Dif.deltaDe(area);
    const chanceComDelta = Number.isFinite(chanceSemDelta) ? T.ajustarChance(chanceSemDelta, delta) : null;

    let simulacao = null;
    if (perfil && tri) {
      const depois = acertou => {
        const p = T.atualizar(perfil, tri, acertou, cfg, { agoraMs: Date.now(), peso: cfg.peso.pratica });
        const theta = T.momentos(p, cfg).media;
        return { theta, nota: arredNota(T.notaDeTheta(area, theta, cfg), cfg) };
      };
      simulacao = { acertar: depois(true), errar: depois(false) };
    }

    return `<div class="md-card">
        <h3>Matéria da questão <small>ENEM ${esc(q.year)}</small></h3>
        <div class="md-arvore">
          <span class="md-chip"><small>ÁREA</small><b>${esc(areaNome)}</b></span>
          <span class="md-arvore-sep">›</span>
          <span class="md-chip"><small>MATÉRIA</small><b>${esc(subj?.name ?? '—')}</b></span>
          <span class="md-arvore-sep">›</span>
          <span class="md-chip is-highlight"><small>TÍTULO</small><b>${esc(topico?.name ?? '—')}</b></span>
          <span class="md-arvore-sep">›</span>
          <span class="md-chip"><small>ASSUNTO</small><b>${esc(assunto ?? '—')}</b></span>
        </div>
      </div>
      <div class="md-card">
        <h3>Nota do aluno nesta área</h3>
        <div class="md-nota-grande">
          <strong>${resumoN.status === 'calibrando' ? `${notaAgora} <small>provisória</small>` : resumoN.nota}</strong>
          ${resumoN.status !== 'calibrando' ? `<span>faixa de ${resumoN.min} a ${resumoN.max}</span>` : ''}
        </div>
        <ol class="md-passos">
          <li><span>1</span>Começa na média do ENEM 2023: <b>${notaPrior}</b></li>
          <li><span>2</span>${n} resposta${n === 1 ? '' : 's'} válida${n === 1 ? '' : 's'} atualizam o nível: <b>θ = ${num(thetaAgora)}</b></li>
          <li><span>3</span>Tabela θ → nota do ENEM: <b>${notaAgora}</b>${resumoN.status === 'calibrando' ? ` <small>(nota aparece pro aluno a partir de 15 respostas; faltam ${resumoN.faltam})</small>` : ''}</li>
        </ol>
      </div>
      <div class="md-card">
        <h3>Chance de acertar esta questão</h3>
        ${tri ? `<div class="md-chance-params">
            <span>a <b>${num(tri.a)}</b></span><span>b <small>(dificuldade)</small> <b>${num(tri.b)}</b></span><span>c <b>${num(tri.c)}</b></span><span>gabarito <b>${esc(q.correct)}</b></span>
          </div>
          <p class="md-tri-formula"><code>c + (1 − c) ÷ (1 + e<sup>−a·(θ−b)</sup>)</code><br>
            = ${num(tri.c)} + ${num(1 - tri.c)} ÷ (1 + e<sup>−${num(tri.a)}·(${num(thetaAgora)} − ${num(tri.b)})</sup>) = <b>${num(chanceSemDelta)}</b></p>
          <div class="md-chance-grande">
            <strong>${pct(chanceComDelta)}</strong>
            <span>${delta ? `com o ajuste δ da área (${num(delta)}); sem δ seria ${pct(chanceSemDelta)}` : 'chance estimada agora'}</span>
          </div>`
          : '<p class="md-nota">Sem TRI do INEP: esta questão não passou na triagem (a, b ou c fora dos limites oficiais), então não dá pra estimar a chance.</p>'}
      </div>
      ${simulacao ? `<div class="md-q-sim">
          <div class="md-card is-acertar"><h3>Se acertar</h3>
            <div class="md-sim-linha"><span>Nível θ</span><b>${num(thetaAgora)} → ${num(simulacao.acertar.theta)}</b></div>
            <div class="md-sim-linha"><span>Nota</span><b>${notaAgora} → ${simulacao.acertar.nota}</b></div>
          </div>
          <div class="md-card is-errar"><h3>Se errar</h3>
            <div class="md-sim-linha"><span>Nível θ</span><b>${num(thetaAgora)} → ${num(simulacao.errar.theta)}</b></div>
            <div class="md-sim-linha"><span>Nota</span><b>${notaAgora} → ${simulacao.errar.nota}</b></div>
          </div>
        </div>` : ''}
      <div class="md-card md-gabarito">
        <h3>Alternativa correta</h3>
        <div class="md-gabarito-linha"><span class="md-gabarito-letra">${esc(q.correct)}</span><p>${esc(q.alternatives?.find(a => a.letter === q.correct)?.text ?? '—')}</p></div>
      </div>`;
  }

  /* ------------------------ coluna 2: a próxima questão ------------------------ */

  function pipelineHTML() {
    return `<div class="md-pipeline">
      <div class="md-pipe-etapa"><b>Semântica (Qwen)</b><span>parecidas no mesmo título da árvore</span></div>
      <span class="md-pipe-seta">›</span>
      <div class="md-pipe-etapa"><b>TRI</b><span>chance do aluno em cada uma</span></div>
      <span class="md-pipe-seta">›</span>
      <div class="md-pipe-etapa"><b>Escore</b><span>reordena as 20 primeiras</span></div>
    </div>`;
  }

  function chipNivelHTML() {
    const cfg = Dif.config(), area = Dif.areaDe(q), perfil = Dif.perfilAgora(area);
    const theta = perfil ? T.momentos(perfil, cfg).media : cfg.prior[area].media;
    const desafio = Dif.desafio();
    return `<div class="md-chip-nivel"><b>θ = ${num(theta)}</b><span>meta do desafio atual: ${DESAFIO_NOME[desafio] ?? desafio} (${pct(T.metaDe(desafio, cfg))})</span></div>`;
  }

  /** Etiqueta só explicativa: nunca influencia a ordem real, que já vem de detalharSemelhantes/
   *  ordenarSemelhantes. "indice" é a posição depois de ordenar pelo escore (0 = escolhida). */
  function etiquetaLinha(linha, indice, alvoEf) {
    if (indice === 0) return 'a escolhida';
    if (!Number.isFinite(linha.chance)) return 'sem TRI do INEP';
    const diff = linha.chance - alvoEf;
    const moveu = indice < linha.posicao ? 'subiu' : indice > linha.posicao ? 'desceu' : '';
    const nivel = Math.abs(diff) <= 0.05 ? 'na meta'
      : diff < -0.15 ? 'mais difícil' : diff < 0 ? 'um pouco difícil'
        : diff > 0.15 ? 'mais fácil' : 'um pouco fácil';
    return moveu ? `${nivel}, ${moveu}` : nivel;
  }

  function linhaProximaHTML(l, i, alvoEf) {
    const x = E.questionRepository.getById(l.id);
    const qwen = dadosProxima?.qwenPorId?.[l.id];
    return `<tr class="${i === 0 ? 'is-escolhida' : ''}">
      <td>${i + 1}ª</td>
      <td>${linkQ(l.id, rotuloCandidata(x))}</td>
      <td class="n">${Number.isFinite(qwen) ? num(qwen) : '…'}</td>
      <td class="n">${x?.tri ? num(x.tri.b) : '—'}</td>
      <td class="n">${pct(l.chance)}</td>
      <td class="n">${num(l.escore, 3)}</td>
      <td class="md-etiqueta">${etiquetaLinha(l, i, alvoEf)}</td>
    </tr>`;
  }

  function renderizarProxima(box) {
    if (!dadosProxima) return;
    const { linhas, alvoEf, base, peso } = dadosProxima;
    const ordenadas = [...linhas].sort((a, b) => b.escore - a.escore);
    const cfg = Dif.config(), area = Dif.areaDe(q);
    const alvoOriginal = Dif.perfilAgora(area)?.pstar ?? T.metaDe(Dif.desafio(), cfg);
    const topo = ordenadas.slice(0, 5), resto = ordenadas.slice(5);
    box.innerHTML = `
      <table class="md-tabela md-tabela-prox"><thead><tr><th>#</th><th>Questão</th><th class="n">Semelhança</th><th class="n">b</th><th class="n">Chance</th><th class="n">Escore</th><th>Por quê</th></tr></thead>
      <tbody>${topo.map((l, i) => linhaProximaHTML(l, i, alvoEf)).join('')}</tbody>
      ${resto.length ? `<tbody ${mostrarTodas ? '' : 'hidden'}>${resto.map((l, i) => linhaProximaHTML(l, i + 5, alvoEf)).join('')}</tbody>` : ''}
      </table>
      ${resto.length ? `<button type="button" class="md-ver-mais" id="md-ver-mais">${mostrarTodas ? '▲ esconder' : `▼ ver as outras ${resto.length}`}</button>` : ''}
      ${alvoEf < alvoOriginal - 0.005 ? `<p class="md-nota md-meta-alcancavel">Nenhuma das ${linhas.length} chega a ${pct(alvoOriginal)}, então a meta vira ${pct(alvoEf)}.</p>` : ''}
      <div class="md-escore-conta">
        <h4>Por que a 1ª foi escolhida</h4>
        <code>(1 ÷ log2(${ordenadas[0].posicao + 2})) × (${num(base)} + ${num(peso)} · ${num(ordenadas[0].A)}) = ${num(ordenadas[0].escore, 3)}</code>
      </div>`;
    ligarLinks(box);
    const btn = box.querySelector('#md-ver-mais');
    if (btn) btn.onclick = () => { mostrarTodas = !mostrarTodas; renderizarProxima(box); };
  }

  async function colunaProxima(meu) {
    const box = raiz.querySelector('#md-proxima'); if (!box) return;
    try {
      const r = await api(`/api/questoes/${encodeURIComponent(q.id)}/recomendacoes?limite=20`);
      if (meu !== token) return;
      if (!r.ids.length) { box.innerHTML = `<p class="md-nota">${esc(r.reason || 'Sem parecidas no catálogo para esta questão.')}</p>`; return; }
      const detalhe = Dif.detalharSemelhantes(r.ids, E.questionRepository);
      if (!detalhe) { box.innerHTML = '<p class="md-nota">Perfil TRI ainda não carregado.</p>'; return; }
      dadosProxima = { ...detalhe, qwenPorId: {} };
      renderizarProxima(box);
      api('/api/dev/diagnostico', { method: 'POST', body: JSON.stringify({ questionId: q.id, limit: 20 }) }).then(d => {
        if (meu !== token || !dadosProxima) return;
        dadosProxima.qwenPorId = Object.fromEntries(d.results.map(x => [x.id, x.components?.qwen?.value]));
        renderizarProxima(box);
      }).catch(() => { /* a tabela já mostra chance e escore; a similaridade Qwen é um extra */ });
    } catch (e) { if (meu === token) box.innerHTML = `<p class="md-erro">${esc(e.message)}</p>`; }
  }

  /* ----------------------------------- render ---------------------------------- */

  function render() {
    if (!q) { raiz.innerHTML = ''; return; }
    const meu = ++token;
    const col = colunas();
    raiz.innerHTML = `<section class="md-dev" aria-label="Modo dev">
      <div class="md-eyebrow">modo dev: o que o aluno não vê</div>
      <div class="md-filtro" role="tablist" aria-label="Mostrar colunas">${[['questao', 'Questão agora'], ['ambas', 'As duas'], ['proxima', 'Próxima questão']].map(([v, l]) => `<button type="button" role="tab" aria-selected="${col === v}" data-col="${v}">${l}</button>`).join('')}</div>
      <div class="md-cols md-cols-${esc(col)}">
        ${col !== 'proxima' ? `<div class="md-col"><h2>1. Questão agora</h2>${colunaQuestao()}</div>` : ''}
        ${col !== 'questao' ? `<div class="md-col"><h2>2. Próxima questão</h2>${pipelineHTML()}${chipNivelHTML()}<div id="md-proxima"><p class="md-nota">Carregando…</p></div></div>` : ''}
      </div>
    </section>`;
    raiz.querySelectorAll('[data-col]').forEach(b => { b.onclick = () => { definirColunas(b.dataset.col); render(); }; });
    if (col !== 'questao') colunaProxima(meu);
  }

  return {
    mostrar(questao) {
      if (questao?.id !== q?.id) { mostrarTodas = false; dadosProxima = null; }
      q = questao; render();
    },
    esconder() { token++; q = null; raiz.innerHTML = ''; },
  };
}
