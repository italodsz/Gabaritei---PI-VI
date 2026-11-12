"""Avaliação cega 6: recomendação 100% dentro do título amplo, duas ordens (top 3 de cada), nota de 0 a 10.
A = ordem por semelhança (rrf_qwen); B = mesmo assunto fino primeiro, depois semelhança. Galeria = base elegível inteira.
Rodar desta pasta: python preparar.py && node ficha.js"""
import json, random, sys, collections, hashlib, re, glob
from pathlib import Path
REC = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REC)); import recomendador as R
ix = R.Indice(); rows = ix.rows; rot = ix.rot
SEED = 'gabaritei-avaliacao-cega-6-titulo-2026-11-11'
txt = ''.join(open(f, encoding='utf-8', errors='ignore').read() for f in glob.glob(str(REC / 'resultados/**/*'), recursive=True)
              if f.endswith(('.json', '.md', '.py', '.jsonl')) and 'avaliacao_cega_6' not in f)
txt += (REC / 'base/pares_desenvolvimento_compativeis.jsonl').read_text(encoding='utf-8')
usados = set(re.findall(r'gq_[0-9a-f]{24}', txt))
fam = {rows[i]['content_family_id'] for i in usados if i in rows}
teste = json.loads((REC / 'base/ids_elegiveis.json').read_text())['test']
livres = [i for i in teste if i not in usados and rows[i]['content_family_id'] not in fam and rot[i]['no'] and not rot[i]['duplicata']]
h = lambda i: hashlib.sha256((SEED + i).encode()).hexdigest()
refs = []
for area in ('MT', 'CN', 'CH', 'LC'):
    refs += sorted([i for i in livres if rows[i]['area'] == area], key=h)[:2]
rng = random.Random(SEED); blocos = []; chave = []
for bi, q in enumerate(refs, 1):
    ids = [i for i, _ in ix.ranking(q, 'titulo', galeria='todas')]
    a = ids[:3]
    b = ([i for i in ids if rot[i]['no'] == rot[q]['no']] + [i for i in ids if rot[i]['no'] != rot[q]['no']])[:3]
    pool = list(dict.fromkeys(a + b)); rng.shuffle(pool)
    blocos.append({'bloco': bi, 'referencia': q, 'sugestoes': pool})
    for k, i in enumerate(pool, 1):
        chave.append({'item': f'S{bi}{k}', 'referencia': q, 'candidata': i, 'materia': rot[q]['materia'], 'titulo': rot[q]['titulo'],
                      'A_semelhanca': a.index(i) + 1 if i in a else None, 'B_assunto_primeiro': b.index(i) + 1 if i in b else None,
                      'mesmo_assunto': rot[i]['no'] == rot[q]['no']})
proto = {'protocolo': 'avaliacao_cega_6_titulo', 'data': '2026-11-11', 'base_sha256': ix.conf['base_sha256'],
 'rotulos_sha256': hashlib.sha256((REC / 'classificador/dados/classificacao_manual.jsonl').read_bytes()).hexdigest(),
 'titulos_sha256': hashlib.sha256((REC / 'classificador/dados/titulos_v1.json').read_bytes()).hexdigest(), 'semente': SEED,
 'metodos': {'A': 'titulo: só o mesmo título amplo, ordem por semelhança (rrf_qwen), top 3',
             'B': 'titulo com o mesmo assunto fino primeiro e depois semelhança, top 3'},
 'galeria': 'base elegível inteira (como no app), mesma matéria e título, sem defeitos, duplicatas nem a família da referência',
 'selecao': 'teste elegível, fora de toda questão citada em resultados/ ou nos pares de desenvolvimento e das famílias delas; 2 por área, por sha256(semente+id)',
 'pares': len(chave),
 'escala': 'nota de 0 a 10: quão boa é a sugestão como próxima questão de estudo para quem acabou de fazer a referência',
 'criterios_definidos_antes': {
   'aprovacao': ['média geral do método >= 5,0',
                 'em pelo menos 5 dos 8 blocos, alguma das 3 sugestões com nota >= 7',
                 'no máximo 20% das sugestões com nota <= 2'],
   'decisao': 'B (assunto primeiro) só substitui A se a média de B superar a de A em 0,5 ou mais; senão fica A, que não depende do rótulo fino',
   'observacao': 'critérios propostos pelo Claude a partir da conversa de 10/11; Ítalo pode alterá-los antes de dar a primeira nota'},
 'avaliador_requerido': 'Ítalo, sem consultar IA nem a chave', 'referencias': refs}
json.dump(proto, open('protocolo.json', 'w'), ensure_ascii=False, indent=1)
json.dump(chave, open('chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('chave_sha256.txt', 'w').write(hashlib.sha256(open('chave_NAO_ABRIR.json', 'rb').read()).hexdigest() + '\n')
def q_(i):
    r = rows[i]; return {'id': i, 'area': r['area'], 'ano': r['year'], 'texto': r['question'] or '',
        'opcoes': [[o['label'], o.get('text') or ''] for o in sorted(r['options'], key=lambda o: o['label'])], 'gabarito': r['answer']}
json.dump([{'bloco': x['bloco'], 'titulo': f"{rot[x['referencia']]['materia']} › {rot[x['referencia']]['titulo']}", 'ref': q_(x['referencia']), 'sug': [q_(i) for i in x['sugestoes']]} for x in blocos],
          open('conteudo.json', 'w'), ensure_ascii=False)
print('sugestões', len(chave), [len(x['sugestoes']) for x in blocos], [f"{rot[q]['titulo']}" for q in refs])
