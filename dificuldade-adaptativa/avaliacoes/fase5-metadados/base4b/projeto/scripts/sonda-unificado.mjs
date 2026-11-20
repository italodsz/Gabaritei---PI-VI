// Evidências técnicas com dados ENEM reais e perfis/respostas sintéticos identificados.
import {writeFileSync,readFileSync} from 'node:fs';
import {once} from 'node:events';
import {carregarAcervo} from '../backend/acervo.mjs';
import {abrirBanco} from '../backend/db.mjs';
import {criarServidor} from '../backend/server.mjs';
import {ordenarUnificado} from '../backend/unificado.mjs';
import * as T from '../frontend/dificuldade.js';
const acervo=await carregarAcervo(),cfg=JSON.parse(readFileSync(new URL('../backend/config/dificuldade_v1.json',import.meta.url)));
const artifact=JSON.parse(readFileSync(new URL('../backend/artefatos/escores_titulo_area.json',import.meta.url)));
const db=abrirBanco(':memory:'),server=criarServidor(acervo,{db}).listen(0,'127.0.0.1');await once(server,'listening');let cookie='';
async function call(path,body){const r=await fetch(`http://127.0.0.1:${server.address().port}`+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});for(const h of r.headers.getSetCookie())cookie=h.split(';')[0];const data=await r.json();if(!r.ok)throw new Error(JSON.stringify(data));return data;}
try{
 const op=await call('/api/unificado/opcoes'),perArea=[];
 for(const area of T.AREAS){const topic=op.assuntos.filter(t=>t.area===area).sort((a,b)=>b.referencias-a.referencias)[0];perArea.push(await call('/api/unificado/recomendacoes',{area,topicId:topic.id,preferencia:'adaptativa'}));}
 const r=perArea.find(r=>r.area==='MT'),cs=artifact.scores[r.questaoRef].flatMap(([id,s],k)=>{const q=acervo.byId.get(id);return q?.tri?[{id,familia:q.familyId,tri:q.tri,dificuldade:q.difficulty,estado:'inedita',escoreSemantico:s,posicaoSemantica:k+1}]:[];});
 const synthetic=[-1.5,0,1.5].map(mu=>{const p={...T.perfilInicial('MT',cfg),n:80,lw:Array.from(T.grade(cfg),v=>-.5*((v-mu)/.2)**2)};return {fixture:'distribuição artificial para testar comportamento; não é estudante',thetaConfigurado:mu,resultado:ordenarUnificado(cs,p,cfg)};});
 const shortage=[];for(const topic of op.assuntos.filter(t=>t.referencias<5).slice(0,3))shortage.push(await call('/api/unificado/recomendacoes',{area:topic.area,topicId:topic.id,preferencia:'adaptativa'}));
 const result={natureza:'teste técnico, não avaliação pedagógica ou estatística',dataset:acervo.info,assuntosComTri:op.assuntos.length,perArea,synthetic,shortage};
 if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(result,null,2));
 console.log(JSON.stringify({areas:perArea.map(r=>({area:r.area,n:r.itens.length,ref:r.questaoRef})),perfis:synthetic.map(r=>({mu:r.thetaConfigurado,top:r.resultado.itens.map(c=>({id:c.id,b:c.tri.b}))})),escassez:shortage.map(r=>({titulo:r.titulo,n:r.itens.length}))},null,2));
}finally{await new Promise(r=>{server.close(r);server.closeIdleConnections();});}
