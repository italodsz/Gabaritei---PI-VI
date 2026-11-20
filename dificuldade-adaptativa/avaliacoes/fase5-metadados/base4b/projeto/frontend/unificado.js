// Painel do fluxo existente: recomendação, consentimento e histórico oficial.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path,body){const r=await fetch(path,{credentials:'same-origin',method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw new Error(data.error||'Não foi possível acessar a recomendação.');return data;}
export function createUnifiedPanel({E,onStartPractice}){
 let options=null,root,area='MT',topic='',preference='adaptativa',review=false,result=null,busy=false,consent=false,sequence=0;
 const $=s=>root?.querySelector(s);
 async function mount(target){root=target;root.innerHTML='<p role="status">Carregando assuntos do catálogo…</p>';try{options ||= await api('/api/unificado/opcoes');render();}catch(e){root.innerHTML=`<p role="alert">${esc(e.message)}</p>`;}}
 function render(){
  const topics=options.assuntos.filter(t=>t.area===area);if(!topics.some(t=>t.id===topic))topic=topics[0]?.id||'';
  root.innerHTML=`<section class="lg-card unificado-panel"><h2>Questões para o seu momento</h2><p>Combinamos o conteúdo escolhido, sua estimativa por área e as questões que você ainda não abriu.</p>
   <form id="unificado-form"><div class="cfg-groups"><label>Área<select id="unificado-area">${[['MT','Matemática'],['CN','Ciências da Natureza'],['CH','Ciências Humanas'],['LC','Linguagens']].map(([id,name])=>`<option value="${id}" ${id===area?'selected':''}>${name}</option>`).join('')}</select></label>
   <label>Assunto do catálogo<select id="unificado-topic">${topics.map(t=>`<option value="${esc(t.id)}" ${t.id===topic?'selected':''}>${esc(t.materia)} · ${esc(t.titulo)}</option>`).join('')}</select></label>
   <label>Dificuldade desejada<select id="unificado-preference">${[['adaptativa','Adequada ao meu perfil'],['facil','Fácil'],['media','Média'],['dificil','Difícil']].map(([id,name])=>`<option value="${id}" ${id===preference?'selected':''}>${name}</option>`).join('')}</select></label>
   <label><input type="checkbox" id="unificado-review" ${review?'checked':''}> Permitir revisões quando faltarem inéditas</label>
   <label><input type="checkbox" id="unificado-consent" ${consent?'checked':''} required> Confirmo essa preferência. O sistema não pode trocar a dificuldade escolhida sem meu aceite.</label>
   <button class="lg-btn lg-btn-primary" type="submit" id="unificado-search" ${busy||!topic?'disabled':''}>${busy?'Buscando…':'Buscar até 5 questões'}</button></div></form>
   <p id="unificado-status" role="status"></p><div id="unificado-results"></div>
   <button type="button" class="lg-btn" id="unificado-history">Meu histórico verificado</button><div id="unificado-history-result"></div></section>`;
  $('#unificado-area').onchange=e=>{area=e.target.value;result=null;sequence++;render();};
  $('#unificado-topic').onchange=e=>{topic=e.target.value;result=null;sequence++;$('#unificado-results').innerHTML='';};
  $('#unificado-preference').onchange=e=>{preference=e.target.value;consent=false;result=null;sequence++;render();};
  $('#unificado-review').onchange=e=>{review=e.target.checked;result=null;sequence++;$('#unificado-results').innerHTML='';};
  $('#unificado-consent').onchange=e=>{consent=e.target.checked;};
  $('#unificado-form').onsubmit=async e=>{e.preventDefault();if(busy||!consent)return;busy=true;const token=++sequence;$('#unificado-search').disabled=true;$('#unificado-status').textContent='Consultando seu histórico e o catálogo…';try{const data=await api('/api/unificado/recomendacoes',{area,topicId:topic,preferencia:preference,modoRevisao:review});if(token!==sequence)return;result=data;showResult();}catch(err){if(token===sequence)$('#unificado-status').textContent=err.message;}finally{busy=false;const b=$('#unificado-search');if(b)b.disabled=false;}};
  $('#unificado-history').onclick=async()=>{try{const h=await api('/api/unificado/historico'),p=await api('/api/eu/perfil-tri');$('#unificado-history-result').innerHTML=`<p>${h.totalFamilias} famílias de questões apresentadas. Revisões não aumentam a evidência TRI.</p><p>${Object.entries(p.perfis||{}).map(([a,v])=>`${esc(a)}: ${v.n} respostas elegíveis`).join(' · ')}</p><ul>${h.eventos.slice(0,12).map(v=>`<li>${esc(v.questao_id)} · ${v.correta?'Acerto':'Erro'} · ${v.conta?'evidência TRI':esc(v.motivo)}</li>`).join('')}</ul>`;}catch(e){$('#unificado-history-result').textContent=e.message;}};
  if(result)showResult();
 }
 function showResult(){
  const p=result.perfil;
  $('#unificado-status').textContent=`${result.itens.length} questões disponíveis. ${p.n} respostas elegíveis nesta área. ${p.status==='inicial'?'Ainda estamos conhecendo seu desempenho.':p.status==='incerta'?'A estimativa ainda tem incerteza elevada.':'A estimativa é provisória.'} Não é uma nota oficial nem avaliação de domínio deste assunto. ${result.motivoEscassez||''}`;
  $('#unificado-results').innerHTML=`<h3>${esc(result.titulo)}</h3><p>Prévia da lista. O histórico de apresentação é registrado ao abrir a questão completa.</p><ol>${result.itens.map(c=>`<li class="lg-card" style="padding:16px;margin:12px 0"><strong>ENEM ${c.questao.ano} · Questão ${c.questao.numero??'sem número'} · ${esc(({facil:'Fácil',media:'Média',dificil:'Difícil'})[c.dificuldade])}</strong><p>${esc(c.questao.preview)}</p><p>${esc(c.justificativa)}</p><details><summary>Por que apareceu?</summary><p>Posição no catálogo de conteúdo: ${c.posicaoSemantica}. ${p.n===0?'Ainda sem evidência individual; a ordenação inicial usa o conteúdo.':`Chance estimada de acerto: ${Math.round(c.chancePrevista*100)}%, provisória.`} ${c.estado==='inedita'?'Ainda não apresentada.':'Revisão explicitamente autorizada.'}</p></details></li>`).join('')}</ol>${result.itens.length?'<button type="button" class="lg-btn lg-btn-primary" id="unificado-start">Estudar essas questões</button>':''}`;
  const start=$('#unificado-start');if(start)start.onclick=()=>{const snapshot=result;onStartPractice(`Recomendadas · ${snapshot.titulo}`,snapshot.itens.map(c=>c.id),'recommended',{...E.EMPTY_FILTERS,count:snapshot.itens.length,recomendacaoId:snapshot.id,preferenciaUnificada:snapshot.preferencia});};
 }
 return {mount};
}
