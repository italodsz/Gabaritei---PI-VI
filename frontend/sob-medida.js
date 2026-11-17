// Prática sob medida: o aluno escolhe o ponto de partida (uma questão, um tema ou aleatório) e, a
// partir daí, o recomendador escolhe a próxima questão sem fim:
//   1. titulo_area: as questões parecidas com a última respondida (catálogo oficial do projeto),
//      sem as já respondidas e sem as da mesma família;
//   2. dificuldade: entre as 20 primeiras dessa lista, um ajuste suave pela chance de acerto
//      (pode trocar a 1ª pela 2ª ou 3ª quando a 1ª está muito fora do desafio);
//   3. se a última não tem parecidas novas, tenta as anteriores da prática; depois o mesmo
//      assunto (pela dificuldade); por fim, o acervo inteiro.
// Cada escolha guarda o motivo (badge na questão) e fica registrada no laboratório (/dev).
import { recomendarQuestao } from './acervo-api.js';
import * as Dif from './dificuldade-cliente.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = v => String(v ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');
export const TITULO = 'Prática sob medida';
const AREAS = [['', 'Todas as áreas'], ['linguagens', 'Linguagens'], ['humanas', 'Humanas'], ['natureza', 'Natureza'], ['matematica', 'Matemática']];

/* ------------------------------------------------------------------ */
/* Primeira questão                                                    */
/* ------------------------------------------------------------------ */
export function primeira(escolha, { E, records }) {
  const vistas = new Set(records.map(r => r.questionId));
  const sorteia = list => list[Math.floor(Math.random() * list.length)];
  if (escolha.modo === 'questao') {
    const q = E.questionRepository.getById(escolha.questaoId);
    return q ? { id: q.id, reason: 'Ponto de partida que você escolheu' } : null;
  }
  if (escolha.modo === 'tema') {
    const pool = E.questionRepository.query({ topicIds: [escolha.topicId] });
    const ineditas = pool.filter(q => !vistas.has(q.id));
    const base = ineditas.length ? ineditas : pool;
    if (!base.length) return null;
    const id = Dif.pronto() ? Dif.montarLista(base, 1, records)[0] : sorteia(base).id;
    const t = E.TOPIC_BY_ID[escolha.topicId];
    return { id, reason: `Começo em ${t?.name ?? 'este tema'}, no seu nível (chance ${pct(Dif.chanceDe(E.questionRepository.getById(id)))})` };
  }
  const pool = E.questionRepository.query(escolha.areaId ? { areaIds: [escolha.areaId] } : {});
  const ineditas = pool.filter(q => !vistas.has(q.id));
  const base = ineditas.length ? ineditas : pool;
  if (!base.length) return null;
  return { id: sorteia(base).id, reason: 'Sorteada para começar' };
}

/* ------------------------------------------------------------------ */
/* Próxima questão                                                     */
/* ------------------------------------------------------------------ */
export async function proxima(session, { E, records }) {
  const repo = E.questionRepository;
  const bloqueadas = [...new Set([...records.map(r => r.questionId), ...session.questionIds])];
  const respondidas = session.questionIds.filter(id => session.answers[id]?.confirmed);
  const refs = [...respondidas].reverse().slice(0, 5);
  for (const [k, ref] of refs.entries()) {
    let ids = [];
    try { ids = (await recomendarQuestao(ref, bloqueadas, 20)).ids || []; } catch { break; }
    if (!ids.length) continue;
    const ordem = Dif.ordenarSemelhantes(ids, repo);
    const id = ordem[0], posicao = ids.indexOf(id) + 1, q = repo.getById(id), chance = Dif.chanceDe(q);
    const de = k === 0 ? 'Parecida com a anterior' : `Parecida com a ${k + 1}ª anterior (a última não tem parecidas novas)`;
    const reason = `${de} · ${posicao}ª no titulo_area${posicao > 1 ? ', subiu pela dificuldade' : ''} · chance ${pct(chance)}`;
    Dif.anotarDecisao({ fonte: 'titulo_area', sessao: session.id, ref, escolhida: id, posicao, candidatas: ids.length, chance, top: ids.slice(0, 5).map(i => ({ id: i, chance: Dif.chanceDe(repo.getById(i)) })) });
    return { id, reason };
  }
  // Sem parecidas novas no catálogo: mesmo assunto da última, pela dificuldade.
  const ultima = repo.getById(respondidas.at(-1) ?? session.questionIds.at(-1));
  const fora = new Set(bloqueadas);
  for (const [filtro, nome] of [[{ topicIds: [ultima?.topicId] }, E.TOPIC_BY_ID[ultima?.topicId]?.name], [{ subjectId: ultima?.subjectId }, E.SUBJECT_BY_ID[ultima?.subjectId]?.name], [{}, null]]) {
    const pool = repo.query(filtro).filter(q => !fora.has(q.id));
    if (!pool.length) continue;
    const id = Dif.pronto() ? Dif.montarLista(pool, 1, records)[0] : pool[Math.floor(Math.random() * pool.length)].id;
    const chance = Dif.chanceDe(repo.getById(id));
    Dif.anotarDecisao({ fonte: nome ? 'assunto' : 'acervo', sessao: session.id, ref: ultima?.id, escolhida: id, chance, candidatas: pool.length });
    return { id, reason: `${nome ? `Sem parecidas novas: mesmo ${filtro.topicIds ? 'assunto' : 'matéria'} (${nome})` : 'Sem parecidas novas: do acervo'}, no seu nível · chance ${pct(chance)}` };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Escolha do ponto de partida (janela)                                */
/* ------------------------------------------------------------------ */
export function abrirEscolha({ E, openDialog, closeDialog, icons, onEscolher }) {
  const state = { aba: 'tema', busca: '', subjectId: null, areaId: '' };
  const subjects = E.SUBJECTS.filter(s => E.questionRepository.query({ subjectId: s.id }).length);
  openDialog(`<div class="sm"><span class="dialog-label">PRÁTICA SOB MEDIDA</span><h2 id="dialog-title" class="dialog-title">Por onde começar?</h2>
    <p class="dialog-description">Depois da primeira questão, o recomendador escolhe a próxima sem parar: uma parecida com a anterior pelo <b>titulo_area</b>, ajustada pelo seu <b>nível de desafio</b>.</p>
    <div class="sm-tabs" role="tablist">${[['questao', 'Uma questão'], ['tema', 'Um tema'], ['aleatorio', 'Aleatório']].map(([v, l]) => `<button type="button" role="tab" data-aba="${v}">${l}</button>`).join('')}</div>
    <div class="sm-body" id="sm-body"></div></div>`);
  const dlg = document.querySelector('#dialog');
  dlg.classList.add('is-wide');
  dlg.addEventListener('close', () => dlg.classList.remove('is-wide'), { once: true });
  const $ = s => dlg.querySelector(s);
  const escolher = escolha => { closeDialog(); onEscolher(escolha); };

  function corpoQuestao() {
    const termo = norm(state.busca.trim());
    const todas = E.questionRepository.query({});
    const achadas = termo.length < 3 ? [] : todas.filter(q => norm(`${q.prompt} ${E.SUBJECT_BY_ID[q.subjectId]?.name} ${E.TOPIC_BY_ID[q.topicId]?.name} ${q.year} ${q.id}`).includes(termo)).slice(0, 30);
    return `<label class="sm-search"><span>Buscar no enunciado, matéria, assunto ou ano</span><input id="sm-busca" value="${esc(state.busca)}" placeholder="Ex.: fotossíntese, porcentagem, 2019" autocomplete="off"></label>
      <div class="sm-list" id="sm-lista">${termo.length < 3 ? '<p class="sm-hint">Digite ao menos 3 letras.</p>' : achadas.length ? achadas.map(q => `<button type="button" class="sm-q" data-q="${q.id}"><span class="sm-q-top"><b>${esc(E.SUBJECT_BY_ID[q.subjectId]?.name)}</b> · ${esc(E.TOPIC_BY_ID[q.topicId]?.name ?? '')} · ENEM ${q.year}${q.sourcePosition ? ` · questão ${q.sourcePosition}` : ''}<em>${pct(Dif.chanceDe(q))}</em></span><span class="sm-q-txt">${esc(String(q.prompt).replace(/\s+/g, ' ').slice(0, 170))}…</span></button>`).join('') : '<p class="sm-hint">Nada encontrado.</p>'}</div>`;
  }
  function corpoTema() {
    const sub = state.subjectId;
    const temas = sub ? E.TOPICS.filter(t => t.subjectId === sub).map(t => ({ t, n: E.questionRepository.query({ topicIds: [t.id] }).length })).filter(x => x.n) : [];
    return `<div class="sm-chips" aria-label="Matéria">${subjects.map(s => `<button type="button" class="sm-chip ${s.id === sub ? 'is-on' : ''}" data-sub="${s.id}">${esc(s.name)}</button>`).join('')}</div>
      ${sub ? `<p class="sm-sub">Assuntos de ${esc(E.SUBJECT_BY_ID[sub].name)}</p><div class="sm-list">${temas.map(({ t, n }) => `<button type="button" class="sm-q sm-t" data-t="${t.id}"><span class="sm-q-top"><b>${esc(t.name)}</b><em>${n} questões</em></span></button>`).join('')}</div>` : '<p class="sm-hint">Escolha uma matéria para ver os assuntos.</p>'}`;
  }
  function corpoAleatorio() {
    return `<p class="sm-sub">A primeira questão é sorteada; a partir dela, o recomendador segue sozinho.</p>
      <div class="sm-chips">${AREAS.map(([v, l]) => `<button type="button" class="sm-chip ${state.areaId === v ? 'is-on' : ''}" data-area="${v}">${l}</button>`).join('')}</div>
      <div class="dialog-actions"><button type="button" class="primary-button" id="sm-sortear">Sortear e começar ${icons('arrow')}</button></div>`;
  }
  function render() {
    dlg.querySelectorAll('[data-aba]').forEach(b => { const on = b.dataset.aba === state.aba; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    $('#sm-body').innerHTML = state.aba === 'questao' ? corpoQuestao() : state.aba === 'tema' ? corpoTema() : corpoAleatorio();
    const busca = $('#sm-busca');
    if (busca) { busca.focus(); busca.setSelectionRange(busca.value.length, busca.value.length); let t; busca.oninput = () => { state.busca = busca.value; clearTimeout(t); t = setTimeout(render, 200); }; }
    dlg.querySelectorAll('[data-q]').forEach(b => b.onclick = () => escolher({ modo: 'questao', questaoId: b.dataset.q }));
    dlg.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => { state.subjectId = b.dataset.sub; render(); });
    dlg.querySelectorAll('[data-t]').forEach(b => b.onclick = () => escolher({ modo: 'tema', topicId: b.dataset.t }));
    dlg.querySelectorAll('[data-area]').forEach(b => b.onclick = () => { state.areaId = b.dataset.area; render(); });
    const sortear = $('#sm-sortear'); if (sortear) sortear.onclick = () => escolher({ modo: 'aleatorio', areaId: state.areaId || null });
  }
  dlg.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => { state.aba = b.dataset.aba; render(); });
  render();
}

/** Texto curto do ponto de partida (para o card do início e o título da sessão). */
export function rotulo(escolha, E) {
  if (escolha.modo === 'questao') { const q = E.questionRepository.getById(escolha.questaoId); return q ? `a partir de uma questão de ${E.SUBJECT_BY_ID[q.subjectId]?.name ?? ''}` : 'a partir de uma questão'; }
  if (escolha.modo === 'tema') return `a partir de ${E.TOPIC_BY_ID[escolha.topicId]?.name ?? 'um tema'}`;
  return escolha.areaId ? `aleatória em ${E.AREA_BY_ID[escolha.areaId]?.shortName ?? escolha.areaId}` : 'totalmente aleatória';
}
