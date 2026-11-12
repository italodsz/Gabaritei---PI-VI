# Teste do Qwen3-Reranker-4B (06/11/2026)

Reordena as 20 primeiras sugestões do candidato `rrf_qwen` com o Qwen3-Reranker-4B (4 bits),
que lê a referência e a candidata juntas e dá a probabilidade de "sim" para a instrução
"mesmo conceito central e mesma operação, independentemente do cenário". Duas instruções
(inglês e português) × duas formas de uso (só o reranker; RRF entre a ordem atual e a do
reranker) = 4 variantes. Validação 2023 (o teste de 2024 não foi usado). Máquina: RTX 4060 Ti
8 GB; 5.040 pares em 6.802 s (cerca de 1,35 s por par). Script: `testar_reranker.py`.

| Método | Pares na ordem certa | hab@5 (136 consultas) | Posições das 5 notas 2 |
|---|---|---|---|
| rrf_qwen (candidato atual) | 39/44 | 20,4% | 1, 1, 2, 5, 10 |
| Reranker EN, só reranker | 39/44 | 21,0% | 1, 2, 2, 3, 7 |
| Reranker EN, RRF com a ordem atual | 39/44 | 21,2% | 1, 1, 2, 3, 4 |
| Reranker PT, só reranker | 40/44 | 22,1% | 1, 2, 2, 2, 8 |
| **Reranker PT, RRF com a ordem atual** | **41/44** | 21,9% | **1, 1, 2, 4, 4** |

Leitura: ganho pequeno nos pares (+2 de 44, dentro do ruído e escolhido entre 4 variantes),
mas consistente em levar as boas sugestões para o topo: com a melhor variante, as 5 notas 2
ficam entre as 4 primeiras posições (antes, uma ficava em 10º, fora do top 5 do app).
hab@5 praticamente igual. Custo: calcular o top 20 de todas as 2.063 questões levaria cerca
de 15 h nessa placa (uma vez só); o app usaria as listas já calculadas.

Status: segundo candidato, não adotado. A avaliação cega 4 continua avaliando `rrf_qwen`
sem reranker; o reranker só entra depois de uma avaliação humana própria.
