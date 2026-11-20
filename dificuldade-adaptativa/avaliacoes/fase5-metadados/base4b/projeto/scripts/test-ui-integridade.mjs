// Teste da tela real; fixture de conta/seleção, sem evidência de aprendizagem real.
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {carregarAcervo} from '../backend/acervo.mjs';
import {abrirBanco} from '../backend/db.mjs';
import {criarServidor} from '../backend/server.mjs';
const module=process.env.PLAYWRIGHT_MODULE;
const {chromium}=await import(module?pathToFileURL(resolve(module)).href:'playwright');
const output=resolve(process.argv[2]||'evidencias-ui');mkdirSync(output,{recursive:true});
const db=abrirBanco(':memory:'),server=criarServidor(await carregarAcervo(),{db}).listen(0,'127.0.0.1');await once(server,'listening');
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'})});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__fixture_ui',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Fixture Fase 4A</title>${['styles','practice-screen','question-screen','legacy-ui','dificuldade'].map(s=>`<link rel="stylesheet" href="/${s}.css">`).join('')}<body></body></html>`}));
 await page.goto(`http://127.0.0.1:${server.address().port}/__fixture_ui`);
 await page.evaluate(async()=>{
  const E=await import('/assets/learning-engine.js'),{carregarAcervo}=await import('/acervo-api.js');await carregarAcervo();
  const {createPracticeScreen}=await import('/practice-screen.js');const Dif=await import('/dificuldade-cliente.js');
  const account=E.createEmptyAccount({id:'fixture-ui',kind:'local',name:'Fixture',now:Date.now()});
  await Dif.iniciarDificuldade({account:()=>account});
  const ids=E.questionRepository.all().filter(q=>q.sourceArea==='MT'&&q.tri).slice(0,2).map(q=>q.id);
  const session=E.createPracticeSession({id:'fixture-ui-sessao',title:'Teste real de integridade',questionIds:ids,filters:E.EMPTY_FILTERS,mode:'manual',timerVisible:true,now:Date.now()});
  window.fixture={account,session,ids};
  const screen=createPracticeScreen({E,icons:()=>'',toast:message=>{window.fixture.toast=message;},getAccount:()=>account,save:()=>{},onExit:()=>{},onProgress:()=>{},onNewList:()=>{}});screen.open(session);
 });
 await page.waitForFunction(async()=>{const t=await import('/tentativas.js');return t.estadoTentativa(window.fixture.ids[0],'fixture-ui-sessao').pronta;});
 const start=Date.now(),samples=[];
 await page.locator('.qs-alt').first().click();
 for(const ms of [3000,7000]){
  await new Promise(r=>setTimeout(r,Math.max(0,start+ms-Date.now())));
  const disabled=await page.locator('#qs-confirm').isDisabled();assert.equal(disabled,true);
  samples.push({afterMs:Date.now()-start,disabled,text:await page.locator('#qs-minimum').textContent()});
  // Atalho não pode contornar o bloqueio do botão.
  await page.keyboard.press('Enter');assert.equal(db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,0);
  if(ms===3000)await page.screenshot({path:join(output,'tela_3_segundos.png'),fullPage:true});
 }
 await page.waitForFunction(()=>document.querySelector('#qs-confirm')?.disabled===false,{},{timeout:4000});
 samples.push({afterMs:Date.now()-start,disabled:false,text:await page.locator('#qs-minimum').textContent()});
 assert(samples.at(-1).afterMs>=8000);
 await page.screenshot({path:join(output,'tela_8_segundos.png'),fullPage:true});
 await page.evaluate(()=>{const b=document.querySelector('#qs-confirm');b.click();b.click();});
 await page.waitForSelector('#qs-next');assert.equal(db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,1);
 await page.locator('#qs-next').click();await page.waitForFunction(()=>window.fixture.account.practiceSessions[0].currentIndex===1);
 await page.waitForFunction(async()=>{const t=await import('/tentativas.js');return t.estadoTentativa(window.fixture.ids[1],'fixture-ui-sessao').pronta;});
 await page.locator('#qs-prev').click();await page.waitForSelector('#qs-next');
 assert.equal(db.prepare('SELECT COUNT(*) n FROM tentativa_integridade').get().n,2);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,1);
 assert.deepEqual(errors,[]);
 const result={fixture:'teste técnico da tela real, respostas sintéticas',samples,events:1,attemptsAfterBack:2,duplicateClick:'um evento',browserErrors:errors};
 writeFileSync(join(output,'resultado_ui.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser?.close();await new Promise(r=>{server.close(r);server.closeIdleConnections();});}
