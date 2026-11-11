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

## Rodada 2: "Cor e visão" separado (11/11/2026)

**O que mudou na árvore:** criei o assunto **Cor e visão** (`FS3.cor-e-visao`), que trata de cor dos objetos, filtros, cores complementares, cones e bastonetes. O antigo "Óptica geométrica e visão" passou a se chamar **Óptica geométrica** e ficou com espelhos, lentes e refração. Para o novo assunto foram movidas 5 questões: antocianinas, filtro da foto, cones com luz vermelha, retina e bastonetes.

**Avaliação:** as referências são as mesmas 24. Todos os pares novos já tinham nota da rodada 1, dada às cegas, então nenhuma nota nova foi necessária.

| | Atual | Assunto primeiro (rodada 2) |
|---|---|---|
| Média das 5 primeiras | 6,51 | 6,86 |
| 1ª sugestão | 8,17 | 8,62 |
| Nota ≥ 7 | 47% | 53% |
| Nota < 5 | 19% | 12% |

A diferença foi de +0,35, com IC95 de 0,07 a 0,63. O método novo foi melhor em 11 blocos e pior em 5. **Isso passa no critério fixado antes do teste**, e o método foi **adotado em Física** (`busca_por_area_v1.json` → `assunto_primeiro`). O catálogo foi regenerado.

**Ressalva:** a mudança na árvore foi feita depois de ver o resultado da rodada 1, usando as mesmas referências. Por isso o ganho pode estar um pouco inflado. O ideal é confirmar com referências novas, numa ficha humana ou numa nova rodada da IA.

## Ajuste por título (11/11/2026)

Pedido do Ítalo: manter o "assunto primeiro" onde ele ajudou e tirar onde atrapalhou. O resultado da rodada 2, separado pelo título amplo da referência, foi este:

| Título | Referências | Diferença média | Decisão |
|---|---|---|---|
| Mecânica | 6 | +0,87 | mantém |
| Termologia | 5 | +0,48 | mantém |
| Física moderna e energia | 4 | +0,35 | mantém |
| Eletricidade e magnetismo | 2 | +0,30 | mantém |
| Ondulatória e óptica | 7 | −0,17 | **volta ao método atual** |

A decisão foi tomada por título, e não por assunto, porque cada assunto tem só 1 ou 2 referências, poucas demais para decidir.

Com essa configuração, a diferença geral passa a ser +0,40 (IC95 de 0,18 a 0,65): 9 blocos melhoram, 1 piora e o resto fica igual. A ressalva de antes continua valendo: o ajuste foi escolhido olhando as mesmas 24 referências, então o ganho real tende a ser um pouco menor. É preciso confirmar com referências novas.

## Confirmação com referências novas (11/11/2026)

**Como foi feito**
- 20 referências de Física que nunca tinham sido usadas, todas dos 4 títulos em que o "assunto primeiro" está ligado.
- 150 itens avaliados às cegas, com uma isca por bloco.
- As notas foram registradas (`notas_IA_confirmacao.txt`, sha256) antes de a chave ser aberta.

| | Atual | Assunto primeiro |
|---|---|---|
| Média das 5 primeiras | 5,92 | 6,38 |
| 1ª sugestão | 7,75 | 8,00 |
| Nota ≥ 7 | 42% | 49% |
| Nota < 5 | 29% | 17% |

**Resultado:** diferença de +0,46, com IC95 de 0,11 a 0,81. O "assunto primeiro" foi melhor em 11 blocos, pior em 3 e igual em 6. As iscas tiveram média 3,6.

**Por título:**

| Título | Diferença média |
|---|---|
| Termologia | +0,80 |
| Mecânica | +0,40 |
| Física moderna | +0,40 |
| Eletricidade | +0,16 |

Nenhum dos 4 títulos piorou na média.

**Conclusão:** **o ganho se confirmou em referências novas**, e o "assunto primeiro" continua ligado nos 4 títulos.
