"""Avaliação cega 7 (humana): titulo_area (oficial) x rrf_qwen (antigo, mesma área sem filtro de título), top 3 de cada,
nota de 0 a 10. 12 referências (3 por área) nunca citadas em resultados/ nem nos pares de desenvolvimento (nem suas famílias):
primeiro do teste; se faltar, da validação (Natureza só tem livres na validação). Rodar: python preparar.py && node ficha.js"""
import json, random, sys, hashlib, re, glob
from pathlib import Path
REC = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REC)); import recomendador as R
ix = R.Indice(); rows = ix.rows; rot = ix.rot
SEED = 'gabaritei-avaliacao-cega-7-titulo_area-x-rrf_qwen-2026-11-11'
txt = ''.join(open(f, encoding='utf-8', errors='ignore').read() for f in glob.glob(str(REC / 'resultados/**/*'), recursive=True)
              if f.endswith(('.json', '.md', '.py', '.jsonl', '.txt')) and 'avaliacao_cega_7' not in f)
txt += (REC / 'base/pares_desenvolvimento_compativeis.jsonl').read_text(encoding='utf-8')
usados = set(re.findall(r'gq_[0-9a-f]{24}', txt)); fam = {rows[i]['content_family_id'] for i in usados if i in rows}
el = json.loads((REC / 'base/ids_elegiveis.json').read_text())
ok = lambda i: i not in usados and rows[i]['content_family_id'] not in fam and rot[i]['no'] and not rot[i]['duplicata'] and not rot[i]['defeito']
h = lambda i: hashlib.sha256((SEED + i).encode()).hexdigest()
refs, origem = [], {}
for area in ('MT', 'CN', 'CH', 'LC'):
    esc = []
    for distinta in ('materia', 'titulo'):
        for sp in ('test', 'validation'):
            cand = sorted([i for i in el[sp] if rows[i]['area'] == area and ok(i)], key=h)
            for i in cand:
                if len(esc) < 3 and i not in esc and rot[i][distinta] not in {rot[j][distinta] for j in esc} and ix.ranking(i, 'titulo_area', 'todas')[:3]:
                    esc.append(i); origem[i] = sp
    refs += esc
rng = random.Random(SEED); blocos, chave = [], []
for bi, q in enumerate(refs, 1):
    a = [i for i, _ in ix.ranking(q, 'titulo_area', galeria='todas')[:3]]
    b = [i for i, _ in ix.ranking(q, 'rrf_qwen', galeria='todas')[:3]]
    pool = list(dict.fromkeys(a + b)); rng.shuffle(pool)
    blocos.append({'bloco': bi, 'referencia': q, 'sugestoes': pool})
    for k, i in enumerate(pool, 1):
        chave.append({'item': f'S{bi}.{k}', 'bloco': bi, 'area': rows[q]['area'], 'referencia': q, 'candidata': i,
                      'materia': rot[q]['materia'], 'titulo': rot[q]['titulo'],
                      'titulo_area': a.index(i) + 1 if i in a else None, 'rrf_qwen': b.index(i) + 1 if i in b else None,
                      'mesmo_titulo': (rot[i].get('materia'), rot[i].get('titulo')) == (rot[q]['materia'], rot[q]['titulo'])})
proto = {'protocolo': 'avaliacao_cega_7_titulo_area_x_rrf_qwen', 'data': '2026-11-11', 'base_sha256': ix.conf['base_sha256'], 'semente': SEED,
 'metodos': {'titulo_area': 'oficial desde 11/11: mesma matéria e título, ordem por matéria (busca_por_area_v1.json)',
             'rrf_qwen': 'oficial de 06/11 a 11/11: mesma área, sem filtro de título, RRF TF-IDF + Qwen'},
 'galeria': 'base elegível inteira', 'pares': len(chave),
 'selecao': 'nunca citadas em resultados/ nem nos pares de desenvolvimento (nem a família); teste primeiro, validação se faltar; 3 por área, matérias distintas na área quando possível (senão títulos distintos), ordem por sha256(semente+id)',
 'origem_referencias': origem,
 'exibicao': 'o título aparece só na referência (nas sugestões entregaria o método); ordem das sugestões aleatória',
 'escala': 'nota de 0 a 10: quão boa é a sugestão como próxima questão de estudo para quem acabou de fazer a referência',
 'criterios_definidos_antes': {
   'aprovacao_de_cada_metodo': ['média >= 5,0', 'em pelo menos 8 dos 12 blocos, alguma das 3 sugestões com nota >= 7', 'no máximo 20% das sugestões com nota <= 2'],
   'decisao': 'titulo_area segue oficial se a média dele não for menor que a do rrf_qwen; se rrf_qwen superar por 0,5 ou mais, a troca de 11/11 é revista',
   'comparacao_com_IA': 'depois das notas, comparar com as notas da IA nos pares em comum (correlação e diferença média)'},
 'avaliador_requerido': 'Ítalo (ou Teles), sem consultar IA nem a chave', 'referencias': refs}
json.dump(proto, open('protocolo.json', 'w'), ensure_ascii=False, indent=1)
json.dump(chave, open('chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('chave_sha256.txt', 'w').write(hashlib.sha256(open('chave_NAO_ABRIR.json', 'rb').read()).hexdigest() + '\n')
def q_(i):
    r = rows[i]; return {'id': i, 'area': r['area'], 'ano': r['year'], 'texto': r['question'] or '',
        'opcoes': [[o['label'], o.get('text') or ''] for o in sorted(r['options'], key=lambda o: o['label'])], 'gabarito': r['answer']}
json.dump([{'bloco': x['bloco'], 'titulo': f"{rot[x['referencia']]['materia']} › {rot[x['referencia']]['titulo']}", 'ref': q_(x['referencia']),
            'sug': [q_(i) for i in x['sugestoes']]} for x in blocos], open('conteudo.json', 'w'), ensure_ascii=False)
print('refs', len(refs), origem.values().__repr__(), 'sugestões', len(chave), [len(x['sugestoes']) for x in blocos])
print([f"{rows[q]['area']} {rot[q]['materia']} › {rot[q]['titulo']}" for q in refs])
