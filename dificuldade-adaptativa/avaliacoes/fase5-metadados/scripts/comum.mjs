import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {carregarAcervo} from '../base4b/projeto/backend/acervo.mjs';
import {CONFIG_UNIFICADO,ordenarUnificado} from '../base4b/projeto/backend/unificado.mjs';
import * as T from '../base4b/projeto/frontend/dificuldade.js';
export {T,ordenarUnificado};
export const root=fileURLToPath(new URL('../',import.meta.url));
export const acervo=await carregarAcervo();
export const cfg=JSON.parse(readFileSync(new URL('../base4b/projeto/backend/config/dificuldade_v1.json',import.meta.url)));
export const policy=structuredClone(CONFIG_UNIFICADO);
export const scores=JSON.parse(readFileSync(new URL('../base4b/projeto/backend/artefatos/escores_titulo_area.json',import.meta.url))).scores;
export const sha=s=>createHash('sha256').update(s).digest('hex');
export function save(name,data){const path=new URL('../resultados/'+name,import.meta.url);mkdirSync(new URL('.',path),{recursive:true});writeFileSync(path,JSON.stringify(data,null,2));}
export const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
export function quantile(a,q){if(!a.length)return null;const b=[...a].sort((a,b)=>a-b),p=q*(b.length-1),i=Math.floor(p);return b[i]+(b[Math.min(i+1,b.length-1)]-b[i])*(p-i);}
export function rng(seed){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let t=v;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export const seedOf=s=>parseInt(sha(s).slice(0,8),16);
export function profile(area,name){const p=T.perfilInicial(area,cfg);if(name==='novo')return p;if(name==='poucas')return {...p,n:4};const mu={baixo:-1.5,medio:0,alto:1.5,incerto:0}[name],dp=name==='incerto'?1.2:.25;return {...p,n:80,lw:Array.from(T.grade(cfg),x=>-.5*((x-mu)/dp)**2)};}
export const profiles=['novo','poucas','baixo','medio','alto','incerto'];
export function candidates(qid,states=new Map()){
 const ref=acervo.byId.get(qid);if(!ref)return [];
 return(scores[qid]||[]).flatMap(([id,s],k)=>{const q=acervo.byId.get(id);if(!q||q.sourceArea!==ref.sourceArea||q.topicId!==ref.topicId||q.familyId===ref.familyId)return [];return [{id,familia:q.familyId,tri:q.tri,dificuldade:q.difficulty,estado:states.get(q.familyId)||'inedita',escoreSemantico:s,posicaoSemantica:k+1}];});
}
const byTopic=new Map();for(const q of acervo.questions){if(!q.tri)continue;const list=byTopic.get(q.topicId)||[];list.push(q);byTopic.set(q.topicId,list);}
// Same reference rule as production; split fixed by title hash, before sensitivity analyses.
export const queries=[...byTopic.entries()].map(([topic,list])=>{
 const pool=acervo.questions.filter(q=>q.topicId===topic);pool.sort((a,b)=>(scores[b.id]?.length||0)-(scores[a.id]?.length||0)||a.id.localeCompare(b.id));const q=pool[0];
 return{topicId:topic,qid:q.id,area:q.sourceArea,titulo:acervo.catalogo.questoes[q.id].titulo,split:seedOf(topic)%5===0?'reserva_operacional':'desenvolvimento_operacional',rotulosFinalIndependente:false};
}).sort((a,b)=>a.topicId.localeCompare(b.topicId));
export function metricRanking(ids,labels,k=5,complete=false){
 const top=ids.slice(0,k),known=top.filter(id=>labels.has(id)),rel=known.filter(id=>labels.get(id)>=2).length,unknown=top.length-known.length;
 const precision=unknown===0?rel/k:null;
 if(complete&&unknown>0)throw new Error('Universo declarado completo não cobre todas as posições retornadas.');
 let recall=null,ndcg=null;
 if(complete){const relevant=[...labels.values()].filter(g=>g>=2).length;recall=relevant?rel/relevant:null;
  const dcg=top.reduce((s,id,i)=>s+(2**(labels.get(id)||0)-1)/Math.log2(i+2),0),ideal=[...labels.values()].sort((a,b)=>b-a).slice(0,k).reduce((s,g,i)=>s+(2**g-1)/Math.log2(i+2),0);ndcg=ideal?dcg/ideal:null;}
 return{precision5:precision,precision5Lower:rel/k,precision5Upper:(rel+unknown)/k,recall5:recall,ndcg5:ndcg,judged:known.length,returned:top.length,unjudged:unknown,completeJudgments:complete};
}
export function brier(events){return mean(events.map(e=>(e.p-e.y)**2));}
export function logloss(events){return mean(events.map(e=>{const p=Math.max(1e-15,Math.min(1-1e-15,e.p));return-e.y*Math.log(p)-(1-e.y)*Math.log(1-p);}));}
export function commonPool(cs,p){const {media,dp}=T.momentos(p,cfg),confidence=Math.min(1,p.n/policy.tri.minEvidencias)*Math.min(1,policy.tri.dpReferencia/dp),max=Math.max(0,...cs.map(c=>c.escoreSemantico));return cs.filter(c=>c.tri&&c.estado==='inedita'&&c.escoreSemantico/max>=policy.relevancia.piso&&(!confidence||Math.abs(c.tri.b-(media+policy.tri.centroRelativoB))<=policy.tri.margens.at(-1)));}
export function baseline(cs,p,kind,seed=42){const pool=commonPool(cs,p),mom=T.momentos(p,cfg),random=rng(seed);const list=pool.map(c=>({...c,key:kind==='aleatorio'?random():kind==='semantico'?-c.posicaoSemantica:Math.exp(-((c.tri.b-mom.media-policy.tri.centroRelativoB)**2)/(2*(1+mom.dp**2)))}));list.sort((a,b)=>b.key-a.key||a.posicaoSemantica-b.posicaoSemantica);return list.slice(0,5);}
