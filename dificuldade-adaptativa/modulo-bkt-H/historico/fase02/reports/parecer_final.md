# Parecer da Fase 02

**APROVADO COM RESSALVAS para continuidade experimental à avaliação da Fase 03.**

Foram treinadas 56 habilidades do ASSISTments, com 19.370 sequências e 143.092 eventos. As 20 inicializações por habilidade convergiram. A formulação de dois estados sem esquecimento foi conferida por forward matricial e por enumeração exata. A reprodução integral em uma cópia isolada e ambiente virtual limpo produziu os mesmos parâmetros.

A validação preliminar em 29.780 eventos e 596 estudantes apresentou log-loss 0.565095, Brier 0.190877, AUC 0.721236 e acurácia 71.63%. O baseline de taxa por habilidade teve log-loss 0.620076. A ECE em dez intervalos foi maior para o BKT. As métricas por habilidade e as médias macro acompanham a entrega.

Os 100 bootstraps por habilidade concluíram 5.600 reajustes convergentes, com 28 habilidades apresentando intervalos amplos. Sete habilidades ficaram próximas a fronteiras numéricas. A interpretação individual de L0,T,G,S exige cautela. A revisão externa permanece pendente e o notebook foi executado em Jupyter local, com verificação de dependências em ambiente limpo. A execução no serviço Colab permanece a verificar.

Os modelos são próprios das habilidades ASSISTments. A correspondência pedagógica com o ENEM, a calibração com alunos do Gabaritei e a qualidade das recomendações ficam pendentes. A inferência já permite atualização de domínio com parâmetros fixos. O processo periódico de retreinamento depende de implementação e validação posteriores.

A Fase 03 pode consumir os modelos e os conjuntos congelados pelo contrato. A aprovação externa desta entrega é a próxima decisão.
