from pathlib import Path
import shutil, hashlib, json
ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent/'auditoria_global_20261112/snapshots/recomendador/recomendador/rrf-tfidf-minilm-J'
FILES = ['resultados/avaliacao_cega_v1.json', 'resultados/avaliacao_cega_4/resultado.json', 'resultados/avaliacao_cega_4/protocolo.json', 'resultados/avaliacao_cega_6/resultado.json', 'resultados/avaliacao_cega_6/protocolo.json', 'resultados/avaliacao_cega_7/notas_humanas.csv', 'resultados/avaliacao_cega_7/protocolo.json', 'resultados/avaliacao_cega_7/RELATORIO_concordancia.md', 'resultados/avaliacao_cega_7/conteudo.json', 'resultados/avaliacao_ia_50/chave_com_notas.json', 'catalogo/recomendacoes_titulo_area.json', 'catalogo/recomendacoes_rrf_qwen.json']
manifest = []
for name in FILES:
    dst = ROOT/'fontes'/name
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC/name, dst)
    manifest.append({'arquivo': name, 'sha256': hashlib.sha256(dst.read_bytes()).hexdigest(), 'url': 'https://github.com/italodsz/Gabaritei---PI-VI/blob/a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef/recomendador/rrf-tfidf-minilm-J/'+name})
(ROOT/'manifesto_fontes.json').write_text(json.dumps({'branch':'recomendador','commit':'a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef','arquivos':manifest}, ensure_ascii=False, indent=2),encoding='utf-8')
print('Fontes copiadas sem alterar originais:', len(manifest))
