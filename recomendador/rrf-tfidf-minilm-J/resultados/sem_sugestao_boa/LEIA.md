# Quando não há sugestão boa (estudo de 11/11/2026, sem mudar o recomendador)

## 1. Dá para detectar sugestão fraca?
`analise.py`: 502 pares do mesmo título com nota 0–10 da IA. A semelhança de sentido (cosseno Qwen) entre referência
e sugestão acompanha a nota (correlação 0,69; separa notas < 5 com AUC 0,87). Por área: MT 0,91, CN 0,87, CH 0,86,
LC 0,75 (Linguagens é a mais difícil de prever).

Cortes (cosseno abaixo de X → alarme):

| Corte | Pares abaixo | Ruins entre os de baixo | Ruins entre os de cima | Ruins pegos | Catálogo: 1ª sugestão abaixo | 3ª abaixo |
|---|---|---|---|---|---|---|
| 0,555 | 10% | 80% | 19% | 32% | 0,6% | 3,2% |
| 0,592 | 20% | 68% | 14% | 54% | 2,0% | 8,6% |
| 0,622 | 30% | 61% | 10% | 72% | 5,7% | 18,2% |
| 0,649 | 40% | 53% | 7% | 84% | 10,7% | 30,2% |

Limites: notas da IA (a avaliação cega 7 permitirá conferir com notas humanas); os pares avaliados são sugestões do topo,
não amostra aleatória.

## 2. As 23 questões sem sugestão (`sem_lista.json`)
- 22 têm o texto incompleto na base (só o comando, sem texto-base, tabela ou figura; 2 sem enunciado). Não dá para
  classificar nem recomendar sem recuperar o texto da prova original.
- 1 não é defeito: `gq_1a3a6d4a138f7ba1fba29cef` (ENEM 2009, caderno de Humanas, trecho de Lúcio Cardoso) foi
  classificada como Literatura › Modernismo. Como a busca exige a mesma área, ela não encontra nenhuma outra
  questão de Literatura em Humanas. É a "Literatura em Humanas" da contagem por matéria.
