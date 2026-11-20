// Verifica a entrega sem alterar o dataset, treinar ou operar Git.
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(process.argv[2]||'../evidencias-reexecucao');mkdirSync(out,{recursive:true});
const runs=[];
function run(name,args){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true});writeFileSync(join(out,name+'.log'),(r.stdout||'')+(r.stderr||'')+(r.error?String(r.error):''));runs.push({name,args,exitCode:r.status??-1});}
const files=readdirSync(join(root,'backend')).filter(f=>f.endsWith('.test.mjs')).map(f=>'backend/'+f);
run('testes_finais',['--test','--test-reporter=tap',...files,'frontend/learning-checks.mjs']);
run('sonda',['scripts/sonda-integridade.mjs',join(out,'sonda.json')]);
if(process.argv.includes('--semantic'))run('semantico',['backend/check-dev-model.mjs']);
if(process.argv.includes('--ui'))run('ui',['scripts/test-ui-integridade.mjs',join(out,'ui')]);
const expected={'Dataset/base_trabalho/data/questions.jsonl':'6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f','recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json':'c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb'};
const hashes=Object.entries(expected).map(([path,sha256])=>{const actual=createHash('sha256').update(readFileSync(join(root,path))).digest('hex');return {path,expected:sha256,actual,ok:actual===sha256};});
const result={date:new Date().toISOString(),node:process.version,runs,hashes,passed:runs.every(r=>r.exitCode===0)&&hashes.every(h=>h.ok)};writeFileSync(join(out,'execucao.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
