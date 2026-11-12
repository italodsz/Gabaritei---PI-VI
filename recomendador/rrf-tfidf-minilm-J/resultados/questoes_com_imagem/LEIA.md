# Questões com imagem: quais estão prontas para entrar no recomendador

Base: `base/questions.jsonl` (878 questões com imagem, todas fora do recomendador hoje).
Lista por questão: `situacao_878.csv`. Cruzamento com o Tardelli (2019–2024): `cruzamento_tardelli.csv`.
Fonte do Tardelli: `tardelli_registros.jsonl` (huggingface.co/datasets/tardellirs/enem-audiodescricao, pasta corpus; licença inep-atribuicao-e-mit).

| Grupo | Quantas | Situação |
|---|---|---|
| 1. Prontas, Maritaca (2022–2024) | 129 | Descrição da prova para ledor do INEP. 127 também casam com o Tardelli |
| 1b. Prontas, Tardelli (2019–2021) | 100 | Hoje só descrição de IA; o Tardelli traz a profissional. MT 34, CN 29, LC 29, CH 8 |
| 3b. Casam com o Tardelli, mas o gabarito diverge | 9 | Conferir: 3 com casamento quase perfeito (o Teles já viu na prova que a nossa letra está certa); 6 com casamento fraco, provavelmente questão vizinha |
| 3. Sem Tardelli (2019–2021) | 32 | Ficam com descrição de IA |
| 4. Só descrição de IA (2009–2018) | 279 | Piora a busca (teste do Teles) |
| 5. Sem descrição (2009–2018) | 329 | MT 169 |

Cruzamento: pelo texto do enunciado e das alternativas (provas regulares; o Tardelli numera pelo caderno ledor, então o número da questão não serve). Aceito com pontuação ≥ 0,6 e gabarito igual; os 18 casos entre 0,6 e 0,75 foram conferidos a olho.

Total pronto: 229 (129 + 100). Antes de entrar: definir o texto do recomendador (enunciado + descrição), refazer TF-IDF, MiniLM, Qwen e catálogo, e avaliar de novo.
