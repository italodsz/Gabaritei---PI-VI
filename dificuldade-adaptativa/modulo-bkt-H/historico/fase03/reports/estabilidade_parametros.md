# Investigação das 28 habilidades com parâmetros amplos

Os 100 conjuntos de parâmetros bootstrap já estimados por habilidade foram reaplicados prospectivamente aos mesmos históricos de validação. Para cada observação foi calculada a largura entre os percentis 2,5 e 97,5% das previsões. Também foi calculado RMSE de cada réplica em relação às previsões do modelo oficial. Essa análise examina incerteza preditiva sob a distribuição empírica dos estudantes de treino.

Entre as 28 habilidades com ao menos um intervalo de parâmetro mais largo que 0,30, 14 tiveram mediana da largura preditiva até 0,10. No conjunto das 56, 20 excederam 0,10 e uma excedeu 0,20. A habilidade 294 apresentou mediana 0.201204. O limiar é uma triagem experimental pré-especificada. O arquivo JSON contém suportes, distribuições de comprimento, taxa de acerto, intervalos de parâmetros, variação por inicialização, larguras e RMSEs de previsão por habilidade.

As 28 habilidades terminaram com {'C': 18, 'B': 10}. A incerteza de parâmetro não ocasionou exclusão automática. A classificação também considerou suporte, diferença pareada de log-loss, Brier e fronteira. Dez ficaram B e dezoito ficaram C. A comparação de inicializações é herdada dos 20 ajustes por habilidade e permanece rastreável ao artefato original.

| Habilidade | Eventos de treino | Largura preditiva mediana | RMSE preditivo p95 | Categoria |
| --- | ---: | ---: | ---: | --- |
| 4 | 1307 | 0.070097 | 0.061160 | C |
| 8 | 1314 | 0.047652 | 0.047388 | B |
| 16 | 585 | 0.108607 | 0.084132 | C |
| 39 | 860 | 0.121312 | 0.077591 | C |
| 40 | 1308 | 0.060352 | 0.069197 | C |
| 46 | 3228 | 0.072707 | 0.056777 | B |
| 51 | 1412 | 0.076191 | 0.064020 | B |
| 54 | 648 | 0.137764 | 0.077754 | C |
| 58 | 1296 | 0.085293 | 0.052151 | C |
| 65 | 2332 | 0.067769 | 0.054609 | B |
| 67 | 3806 | 0.077347 | 0.048846 | B |
| 81 | 2199 | 0.084919 | 0.051094 | B |
| 82 | 1247 | 0.107074 | 0.077159 | C |
| 84 | 478 | 0.127218 | 0.064936 | C |
| 86 | 2031 | 0.071523 | 0.075551 | B |
| 91 | 461 | 0.107781 | 0.058888 | C |
| 96 | 575 | 0.143420 | 0.117308 | B |
| 101 | 976 | 0.132439 | 0.059324 | C |
| 279 | 4804 | 0.063064 | 0.078359 | B |
| 294 | 582 | 0.201204 | 0.113637 | C |
| 297 | 688 | 0.159983 | 0.083718 | C |
| 303 | 965 | 0.139497 | 0.062376 | B |
| 307 | 603 | 0.057360 | 0.083104 | C |
| 308 | 568 | 0.154629 | 0.072907 | C |
| 312 | 3481 | 0.108570 | 0.084450 | C |
| 322 | 787 | 0.091682 | 0.111182 | C |
| 323 | 672 | 0.046673 | 0.039092 | C |
| 325 | 1441 | 0.119538 | 0.054513 | C |
