# Qualidade das sugestões das 23 questões corrigidas (11/11/2026)

**Como foi feito:** para cada uma das 23 questões (os 22 textos do INEP e a questão de Literatura), avaliei as 5 primeiras sugestões do método oficial, já com os vetores Qwen novos, mais 1 isca. A avaliação foi às cegas, com a régua 2, e as notas foram registradas com sha256 antes de abrir a chave.

| | 23 questões corrigidas | Referência (método oficial em testes anteriores) |
|---|---|---|
| Média das 5 primeiras | **6,48** | ~6,4 a 6,6 |
| 1ª sugestão | **7,74** | ~7,4 a 8,0 |
| Nota ≥ 7 | 56% | ~50% |
| Nota < 5 | 22% | ~15 a 20% |
| Iscas | 3,3 | — |

**Leitura:** as 23 questões, que antes não tinham nenhuma sugestão, agora recebem sugestões da mesma qualidade das outras questões da base.

| Matéria | Média das 5 primeiras |
|---|---|
| Matemática | 6,0 a 8,2 (geralmente a mais alta) |
| Química | 4,4 a 8,4 |
| Física | 4,8 a 7,8 |
| Biologia | 4,4 (atemoia/enxertia: há poucas questões de propagação vegetativa na base) |

**Problema encontrado:** em 2 das 23 questões, a 1ª sugestão era **a mesma questão repetida** em outro caderno: "A menina que roubava livros" e Kelsen/Bobbio. Na base inteira havia 13 casos assim no top 5, todos de pares de questões duplicadas.

**Correção aplicada:**
1. Mais 3 duplicatas foram marcadas: `6813b543`, `acf5d212` e `b8f4ee58`.
2. O recomendador agora descarta candidatas cujo texto é quase idêntico ao da referência (semelhança Qwen ≥ 0,97).

Depois de regenerar o catálogo, não sobrou nenhuma questão repetida no top 5 e nenhuma lista ficou vazia. As duas notas 2 dadas a essas repetições não entram mais na lista. Sem elas, a média das 23 questões ficaria um pouco acima de 6,48.
