# Base unificada (K)

Autor: João. Primeira tentativa de montar a base do Gabaritei: os scripts em limpeza/ baixam datasets públicos do ENEM (HuggingFace e Zenodo), padronizam os registros, removem repetições e geram os CSVs desta pasta. Esta base não alimenta a linha atual (v1.2.1 → v2 → v2.1-rc1 → base de trabalho); fica como registro.

## Como rodar

```bash
cd limpeza
python3 pipeline.py
python3 unify_csv.py
```

Dependências: `pyarrow` e `rapidfuzz`.

| Arquivo | Conteúdo e uso |
|---|---|
| `enem_unificado.csv` | **6.704 textos distintos para embeddings**: 4.871 registros de múltipla escolha, 1.157 pares pergunta-resposta e 676 registros de audiodescrição. Use `vector_text` para gerar um embedding por linha. Para treino supervisionado, filtre `training_eligible=True`: **4.628 questões de múltipla escolha** passaram pelo filtro automático de cinco alternativas e gabarito. |
| `enem_todas_ocorrencias.csv` | **12.774 registros de origem**, incluindo perguntas repetidas entre fontes, descrições de imagem e registros incompletos. Esse número não representa 12.774 questões diferentes. Serve para auditoria e rastreamento; não vetorize todas as linhas diretamente. |
| `all_questions_df.csv` | **1.006 linhas brutas** de uma única fonte, [Brazilian Secondary School Exam (ENEM) Questions Dataset](https://zenodo.org/records/8301716). O arquivo foi obtido do repositório dos autores, com MD5 igual ao publicado no Zenodo. |

Nos CSVs consolidados, `record_id` identifica a ocorrência, `vector_group_id` liga versões da mesma pergunta e `quality_flags` indica pontos que precisam de revisão. A deduplicação removeu textos idênticos e pequenas variações de OCR/formatação; paráfrases e erros grandes ainda podem exigir revisão manual. A aprovação automática não substitui a conferência do gabarito com o INEP.
