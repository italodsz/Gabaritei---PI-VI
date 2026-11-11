# Época (História) e escala (Geografia) dentro do título — 11/11/2026

Peças novas em `sinais.py`: `epoca` (períodos por termos, séculos e anos) e `escala` (Brasil x mundo, regiões,
urbano/rural, litoral). Bônus sobre o "só sentido" (Qwen) do `titulo_area`.

Validação (treino+validação, mesmo assunto nas 3 primeiras): História 49,9% → 50,9% (peso 0,5), piora com peso
maior; Geografia 68,6% → 64,5% (peso 0,5), piora mais com peso maior. Ver `validacao.json`.

Régua da IA (todas as 20 referências de teste das duas matérias, às cegas, novas sugestões misturadas com iscas):

| | História atual | História + época | Geografia atual | Geografia + escala |
|---|---|---|---|---|
| Média top 3 | 6,08 | 6,17 | 6,44 | 6,31 |
| 1ª sugestão | 7,12 | 6,50 | 7,42 | 6,75 |
| Abaixo de 5 | 17% | 12% | 17% | 19% |
| Melhor/igual/pior (refs) | — | 2/5/1 | — | 0/8/4 |
| Diferença (IC95) | — | +0,08 (−0,08 a +0,29) | — | −0,14 (−0,28 a −0,03) |

Conclusão: época empata (não adotada); escala piora (descartada). Motivo provável: os títulos de História já são
períodos e os de Geografia já são temas, então essas peças repetem o que o filtro de título já faz.
