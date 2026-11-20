# Parecer final

**APROVAÇÃO PARCIAL.** A integridade matemática, a reprodução e o resultado preditivo agregado sustentam continuidade experimental controlada para parte das habilidades ASSISTments. Há 21 habilidades A e 14 B, totalizando 35 com evidência favorável sob os critérios pré-especificados. As 21 habilidades C têm uso experimental restrito. A categoria D ficou vazia.

A reprodução dos 56 modelos foi exata. O teste de 29.948 respostas de 585 estudantes apresentou log-loss 0.565608, Brier 0.191332, AUC 0.728572 e acurácia de previsão de acerto 71.67%. Os intervalos pareados de log-loss e Brier favoreceram o BKT frente à taxa por habilidade do treino. A ECE pontual favoreceu o baseline. O ajuste de calibração foi rejeitado na validação cruzada.

As 28 habilidades com parâmetros amplos tiveram dez classificações B e dezoito C. Os sete casos de fronteira ficaram C. Os intervalos dos parâmetros e os perfis de likelihood exigem prudência na interpretação de domínio. As classificações individuais são descritivas e usam intervalos marginais.

A revisão integral no Claude Code está pendente, após uma tentativa limitada de inspeção de código exceder 120 segundos. A revisão humana externa está pendente. A execução do notebook foi local.

Para a Fase 04, recomenda-se uma prova de conceito controlada com a origem dos parâmetros explícita, usando a lista A/B e mecanismos de restrição para C. A transferência ao ENEM exige alinhamento pedagógico, histórias locais e avaliação própria. A integração deve preservar a escolha do aluno e o papel do módulo semântico. O contrato da Fase 04 documenta os requisitos. A entrega fica sujeita à análise e aprovação do responsável pelo projeto.


# Reprodução em ambiente limpo

O ambiente virtual novo recebeu as dependências fixadas pela Fase 02. Os 56 modelos foram ajustados novamente em uma cópia isolada, com 20 inicializações, semente 20261110, SLSQP, 500 iterações e ftol 1e-9. Os dados foram os mesmos, identificados pelo gate e pelo manifesto local.

As 56 reproduções foram exatas. O arquivo reproducao_treinamento.csv mostra L0,T,G,S originais e reproduzidos, diferenças absolutas, log-verossimilhanças, NLLs, convergência e inicialização selecionada. As tolerâncias preservadas da Fase 02 são 1e-4 nos parâmetros e 1e-8 na NLL média. Nenhuma habilidade precisou da categoria de equivalência estatística ou de tolerância não nula.

Versões efetivas da reprodução: Python 3.14.0, NumPy 2.4.3, SciPy 1.17.1. O processo usou quatro trabalhadores, com uma thread BLAS e OpenMP por processo. O log registra as 1.120 otimizações principais reproduzidas.


# Auditoria matemática

Uma implementação matricial nova, sem importar as equações centrais da Fase 02, conferiu as verossimilhanças das 56 habilidades nos 143.092 eventos de treino. A maior diferença de NLL média foi 2.52e-14. O código compara também probabilidades anteriores e estados posteriores em amostras de sequências por habilidade, com erro máximo permitido de 1e-10.

A enumeração exata de 126 sequências binárias com comprimento entre 1 e 6, usando frações, confirmou o forward escalado. Foram incluídas sequências de 5.000 observações para estabilidade numérica. A crença reinicia por estudante e habilidade. A resposta atual só atualiza o estado depois da previsão. A transição após a última resposta não integra a verossimilhança como nova observação.

As restrições dos parâmetros, os exemplos manuais, o reset e a ausência de respostas futuras foram executados como testes. O status é aprovado para a implementação conferida. A autoria é a mesma do pipeline. A revisão humana externa está pendente.


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


# Investigação das sete habilidades de fronteira

Para 16, 84, 91, 307, 308, 322 e 323, o parâmetro próximo da fronteira foi fixado em uma grade que inclui seu valor oficial e valores entre 0,0001 e 0,9999. Os outros três foram reotimizados com três inicializações, os mesmos limites e a restrição G+S≤0,99. As configurações inviáveis de emissão foram excluídas da grade. Os modelos oficiais foram preservados.

O perfil relata a perda de log-verossimilhança total em relação ao modelo oficial. O conjunto ΔLL≤1,92 é uma referência descritiva de suporte de likelihood, sem alegação de intervalo nominal válido na fronteira. As alternativas foram mantidas como exploração e tiveram suas previsões comparadas na validação.

| ID | Parâmetro | Valor oficial | Distância inferior | Valores no perfil com ΔLL≤1,92 | Maior RMSE preditivo nesse conjunto |
| --- | --- | ---: | ---: | --- | ---: |
| 16 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1] | 0.043800 |
| 84 | L0 | 0.00010000 | 6.78e-20 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5] | 0.021655 |
| 91 | G | 0.00010000 | 1.79e-17 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25] | 0.040898 |
| 307 | T | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25] | 0.058874 |
| 308 | L0 | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5] | 0.041193 |
| 322 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025] | 0.010581 |
| 323 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.75] | 0.002378 |

O menor delta observado foi da ordem de −2e-11, compatível com aritmética e tolerância de otimização, sem melhoria substantiva sobre o ajuste oficial. Os perfis mostram regiões de parâmetros alternativas com objetivos semelhantes. Todas as sete habilidades ficaram na categoria C, por suporte de teste limitado e/ou ganho inconclusivo ou Brier pontualmente pior. Esses motivos individuais constam no CSV.


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


# Calibração probabilística

Foi ajustada uma transformação logística global expit(a·logit(p)+b), com a entre 0,05 e 5 e b entre −5 e 5. Os dados usados foram exclusivamente os estudantes de validação. A escolha foi avaliada por cinco folds de estudantes, formados deterministicamente pela primeira ordem de evento do estudante e a semente 20261111. Cada evento recebeu uma previsão calibrada fora do fold usado no seu ajuste.

O critério anterior ao teste exigia ganho mínimo de 0,002 em log-loss, aumento de Brier de até 0,0005 e ECE não maior. A log-loss original da validação foi 0.56509503, e a logística crossfit teve 0.56586199. O resultado selecionou identidade. O calibrador ajustado em toda a validação está armazenado como candidato, com selected=false, e não foi aplicado na avaliação principal.

A regra reduz a chance de promover uma calibração por ajuste aparente na própria amostra, mas cinco folds de uma única validação mantêm incerteza e risco de sobreajuste. O desempenho em teste permaneceu reservado ao protocolo congelado. As curvas de confiabilidade e distribuições de probabilidade acompanham o relatório. A ECE é uma descrição dependente dos intervalos e do suporte, avaliada em conjunto com log-loss e Brier.


# Avaliação final congelada

A avaliação utilizou 29948 eventos, 3892 sequências e 585 estudantes nas 56 habilidades. O protocolo foi congelado com SHA-256 bc2d2609405c4bb2d69ac43dc84f4ce0e88e13a81028579598f6172ea9500348. O registro de acesso coloca o congelamento antes da primeira abertura de rótulos para avaliação nesta missão. Os parâmetros permanecem idênticos aos modelos da Fase 02.

O recorte preparado tem 4.003 estudantes. A divisão por estudante soma 2.802 no treino, 601 na validação e 600 no teste. O filtro de 56 habilidades, definido apenas pelo treino, deixa 2.773 estudantes de treino, 596 na validação e 585 no teste. Os quinze estudantes de teste restantes tinham eventos apenas nas habilidades fora do recorte principal. As contagens integrais foram preservadas, com cobertura explicitamente reportada.

A média micro pesa cada evento igualmente. A média macro pesa igualmente cada habilidade com métrica definida. Métricas indefinidas são nulas em JSON e NA em CSV. O baseline por habilidade é (acertos_treino+1)/(eventos_treino+2). A taxa global usa os eventos das 56 habilidades de treino. O histórico suavizado usa (acertos anteriores+2·taxa_treino)/(oportunidades anteriores+2) por estudante–habilidade.

| Método | Log-loss | Brier | AUC | Acurácia | ECE |
| --- | ---: | ---: | ---: | ---: | ---: |
| bkt | 0.56560806 | 0.19133217 | 0.72857236 | 0.71670896 | 0.01331319 |
| historico_suavizado | 0.58257659 | 0.19903983 | 0.71359450 | 0.69396955 | 0.04814897 |
| taxa_global | 0.64614090 | 0.22686015 | 0.50000000 | 0.65243088 | 0.00976320 |
| taxa_habilidade | 0.62544293 | 0.21774701 | 0.61037140 | 0.66338320 | 0.01220171 |

Os IC95% do BKT foram 0.552316 a 0.579110 para log-loss e 0.185497 a 0.197276 para Brier. O bootstrap pareado, com 2.000 reamostragens de estudantes, encontrou delta BKT menos taxa por habilidade de log-loss entre -0.073389 e -0.048882. Para Brier, o intervalo foi -0.032687 a -0.021343. Esses intervalos favorecem o BKT na comparação primária.

O histórico suavizado também obteve log-loss menor que a taxa por habilidade. A vantagem pontual do BKT sobre esse comparador é 0.016969. A hipótese e os intervalos confirmatórios desta entrega têm como referência a taxa por habilidade. As comparações adicionais são exploratórias.

A ECE micro do BKT foi 0.013313, frente a 0.012202 no baseline. O resultado de erro preditivo favorável convive com ECE pontualmente maior. A ECE macro foi 0.057328. Macro log-loss foi 0.554804, frente a 0.610957. As demais métricas macro estão no JSON.

| Categoria | Habilidades |
| --- | ---: |
| A | 21 |
| B | 14 |
| C | 21 |
| D | 0 |

Os intervalos por habilidade usam 1.000 reamostragens de estudantes. São intervalos marginais e as categorias têm caráter descritivo experimental, sem controle familiar de 56 comparações. O CSV registra suportes, parâmetros, diagnóstico, validação, teste, intervalos e justificativas de cada decisão.

Dos 8131 itens distintos do teste selecionado, 7929 aparecem no treino e 202 são inéditos em relação ao estoque completo de treino retido. A pergunta principal diz respeito a estudantes novos. Os recortes de itens novos, primeira resposta, comprimentos, repetição, poucos dados, fronteiras e padrões extremos são descritos por máscaras pré-especificadas. A seleção de estudantes extremos usa seu resultado observado somente para descrição, sem alteração dos modelos.

A log-loss do BKT na primeira resposta foi 0.644189, frente a 0.670888. Todas as métricas dos recortes e seus suportes constam em avaliacao_final.json e no gráfico 09. Os subgrupos recebem estimativas pontuais e não herdam automaticamente os intervalos globais.


# Auditoria e situação da revisão externa

A auditoria dos dados verificou hashes, contratos, critérios de limpeza já congelados, suportes, ordenação, seleção de habilidades apenas no treino e ausência de estudantes compartilhados. Os 25 testes anteriores passaram. O gate desta missão reexecutou verificações críticas da Fase 01 por inspeção de esquema e hash, reconciliação e elegibilidade. Os testes da Fase 02 foram reexecutados integralmente. Os rótulos de teste não foram usados para seleção de modelos ou calibradores.

O forward novo foi escrito com equações próprias e conferido em todos os eventos de treino, em 126 sequências exatas e em sequências longas. A conferência final recalculou métricas com fórmulas diretas e ranks do SciPy, verificou a origem de cada previsão e os registros de abertura do teste. Os resultados desse replay estão em auditoria_resultados.json.

A primeira checagem de AUC falhou na reprodução da validação por diferença de ranks em probabilidades quase empatadas. A correção da convenção de empate ocorreu antes do congelamento e está documentada. A primeira tentativa do notebook falhou porque o arquivo de dependências ainda não tinha sido incluído na pasta de trabalho. O arquivo foi adicionado e a execução foi repetida. A alteração foi de empacotamento, com os códigos científicos congelados preservados. Os logs originais permanecem na entrega.

O Claude Code estava disponível no ambiente. A chamada com ferramentas desativadas, destinada apenas à inspeção do código e sem dados individuais, excedeu o limite de 120 segundos. Seu status real é nao_concluida. A reprodução integral e a avaliação no Claude estão pendentes. A tabela comparativa mantém NA nos resultados externos. O pacote contém o roteiro de duas etapas, especificação matemática, comandos, critérios e tolerâncias.

Esta missão tem testes automatizados e auditoria por implementação separada sob a mesma autoria. A revisão humana científica externa continua pendente. O notebook executado foi Jupyter local. A execução no serviço Google Colab permanece sem comprovação.
