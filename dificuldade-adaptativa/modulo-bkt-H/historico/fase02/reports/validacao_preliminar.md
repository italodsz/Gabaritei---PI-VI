# Validação preliminar prospectiva

A validação avaliou 29,780 eventos de 596 estudantes nas 56 habilidades. Os estudantes são inéditos em relação ao treino. Para cada sequência, o estado inicia em L0, a previsão é salva antes da resposta e a atualização usa somente respostas anteriores para a oportunidade seguinte. Os parâmetros ficam fixos.

O baseline usa a taxa por habilidade estimada no treino, suavizada por Beta(1,1), isto é, (acertos+1)/(eventos+2). Ele recebe o mesmo conjunto de observações para a comparação. A acurácia usa limiar de 0,5. AUC usa ranks médios em empates e fica indefinida quando há apenas uma classe. A calibração usa dez intervalos fixos de largura 0,1. O último inclui a borda 1.

| Métrica micro | BKT | Baseline por habilidade |
| --- | ---: | ---: |
| log_loss | 0.56509503 | 0.62007642 |
| brier | 0.19087660 | 0.21519058 |
| auc_roc | 0.72123583 | 0.61026192 |
| accuracy_threshold_0_5 | 0.71631968 | 0.66991269 |
| ece_10_bins | 0.00951120 | 0.00352856 |

A log-loss do BKT é menor em 55 de 56 habilidades. O ganho micro de log-loss é 0.05498139. A diferença BKT menos baseline teve intervalo empírico de 95% entre -0.06470746 e -0.04656140, com 2.000 reamostragens pareadas de estudantes da validação. O resultado é preliminar, com a seleção de parâmetros já encerrada pelo objetivo de treino. O teste continua reservado.

A ECE é menor para o baseline. Portanto, a melhoria de log-loss, Brier e discriminação convive com maior desvio de calibração nos intervalos usados. A ECE depende da definição dos intervalos. Os gráficos incluem a quantidade de eventos por intervalo.

A agregação macro dá o mesmo peso a cada habilidade. Os valores macro de log-loss são 0.56035924 para BKT e 0.60482790 para baseline. Os resultados completos, suportes por classe, calibração por habilidade e demais médias macro estão em validacao.json.

Há itens compartilhados entre treino e validação. A avaliação mede generalização a estudantes novos sob a política do tutor. Os históricos, as habilidades e a escala de dificuldade não estabelecem calibração para o ENEM.
