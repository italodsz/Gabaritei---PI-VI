# Calibração probabilística

Foi ajustada uma transformação logística global expit(a·logit(p)+b), com a entre 0,05 e 5 e b entre −5 e 5. Os dados usados foram exclusivamente os estudantes de validação. A escolha foi avaliada por cinco folds de estudantes, formados deterministicamente pela primeira ordem de evento do estudante e a semente 20261111. Cada evento recebeu uma previsão calibrada fora do fold usado no seu ajuste.

O critério anterior ao teste exigia ganho mínimo de 0,002 em log-loss, aumento de Brier de até 0,0005 e ECE não maior. A log-loss original da validação foi 0.56509503, e a logística crossfit teve 0.56586199. O resultado selecionou identidade. O calibrador ajustado em toda a validação está armazenado como candidato, com selected=false, e não foi aplicado na avaliação principal.

A regra reduz a chance de promover uma calibração por ajuste aparente na própria amostra, mas cinco folds de uma única validação mantêm incerteza e risco de sobreajuste. O desempenho em teste permaneceu reservado ao protocolo congelado. As curvas de confiabilidade e distribuições de probabilidade acompanham o relatório. A ECE é uma descrição dependente dos intervalos e do suporte, avaliada em conjunto com log-loss e Brier.
