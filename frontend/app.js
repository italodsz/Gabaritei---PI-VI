import { createLearningPages } from './learning-pages.js';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${/^[a-z-]+$/.test(name) ? name : 'book'}"/></svg>`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const initial = [
  { id: 'functions', title: 'Funções e gráficos', description: 'Pratique a leitura de gráficos e as relações entre grandezas.', area: 'Matemática', icon: 'plus', done: true, saved: false },
  { id: 'practice', title: 'Continue de onde parou', description: 'Matemática · 10 questões', area: 'Matemática', featured: true, done: false, saved: true },
  { id: 'reading', title: 'Interpretação de texto', description: 'Explore sentidos, argumentos e estratégias de leitura.', area: 'Linguagens', icon: 'book', done: true, saved: false },
  { id: 'ecology', title: 'Ecologia e ambiente', description: 'Conecte os seres vivos, o ambiente e as suas relações.', area: 'Natureza', icon: 'leaf', done: false, saved: false },
  { id: 'percentage', title: 'Porcentagem no cotidiano', description: 'Resolva situações com descontos e proporções.', area: 'Matemática', icon: 'calculator', done: false, saved: false }
];
const studyAreas = [
  { key: 'linguagens', area: 'Linguagens', title: 'Linguagens, Códigos', fullName: 'Linguagens, Códigos e suas Tecnologias', subjects: 'LEITURA · EXPRESSÃO · CULTURA', text: 'Textos, sentidos e novas formas de ver o mundo.', id: 'reading', art: 'linguagens' },
  { key: 'natureza', area: 'Natureza', title: 'Ciências da Natureza', fullName: 'Ciências da Natureza e suas Tecnologias', subjects: 'BIOLOGIA · FÍSICA · QUÍMICA', text: 'Descubra as conexões entre a vida e a ciência.', id: 'ecology', art: 'natureza' },
  { key: 'humanas', area: 'Humanas', title: 'Ciências Humanas', fullName: 'Ciências Humanas e suas Tecnologias', subjects: 'SOCIEDADE · HISTÓRIA · ESPAÇO', text: 'Entenda as pessoas, os lugares e suas histórias.', id: 'humanities', art: 'humanas' },
  { key: 'matematica', area: 'Matemática', title: 'Matemática', fullName: 'Matemática e suas Tecnologias', subjects: 'LÓGICA · NÚMEROS · GEOMETRIA', text: 'Encontre caminhos entre números e ideias.', id: 'functions', art: 'matematica' }
];
const areaKey = name => studyAreas.find(area => area.area === name)?.key || 'livre';
const officialArea = name => studyAreas.find(area => area.area === name)?.fullName || name;
function getActivity(id) { return activities.find(item => item.id === id) || (id === 'humanities' ? { id, title: 'A Terra em movimento', area: 'Humanas', description: 'Explore as relações entre os movimentos da Terra e o nosso cotidiano.', done: false } : null); }
function areaCards(mode = 'practice') {
  return `<div class="area-grid">${studyAreas.map((area, index) => `<button class="area-card area-${area.key}" data-open="${area.id}" aria-label="${mode === 'simulation' ? 'Explorar simulado' : 'Estudar agora'}: ${area.fullName}">
    <span class="area-number">${String(index + 1).padStart(2, '0')}</span>
    <span class="area-kicker">${area.subjects}</span>
    <span class="area-copy"><h2><span class="area-title">${area.title}</span> <span class="area-suffix">e suas Tecnologias</span></h2><span class="area-description">${area.text}</span><span class="area-meta">${mode === 'simulation' ? 'Treino por área' : 'No seu ritmo'} <span>·</span> 1 questão de exemplo</span><span class="area-cta">${mode === 'simulation' ? 'Explorar simulado' : 'Estudar agora'} ${icon('arrow')}</span></span>
    <img class="area-art" src="assets/area-${area.art}.svg" alt="" width="180" height="190" draggable="false">
  </button>`).join('')}</div><p class="area-demo-note">${icon('spark')} Um pequeno começo: neste protótipo, cada área abre uma questão demonstrativa.</p>`;
}
let activities = structuredClone(initial);
let note = 'Você não precisa saber tudo.\nSó precisa começar.';
try { const stored = JSON.parse(localStorage.getItem('gabaritei:canvas-prototype:v1')); if (stored && Array.isArray(stored.activities) && stored.activities.length && stored.activities.every(a => typeof a.id === 'string' && typeof a.title === 'string' && typeof a.description === 'string' && typeof a.area === 'string')) { activities = stored.activities; if (typeof stored.note === 'string') note = stored.note; } } catch { /* O protótipo também funciona sem armazenamento. */ }
const state = { page: 'plano', view: 'map', pending: false, saved: false, zoom: 1 };
function persist() { try { localStorage.setItem('gabaritei:canvas-prototype:v1', JSON.stringify({ activities, note })); } catch { /* Estado mantido nesta sessão. */ } }
let toastTimeout;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }
function render() {
  const query = $('#search').value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const filtered = activities.filter(a => (!state.pending || !a.done) && (!state.saved || a.saved) && `${a.title} ${a.description} ${a.area}`.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(query));
  $('#total-count').textContent = activities.length;
  $('#done-count').textContent = activities.filter(a => a.done).length;
  $('#upcoming-count').textContent = activities.filter(a => !a.done).length;
  $('#learning-canvas').classList.toggle('is-filtered', Boolean(query || state.pending || state.saved || activities.length > 5));
  $('#learning-canvas').dataset.view = state.view;
  $('#learning-canvas').style.setProperty('--zoom', state.zoom);
  $('#empty-state').hidden = filtered.length > 0;
  $('#activities').innerHTML = filtered.map((a, i) => a.featured ? `
    <article class="activity-card featured" data-id="${escape(a.id)}" data-area="${areaKey(a.area)}" style="--index:${i}">
      <span class="card-top-label">${a.done ? 'MAIS UM PASSO CONCLUÍDO' : 'SEU PRÓXIMO PASSO'}</span><h2>${escape(a.done ? 'Olha só até onde você chegou.' : a.title)}</h2><p class="card-description">${escape(a.description)}</p>
      <span class="math-decoration" aria-hidden="true">√x</span><button class="play-button" data-action="start" data-id="${escape(a.id)}" aria-label="Retomar prática de Matemática"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4a1.7 1.7 0 0 1 2.5-1.5l12 7.4a2 2 0 0 1 0 3.2l-12 7.4A1.7 1.7 0 0 1 7 19Z"/></svg></button>
      <div class="card-actions"><button class="resume-button" data-action="start" data-id="${escape(a.id)}">${icon(a.done ? 'check' : 'clock')}${a.done ? 'Praticar novamente' : 'Retomar prática'}</button><div class="avatar-stack" aria-hidden="true"><span class="mini-avatar">🧑🏽</span><span class="mini-avatar">👩🏻</span><span class="mini-avatar">🧑🏾</span></div></div>
    </article>` : `
    <article class="activity-card" data-id="${escape(a.id)}" data-area="${areaKey(a.area)}" style="--index:${i}">
      <div class="card-badge" aria-hidden="true">${icon(a.icon || 'book')}</div><h2>${escape(a.title)}</h2><p class="card-description">${escape(a.description)}</p>
      <div class="card-actions"><span class="status-pill ${a.done ? 'done' : ''}">${a.done ? 'Concluído' : 'Próxima atividade'}${icon(a.done ? 'check' : 'clock')}</span><div class="card-action-group"><button class="icon-button save-button" data-action="save" data-id="${escape(a.id)}" aria-label="${a.saved ? 'Remover dos salvos' : 'Salvar atividade'}: ${escape(a.title)}" aria-pressed="${Boolean(a.saved)}">${icon('bookmark')}</button><button class="icon-button complete-button ${a.done ? 'done' : ''}" data-action="${a.done ? 'complete' : 'start'}" data-id="${escape(a.id)}" aria-label="${a.done ? 'Marcar como pendente' : 'Iniciar atividade'}: ${escape(a.title)}">${icon(a.done ? 'check' : 'arrow')}</button></div></div>
    </article>`).join('');
  $('#note-content').textContent = note;
  $('#filter-button').setAttribute('aria-pressed', state.pending);
  $('#saved-button').setAttribute('aria-pressed', state.saved);
  $$('[data-view]').filter(el => el.tagName === 'BUTTON').forEach(button => { button.classList.toggle('selected', button.dataset.view === state.view); button.setAttribute('aria-pressed', button.dataset.view === state.view); });
}
const dialog = $('#dialog');
function openDialog(content) { if (dialog.open) dialog.close(); $('#dialog-content').innerHTML = content; dialog.showModal(); }
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
function activityDetails(id) {
  const a = getActivity(id);
  if (!a) return;
  openDialog(`<span class="dialog-label">${escape(a.area)} · PRÁTICA DEMONSTRATIVA</span><h2 id="dialog-title" class="dialog-title">${escape(a.featured ? 'Vamos conectar os pontos?' : a.title)}</h2><p class="dialog-description">Um pequeno treino para experimentar o novo Gabaritei. Esta prévia tem uma questão fictícia e não utiliza dados de uma prova oficial.</p><div style="display:flex;gap:10px"><span class="status-pill">${icon('layers')}1 questão de exemplo</span><span class="status-pill">${icon('clock')}Sem pressa</span></div><div class="dialog-actions"><button class="primary-button" id="begin-practice">Começar ${icon('arrow')}</button><button class="small-button" id="toggle-complete">${a.done ? 'Marcar como pendente' : 'Marcar como concluída'}</button></div>`);
  $('#begin-practice').onclick = () => startQuestion(id);
  $('#toggle-complete').onclick = () => { if (!activities.some(item => item.id === id)) activities.push(a); a.done = !a.done; persist(); render(); dialog.close(); toast(a.done ? 'Mais um passo concluído. Boa!' : 'Atividade marcada como pendente.'); };
}
function startQuestion(id) {
  const a = getActivity(id);
  if (!a) return;
  const questions = {
    Natureza: { text: 'Em uma cadeia alimentar, qual grupo transforma a energia solar em energia química disponível para os demais seres vivos?', options: ['Produtores, como plantas e algas', 'Consumidores primários', 'Consumidores secundários', 'Decompositores'], correct: 0, explanation: 'Plantas e algas são produtores. Pela fotossíntese, transformam energia solar em energia química armazenada na matéria orgânica.' },
    Linguagens: { text: 'Na frase “Embora estivesse chovendo, ela foi estudar”, a palavra “embora” estabelece uma relação de:', options: ['Causa', 'Concessão', 'Conclusão', 'Finalidade'], correct: 1, explanation: '“Embora” introduz uma concessão: apresenta uma circunstância que poderia impedir a ação, mas não a impede.' },
    Humanas: { text: 'Qual movimento da Terra está diretamente relacionado à alternância entre o dia e a noite?', options: ['Translação ao redor do Sol', 'Rotação em torno do próprio eixo', 'Movimento das marés', 'Deslocamento das placas tectônicas'], correct: 1, explanation: 'A rotação é o movimento da Terra em torno do próprio eixo. Ao girar, diferentes partes da superfície ficam voltadas para o Sol, alternando períodos de dia e noite.' },
    Matemática: { text: 'Um livro custa R$ 80,00 e está com 25% de desconto. Quanto você vai pagar?', options: ['R$ 20,00', 'R$ 55,00', 'R$ 60,00', 'R$ 75,00'], correct: 2, explanation: '25% de R$ 80,00 são R$ 20,00. Subtraindo o desconto: 80 − 20 = R$ 60,00.' }
  };
  const q = questions[a.area] || questions.Matemática;
  let selected = null;
  openDialog(`<div class="question-label"><span>PRÁTICA DEMONSTRATIVA</span><span>01 / 01</span></div><h2 id="dialog-title" class="dialog-title">${escape(a.area)}</h2><p class="question-text">${q.text}</p><div class="answer-list">${q.options.map((text, i) => `<button class="answer" data-answer="${i}" aria-pressed="false"><span>${String.fromCharCode(65 + i)}</span>${text}</button>`).join('')}</div><div id="answer-feedback"></div><div class="dialog-actions"><button class="primary-button" id="check-answer" disabled>Confirmar resposta ${icon('check')}</button></div>`);
  $$('.answer', dialog).forEach(button => button.onclick = () => { selected = Number(button.dataset.answer); $$('.answer', dialog).forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', b === button); }); $('#check-answer').disabled = false; });
  $('#check-answer').onclick = () => { if (selected === null) return; $$('.answer', dialog).forEach(b => { b.disabled = true; b.classList.remove('selected'); b.classList.toggle('correct', Number(b.dataset.answer) === q.correct); b.classList.toggle('incorrect', Number(b.dataset.answer) === selected && selected !== q.correct); }); $('#answer-feedback').innerHTML = `<div class="answer-feedback" role="status"><strong>${selected === q.correct ? 'Isso mesmo! ✨' : 'Tudo bem. Vamos entender juntos?'}</strong><br>${q.explanation}</div>`; $('#check-answer').innerHTML = `Concluir atividade ${icon('arrow')}`; $('#check-answer').onclick = () => { if (!activities.some(item => item.id === id)) activities.push(a); a.done = true; persist(); render(); if (state.page === 'progresso') renderSecondary(); dialog.close(); toast('Atividade concluída. Um passo a mais no seu caminho!'); }; };
}
$('#activities').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const a = activities.find(item => item.id === button.dataset.id); if (!a) return; if (button.dataset.action === 'start') activityDetails(a.id); else if (button.dataset.action === 'save') { a.saved = !a.saved; persist(); render(); toast(a.saved ? 'Atividade guardada nos seus salvos.' : 'Atividade removida dos salvos.'); } else { a.done = !a.done; persist(); render(); toast('Atividade marcada como pendente.'); } });
$('#search').addEventListener('input', render);
function clearFilters() { $('#search').value = ''; state.pending = false; state.saved = false; render(); }
$('#clear-search').onclick = clearFilters;
$$('button[data-view]').forEach(button => button.onclick = () => { state.view = button.dataset.view; render(); });
$('#zoom-in').onclick = () => { state.zoom = Math.min(1.08, state.zoom + .04); render(); toast(`Visualização: ${Math.round(state.zoom * 100)}%`); };
$('#zoom-out').onclick = () => { state.zoom = Math.max(.84, state.zoom - .04); render(); toast(`Visualização: ${Math.round(state.zoom * 100)}%`); };
$('#dock-map').onclick = () => { navigate('plano'); state.view = 'map'; clearFilters(); };
$('#filter-button').onclick = () => { navigate('plano'); state.pending = !state.pending; render(); toast(state.pending ? 'Mostrando suas próximas atividades.' : 'Mostrando todas as atividades.'); };
$('#saved-button').onclick = () => { navigate('plano'); state.saved = !state.saved; render(); toast(state.saved ? 'Mostrando atividades salvas.' : 'Mostrando todas as atividades.'); };
$('#notifications').onclick = () => { $('.week-panel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); toast('Você tem 3 atividades no plano da semana.'); };
$('#profile-button').onclick = () => { const menu = $('#profile-menu'); menu.hidden = !menu.hidden; $('#profile-button').setAttribute('aria-expanded', !menu.hidden); };
document.addEventListener('click', event => { if (!event.target.closest('.profile-wrapper')) { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });
$('#reset-demo').onclick = () => { activities = structuredClone(initial); note = 'Você não precisa saber tudo.\nSó precisa começar.'; persist(); clearFilters(); navigate('plano'); $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); toast('Demonstração restaurada. Tudo pronto para recomeçar.'); };
$('#note-button').onclick = () => { openDialog(`<span class="dialog-label">UM LEMBRETE GENTIL</span><h2 id="dialog-title" class="dialog-title">Uma mensagem para você.</h2><p class="dialog-description">Deixe aqui algo que ajude nos dias em que começar parece mais difícil.</p><form id="note-form"><label class="dialog-field">Seu lembrete<textarea name="note" maxlength="120" required>${escape(note)}</textarea></label><button class="primary-button" type="submit">Guardar lembrete ${icon('check')}</button></form>`); $('#note-form').onsubmit = event => { event.preventDefault(); note = new FormData(event.target).get('note').trim(); if (!note) return; persist(); render(); dialog.close(); toast('Seu lembrete está no lugar.'); }; };
$('#add-button').onclick = () => { openDialog(`<span class="dialog-label">SEU PLANO, DO SEU JEITO</span><h2 id="dialog-title" class="dialog-title">O que vamos estudar?</h2><p class="dialog-description">Adicione um assunto ao seu mural. Você pode reorganizar a visualização pela barra lateral.</p><form id="activity-form"><label class="dialog-field">Assunto<input name="title" placeholder="Ex.: Equações do segundo grau" maxlength="70" required></label><label class="dialog-field">Sua intenção para esse estudo<textarea name="description" placeholder="O que você quer entender melhor?" maxlength="160" required></textarea></label><button class="primary-button" type="submit">Adicionar ao meu plano ${icon('plus')}</button></form>`); $('#activity-form').onsubmit = event => { event.preventDefault(); const data = new FormData(event.target); const title = data.get('title').trim(), description = data.get('description').trim(); if (!title || !description) return; activities.push({ id: crypto.randomUUID(), title, description, area: 'Estudo livre', icon: 'book', done: false, saved: false }); persist(); navigate('plano'); clearFilters(); dialog.close(); toast('Novo assunto adicionado. Seu plano ganhou mais um caminho.'); }; };
let timerRemaining = 25 * 60;
let timerEnd = null;
let timerInterval = null;
const timerText = () => `${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`;
function updateTimer() { if (timerEnd) timerRemaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000)); if ($('#timer-value')) $('#timer-value').textContent = timerText(); if (timerEnd && timerRemaining === 0) { clearInterval(timerInterval); timerInterval = null; timerEnd = null; if ($('#timer-start')) $('#timer-start').textContent = 'Foco concluído'; toast('Seu tempo de foco terminou. Hora de respirar um pouco.'); } }
$('#focus-button').onclick = () => { updateTimer(); openDialog(`<span class="dialog-label">UMA COISA DE CADA VEZ</span><h2 id="dialog-title" class="dialog-title">Seu momento de foco.</h2><p class="dialog-description">Escolha um tempo, deixe as distrações de lado e dê o próximo passo.</p><div class="timer-modes"><button data-minutes="15">15 min</button><button data-minutes="25" class="active">25 min</button><button data-minutes="45">45 min</button></div><div class="timer-face" id="timer-value" role="timer" aria-label="Tempo restante">${timerText()}</div><div class="dialog-actions" style="justify-content:center"><button class="primary-button" id="timer-start">${timerEnd ? 'Pausar' : 'Começar'}</button><button class="small-button" id="timer-reset">Reiniciar</button></div>`); let duration = 25; $$('[data-minutes]', dialog).forEach(button => { button.classList.toggle('active', !timerEnd && Number(button.dataset.minutes) === Math.ceil(timerRemaining / 60)); button.onclick = () => { duration = Number(button.dataset.minutes); clearInterval(timerInterval); timerInterval = null; timerEnd = null; timerRemaining = duration * 60; $$('[data-minutes]', dialog).forEach(b => b.classList.toggle('active', b === button)); updateTimer(); $('#timer-start').textContent = 'Começar'; }; }); $('#timer-start').onclick = () => { if (timerEnd) { updateTimer(); timerEnd = null; clearInterval(timerInterval); timerInterval = null; $('#timer-start').textContent = 'Continuar'; } else { if (!timerRemaining) timerRemaining = duration * 60; timerEnd = Date.now() + timerRemaining * 1000; timerInterval = setInterval(updateTimer, 250); $('#timer-start').textContent = 'Pausar'; } }; $('#timer-reset').onclick = () => { clearInterval(timerInterval); timerInterval = null; timerEnd = null; timerRemaining = duration * 60; updateTimer(); $('#timer-start').textContent = 'Começar'; }; };
const eventDetails = [
  { label: 'SEGUNDA · PRÁTICA', title: 'Uma dose de Matemática', text: 'Reserve 20 minutos para praticar funções e gráficos. Neste protótipo, você pode experimentar uma questão demonstrativa.', id: 'functions' },
  { label: 'TERÇA · REVISÃO', title: 'Errar também é aprender.', text: 'Uma revisão tranquila para entender o raciocínio, reconhecer padrões e tentar outra vez. Experimente a prática de leitura demonstrativa.', id: 'reading' },
  { label: 'QUARTA · SIMULADO', title: 'Um novo desafio de Natureza.', text: 'A proposta completa é um simulado de 10 questões. Este modelo visual oferece uma questão demonstrativa para você experimentar a interação.', id: 'ecology' }
];
$$('[data-event]').forEach(button => button.onclick = () => { const e = eventDetails[Number(button.dataset.event)]; openDialog(`<span class="dialog-label">${e.label}</span><h2 id="dialog-title" class="dialog-title">${e.title}</h2><p class="dialog-description">${e.text}</p><button class="primary-button" id="start-event">Experimentar ${icon('arrow')}</button>`); $('#start-event').onclick = () => startQuestion(e.id); });
function navigate(page) { state.page = page; history.replaceState(null, '', `#${page}`); $('#plan-page').hidden = page !== 'plano'; $('#secondary-page').hidden = page === 'plano'; $$('.nav-item').forEach(button => { const active = button.dataset.page === page; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); }); const names = { plano: 'Meu plano', questoes: 'Questões', simulados: 'Simulados', progresso: 'Progresso' }; document.title = `${names[page]} · Gabaritei`; if (page !== 'plano') renderSecondary(); }
$$('[data-page]').forEach(button => button.onclick = () => navigate(button.dataset.page));
$('.brand').onclick = event => { event.preventDefault(); navigate('plano'); };
function renderSecondary() {
  const page = $('#secondary-page');
  if (state.page === 'questoes' || state.page === 'progresso') { learning.mount(state.page); return; }
  delete page.dataset.learning;
  page.classList.remove('learning-page');
  if (state.page === 'simulados') {
    page.innerHTML = `<div class="eyebrow">SE PREPARAR TAMBÉM É EXPERIMENTAR</div><h1>Um treino no seu ritmo. 🧩</h1><p class="secondary-description">Escolha entre as quatro áreas do ENEM. Nesta prévia, cada opção abre uma questão de exemplo, sem tempo de prova ou nota oficial.</p>${areaCards('simulation')}`;
  }
  $$('[data-open]', page).forEach(button => button.onclick = () => activityDetails(button.dataset.open));
}
document.addEventListener('keydown', event => { const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName); if (event.key === '/' && !typing && !dialog.open) { event.preventDefault(); navigate('plano'); $('#search').focus(); } if (event.key === 'Escape') { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });
const learning = createLearningPages({root:$('#secondary-page'),openDialog,closeDialog:()=>dialog.close(),toast,navigate,icons:icon});
render();
if (['plano', 'questoes', 'simulados', 'progresso'].includes(location.hash.slice(1))) navigate(location.hash.slice(1));
