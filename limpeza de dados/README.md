# Limpeza de dados do ENEM

Scripts Python usados para coletar, padronizar e deduplicar as fontes que deram origem aos CSVs publicados em [`Dataset/`](../Dataset/).

| Arquivo | Função |
|---|---|
| `pipeline.py` | Baixa os arquivos de origem para `raw/`, registra revisão e SHA-256 em `manifests/acquisition.json`, normaliza questões de múltipla escolha e gera arquivos JSONL de treino, validação, teste e quarentena. |
| `unify_csv.py` | Lê os arquivos adquiridos, consolida todas as ocorrências e produz `processed/enem_unificado.csv` (uma linha por texto deduplicado) e `processed/enem_todas_ocorrencias.csv` (todas as linhas de origem). |

## Executar

Requer Python 3.10+ e espaço para aproximadamente 0,5 GB de arquivos brutos. Dentro desta pasta:

```powershell
python -m pip install -r requirements.txt
python pipeline.py acquire
python pipeline.py build
python unify_csv.py
```

Os scripts gravam `raw/`, `manifests/` e `processed/` **nesta pasta**. Esses arquivos gerados são ignorados pelo Git; os CSVs já publicados permanecem em `Dataset/`.

A deduplicação usa igualdade do enunciado normalizado e, para pequenas variações, similaridade textual mínima de 97%, razão de comprimento mínima de 0,93 e os 40 caracteres finais iguais. `training_eligible` é um filtro automático de estrutura, não uma validação manual dos gabaritos. A coleta consulta as revisões disponíveis no momento da execução, então uma nova rodada pode produzir contagens diferentes das publicadas.
