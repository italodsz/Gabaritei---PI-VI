# Suficiência de habilidades e análise exploratória

O corpus processado tem 101 habilidades, 13.106 itens distintos e 32.070 históricos. São 8.191 históricos com um evento e 15.072 com pelo menos cinco. O tamanho médio é 6,69 e a mediana, 4. Há 2.962 reexposições ao mesmo item para o mesmo estudante. A contagem por estudante–habilidade–item é a mesma nesta edição. O principal preserva as reexposições como eventos distintos com ordem distinta.

No treino houve 99.605 acertos na primeira ação e 51.410 erros ou ajuda inicial. A taxa de acerto do treino é 65,96%. As 100 habilidades observadas no treino incluem habilidades com rótulo constante. Esses extremos reforçam a necessidade dos mínimos por classe. O código 348 aparece no corpus processado, mas ficou sem observações no treino.

| Critério, calculado no treino | Estudantes | Sequências de 5+ | Acertos | Erros ou ajuda | Habilidades |
| --- | ---: | ---: | ---: | ---: | ---: |
| Brando | 75 | 20 | 30 | 30 | 61 |
| Principal | 100 | 30 | 50 | 50 | 56 |
| Estrito | 150 | 50 | 100 | 100 | 47 |

Das 101 habilidades observadas, 56 passam no critério principal e 45 ficam fora. Entre as 100 presentes no treino, 43 falham no requisito de sequências longas, 30 no de estudantes, 26 no de negativos e 17 no de positivos. Uma habilidade pode falhar em mais de um requisito. A lista completa e a justificativa individual ficam em data/manifests/decisoes_habilidades.csv.

As 56 habilidades estão representadas nos três conjuntos. A cobertura é de 143.092 eventos de treino, 29.780 de validação e 29.948 de teste. Os totais de sequências nessas habilidades são 19.370, 4.253 e 3.892. Históricos curtos continuam presentes quando pertencem a habilidades elegíveis.

Nas sensibilidades de treino, reter somente a primeira exposição por estudante e item preservou 148.950 eventos, 22.591 sequências e 56 habilidades elegíveis. Remover eventos de ajuda na primeira ação preservou 136.731 eventos, 21.962 sequências e 54 habilidades elegíveis. As listas de IDs de cada análise estão em data/manifests/sensibilidade.json. Os limiares e o recorte principal são os definidos antes dessas análises.

Os dez gráficos em reports/graficos cobrem eventos por aluno e habilidade, comprimentos, classes de treino, elegibilidade, cobertura, itens, repetição, perdas e desequilíbrio. O volume das transições observadas permite planejar o ajuste. Sequências curtas, dependência entre tentativas, diferenças entre itens de uma habilidade, prática guiada e parada por domínio ainda podem limitar a identificabilidade dos parâmetros. As transições entre acerto e erro não sustentam inferência causal sobre aprendizagem.
