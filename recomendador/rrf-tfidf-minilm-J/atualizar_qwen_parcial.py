"""Recalcula os vetores Qwen só das questões listadas em indice/config.json → qwen_vetores_desatualizados.
Rode no computador que gerou os vetores Qwen (mesmo modelo e instrução de gerar_vetores_qwen.py):
    python atualizar_qwen_parcial.py
Depois atualize QWEN_SHA256 em recomendador.py com o hash impresso no final."""
import json, hashlib
from pathlib import Path
import numpy as np
import pipeline_baseline as bl, recomendador as rc
from gerar_vetores_qwen import INSTRUCOES
R = Path(__file__).parent; IDX = R / 'indice'
conf = json.loads((IDX / 'config.json').read_text())
alvo = conf.get('qwen_vetores_desatualizados', [])
ids = json.loads((IDX / 'qwen' / 'ids.json').read_text()); pos = {i: k for k, i in enumerate(ids)}
rows, _ = rc.carregar()
cfgq = json.loads((IDX / 'qwen' / 'Qwen3-Embedding-8B-4bit__config.json').read_text())
from sentence_transformers import SentenceTransformer
m = SentenceTransformer(cfgq.get('modelo', 'Qwen/Qwen3-Embedding-8B'))
f = IDX / 'qwen' / rc.QWEN_ARQUIVO; Q = np.load(f)
txt = [INSTRUCOES['conceito'] + bl.question_text(rows[i]) for i in alvo]
V = m.encode(txt, normalize_embeddings=True, batch_size=4)
for i, v in zip(alvo, V): Q[pos[i]] = v.astype(Q.dtype)
np.save(f, Q); conf['qwen_vetores_desatualizados'] = []; (IDX / 'config.json').write_text(json.dumps(conf, ensure_ascii=False, indent=2))
print('atualizados', len(alvo), '| novo sha256:', hashlib.sha256(f.read_bytes()).hexdigest())
