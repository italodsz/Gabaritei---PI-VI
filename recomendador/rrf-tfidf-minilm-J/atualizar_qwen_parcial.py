"""Recalcula os vetores Qwen só das questões listadas em indice/config.json → qwen_vetores_desatualizados.
Usa exatamente a mesma configuração de gerar_vetores_qwen.py --quantizar-4bit (Qwen3-Embedding-8B em 4 bits NF4,
instrução 'conceito', max 8192 tokens). Precisa de placa NVIDIA.

Uso (na pasta recomendador/rrf-tfidf-minilm-J):
    python atualizar_qwen_parcial.py
No fim ele imprime o novo sha256 e já atualiza QWEN_SHA256 em recomendador.py."""
import json, hashlib, re
from pathlib import Path
import numpy as np
import pipeline_baseline as bl
from gerar_vetores_qwen import INSTRUCOES

R = Path(__file__).resolve().parent; IDX = R / 'indice'; QD = IDX / 'qwen'
ARQ = QD / 'Qwen3-Embedding-8B-4bit__conceito.npy'


def main():
    import torch
    from sentence_transformers import SentenceTransformer
    from transformers import BitsAndBytesConfig
    if not torch.cuda.is_available():
        raise SystemExit('Precisa de placa NVIDIA (CUDA), igual à geração original.')
    conf = json.loads((IDX / 'config.json').read_text(encoding='utf-8'))
    alvo = conf.get('qwen_vetores_desatualizados', [])
    if not alvo:
        raise SystemExit('Nada a atualizar: a lista qwen_vetores_desatualizados está vazia.')
    ids = json.loads((QD / 'ids.json').read_text(encoding='utf-8')); pos = {i: k for k, i in enumerate(ids)}
    rows = {q['id']: q for q in map(json.loads, (R / 'base' / 'questions.jsonl').open(encoding='utf-8'))}
    print(f'{len(alvo)} questões a atualizar; carregando o modelo em 4 bits…', flush=True)
    mk = {'quantization_config': BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
                                                    bnb_4bit_compute_dtype=torch.float16,
                                                    bnb_4bit_use_double_quant=True),
          'device_map': {'': 0}}
    model = SentenceTransformer('Qwen/Qwen3-Embedding-8B', model_kwargs=mk, tokenizer_kwargs={'padding_side': 'left'})
    model.max_seq_length = 8192
    textos = [bl.question_text(rows[i]) for i in alvo]
    E = model.encode(textos, prompt=INSTRUCOES['conceito'], batch_size=2, normalize_embeddings=True,
                     show_progress_bar=True, convert_to_numpy=True)
    Q = np.load(ARQ)
    antes = {i: float(Q[pos[i]] @ e) for i, e in zip(alvo, E)}
    for i, e in zip(alvo, E):
        Q[pos[i]] = e.astype(np.float32)
    np.save(ARQ, Q)
    novo = hashlib.sha256(ARQ.read_bytes()).hexdigest()
    p = R / 'recomendador.py'; s = p.read_text(encoding='utf-8')
    p.write_text(re.sub(r"QWEN_SHA256 = '[0-9a-f]+'", f"QWEN_SHA256 = '{novo}'", s), encoding='utf-8')
    conf['qwen_vetores_desatualizados'] = []; conf['qwen_atualizados_parcialmente'] = alvo
    (IDX / 'config.json').write_text(json.dumps(conf, ensure_ascii=False, indent=2), encoding='utf-8')
    print('semelhança vetor antigo × novo (1 = igual):')
    for i, v in antes.items():
        print(f'  {i}  {v:.3f}')
    print(f'\npronto: {len(alvo)} vetores atualizados | novo sha256: {novo}')
    print('Agora rode: python recomendador.py exportar   e depois faça commit e push.')


if __name__ == '__main__':
    main()
