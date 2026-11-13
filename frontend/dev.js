import { questionTextHTML, descriptionsHTML } from './question-text.js';
import { SESSION_KEY, emptySession, sessionStats, saveReview, exportCSV, removeLatestRecord, restoreRecord } from './dev-session.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => new Intl.NumberFormat('pt-BR').format(value);
const fixed = (value, digits=4) => value === null || value === undefined ? '—' : Number(value).toLocaleString('pt-BR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
const percent = value => value === null ? '—' : `${fixed(value*100,1)}%`;
const splitName = {train:'Treino',validation:'Validação',test:'Teste reservado'};
const statusName = {liberada:'Liberada',defeito:'Defeito de texto',duplicata:'Duplicata',fora:'Fora das elegíveis'};
const names = {tfidf:'TF-IDF',qwen:'Qwen',minilm:'MiniLM',sinal_nomes:'Nomes'};
const state = {summary:null,question:null,diagnostic:null,selection:null,answer:null,offset:0,total:0,list:[],listToken:0,questionToken:0,diagnosticToken:0,selectedAt:0,answerBusy:false,rating:null,compare:null};
let session = emptySession();
let storageAvailable = true;
let lastRemoved = null;
try { const saved=JSON.parse(localStorage.getItem(SESSION_KEY)); if(saved?.schemaVersion===1&&Array.isArray(saved.answers)&&Array.isArray(saved.reviews))session=saved; } catch { storageAvailable=false; }
let toastTimer;
function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500); }
function persist() { try { localStorage.setItem(SESSION_KEY,JSON.stringify(session)); } catch { storageAvailable=false;toast('Sem armazenamento: exporte sua sessão para guardar as avaliações.'); } updateSessionCount(); }
async function request(path, options={}) {
  const response=await fetch(path,{...options,signal:AbortSignal.timeout(55000),headers:{'Content-Type':'application/json',...options.headers}});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Solicitação indisponível.');return data;
}
const post=(path,data)=>request(path,{method:'POST',body:JSON.stringify(data)});
const tag=(value,kind='')=>`<span class="tag ${kind}">${esc(value)}</span>`;
const metric=(label,value,note,icon)=>`<article class="metric"><span>${esc(label)}</span><i>${icon}</i><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`;

function provenance() {
  return {baseSha256:state.summary.info.sha256,catalogSha256:state.summary.info.catalogSha256,method:'titulo_area',datasetCommit:state.summary.info.datasetCommit,recommenderCommit:state.summary.info.recommenderCommit};
}
function updateSessionCount() { $('#session-count').textContent=number(session.answers.length+session.reviews.length); }
function setTab(tab) {
  for(const button of document.querySelectorAll('[data-tab]'))button.setAttribute('aria-pressed',String(button.dataset.tab===tab));
  for(const id of ['explore','stats','session'])$('#'+id).hidden=id!==tab;
  if(tab==='stats')renderStats();if(tab==='session')renderSession();
  history.replaceState(null,'',`/dev#${tab}`);
}
const filters=()=>({area:$('#area').value,materia:$('#subject').value,ano:$('#year').value,split:$('#split').value,status:$('#status').value,busca:$('#question-search').value.trim()});
async function loadList(reset=false) {
  if(reset)state.offset=0;
  const token=++state.listToken;const params=new URLSearchParams({...filters(),inicio:String(state.offset),limite:'20'});
  $('#question-list').innerHTML='<p class="empty-inline">Buscando questões…</p>';
  try {
    const result=await request('/api/dev/questoes?'+params);if(token!==state.listToken)return;
    state.total=result.total;state.list=result.records;
    $('#found-count').textContent=number(result.total);$('#list-range').textContent=result.total?`${state.offset+1}–${Math.min(state.offset+20,result.total)} de ${number(result.total)}`:'Nenhum resultado';
    $('#page-label').textContent=`${Math.floor(state.offset/20)+1} / ${Math.max(1,Math.ceil(result.total/20))}`;
    $('#prev-page').disabled=!state.offset;$('#next-page').disabled=state.offset+20>=result.total;$('#random').disabled=!result.total;
    renderList();
  }catch(error){if(token===state.listToken)$('#question-list').innerHTML=`<p class="message error">${esc(error.message)}</p>`;}
}
function renderList() {
  $('#question-list').innerHTML=state.list.length?state.list.map(q=>`<button class="question-item ${state.question?.id===q.id?'selected':''}" data-open="${q.id}" aria-pressed="${state.question?.id===q.id}"><div>${tag(`${q.area} · ${q.year}`,q.split==='validation'?'blue':'')} ${q.status==='liberada'?`<small>${q.recommendations} sugestões</small>`:tag(statusName[q.status],q.status==='defeito'?'red':'orange')}</div><strong>${esc(q.assunto||q.titulo||'Sem classificação')}</strong><p>${esc(q.preview)}</p><small>${esc(q.id)}</small></button>`).join(''):'<p class="empty-inline">Nenhuma questão com esses filtros. Experimente outro conjunto ou uma busca menor.</p>';
  $('#question-list').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>loadQuestion(b.dataset.open));
}
async function loadQuestion(id) {
  const token=++state.questionToken;++state.diagnosticToken;state.question=null;state.diagnostic=null;state.answer=null;state.selection=null;
  $('#question').innerHTML='<div class="loading">Abrindo a questão…</div>';$('#diagnostic').innerHTML='<p class="empty-inline">Aguardando a questão.</p>';$('#run-diagnostic').disabled=true;
  try {
    const q=await request('/api/dev/questoes/'+encodeURIComponent(id));if(token!==state.questionToken)return;
    state.question=q;state.selectedAt=performance.now();renderQuestion();renderList();$('#run-diagnostic').disabled=!q.canAnalyze;
    if(q.canAnalyze)runDiagnostic();else $('#diagnostic').innerHTML=`<p class="message">${esc(q.analysisRestriction)}</p>`;
  }catch(error){if(token===state.questionToken)$('#question').innerHTML=`<p class="message error">${esc(error.message)}</p>`;}
}
function renderQuestion() {
  const d=state.question,q=d.question;
  const canAnswer=d.canAnalyze;
  $('#question').innerHTML=`<div class="question-title"><div><p class="eyebrow">QUESTÃO DE REFERÊNCIA</p><div class="question-tags">${tag(`${d.area} · ENEM ${d.year}`,'blue')}${tag(splitName[d.split]||d.split)}${tag(statusName[d.status],d.status==='liberada'?'green':'orange')}</div><h2>${esc(d.materia||'Questão sem rótulo')}${d.position?` <span class="muted">/ ${d.position}</span>`:''}</h2><span class="mono question-id">${esc(d.id)}</span></div><button id="next-random" type="button" title="Outra questão do filtro atual">↻ Outra</button></div>
    ${d.analysisRestriction?`<p class="message">${esc(d.analysisRestriction)}</p>`:''}
    <div class="source-text">${questionTextHTML(q.prompt)}${descriptionsHTML(q.descriptions)}</div>
    <div class="alternatives" role="radiogroup" aria-label="Alternativas da questão">${q.alternatives.map(a=>`<button type="button" class="alternative ${state.answer&&a.letter===state.answer.answer?'correct':''} ${state.answer&&!state.answer.correct&&a.letter===state.selection?'wrong':''}" role="radio" aria-checked="${state.selection===a.letter}" data-answer="${a.letter}" ${!canAnswer||state.answer||state.answerBusy?'disabled':''}><span>${a.letter}</span>${esc(a.text)}</button>`).join('')}</div>
    <div class="answer-actions"><button id="confirm-answer" type="button" class="primary" ${!canAnswer||!state.selection||state.answer||state.answerBusy?'disabled':''}>${state.answerBusy?'Conferindo…':state.answer?'Resposta registrada':'Confirmar resposta'}</button><span id="answer-feedback" class="answer-feedback" role="status">${state.answer?`${state.answer.correct?'✓ Correta.':'Resposta incorreta.'} Gabarito: ${state.answer.answer}. Registrado só na sessão dev.`:canAnswer?'Sua resposta não altera os pesos do recomendador.':''}</span></div>
    <details class="metadata"><summary>Metadados, rótulo e qualidade do texto</summary><dl class="meta-grid">${[['Matéria',d.materia],['Título',d.titulo],['Assunto',d.assunto],['Nó da árvore',d.label?.no||'Rótulo herdado da classificação'],['Conjunto',splitName[d.split]],['Idioma',d.language],['Descrição aprovada',`${d.descriptionCount} item(ns)`],['Habilidade INEP',d.skill??'Não informada'],['TRI b (informação)',d.tri?.b??'Não informado'],['Família',d.familyId]].map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v??'Não informado')}</dd></div>`).join('')}<div class="wide"><dt>Observação da classificação manual</dt><dd>${esc(d.label?.obs||'Sem observação manual para este registro.')}</dd></div><div class="wide"><dt>Uso dos metadados</dt><dd>Gabarito, TRI e habilidade não entram no texto nem nos escores de semelhança. A árvore fornece os filtros de matéria, título e prioridade de assunto.</dd></div></dl></details>`;
  $('#next-random').onclick=randomQuestion;
  $('#question').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{state.selection=b.dataset.answer;renderQuestion();});
  $('#confirm-answer').onclick=confirmAnswer;
}
async function confirmAnswer() {
  if(!state.question?.canAnalyze||!state.selection||state.answer||state.answerBusy)return;
  const d=state.question,selected=state.selection,token=state.questionToken,selectedAt=state.selectedAt;state.answerBusy=true;renderQuestion();
  try {
    const answer=await post(`/api/questoes/${d.id}/responder`,{selected});
    session.answers.push({...provenance(),at:new Date().toISOString(),questionId:d.id,split:d.split,materia:d.materia,selected,correct:answer.correct,answer:answer.answer,durationMs:Math.max(0,Math.round(performance.now()-selectedAt))});persist();
    if(token===state.questionToken)state.answer=answer;
  }catch(error){toast(error.message);}finally{state.answerBusy=false;if(state.question)renderQuestion();}
}
async function randomQuestion() {
  if(!state.total)return;
  try{const offset=Math.floor(Math.random()*state.total);const data=await request('/api/dev/questoes?'+new URLSearchParams({...filters(),inicio:String(offset),limite:'1'}));if(data.records[0])loadQuestion(data.records[0].id);}catch(error){toast(error.message);}
}
async function runDiagnostic() {
  if(!state.question?.canAnalyze)return;
  const q=state.question,token=++state.diagnosticToken;state.diagnostic=null;$('#run-diagnostic').disabled=true;
  $('#diagnostic').innerHTML='<div class="loading">Calculando os valores sobre os índices existentes… A primeira consulta também carrega os sinais auxiliares. Sem baixar modelo ou usar a GPU.</div>';
  try{
    const result=await post('/api/dev/diagnostico',{questionId:q.id,limit:20,exclude:[]});if(token!==state.diagnosticToken)return;
    state.diagnostic=result;renderDiagnostic();$('#runtime').textContent='Índices carregados · CPU';
  }catch(error){if(token===state.diagnosticToken)$('#diagnostic').innerHTML=`<div class="message error"><strong>Escores indisponíveis</strong><br>${esc(error.message)}<br>A questão e as estatísticas continuam disponíveis; nenhum escore foi estimado para preencher a tela.</div>`;}
  finally{if(token===state.diagnosticToken)$('#run-diagnostic').disabled=false;}
}
function componentValue(c) {return c?`<span class="${c.used?'':'inactive-value'}">${fixed(c.value)}</span><small style="display:block;color:var(--muted);font:9px Inter;margin-top:4px">posição ${c.rank}${c.used?'':' · fora da receita'}</small>`:'—';}
function scoreBars(row) {
  return `<div class="score-breakdown" aria-label="Contribuições do escore">${Object.entries(row.components).filter(([,c])=>c.contribution>0).map(([key,c])=>`<span class="${key==='qwen'?'component-qwen':key==='tfidf'?'component-tfidf':'component-extra'}" style="width:${100*c.contribution/row.score}%" title="${esc(names[key]||key)}: ${fixed(c.contribution,6)}"></span>`).join('')}</div>`;
}
function renderDiagnostic() {
  const d=state.diagnostic;
  const extra=Object.keys(d.results[0]?.components||{}).filter(k=>k.startsWith('sinal_'));
  $('#diagnostic').innerHTML=`<div class="trace-top">${tag('Ao vivo · índices existentes','green')}${tag(`${number(d.totalRanked)} candidatas no ranking`)}${tag('Galeria: treino','blue')}<span class="duration">${fixed(d.durationMs,0)} ms · carga do índice ${fixed(d.indexLoadMs,0)} ms</span></div>
    <div class="recipe"><span>K = ${d.rrfK}</span><span class="${d.recipe.palavras?'':'inactive'}">TF-IDF × ${d.recipe.palavras}</span><span>Qwen × ${d.recipe.sentido}</span>${Object.entries(d.recipe.pecas).map(([k,v])=>`<span>${esc(k)} × ${v}</span>`).join('')}<span class="inactive">MiniLM · comparação</span>${d.subjectPriority?'<span>Mesmo assunto primeiro</span>':''}</div>
    <p class="trace-help">Escore final = soma de peso ÷ (K + posição em cada sinal). <strong>Não é probabilidade de acerto.</strong> TF-IDF e Qwen mostram seus produtos escalares reais; MiniLM é diagnóstico e não entra na receita oficial. ${d.subjectPriority?'A prioridade de assunto pode colocar um escore menor acima de outro maior.':''}</p>
    ${d.results.length?`<div class="table-scroll"><table class="ranking"><thead><tr><th>#</th><th>Questão sugerida</th><th class="number">TF-IDF</th><th class="number">Qwen</th><th class="number">MiniLM</th>${extra.map(k=>`<th class="number">${esc(names[k]||k)}</th>`).join('')}<th class="number">Escore final</th></tr></thead><tbody>${d.results.map(r=>`<tr><td class="number">${r.rank}</td><td class="candidate"><strong>${esc(r.assunto)}</strong><small>ENEM ${r.year} · ${esc(r.materia)}${r.sameSubject?' · mesmo assunto':''}</small><span class="mono">${esc(r.id)}</span><small>Posição no catálogo do app: ${r.catalogRank??'fora do top 50'}</small><div class="candidate-actions"><button data-compare="${r.id}" type="button">Comparar / avaliar</button><button data-follow="${r.id}" type="button">Abrir ↗</button></div></td><td class="number">${componentValue(r.components.tfidf)}</td><td class="number">${componentValue(r.components.qwen)}</td><td class="number">${componentValue(r.components.minilm)}</td>${extra.map(k=>`<td class="number">${componentValue(r.components[k])}</td>`).join('')}<td class="number"><strong>${fixed(r.score,6)}</strong>${scoreBars(r)}${d.subjectPriority?`<small class="rank-priority">posição só pelo escore: ${r.scoreRankBeforePriority}</small>`:''}</td></tr>`).join('')}</tbody></table></div><p class="trace-help">Mostrando ${d.results.length} de ${d.totalAfterExclusions}. Barras: Qwen em verde, TF-IDF em azul e sinais auxiliares em ocre; larguras representam a contribuição na soma, sem estimativa de importância causal.</p>`:'<p class="message">Nenhuma candidata passou pelos filtros. Confira as etapas abaixo.</p>'}
    <details class="trace-details" open><summary>Funil de filtros · por que as questões saem?</summary><div class="funnel">${d.stages.map(s=>`<div class="funnel-row"><span>${esc(s.label)}<small>${number(s.removed)} removidas nesta etapa</small></span><div class="track"><span style="width:${100*s.after/d.stages[0].before}%"></span></div><b>${number(s.after)}</b></div>`).join('')}</div><details class="trace-details"><summary>Exemplos de exclusão (até quatro por etapa)</summary><div class="rejected">${d.rejectedExamples.map(e=>`<p><span class="mono">${esc(e.id)}</span> · ${e.year} · ${esc(e.materia||'sem matéria')}<br><strong>Filtro:</strong> ${esc(e.reason)}</p>`).join('')}</div></details></details>
    <details class="trace-details"><summary>Texto exato usado na busca e informações dos vetores</summary><p class="trace-help">Linha ${d.vectors.row} · MiniLM ${d.vectors.minilmDimensions} dimensões, norma ${fixed(d.vectors.minilmNorm,7)} · Qwen ${d.vectors.qwenDimensions} dimensões, norma ${fixed(d.vectors.qwenNorm,7)}. Qwen é normalizado em baixa precisão; o método usa o produto escalar sem renormalização posterior.</p><pre class="source-code">${esc(d.searchText)}</pre><p class="mono">Qwen SHA-256: ${esc(d.qwenSha256)}</p></details>`;
  $('#diagnostic').querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>compare(b.dataset.compare));
  $('#diagnostic').querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{loadQuestion(b.dataset.follow);$('#question').scrollIntoView({block:'start',behavior:'smooth'});});
}

function bars(rows) {const max=Math.max(1,...rows.map(r=>r.value));return `<div class="bars">${rows.map(r=>`<div class="bar-row"><span>${esc(r.label)}</span><div class="track"><span style="width:${100*r.value/max}%"></span></div><b>${number(r.value)}</b></div>`).join('')}</div>`;}
function renderStats() {
  const s=state.summary;
  $('#stats').innerHTML=`<div class="stats-grid"><section class="panel"><h2>Tamanho das listas do catálogo</h2><p>Contagem calculada agora sobre o catálogo publicado. As listas podem ser menores que 50 dentro de cada título.</p>${bars(s.catalog.histogram)}<p>Menor lista não vazia: ${s.catalog.minNonEmpty}. Listas entre 1 e 4: ${s.catalog.underFive}.</p></section><section class="panel"><h2>Situação dos registros</h2><p>Todos os ${number(s.info.total)} registros da fonte, incluindo os que não entram no recomendador.</p>${bars(s.distributions.status.map(r=>({...r,label:statusName[r.label]||r.label})))}</section><section class="panel"><h2>Questões por área</h2>${bars(s.distributions.area)}</section><section class="panel"><h2>Matérias disponíveis na prática</h2>${bars(s.distributions.subject)}</section><section class="panel"><h2>Edições presentes na fonte</h2>${bars([...s.distributions.year].sort((a,b)=>Number(b.label)-Number(a.label)))}</section><section class="panel"><h2>Classificações novas no top 5</h2><p style="font:650 44px Bricolage;color:var(--ink)">${percent(s.catalog.newLabelsTopFive/s.catalog.topFive)}</p><p>${number(s.catalog.newLabelsTopFive)} de ${number(s.catalog.topFive)} sugestões nas primeiras cinco posições têm rótulo acrescentado na migração. Não é uma taxa de acerto.</p><p>${esc(s.catalog.newLabelsDefinition)}</p></section><section class="panel full"><h2>Conjuntos oficiais × ano da questão</h2><p>A partição é a de ids_elegiveis.json, preservada por famílias. Não é inferida apenas pelo ano: o treino inclui quatro registros de 2023 e dez de 2024. A análise recusa os IDs do conjunto reservado de teste, independentemente desse resumo temporal.</p><div class="table-scroll"><table class="stat-table"><thead><tr><th>Conjunto</th><th>Total elegível</th><th>Anos presentes</th></tr></thead><tbody>${s.partitions.map(p=>`<tr><td>${splitName[p.split]}</td><td>${p.total}</td><td>${[...p.years].sort((a,b)=>Number(a.label)-Number(b.label)).map(y=>`${y.label}: ${y.value}`).join(' · ')}</td></tr>`).join('')}</tbody></table></div></section><section class="panel full"><h2>Validação de desenvolvimento · antes e depois</h2><p>Resultados congelados da migração, não uma avaliação refeita por esta tela. São comparações de pares ordenados. Denominadores diferentes não são diretamente comparáveis; o método oficial tem só dez comparações compatíveis.</p><div class="table-scroll"><table class="stat-table"><thead><tr><th>Método</th><th>Antes</th><th>Depois</th><th>Observação</th></tr></thead><tbody>${s.validation.map(v=>`<tr class="${v.method==='titulo_area'?'official':''}"><td><strong>${esc(v.method)}</strong></td><td>${v.before.certos}/${v.before.comparacoes}</td><td>${v.after.certos}/${v.after.comparacoes}</td><td>${v.method==='titulo_area'?'Método oficial · mesma régua antes/depois':'Método de comparação'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel full"><h2>Origem, integridade e ambiente dos índices</h2><p>Base e catálogo têm hash conferido ao iniciar o servidor. As versões abaixo são as registradas na geração dos índices, não uma leitura dos pacotes instalados hoje.</p><div class="hashes">Dataset ${esc(s.info.datasetCommit)} · recomendador ${esc(s.info.recommenderCommit)}<br>Base: ${esc(s.info.sha256)}<br>Catálogo: ${esc(s.info.catalogSha256)}<br>Qwen: ${esc(s.environment.hashes['indice/qwen/Qwen3-Embedding-8B-4bit__conceito.npy'])}</div><div class="meta-grid">${Object.entries(s.environment.packages).map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</div><p>Auditoria registrada: TF-IDF ajustado só no treino (${s.audit.tfidfTrainOnly?'confirmado':'não confirmado'}); alinhamento de IDs × vetores (${s.audit.aligned?'confirmado':'não confirmado'}). Os escores ao vivo usam os próprios arquivos indexados, sem novo treinamento.</p></section></div>`;
}
function renderSession() {
  const stats=sessionStats(session,state.summary.info.sha256);
  $('#session').innerHTML=`<div class="session-summary"><div class="session-metric">Respostas na sessão<strong>${stats.answered}</strong><small>${stats.distinct} questões distintas</small></div><div class="session-metric">Seu acerto nesta sessão<strong>${percent(stats.accuracy)}</strong><small>${stats.correct} corretas; não mede a qualidade do recomendador</small></div><div class="session-metric">Sugestões avaliadas<strong>${stats.reviews}</strong><small>${stats.ratings.boa} boas · ${stats.ratings.parcial} parciais · ${stats.ratings.ruim} ruins</small></div><div class="session-metric">Tempo médio até responder<strong>${stats.meanMs===null?'—':`${fixed(stats.meanMs/1000,1)} s`}</strong><small>Tempo nesta tela, incluindo inspeção</small></div></div><section class="panel session-panel"><div class="session-toolbar"><div><h2>Anotações para a próxima revisão</h2><p class="context-note">Avaliações manuais, sem alterar rótulos, pesos ou o dataset. ${storageAvailable?'Salvas somente neste navegador.':'Armazenamento indisponível: exporte para guardar.'}${stats.otherVersions?` Há ${stats.otherVersions} registros de outra versão, mantidos na exportação e fora dos indicadores atuais.`:''}</p></div><div><button type="button" id="export-json">Exportar JSON ↓</button><button type="button" id="export-csv">Exportar CSV ↓</button><button type="button" id="remove-latest" ${session.answers.length+session.reviews.length?'':'disabled'}>Remover último registro</button>${lastRemoved?'<button type="button" id="undo-remove">Desfazer</button>':''}</div></div>${session.reviews.length?[...session.reviews].reverse().map(r=>`<div class="review-item"><div><strong>${esc(r.materia||'Questão')} · ${esc(r.assunto||'Avaliação de sugestão')}</strong><small class="mono">${esc(r.questionId)} → ${esc(r.candidateId)}</small><small>${new Date(r.at).toLocaleString('pt-BR')} · galeria ${esc(r.gallery)} · escore ${fixed(r.score,6)}</small><p>${esc(r.note||'Sem observação escrita.')}</p></div>${tag({boa:'Boa sugestão',parcial:'Parcial',ruim:'Ruim',texto:'Problema de texto'}[r.rating]||r.rating,r.rating==='boa'?'green':r.rating==='ruim'?'red':'orange')}</div>`).join(''):'<p class="empty-inline">Ainda não há avaliações. No ranking, abra “Comparar / avaliar” e registre a relevância da sugestão.</p>'}<details class="trace-details"><summary>Respostas registradas (${session.answers.length})</summary>${[...session.answers].reverse().map(a=>`<div class="review-item"><div><strong>${esc(a.materia)} · ${splitName[a.split]}</strong><small class="mono">${esc(a.questionId)}</small><small>${new Date(a.at).toLocaleString('pt-BR')} · alternativa ${a.selected} · gabarito ${a.answer}</small></div>${tag(a.correct?'Acertou':'Errou',a.correct?'green':'orange')}</div>`).join('')||'<p class="empty-inline">Responda uma questão na aba Explorar.</p>'}</details></section>`;
  $('#export-json').onclick=()=>download('json');$('#export-csv').onclick=()=>download('csv');
  $('#remove-latest').onclick=()=>{lastRemoved=removeLatestRecord(session);persist();renderSession();toast('Registro removido. Você pode desfazer nesta tela.');};
  const undo=$('#undo-remove');if(undo)undo.onclick=()=>{restoreRecord(session,lastRemoved);lastRemoved=null;persist();renderSession();toast('Registro restaurado.');};
}
function download(format='json') {
  const payload={exportedAt:new Date().toISOString(),...provenance(),diagnosticScope:'queries train/validation; gallery train',session};
  const blob=new Blob([format==='csv'?exportCSV(session):JSON.stringify(payload,null,2)],{type:format==='csv'?'text/csv;charset=utf-8':'application/json;charset=utf-8'});
  const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=`gabaritei-dev-${new Date().toISOString().slice(0,10)}.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);toast('Sessão exportada.');
}
function questionComparison(q,label) {return `<article><p class="eyebrow">${esc(label)}</p><h3>${esc(q.materia||q.assunto||'Questão')}</h3><span class="mono">${esc(q.id)} · ${q.year}</span><div class="source-text">${questionTextHTML(q.question.prompt)}${descriptionsHTML(q.question.descriptions)}</div><details class="trace-details"><summary>Alternativas</summary><div class="alternatives">${q.question.alternatives.map(a=>`<p><strong>${a.letter}.</strong> ${esc(a.text)}</p>`).join('')}</div></details></article>`;}
async function compare(id) {
  const trace=state.diagnostic,query=state.question,row=trace?.results.find(r=>r.id===id);if(!row)return;
  const dialog=$('#compare');$('#compare-content').innerHTML='<p class="loading">Abrindo comparação…</p>';dialog.showModal();
  try {
    const candidate=await request('/api/dev/questoes/'+id);if(!dialog.open)return;
    state.compare={query,candidate,row,trace};
    const old=session.reviews.find(r=>r.questionId===query.id&&r.candidateId===id&&r.baseSha256===trace.baseSha256&&r.gallery===trace.gallery);state.rating=old?.rating||null;
    $('#compare-content').innerHTML=`<div class="dialog-head"><div><p class="eyebrow">CONFERÊNCIA MANUAL · POSIÇÃO ${row.rank}</p><h2>Essa sugestão faz sentido?</h2></div></div><div class="comparison">${questionComparison(query,'Referência')}${questionComparison(candidate,'Sugestão')}</div><details class="trace-details" open><summary>Composição exata do escore ${fixed(row.score,6)}</summary><div class="table-scroll"><table class="component-table"><thead><tr><th>Sinal</th><th>Valor</th><th>Posição</th><th>Peso</th><th>Contribuição</th></tr></thead><tbody>${Object.entries(row.components).map(([k,c])=>`<tr><td>${esc(names[k]||k)}</td><td>${fixed(c.value,6)}</td><td>${c.rank}</td><td>${c.weight}</td><td>${fixed(c.contribution,8)}</td></tr>`).join('')}</tbody></table></div><p class="trace-help">Contribuição ativa = peso ÷ (${trace.rrfK} + posição). ${trace.subjectPriority?'Esta consulta prioriza o mesmo assunto antes de ordenar pelo escore.':''}</p></details><form id="review-form" class="review-form"><label>Avaliação da sugestão</label><div class="review-options" role="group" aria-label="Relevância da sugestão">${[['boa','Boa sugestão'],['parcial','Parcial'],['ruim','Ruim'],['texto','Problema de texto']].map(([v,l])=>`<button type="button" data-rating="${v}" aria-pressed="${state.rating===v}">${l}</button>`).join('')}</div><label>O que precisa ser revisto?<textarea id="review-note" maxlength="2000" placeholder="Ex.: mesmo título, mas exige outra operação; descrição insuficiente; classificação a conferir…">${esc(old?.note||'')}</textarea></label><div class="dialog-footer"><p>Registro dev separado. Nada será alterado na base ou no recomendador.</p><button type="submit" class="primary">Salvar avaliação</button></div></form>`;
    $('#compare-content').querySelectorAll('[data-rating]').forEach(b=>b.onclick=()=>{state.rating=b.dataset.rating;$('#compare-content').querySelectorAll('[data-rating]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.rating===state.rating)));});
    $('#review-form').onsubmit=event=>{event.preventDefault();if(!state.rating){toast('Escolha uma avaliação antes de salvar.');return;}saveReview(session,{...provenance(),at:new Date().toISOString(),questionId:query.id,candidateId:id,split:query.split,gallery:trace.gallery,rating:state.rating,note:$('#review-note').value.trim(),score:row.score,rank:row.rank,components:row.components,recipe:trace.recipe,rrfK:trace.rrfK,materia:candidate.materia,assunto:candidate.assunto});persist();dialog.close();toast('Avaliação salva na sessão dev.');};
  }catch(error){$('#compare-content').innerHTML=`<p class="message error">${esc(error.message)}</p>`;}
}

$('#compare .close-dialog').onclick=()=>$('#compare').close();
$('#compare').addEventListener('click',e=>{if(e.target===$('#compare')){const r=$('#compare').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#compare').close();}});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('#export-all').onclick=()=>{if(state.summary)download('json');};$('#run-diagnostic').onclick=runDiagnostic;
$('#search-form').onsubmit=event=>{event.preventDefault();loadList(true);};
let searchTimer;$('#question-search').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadList(true),300);};
for(const selector of ['#area','#subject','#split','#status','#year'])$(selector).onchange=()=>loadList(true);
$('#prev-page').onclick=()=>{state.offset=Math.max(0,state.offset-20);loadList();};$('#next-page').onclick=()=>{state.offset+=20;loadList();};$('#random').onclick=randomQuestion;

try {
  state.summary=await request('/api/dev/resumo');const s=state.summary;
  $('#runtime').textContent='Base e catálogo verificados';
  $('#metrics').innerHTML=metric('Disponíveis na prática',number(s.info.available),`${number(s.info.total)} registros na fonte`,'↗')+metric('Cobertura do catálogo',percent((s.info.eligible-s.catalog.empty)/s.info.eligible),`${s.catalog.empty} listas vazias em ${number(s.info.eligible)}`,'◎')+metric('Sugestões por lista',s.catalog.median,'mediana · até 50 sugestões','≋')+metric('Bloqueios no catálogo',s.info.blocked,'67 defeitos + 7 duplicatas','⊘');
  $('#subject').innerHTML='<option value="">Todas</option>'+s.distributions.subject.map(r=>`<option>${esc(r.label)}</option>`).join('');
  $('#year').innerHTML='<option value="">Todos</option>'+s.distributions.year.sort((a,b)=>Number(b.label)-Number(a.label)).map(r=>`<option>${esc(r.label)}</option>`).join('');
  updateSessionCount();await loadList();
  const tab=location.hash.slice(1);setTab(['explore','stats','session'].includes(tab)?tab:'explore');
  if(!tab||tab==='explore')loadQuestion(s.defaultQuestionId);
}catch(error){$('#fatal').hidden=false;$('#fatal').textContent=`Não foi possível abrir o laboratório: ${error.message}`;$('#runtime').textContent='API indisponível';}
