# Questões com imagem: quais estão prontas para entrar no recomendador

Base: `base/questions.jsonl` (878 questões com imagem, todas fora do recomendador hoje). Lista completa: `situacao_878.csv`.

| Grupo | Quantas | Situação |
|---|---|---|
| 1. Prontas (Maritaca, 2022–2024) | 129 | Descrição da prova para ledor do INEP (marcada como revisada). MT 45, CN 44, LC 23, CH 17 |
| 3. Esperam o Tardelli (2019–2021) | 141 | Hoje só descrição de IA. Cerca de 104 têm descrição do Tardelli (cruzamento do Teles); o resto fica sem |
| 4. Só descrição de IA (2009–2018) | 279 | Descrição gerada por IA, sem revisão; piora a busca (teste do Teles) |
| 5. Sem descrição (2009–2018) | 329 | Nenhuma descrição; MT 169 |

Nenhuma questão do grupo 1 tem alternativa vazia. Antes de entrar, falta: decidir que texto o recomendador usa (enunciado + descrição), refazer TF-IDF, MiniLM, Qwen e catálogo, e avaliar de novo.
