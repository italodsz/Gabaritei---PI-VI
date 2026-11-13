import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { carregarAcervo, PROJECT_ROOT } from './acervo.mjs';
import { criarServidor } from './server.mjs';
import { pythonDoLaboratorio } from './dev-worker.mjs';

const python=spawnSync(pythonDoLaboratorio(),['-X','utf8',resolve(PROJECT_ROOT,'backend/test_recomendador_debug.py')],{cwd:PROJECT_ROOT,stdio:'inherit',windowsHide:true,env:{...process.env,PYTHONUTF8:'1',OMP_NUM_THREADS:'2',OPENBLAS_NUM_THREADS:'2'}});
if(python.error)throw python.error;
if(python.status!==0)process.exit(python.status||1);
const server=criarServidor(await carregarAcervo()).listen(0,'127.0.0.1');
await once(server,'listening');
try{
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/dev/diagnostico`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questionId:'gq_29ef25a472475b50d03207ab',limit:3})});
  const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));
  assert.equal(result.results[0].id,'gq_d0b90b1244b012b1d99bd09a');assert.equal(result.results[0].score,1/61);
  assert.equal(result.results.length,3);console.log('PASS: API HTTP → worker Python → índices reais → decomposição do escore.');
}finally{await new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();});}
