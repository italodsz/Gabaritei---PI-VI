// Somente fixture isolada: relógio injetado pelo teste, HTTP loopback e SQLite em memória.
import {writeFileSync} from 'node:fs';
import {once} from 'node:events';
import {carregarAcervo} from '../backend/acervo.mjs';
import {abrirBanco} from '../backend/db.mjs';
import {criarServidor} from '../backend/server.mjs';
const acervo=await carregarAcervo();let now=1800000000000;
const token='fixture-only-development-token-12345',db=abrirBanco(':memory:');
const server=criarServidor(acervo,{db,relogio:()=>now,devLocal:{enabled:true,token}}).listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;let cookie='';
async function call(method,path,body,dev=false){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie,...(dev?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 for(const raw of r.headers.getSetCookie()){const c=raw.split(';')[0],name=c.split('=')[0];cookie=cookie.split('; ').filter(x=>!x.startsWith(name+'=')).concat(c).filter(Boolean).join('; ');}
 return {status:r.status,data:await r.json()};
}
try{
 const q=acervo.questions.find(q=>q.sourceArea==='MT'&&q.tri),result={fixture:'respostas sintéticas, não mede aprendizagem',base:acervo.info.sha256};
 async function issue(session){return (await call('POST',`/api/questoes/${q.id}/tentativas`,{sessaoId:session})).data.tentativaId;}
 const id=await issue('primeira');const send=(tempoMs=8000)=>call('POST',`/api/questoes/${q.id}/responder`,{selected:q.correct,tentativaId:id,tempoMs});
 now+=3000;result.aos3=(await send(3000)).status;now+=4000;result.aos7=(await send(7000)).status;now+=1000;const first=await send();result.aos8=first.status;
 result.retryIdempotente=JSON.stringify(first.data)===JSON.stringify((await send()).data);
 const initial=first.data.tri.perfil;
 for(let i=0;i<18;i++){const attempt=await issue('revisao-'+i);now+=8000;const r=await call('POST',`/api/questoes/${q.id}/responder`,{selected:q.correct,tentativaId:attempt,tempoMs:8000});if(r.status!==200)throw new Error(JSON.stringify(r));}
 const v=(await call('GET','/api/eu/perfil-tri')).data;
 result.repeticoes={eventos:db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,n:v.perfis.MT.n,janela:v.perfis.MT.respostas.length,pstar:v.perfis.MT.pstar,perfilIdentico:JSON.stringify(initial)===JSON.stringify(v.perfis.MT)};
 result.calibracao=(await call('GET','/api/dev/dificuldade',undefined,true)).data;
 const imported=await call('PUT','/api/eu/perfil-tri',{perfis:{CH:{lw:[0],n:15}}});result.importacao={status:imported.status,n:imported.data.perfis.CH.n,promovido:imported.data.importacao.promovido};
 const s=db.prepare('SELECT sujeito FROM evento_integridade LIMIT 1').get().sujeito;
 result.historiaVerificavel={sujeitoTipo:s.split(':')[0],total:db.prepare('SELECT COUNT(*) n FROM evento_integridade WHERE sujeito=?').get(s).n};
 const output=JSON.stringify(result,null,2);if(process.argv[2])writeFileSync(process.argv[2],output);console.log(output);
}finally{await new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();});}
