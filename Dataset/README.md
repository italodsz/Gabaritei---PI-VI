# Dataset ENEM

Arquivos CSV, os dois arquivos foram produzidos a partir das fontes coletadas para o projeto Gabaritei; o terceiro é uma fonte original.

| Arquivo | Conteúdo e uso |
|---|---|
| `enem_unificado.csv` | **6.704 textos distintos para embeddings**: 4.871 registros de múltipla escolha, 1.157 pares pergunta-resposta e 676 registros de audiodescrição. Use `vector_text` para gerar um embedding por linha. Para treino supervisionado, filtre `training_eligible=True`: **4.628 questões de múltipla escolha** passaram pelo filtro automático de cinco alternativas e gabarito. |
| `enem_todas_ocorrencias.csv` | **12.774 registros de origem**, incluindo perguntas repetidas entre fontes, descrições de imagem e registros incompletos. Esse número não representa 12.774 questões diferentes. Serve para auditoria e rastreamento; não vetorize todas as linhas diretamente. |
| `all_questions_df.csv` | **1.006 linhas brutas** de uma única fonte, [Brazilian Secondary School Exam (ENEM) Questions Dataset](https://zenodo.org/records/8301716). O arquivo foi obtido do repositório dos autores, com MD5 igual ao publicado no Zenodo. |

Nos CSVs consolidados, `record_id` identifica a ocorrência, `vector_group_id` liga versões da mesma pergunta e `quality_flags` indica pontos que precisam de revisão. A deduplicação removeu textos idênticos e pequenas variações de OCR/formatação; paráfrases e erros grandes ainda podem exigir revisão manual. A aprovação automática não substitui a conferência do gabarito com o INEP.

## Experimento v2

O pacote completo do experimento v2, incluindo dados, auditorias e mídias, está versionado em partes em [`experimento_v2/`](experimento_v2/). O diretório inclui instruções e um script que reconstrói o ZIP original e valida todos os hashes.
