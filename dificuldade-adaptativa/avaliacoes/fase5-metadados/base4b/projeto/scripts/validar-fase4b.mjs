import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(process.argv[2]||'../evidencias-reexecucao-4b');mkdirSync(out,{recursive:true});const runs=[];
function run(name,args){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true});writeFileSync(join(out,name+'.log'),(r.stdout||'')+(r.stderr||'')+(r.error?String(r.error):''));runs.push({name,args,exitCode:r.status??-1});}
run('testes',['--test','--test-reporter=tap',...readdirSync(join(root,'backend')).filter(n=>n.endsWith('.test.mjs')).map(n=>'backend/'+n),'frontend/learning-checks.mjs']);
run('sonda4a',['scripts/sonda-integridade.mjs',join(out,'sonda4a.json')]);
run('sonda4b',['scripts/sonda-unificado.mjs',join(out,'sonda4b.json')]);
if(process.argv.includes('--semantic'))run('worker-semantico',['backend/check-dev-model.mjs']);
if(process.argv.includes('--ui')){run('ui4a',['scripts/test-ui-integridade.mjs',join(out,'ui4a')]);run('ui4b',['scripts/test-ui-4b.mjs',join(out,'ui4b')]);}
const expected={'Dataset/base_trabalho/data/questions.jsonl':'6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f','recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json':'c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb','backend/artefatos/escores_titulo_area.json':'5e5020339d05ef4786736b2f1bda74ac51bb33401b3ea495fdd5c20c0d01ae77'};
const hashes=Object.entries(expected).map(([path,expected])=>{const actual=createHash('sha256').update(readFileSync(join(root,path))).digest('hex');return {path,expected,actual,ok:actual===expected};});
const result={node:process.version,date:new Date().toISOString(),runs,hashes,passed:runs.every(r=>r.exitCode===0)&&hashes.every(h=>h.ok)};writeFileSync(join(out,'execucao.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
