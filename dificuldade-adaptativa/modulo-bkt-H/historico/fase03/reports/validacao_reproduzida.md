# Reprodução da validação e sensibilidade da AUC

A nova implementação avaliou as mesmas 4.253 sequências, 29.780 eventos e 596 estudantes da Fase 02. Log-loss, Brier, acurácia e ECE foram reproduzidos até 1e-11, globalmente e por habilidade. A maior diferença de probabilidade entre os dois filtros foi 6.13e-13.

Probabilidades praticamente empatadas tiveram ranks distintos por ponto flutuante. A primeira checagem de AUC por habilidade falhou e o log foi preservado. Antes de abrir o teste, foi fixada a regra de arredondar a dez casas somente os scores usados no ranking da AUC. As duas implementações produziram a mesma AUC por habilidade sob essa convenção. As probabilidades completas continuam usadas nas demais métricas.

A AUC micro original de 0,72123583 passou a 0.72123663. Em algumas habilidades com previsões quase constantes, a variação por tratamento de empates foi maior. A maior mudança foi aproximadamente 0,03211 na habilidade 323. Os valores históricos e os valores desta missão estão abaixo. A alteração de convenção não participa da classificação favorável, que usa log-loss e Brier. O cuidado é especialmente relevante ao interpretar AUCs de habilidades de fronteira.

| Habilidade | AUC histórica sem arredondamento | AUC com empate a dez casas | Diferença |
| --- | ---: | ---: | ---: |
| 11 | 0.63308161 | 0.63306380 | -0.00001781 |
| 16 | 0.62652296 | 0.61996251 | -0.00656045 |
| 18 | 0.69476377 | 0.69476640 | 0.00000263 |
| 65 | 0.60184026 | 0.60182800 | -0.00001227 |
| 70 | 0.74216332 | 0.74254136 | 0.00037805 |
| 77 | 0.84033538 | 0.84047074 | 0.00013536 |
| 86 | 0.64870083 | 0.64893152 | 0.00023069 |
| 91 | 0.50170576 | 0.50554371 | 0.00383795 |
| 277 | 0.73787450 | 0.73789983 | 0.00002533 |
| 279 | 0.61365813 | 0.61366872 | 0.00001059 |
| 280 | 0.73592024 | 0.73590795 | -0.00001229 |
| 311 | 0.68279865 | 0.68284038 | 0.00004172 |
| 322 | 0.69981326 | 0.69514472 | -0.00466853 |
| 323 | 0.63073394 | 0.66284404 | 0.03211009 |
