// Estado de apresentação/contagem visual. O servidor decide o tempo e a elegibilidade.
import { usuarioAtual } from './conta.js';
const recomendacoes=new Map();
export const associarRecomendacao=(sessao,id)=>{if(id)recomendacoes.set(sessao,id);};
const entries=new Map();let queue=Promise.resolve();
const key=(id,sessao,origem)=>`${usuarioAtual()?.id||'exercicio'}:${origem}:${sessao}:${id}`;
async function request(url,body){
  const r=await fetch(url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.error||'Não foi possível registrar a tentativa.'),{status:r.status,data});return data;
}
export function estadoTentativa(id,sessao,origem='pratica'){
 const e=entries.get(key(id,sessao,origem));
 if(!e?.data)return {pronta:false,restanteMs:8000,erro:e?.erro};
 const restanteMs=Math.max(0,e.data.restanteMs-(performance.now()-e.recebida));
 return {pronta:!e.erro,restanteMs,tentativaId:e.data.tentativaId,enviando:!!e.inflight};
}
export function prepararTentativa(id,sessao,origem='pratica'){
 const k=key(id,sessao,origem);if(entries.get(k)?.promise)return entries.get(k).promise;
 const e={};entries.set(k,e);
 // Serializa a primeira emissão para que chamadas paralelas compartilhem o cookie de exercício.
 const rec=origem==='pratica'&&recomendacoes.get(sessao);
 const promise=queue.then(()=>rec?request(`/api/unificado/recomendacoes/${encodeURIComponent(rec)}/exposicoes`,{questaoId:id,sessaoId:sessao}):request(`/api/questoes/${encodeURIComponent(id)}/tentativas`,{sessaoId:sessao,origem}));
 queue=promise.catch(()=>{});
 e.promise=promise.then(data=>{e.data=data;e.recebida=performance.now();return data;}).catch(error=>{e.erro=error.message;e.promise=null;throw error;});
 return e.promise;
}
export function observacaoTentativa(id,sessao,origem='pratica'){
 const e=entries.get(key(id,sessao,origem));if(!e?.data)return {};
 return {tentativaId:e.data.tentativaId,tempoMs:Math.floor(Math.max(0,e.data.minimoMs-e.data.restanteMs)+performance.now()-e.recebida)};
}
export async function registrarApoio(id,sessao){await prepararTentativa(id,sessao);const t=observacaoTentativa(id,sessao);return request(`/api/tentativas/${t.tentativaId}/apoio`,{});}
export async function responderTentativa(id,sessao,selected,extra={}){
 await prepararTentativa(id,sessao);
 const e=entries.get(key(id,sessao,'pratica')),state=estadoTentativa(id,sessao);
 if(e.inflight)return e.inflight;
 if(state.restanteMs>0)throw new Error('Aguarde o tempo mínimo antes de confirmar.');
 if(e.payload&&e.payload.selected!==selected)throw new Error('Reenvie a alternativa da tentativa pendente antes de alterá-la.');
 e.payload ||= {selected,...extra,...observacaoTentativa(id,sessao)};
 e.inflight=request(`/api/questoes/${encodeURIComponent(id)}/responder`,e.payload);
 try{return await e.inflight;}
 catch(error){
  if(error.status===425){e.payload=null;e.data.restanteMs=error.data.restanteMs||1000;e.recebida=performance.now();}
  if(error.status===410){entries.delete(key(id,sessao,'pratica'));}
  throw error;
 }finally{e.inflight=null;}
}
