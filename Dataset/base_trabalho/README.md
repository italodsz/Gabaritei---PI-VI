# Base de trabalho

Base oficial usada pelo aplicativo e pelo recomendador `titulo_area`, proveniente
do dataset `e6712a8`, após as revisões de novembro de 2026.

- `data/questions.jsonl`: 3.086 registros, com enunciados, alternativas, gabaritos,
  referências oficiais, TRI e descrições quando disponíveis.
- `ids_elegiveis.json`: 2.731 questões elegíveis para recomendação por texto.
- `splits/`: partições preservadas de treino (2.382 elegíveis), validação (175)
  e teste (174). O ENEM 2024 permanece reservado para teste.
- `AVISO_INDICES.json`: proveniência das mudanças e aviso sobre a incompatibilidade
  dos vetores anteriores. Os índices compatíveis atuais estão em
  `../../recomendador/rrf-tfidf-minilm-J/indice/`.
- `media/`: imagens locais opcionais, verificadas pelo servidor e fora do Git.

SHA-256 de `data/questions.jsonl`:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
O servidor exige esse hash. Não altere a base para contornar a checagem.

O app libera 2.657 questões: exclui os 67 defeitos e as 7 duplicatas sinalizadas
no catálogo. Somente descrições com `use_for_recommender: true` entram no texto
de busca. As pendências de texto e classificação continuam registradas na própria
base, nos alertas do catálogo e na amostra de conferência do classificador.
A licença para redistribuição pública precisa de revisão.

Os registros históricos de revisão da antiga pasta `qualidade/` permanecem no
histórico do Git e nas branches de pesquisa. A limpeza não modificou registros,
gabaritos, parâmetros TRI, IDs nem partições. Para execução e imagens, veja o
[README do projeto](../../README.md).
