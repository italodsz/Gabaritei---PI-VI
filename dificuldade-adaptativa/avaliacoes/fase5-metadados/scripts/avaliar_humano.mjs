import {readFileSync,existsSync} from 'node:fs';
import {candidates,cfg,profile,baseline,ordenarUnificado,metricRanking,acervo,save,seedOf} from './comum.mjs';
const path=new URL('../protocolo_humano/julgamentos_adjudicados.jsonl',import.meta.url);
if(!existsSync(path)){save('avaliacao_humana.json',{status:'PENDENTE',reason:'Nenhum julgamento novo recebido. Métricas finais não calculadas.',precision5:null,recall5:null,ndcg5:null});console.log('PENDENTE: avaliação humana não recebida.');}
else{
 const universe=JSON.parse(readFileSync(new URL('../protocolo_humano/universo_congelado.json',import.meta.url),'utf8')),rows=readFileSync(path,'utf8').trim().split(/\r?\n/).map(JSON.parse),byPair=new Map();
 for(const r of rows){if(byPair.has(r.pair_id)||![0,1,2].includes(r.grade)||!r.reviewer_A||!r.reviewer_B||r.reviewer_A===r.reviewer_B||r.reviewer_A_kind!=='human'||r.reviewer_B_kind!=='human'||!r.adjudication_note)throw new Error('Julgamento incompleto ou sem dupla revisão declarada: '+r.pair_id);byPair.set(r.pair_id,r);}
 if(rows.length!==universe.key.length||universe.key.some(p=>!byPair.has(p.pair_id)))throw new Error('Universo de julgamentos incompleto.');
 const results=[];for(const qid of universe.queries){const labels=new Map(universe.key.filter(p=>p.query_id===qid).map(p=>[p.candidate_id,byPair.get(p.pair_id).grade])),cs=candidates(qid),p=profile(acervo.byId.get(qid).sourceArea,'medio');
  for(const kind of ['aleatorio','semantico','tri','unificado'])for(let seed=0;seed<(kind==='aleatorio'?20:1);seed++){const out=kind==='unificado'?ordenarUnificado(cs,p,cfg).itens:baseline(cs,p,kind,seedOf(qid)+seed);results.push({qid,kind,seed,...metricRanking(out.map(x=>x.id),labels,5,true)});}}
 save('avaliacao_humana.json',{status:'julgamentos_declarados_a_conferir',scope:'universo congelado por referência, não catálogo inteiro; identidades/qualificações exigem conferência documental',results});
}
