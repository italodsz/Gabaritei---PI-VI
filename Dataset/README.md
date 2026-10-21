# Dataset ENEM

Arquivos CSV, os dois arquivos foram produzidos a partir das fontes coletadas para o projeto Gabaritei; o terceiro é uma fonte original.

| Arquivo | Conteúdo e uso |
|---|---|
| `enem_unificado.csv` | **6.704 perguntas sem repetição**. Use `vector_text` para gerar um embedding por linha. Para treino supervisionado com cinco alternativas e gabarito, filtre `training_eligible=True` (4.628 linhas). |
| `enem_todas_ocorrencias.csv` | **12.774 registros de origem**, incluindo cópias de perguntas, descrições de imagem e registros incompletos. Serve para auditoria e rastreamento; não vetorize todas as linhas diretamente. |
| `all_questions_df.csv` | **1.006 linhas brutas** de uma única fonte, [Brazilian Secondary School Exam (ENEM) Questions Dataset](https://zenodo.org/records/8301716). O arquivo foi obtido do repositório dos autores, com MD5 igual ao publicado no Zenodo (`0389950866be9f8466e2016dcad311be`). |

Nos CSVs consolidados, `record_id` identifica a ocorrência, `vector_group_id` liga versões da mesma pergunta e `quality_flags` indica pontos que precisam de revisão. A deduplicação removeu textos idênticos e pequenas variações de OCR/formatação; paráfrases e erros grandes ainda podem exigir revisão manual. A aprovação automática não substitui a conferência do gabarito com o INEP.
