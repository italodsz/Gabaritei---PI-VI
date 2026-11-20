"""Gera vetores Qwen3-Embedding para a base de trabalho do Gabaritei.

Coloque este arquivo dentro de recomendador/rrf-tfidf-minilm-J/ (onde estão base/ e indice/)
e rode:
    pip install -U "sentence-transformers>=3.0" "transformers>=4.51" torch
    python gerar_vetores_qwen.py                      # Qwen3-Embedding-8B, duas variantes
    python gerar_vetores_qwen.py --modelo Qwen/Qwen3-Embedding-4B   # se faltar memória

Gera em indice/qwen/:
    <modelo>__sem_instrucao.npy   texto da questão puro
    <modelo>__conceito.npy        com instrução para focar no conceito e na tarefa
    ids.json                      ordem das linhas (mesma de indice/documentos.json)
"""
import argparse, json, sys, time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import pipeline_baseline as bl

INSTRUCOES = {
    'sem_instrucao': None,
    'conceito': ('Instruct: Dada uma questão do ENEM, represente o conceito central cobrado e a '
                 'operação que o aluno precisa fazer para responder, ignorando o cenário e o tema '
                 'de fundo do texto\nQuery: '),
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default='Qwen/Qwen3-Embedding-8B')
    ap.add_argument('--lote', type=int, default=4, help='diminua se faltar memória de GPU')
    ap.add_argument('--max-tokens', type=int, default=8192)
    ap.add_argument('--quantizar-4bit', action='store_true',
                    help='carrega o modelo em 4 bits (NF4); necessário em placas com menos de 20 GB')
    a = ap.parse_args()

    import torch
    from sentence_transformers import SentenceTransformer
    dev = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
    print(f'dispositivo: {dev}', flush=True)
    mk = {'torch_dtype': torch.float16 if dev != 'cpu' else torch.float32}
    if a.quantizar_4bit:
        if dev != 'cuda':
            raise SystemExit('--quantizar-4bit exige placa NVIDIA (CUDA).')
        from transformers import BitsAndBytesConfig
        mk = {'quantization_config': BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
                                                        bnb_4bit_compute_dtype=torch.float16,
                                                        bnb_4bit_use_double_quant=True),
              'device_map': {'': 0}}
    print(f'modelo: {a.modelo} | 4 bits: {a.quantizar_4bit} | max_tokens: {a.max_tokens}', flush=True)
    model = SentenceTransformer(a.modelo, device=None if a.quantizar_4bit else dev,
                                model_kwargs=mk, tokenizer_kwargs={'padding_side': 'left'})
    model.max_seq_length = a.max_tokens

    docs = json.loads((ROOT / 'indice' / 'documentos.json').read_text())
    rows = {q['id']: q for q in map(json.loads, (ROOT / 'base' / 'questions.jsonl').open(encoding='utf-8'))}
    textos = [bl.question_text(rows[d['id']]) for d in docs]
    ordem = np.argsort([-len(t) for t in textos])          # agrupa textos parecidos no lote

    out = ROOT / 'indice' / 'qwen'; out.mkdir(parents=True, exist_ok=True)
    (out / 'ids.json').write_text(json.dumps([d['id'] for d in docs]), encoding='utf-8')
    nome = a.modelo.split('/')[-1] + ('-4bit' if a.quantizar_4bit else '')
    for var, prompt in INSTRUCOES.items():
        t0 = time.time()
        E = model.encode([textos[i] for i in ordem], prompt=prompt, batch_size=a.lote,
                         normalize_embeddings=True, show_progress_bar=True, convert_to_numpy=True)
        M = np.zeros_like(E); M[ordem] = E
        np.save(out / f'{nome}__{var}.npy', M.astype(np.float32))
        print(f'{var}: {M.shape} em {time.time()-t0:.0f}s', flush=True)
    meta = {'modelo': a.modelo, 'quantizado_4bit': a.quantizar_4bit, 'instrucoes': INSTRUCOES, 'max_tokens': a.max_tokens,
            'base_sha256': json.loads((ROOT / 'indice' / 'config.json').read_text())['base_sha256']}
    (out / f'{nome}__config.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
    print('pronto. Agora rode: python comparar_modelos.py', flush=True)

if __name__ == '__main__':
    main()
