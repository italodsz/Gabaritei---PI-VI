# Teste "assunto primeiro" em Física (11/11/2026)

**Pergunta:** colocar no topo as questões do mesmo assunto da árvore e completar a lista com o resto do título amplo melhora a recomendação de Física?

**Como foi feito**
- Antes do teste, 3 questões de Física foram reclassificadas (rodas de aro 17 → Cinemática; Fata Morgana → Óptica; celular no avião → Ondas eletromagnéticas).
- Foram sorteadas 24 referências de Física, todas de assuntos com pelo menos 3 questões.
- Comparei as 5 primeiras sugestões do método atual (`titulo_area`) com as 5 primeiras do método novo.
- Avaliei 191 itens às cegas, com a régua 2 e uma isca por bloco. As notas foram registradas (`notas_IA.txt`, sha256 em `notas_IA.sha256`) antes de a chave ser aberta.
- Critério fixado antes: adotar o método novo se a média subisse pelo menos 0,3 e o limite inferior do IC95 da diferença ficasse acima de 0.

**Resultado (notas da IA)**

| | Atual | Assunto primeiro |
|---|---|---|
| Média das 5 primeiras | 6,51 | 6,78 |
| 1ª sugestão | 8,17 | 8,54 |
| Nota ≥ 7 | 47% | 52% |
| Nota < 5 | 19% | 13% |

- A diferença foi de +0,27, com IC95 de −0,05 a 0,59.
- Em 10 blocos o novo foi melhor, em 5 foi pior e em 9 empatou.
- As iscas tiveram média 3,7, então a régua separou bem o que era fraco.

**Decisão pelo critério:** não adotar ainda. O método melhorou, mas ficou abaixo do mínimo combinado (0,27 contra 0,30) e o intervalo de confiança encosta no zero.

**Onde piorou:** nos blocos 6 e 7, que são de Ondas eletromagnéticas. O assunto "Ondas eletromagnéticas e espectro" mistura cor e espectro visível com rádio e interferência. Ao exigir o mesmo assunto, o método novo trouxe questões de rádio para uma referência sobre cor, e deixou de fora questões de óptica sobre cor que eram melhores.

**Onde ajudou:** em Mecânica e Termologia, que concentram a maior parte das questões. Por exemplo:
- energia elástica (+1,2);
- queda dos corpos (+1,8);
- condução térmica (+1,8);
- termodinâmica (+0,6 a +1,0).
