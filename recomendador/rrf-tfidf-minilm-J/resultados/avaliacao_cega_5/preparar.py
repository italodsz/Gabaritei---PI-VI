"""Prepara a avaliação cega 5: rrf_qwen (oficial) × arvore (candidato), top 3 de cada, galeria = treino.
Rodar desta pasta: python preparar.py && node ficha.js"""
import json, random, sys, collections, hashlib, re, glob
from pathlib import Path
REC = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REC)); import recomendador as R
ix = R.Indice(); rows = ix.rows
SEED = 'gabaritei-avaliacao-cega-5-arvore-2026-11-10'
# Referências: teste elegível, fora de tudo o que já aparece em resultados/ e nos pares de desenvolvimento
# (referências e sugestões de avaliações anteriores) e fora das famílias delas; só questões classificadas.
txt = ''.join(open(f, encoding='utf-8', errors='ignore').read() for f in glob.glob(str(REC / 'resultados/**/*'), recursive=True)
              if f.endswith(('.json', '.md', '.py', '.jsonl')) and 'avaliacao_cega_5' not in f)
txt += (REC / 'base/pares_desenvolvimento_compativeis.jsonl').read_text(encoding='utf-8')
usados = set(re.findall(r'gq_[0-9a-f]{24}', txt))
fam = {rows[i]['content_family_id'] for i in usados if i in rows}
teste = json.loads((REC / 'base/ids_elegiveis.json').read_text())['test']
livres = [i for i in teste if i not in usados and rows[i]['content_family_id'] not in fam and ix.rot[i]['no']]
h = lambda i: hashlib.sha256((SEED + i).encode()).hexdigest()
refs = []
for area, n in (('MT', 1), ('CN', 3), ('CH', 3), ('LC', 1)):
    refs += sorted([i for i in livres if rows[i]['area'] == area], key=h)[:n]
rng = random.Random(SEED); blocos = []; chave = []
for bi, qid in enumerate(refs, 1):
    a = [i for i, _ in ix.ranking(qid, 'rrf_qwen')[:3]]; b = [i for i, _ in ix.ranking(qid, 'arvore')[:3]]
    pool = list(dict.fromkeys(a + b)); rng.shuffle(pool)
    blocos.append({'bloco': bi, 'referencia': qid, 'sugestoes': pool})
    for k, i in enumerate(pool, 1):
        chave.append({'item': f'S{bi}{k}', 'referencia': qid, 'candidata': i,
                      'A_oficial_rrf_qwen': a.index(i) + 1 if i in a else None,
                      'B_arvore': b.index(i) + 1 if i in b else None,
                      'mesmo_assunto': ix.rot[i]['no'] == ix.rot[qid]['no']})
proto = {'protocolo': 'avaliacao_cega_5_arvore', 'data': '2026-11-10',
 'base_sha256': ix.conf['base_sha256'], 'vetores_qwen_sha256': R.QWEN_SHA256,
 'rotulos_sha256': hashlib.sha256((REC / 'classificador/dados/classificacao_manual.jsonl').read_bytes()).hexdigest(),
 'semente': SEED,
 'metodos': {'A': 'oficial: rrf_qwen (RRF k=60 de TF-IDF + Qwen3-Embedding-8B 4 bits), top 3',
             'B': 'candidato: arvore (mesmo assunto primeiro; depois RRF de TF-IDF, Qwen e ordem da árvore v1.2; sem defeitos nem duplicatas), top 3'},
 'galeria': 'treino elegível da mesma área, sem a família da referência',
 'selecao': 'teste elegível, excluindo toda questão citada em resultados/ ou nos pares de desenvolvimento e as famílias delas; 1 MT, 3 CN, 3 CH, 1 LC, ordenadas por sha256(semente+id)',
 'pares': len(chave),
 'avaliacao': 'cada sugestão é avaliada uma vez; a nota vale para todo método que a sugeriu; Pendente não entra na conta',
 'criterios_definidos_antes': {
   'limiares': ['nota 2 >= 50% das sugestões do método', 'nota 1 ou 2 >= 75%', 'nenhum bloco com duas ou mais notas 0'],
   'decisao': ['1. B vira oficial se a média dele superar a de A em 0,10 ou mais; abaixo disso, fica A (não depende de rótulos).',
               '2. Se B virar oficial e cumprir os três limiares, é aprovado sem ressalvas; se não, é adotado com a limitação registrada por área.'],
   'leitura_por_area': 'CN e CH (6 referências) mostram se a árvore corrige a falha de conceito; MT e LC (2) verificam que não piora'},
 'avaliador_requerido': 'pessoa, sem consultar IA nem avaliações anteriores; preferencialmente Teles; guardar a ficha preenchida com nome e data',
 'referencias': refs}
json.dump(proto, open('protocolo.json', 'w'), ensure_ascii=False, indent=1)
json.dump(chave, open('chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('chave_sha256.txt', 'w').write(hashlib.sha256(open('chave_NAO_ABRIR.json', 'rb').read()).hexdigest() + '\n')
def q(i):
    r = rows[i]; return {'id': i, 'area': r['area'], 'ano': r['year'], 'texto': r['question'] or '',
        'opcoes': [[o['label'], o.get('text') or ''] for o in sorted(r['options'], key=lambda o: o['label'])], 'gabarito': r['answer']}
json.dump([{'bloco': x['bloco'], 'ref': q(x['referencia']), 'sug': [q(i) for i in x['sugestoes']]} for x in blocos],
          open('conteudo.json', 'w'), ensure_ascii=False)
cnt = collections.Counter(('A' if x['A_oficial_rrf_qwen'] else '') + ('B' if x['B_arvore'] else '') for x in chave)
print('sugestões', len(chave), [len(x['sugestoes']) for x in blocos], dict(cnt))
