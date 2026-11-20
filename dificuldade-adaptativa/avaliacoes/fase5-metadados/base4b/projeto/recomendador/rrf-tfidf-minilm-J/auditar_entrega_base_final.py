"""Valida o catálogo e os índices e produz a comparação descritiva da validação."""
import collections
import hashlib
import json
import random
from pathlib import Path
import joblib
import numpy as np
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
import pipeline_baseline as bl
import recomendador as rc

R=Path(__file__).resolve().parent
OUT=R/'resultados/base_final'
ANTES=R.parents[2]/'Gabaritei-base-final-antes/recomendador/rrf-tfidf-minilm-J'

def main():
    ix=rc.Indice(); rows,el=rc.carregar(); ids=sum(el.values(),[])
    assert [d['id'] for d in ix.docs]==ids
    assert len(ids)==len(set(ids))==2731
    assert all(d['split']==rows[d['id']]['split'] for d in ix.docs)
    assert ix.M.shape==(2731,384) and ix.Q.shape==(2731,4096)
    normas={}
    # O encode normaliza em baixa precisão antes de converter para float32.
    # Qwen anterior: [0.9964104, 1.0038823]; renormalizar mudaria a receita congelada.
    for nome,matrix,tolerancia in [('minilm',ix.M,2e-5),('qwen',ix.Q,0.005)]:
        n=np.linalg.norm(matrix,axis=1)
        assert np.isfinite(matrix).all() and np.allclose(n,1,atol=tolerancia,rtol=0)
        normas[nome]={'minimo':float(n.min()),'maximo':float(n.max()),'tolerancia_absoluta':tolerancia}
    texts=[bl.question_text(rows[i]) for i in ids]
    cfg=json.loads((R/'base/config_baseline.json').read_text(encoding='utf-8'))
    p=dict(cfg['tfidf']); p['ngram_range']=tuple(p['ngram_range'])
    fitted=TfidfVectorizer(**p,norm='l2',dtype=np.float32).fit(texts[:len(el['train'])])
    tf=joblib.load(R/'indice/tfidf.joblib')
    assert fitted.vocabulary_==tf.vocabulary_ and np.array_equal(fitted.idf_,tf.idf_)
    assert (tf.transform(texts)!=ix.X).nnz==0
    qm=json.loads((R/'indice/qwen/Qwen3-Embedding-8B-4bit__config.json').read_text(encoding='utf-8'))
    assert qm['quantizado_4bit'] is True and qm['max_tokens']==8192
    assert qm['base_sha256']==ix.conf['base_sha256']
    cat=json.loads((R/'catalogo/recomendacoes_titulo_area.json').read_text(encoding='utf-8'))
    assert set(cat['questoes'])==set(cat['recomendacoes'])==set(ids)
    empty=[]; sizes=[]
    for qid,recs in cat['recomendacoes'].items():
        sizes.append(len(recs)); assert len(recs)<=50 and len(recs)==len(set(recs))
        if not recs: empty.append({'id':qid,'motivo':'defeito de texto' if ix.rot[qid]['defeito'] else 'duplicata' if ix.rot[qid]['duplicata'] else 'sem candidato compatível no título/língua após filtros','area':rows[qid]['area'],'materia':ix.rot[qid]['materia'],'titulo':ix.rot[qid]['titulo']})
        fam=set()
        for cid in recs:
            assert cid!=qid and rows[cid]['content_family_id']!=rows[qid]['content_family_id']
            assert not ix.rot[cid]['defeito'] and not ix.rot[cid]['duplicata']
            assert (ix.rot[cid]['materia'],ix.rot[cid]['titulo'])==(ix.rot[qid]['materia'],ix.rot[qid]['titulo'])
            assert rows[cid]['area']==rows[qid]['area']
            assert rows[cid]['content_family_id'] not in fam; fam.add(rows[cid]['content_family_id'])
            if rows[qid]['language'] in ('en','es') or rows[cid]['language'] in ('en','es'): assert rows[qid]['language']==rows[cid]['language']
    (OUT/'listas_vazias.json').write_text(json.dumps(empty,ensure_ascii=False,indent=2),encoding='utf-8')
    before=json.loads((ANTES/'catalogo/recomendacoes_titulo_area.json').read_text(encoding='utf-8'))
    oldids=set(before['questoes']); rng=random.Random(20261113)
    chosen=rng.sample(sorted(i for i in el['validation'] if rows[i]['year']==2023),20)
    lines=['# Comparação descritiva — 20 consultas da validação de 2023','', 'Semente: 20261113. Sem notas e sem escolha de configuração. “Resgatada” significa elegível agora e ausente do catálogo anterior. “Sem consulta antes” significa que a questão ainda não era elegível.','', '| Questão | Antes: top 5 | Depois: top 5 | Mudou? | Novas sugestões resgatadas |','|---|---|---|---|---|']
    for i in chosen:
        old=before['recomendacoes'].get(i,[])[:5]; new=cat['recomendacoes'][i][:5]
        rescued=[c for c in new if c not in oldids]
        lines.append(f'| {i} | '+('<br>'.join(old) if i in oldids else 'Sem consulta antes')+' | '+('<br>'.join(new) or 'Lista vazia')+' | '+('sim' if old!=new else 'não')+' | '+('<br>'.join(rescued) or 'nenhuma')+' |')
    (OUT/'comparacao_20_validacao.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    changes=set(json.loads((OUT/'auditoria_base.json').read_text(encoding='utf-8'))['textos_alterados'])
    pairs=[]
    for p in map(json.loads,(R/'base/pares_desenvolvimento_compativeis.jsonl').read_text(encoding='utf-8').splitlines()):
        touched=[{'id':i,'situacao':'fora das elegíveis' if i not in ix.pos else 'texto alterado'} for i in (p['query_id'],p['candidate_id']) if i not in ix.pos or i in changes]
        if touched: pairs.append({'query_id':p['query_id'],'candidate_id':p['candidate_id'],'alteracoes':touched})
    (OUT/'pares_desenvolvimento_afetados.json').write_text(json.dumps(pairs,ensure_ascii=False,indent=2),encoding='utf-8')
    summary={'questoes':len(ids),'elegiveis':{s:len(v) for s,v in el.items()},'listas_vazias':len(empty),'motivos_vazias':dict(collections.Counter(q['motivo'] for q in empty)),'mediana_tamanho':float(np.median(sizes)),'minimo_nao_vazio':min(n for n in sizes if n),'sem_rotulo':sum(i not in ix.rot for i in ids),'defeitos':sum(ix.rot[i]['defeito'] for i in ids),'duplicatas':sum(ix.rot[i]['duplicata'] for i in ids),'tfidf_fit_so_treino_verificado':True,'ids_vetores_alinhados':True,'qwen_sha256':rc.QWEN_SHA256,'pares_afetados':len(pairs),'semente_comparacao':20261113,'testes_de_configuracao_no_teste':False}
    summary['normas_vetores']=normas
    (OUT/'auditoria_entrega.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
