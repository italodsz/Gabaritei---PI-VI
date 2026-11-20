// Seletor auditável: escores reais titulo_area + posterior TRI oficial + novidade persistida.
import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import * as T from '../frontend/dificuldade.js';
import {erro} from './auth.mjs';
import {transacao} from './db.mjs';
export const CONFIG_UNIFICADO=JSON.parse(readFileSync(new URL('./config/unificado_v1.json',import.meta.url)));
const bytes=readFileSync(new URL('./artefatos/escores_titulo_area.json',import.meta.url));
export const ESCORES_SHA256='5e5020339d05ef4786736b2f1bda74ac51bb33401b3ea495fdd5c20c0d01ae77';
if(createHash('sha256').update(bytes).digest('hex')!==ESCORES_SHA256)throw new Error('Artefato semântico 4B alterado. Reproduza e audite os escores.');
const artifact=JSON.parse(bytes);
export function validarEscores(acervo){
 if(artifact.datasetSha256!==acervo.info.sha256||artifact.catalogSha256!==acervo.info.catalogSha256)throw new Error('Escores não correspondem à base/catálogo.');
 for(const [qid,ids] of Object.entries(acervo.catalogo.recomendacoes)){
  const scored=artifact.scores[qid];if(!scored||scored.length!==ids.length||scored.some(([id,v],k)=>id!==ids[k]||!Number.isFinite(v)||v<=0))throw new Error('IDs/escores incompatíveis em '+qid);
 }
 return true;
}
export function ordenarUnificado(candidatas,perfil,triCfg,policy=CONFIG_UNIFICADO,{preferencia='adaptativa',revisao=false}={}){
 const moment=T.momentos(perfil,triCfg),confidence=Math.min(1,perfil.n/policy.tri.minEvidencias)*Math.min(1,policy.tri.dpReferencia/Math.max(.001,moment.dp));
 const center=moment.media+policy.tri.centroRelativoB;
 const max=Math.max(0,...candidatas.map(c=>c.escoreSemantico));
 const rejected={semTri:0,preferencia:0,respondidas:0,relevancia:0};
 const evaluated=candidatas.flatMap(c=>{
  if(!c.tri){rejected.semTri++;return [];}
  if(preferencia!=='adaptativa'&&c.dificuldade!==preferencia){rejected.preferencia++;return [];}
  if(c.estado!=='inedita'&&!revisao){rejected.respondidas++;return [];}
  const rel=c.escoreSemantico/max;
  if(rel<policy.relevancia.piso){rejected.relevancia++;return [];}
  const distance=Math.abs(c.tri.b-center),adequacy=Math.exp(-(distance**2)/(2*(policy.tri.largura**2+moment.dp**2)));
  const semantic=policy.relevancia.pesoEscore*rel+(1-policy.relevancia.pesoEscore)/Math.log2(c.posicaoSemantica+1);
  const wt=policy.pesos.tri*confidence,ws=policy.pesos.semantica;
  return [{...c,relevanciaRelativa:rel,distanciaB:distance,adequacao:adequacy,chancePrevista:T.chance(perfil,c.tri,triCfg),escoreSelecao:(ws*semantic+wt*adequacy)/(ws+wt)}];
 });
 // Fallbacks só afrouxam relevância e margem de b dentro de limites explícitos.
 const selected=[],families=new Set(),steps=[];
 const novelty=revisao?['inedita','apresentada','respondida','revisada']:['inedita'];
 for(const state of novelty){
  const stages=[{rel:policy.relevancia.inicial,margin:policy.tri.margens[0]},{rel:policy.relevancia.piso,margin:policy.tri.margens[0]},{rel:policy.relevancia.piso,margin:policy.tri.margens[1]}];
  for(let k=0;k<stages.length&&selected.length<policy.limite;k++){
   const stage=stages[k];
   const available=evaluated.filter(c=>c.estado===state&&c.relevanciaRelativa>=stage.rel&&(!confidence||c.distanciaB<=stage.margin)&&!families.has(c.familia));
   available.sort((a,b)=>b.escoreSelecao-a.escoreSelecao||a.posicaoSemantica-b.posicaoSemantica||a.id.localeCompare(b.id));
   let added=0;for(const c of available){if(selected.length>=policy.limite)break;if(families.has(c.familia))continue;families.add(c.familia);selected.push({...c,etapa:k,modo:state==='inedita'?'inedita':'revisao_explicita'});added++;}
   steps.push({estado:state,etapa:k,minRelevancia:stage.rel,maxDistanciaB:confidence?stage.margin:null,incluidas:added});
  }
 }
 return {itens:selected,perfil:{area:perfil.area,n:perfil.n,theta:moment.media,dp:moment.dp,pesoRelativoEvidencia:confidence,status:perfil.n<policy.tri.minEvidencias?'inicial':moment.dp>policy.tri.dpReferencia?'incerta':'estimativa_disponivel',aviso:'Estimativa por área; não é domínio do assunto nem nota oficial. Mesmo 15 respostas não garantem confiabilidade.'},exclusoes:rejected,etapas:steps,avaliadas:evaluated.length};
}
export function criarUnificado({db,acervo,integridade,triCfg,policy=CONFIG_UNIFICADO,relogio=Date.now}){
 let checked=false;
 function validar(){if(!checked){validarEscores(acervo);checked=true;}}
 function estados(s){
  const map=new Map();
  for(const t of db.prepare('SELECT questao_id,familia FROM tentativa_integridade WHERE sujeito=?').all(s))map.set(t.familia,{estado:'apresentada',id:t.questao_id});
  const events=db.prepare('SELECT questao_id,familia,COUNT(*) n FROM evento_integridade WHERE sujeito=? GROUP BY familia').all(s);
  for(const e of events)map.set(e.familia,{estado:e.n>1?'revisada':'respondida',id:e.questao_id});return map;
 }
 function opcoes(){validar();const topics=new Map();for(const q of acervo.questions){if(!q.tri)continue;const t=acervo.bootstrap.subjects.flatMap(s=>s.topics).find(t=>t.id===q.topicId);if(!topics.has(q.topicId))topics.set(q.topicId,{id:q.topicId,titulo:t.name,area:q.sourceArea,materia:acervo.catalogo.questoes[q.id].materia,referencias:0});topics.get(q.topicId).referencias++;}return {areas:T.AREAS,assuntos:[...topics.values()].sort((a,b)=>a.titulo.localeCompare(b.titulo,'pt-BR'))};}
 function recomendar(s,input){
  validar();if(!input||typeof input!=='object'||Array.isArray(input))throw erro(400,'Envie os critérios da recomendação.');
  const allowed=['area','topicId','titulo','questaoRef','preferencia','modoRevisao'];if(Object.keys(input).some(k=>!allowed.includes(k)))throw erro(400,'Campo não permitido. Identidade e perfil são determinados pelo servidor.');
  if(!T.AREAS.includes(input.area))throw erro(400,'Área ENEM inválida.');
  const pref=input.preferencia;if(!['adaptativa','facil','media','dificil'].includes(pref))throw erro(400,'Escolha explicitamente a preferência de dificuldade.');
  if(input.modoRevisao!==undefined&&typeof input.modoRevisao!=='boolean')throw erro(400,'modoRevisao deve ser booleano.');
  if(input.topicId&&input.titulo)throw erro(400,'Use assunto ou título, não ambos.');
  let pool=acervo.questions.filter(q=>q.sourceArea===input.area);
  if(input.topicId){if(typeof input.topicId!=='string')throw erro(400,'Assunto inválido.');pool=pool.filter(q=>q.topicId===input.topicId);}
  else if(input.titulo){if(typeof input.titulo!=='string'||input.titulo.length>180)throw erro(400,'Título inválido.');pool=pool.filter(q=>acervo.catalogo.questoes[q.id].titulo.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()===input.titulo.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase());}
  else if(!input.questaoRef)throw erro(400,'Selecione assunto/título ou questão de referência.');
  let ref;
  if(input.questaoRef){ref=pool.find(q=>q.id===input.questaoRef);if(!ref)throw erro(422,'Referência incompatível com área ou assunto.');}
  else ref=pool.sort((a,b)=>(artifact.scores[b.id]?.length||0)-(artifact.scores[a.id]?.length||0)||a.id.localeCompare(b.id))[0];
  if(!ref)throw erro(422,'Assunto não corresponde ao catálogo nessa área. Não há busca livre por texto.');
  const history=estados(s),all=artifact.scores[ref.id]||[],candidate=[];
  for(let k=0;k<all.length;k++){
   const [id,score]=all[k],q=acervo.byId.get(id);
   if(!q||q.sourceArea!==input.area||q.topicId!==ref.topicId||q.familyId===ref.familyId)continue;
   candidate.push({id,familia:q.familyId,tri:q.tri,dificuldade:q.difficulty,estado:history.get(q.familyId)?.estado||'inedita',escoreSemantico:score,posicaoSemantica:k+1});
  }
  const p=integridade.perfis(s)[input.area],selection=ordenarUnificado(candidate,p,triCfg,policy,{preferencia:pref,revisao:input.modoRevisao===true});
  const id=randomUUID(),result={id,versao:policy.versao,proveniencia:{politica:structuredClone(policy),triConfigSha256:createHash('sha256').update(JSON.stringify(triCfg)).digest('hex'),perfilSha256:createHash('sha256').update(JSON.stringify(p)).digest('hex'),datasetSha256:acervo.info.sha256,catalogoSha256:acervo.info.catalogSha256},preferencia:pref,revisaoAutorizada:input.modoRevisao===true,area:input.area,questaoRef:ref.id,topicId:ref.topicId,titulo:acervo.catalogo.questoes[ref.id].titulo,
   semantica:{metodo:'titulo_area',escoresSha256:ESCORES_SHA256,galeria:'todas',limiteCatalogo:all.length,consulta:'contexto de questão de referência; título seleciona grupo, não embedding de texto livre',unidade:'RRF, não probabilidade'},
   ...selection,status:selection.itens.length<policy.limite?'estoque_insuficiente':'recomendacoes',faltam:policy.limite-selection.itens.length,
   motivoEscassez:selection.itens.length<policy.limite?'Poucas candidatas inéditas com TRI, relevância e preferência compatíveis dentro do catálogo congelado.':null,
   itens:selection.itens.map(c=>({...c,questao:{id:c.id,area:input.area,ano:acervo.byId.get(c.id).year,numero:acervo.byId.get(c.id).sourcePosition,preview:acervo.byId.get(c.id).prompt.slice(0,250)},justificativa:c.estado==='inedita'?(p.n===0?'Inédita no histórico oficial; seleção inicial pelo conteúdo, ainda sem evidência individual.':'Inédita no histórico oficial; conteúdo do título selecionado e adequação provisória ao perfil por área.'):'Revisão autorizada; não produz nova evidência independente.'}))};
  db.prepare('INSERT INTO recomendacao_unificada VALUES (?,?,?,?,?,?)').run(id,s,relogio(),JSON.stringify(input),JSON.stringify(result),policy.versao);return result;
 }
 function obter(s,id){const r=db.prepare('SELECT resultado_json FROM recomendacao_unificada WHERE id=? AND sujeito=?').get(id,s);if(!r)throw erro(404,'Recomendação não encontrada nesta conta/sessão.');return JSON.parse(r.resultado_json);}
 function expor(s,id,input){const r=obter(s,id);if(!r.itens.some(c=>c.id===input?.questaoId))throw erro(422,'Questão não pertence a esta recomendação.');
  return transacao(db,()=>{const t=integridade.emitir(s,input.questaoId,{sessaoId:input.sessaoId,origem:'pratica'});db.prepare('INSERT OR IGNORE INTO exposicao_unificada VALUES (?,?,?,?,?,?)').run(randomUUID(),s,id,input.questaoId,t.tentativaId,relogio());return t;});
 }
 function historico(s){const es=estados(s),events=db.prepare('SELECT seq,id,questao_id,area,correta,conta,adapta,motivo,recebida_ms FROM evento_integridade WHERE sujeito=? ORDER BY seq DESC LIMIT 100').all(s);return {identidade:'sessao_do_servidor',totalFamilias:es.size,estados:[...es.values()],eventos:events,limiteEventos:100,recomendacoes:db.prepare('SELECT id,criada_ms,versao FROM recomendacao_unificada WHERE sujeito=? ORDER BY rowid DESC LIMIT 20').all(s)};}
 return {opcoes,recomendar,obter,expor,historico};
}
