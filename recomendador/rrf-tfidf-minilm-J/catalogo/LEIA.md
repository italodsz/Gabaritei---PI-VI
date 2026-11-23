# Catálogo de recomendações

O FastAPI consulta `recomendacoes_titulo_area.json`, gerado por
`python recomendador.py exportar`. Para cada uma das 2.731 questões elegíveis,
guarda até 50 sugestões ordenadas; a mediana é 45 e 68 listas são vazias.

As sugestões têm a mesma área, matéria e título, segundo a árvore v1.2 do projeto.
Excluem a própria questão, a mesma família, defeitos e duplicatas. Inglês e espanhol
permanecem separados. Matéria e título são nossa classificação, não rótulos do INEP.
A decisão oficial está em `../DECISAO_FINAL.json`.

- `questoes`: metadados por ID, incluindo área, ano, habilidade, `tri_b` oficial,
  nível por tercis do treino, matéria, título, língua, defeitos e duplicatas.
- `recomendacoes`: IDs ordenados por questão; a galeria contém treino, validação
  e teste. Nas avaliações, a galeria é restrita ao treino.
- `alertas_texto.json`: 67 bloqueios e duas ressalvas da prova original.

O servidor preserva a ordem do catálogo, exclui questões e famílias já usadas e
aplica o ajuste de dificuldade descrito em
[recomendador-dificuldade.md](../../../docs/recomendador-dificuldade.md).
Uma lista sem candidatos não é completada com sorteio de outra matéria.
O nível em tercis do catálogo não substitui o modelo TRI usado pelo aplicativo.

Base final: `e6712a8`. SHA-256:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
A base e o catálogo são congelados e conferidos ao iniciar o servidor.
As auditorias históricas removidas da árvore atual continuam no Git; os cinco
JSONs lidos pelo modo dev permanecem em `../resultados/base_final/`.
Veja [reconstrução e pendências](../README.md).
