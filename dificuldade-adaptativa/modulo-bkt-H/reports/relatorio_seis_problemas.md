# Tratamento integral da auditoria do Claude

A auditoria fornecida tem oito páginas. Seu quadro de gravidade contém nove linhas, sendo três de gravidade alta, quatro médias e duas baixas. Os seis primeiros apontamentos foram tratados como prioritários, incluindo a linha de testes que continua na página 7. As outras três ressalvas também receberam análise. A matemática e o treinamento existentes foram preservados e a execução de treinamento teve finalidade de reprodução.

| Prioridade | Problema | Tratamento e evidência | Situação |
| --- | --- | --- | --- |
| P1 | Reprodução externa inviável com o pacote entregue | Reconstrução somente a partir do CSV verificado; identidades alternativas determinísticas e hashes canônicos sem chave antiga. Evidência em reports/reconstrucao.json; reports/execucao_source_only.json; reports/reproducao_treinamento.json; tests/B_dados; tests/C_treinamento. | CORRIGIDO_NO_MODO_SOURCE_ONLY |
| P2 | Comparação principal limitada a baseline por habilidade | Delta pareado BKT menos histórico suavizado, 2000 reamostragens de estudantes, incluindo os dois grupos extremos. Evidência em reports/comparacao_estatistica.json; evidence/logs/comparacao_estatistica.log; tests/E_avaliacao. | COMPLEMENTADO_POS_HOC_GANHO_GLOBAL_E_CONTRAPONTOS |
| P3 | Conclusões não demonstram aplicação ao Gabaritei e ENEM | Inspeção do frontend real, adaptador para Envios/Correção, motor independente com SQLite e namespace ENEM encaminhado a fallback. Evidência em integration/contrato_frontend.json; bkt04/adaptador.py; bkt04/motor.py; reports/demo_integracao.json; tests/D_integracao. | MITIGADO_NO_MODULO_APLICACAO_REAL_PENDENTE |
| P4 | Parâmetros pouco plausíveis atravessam as categorias históricas | Gate operacional adicional bloqueia G≥0.5, S≥0.5, fronteira, categoria C/D, intervalos amplos e evidência preditiva insuficiente. Evidência em models/elegibilidade_integracao.json; reports/elegibilidade_habilidades.csv; tests/D_integracao/test_engine.py. | CORRIGIDO_COM_GATE_CONSERVADOR |
| P5 | Anterioridade do protocolo histórico não tem prova externa | Preservação do protocolo anterior; nova análise é explicitamente posterior ao teste; hash da Missão04 registrado no chat antes das análises. Evidência em reports/protocolo_missao04.json; evidence/protocolo_hash.json; comunicação no chat. | LIMITACAO_HISTORICA_PENDENTE_MITIGACAO_NESTA_RODADA |
| P6 | Suítes dependem dos dados privados para coleta e execução | Grupos independentes A matemática, B dados, C treino, D integração e E avaliação; ausência vira bloqueio e código 2. Evidência em testar.py; evidence/tests/all.json; evidence/tests/sem_dados.json; evidence/tests/stdlib_AD.json. | CORRIGIDO_COM_GRUPOS_INDEPENDENTES |

## P1 · Reprodução externa inviável com o pacote entregue

Tratamento aplicado. Reconstrução somente a partir do CSV verificado; identidades alternativas determinísticas e hashes canônicos sem chave antiga.

Critério de aceitação. 346860 brutos, 214417 válidos, 4003 estudantes, 56 habilidades, split 2802/601/600 e oito representações lógicas iguais; modelos dentro de 1e-4 e NLL 1e-8.

Critério de reprovação. Qualquer divergência não explicada de fonte, eventos, sequências, split, seleção ou parâmetros.

Evidências. reports/reconstrucao.json; reports/execucao_source_only.json; reports/reproducao_treinamento.json; tests/B_dados; tests/C_treinamento

Estado registrado. CORRIGIDO_NO_MODO_SOURCE_ONLY

## P2 · Comparação principal limitada a baseline por habilidade

Tratamento aplicado. Delta pareado BKT menos histórico suavizado, 2000 reamostragens de estudantes, incluindo os dois grupos extremos.

Critério de aceitação. IC95 superior <0 favorece BKT nesse grupo; IC contendo zero é inconclusivo; IC inferior >0 favorece histórico.

Critério de reprovação. Alegar ganho sem perdas individuais alinhadas, quebrar agrupamento por aluno ou apresentar análise como pré-registrada.

Evidências. reports/comparacao_estatistica.json; evidence/logs/comparacao_estatistica.log; tests/E_avaliacao

Estado registrado. COMPLEMENTADO_POS_HOC_GANHO_GLOBAL_E_CONTRAPONTOS

## P3 · Conclusões não demonstram aplicação ao Gabaritei e ENEM

Tratamento aplicado. Inspeção do frontend real, adaptador para Envios/Correção, motor independente com SQLite e namespace ENEM encaminhado a fallback.

Critério de aceitação. Interface, persistência e consentimento passam nos testes; implantação real exige backend conectado e evidência local ENEM.

Critério de reprovação. Declarar modelo calibrado no ENEM ou integração na aplicação sem execução na aplicação real.

Evidências. integration/contrato_frontend.json; bkt04/adaptador.py; bkt04/motor.py; reports/demo_integracao.json; tests/D_integracao

Estado registrado. MITIGADO_NO_MODULO_APLICACAO_REAL_PENDENTE

## P4 · Parâmetros pouco plausíveis atravessam as categorias históricas

Tratamento aplicado. Gate operacional adicional bloqueia G≥0.5, S≥0.5, fronteira, categoria C/D, intervalos amplos e evidência preditiva insuficiente.

Critério de aceitação. Os cinco G altos e sete casos de fronteira usam fallback; nenhum caso bloqueado recebe domínio BKT para controlar dificuldade.

Critério de reprovação. Categoria A/B autorizar sozinha a política ou algum bloqueado operar como BKT.

Evidências. models/elegibilidade_integracao.json; reports/elegibilidade_habilidades.csv; tests/D_integracao/test_engine.py

Estado registrado. CORRIGIDO_COM_GATE_CONSERVADOR

## P5 · Anterioridade do protocolo histórico não tem prova externa

Tratamento aplicado. Preservação do protocolo anterior; nova análise é explicitamente posterior ao teste; hash da Missão04 registrado no chat antes das análises.

Critério de aceitação. Para futura confirmação prospectiva, exigir registro verificável externo anterior ao acesso a dados novos.

Critério de reprovação. Tratar logs próprios ou registro criado depois como prova retroativa de anterioridade das Fases01–03.

Evidências. reports/protocolo_missao04.json; evidence/protocolo_hash.json; comunicação no chat

Estado registrado. LIMITACAO_HISTORICA_PENDENTE_MITIGACAO_NESTA_RODADA

## P6 · Suítes dependem dos dados privados para coleta e execução

Tratamento aplicado. Grupos independentes A matemática, B dados, C treino, D integração e E avaliação; ausência vira bloqueio e código 2.

Critério de aceitação. A/D passam em venv só com biblioteca padrão; coleta completa sem dados distingue aprovados e bloqueados; com dados todos passam.

Critério de reprovação. Erro de importação por variável ausente, ausência de coleta ou contagem de bloqueados como aprovados.

Evidências. testar.py; evidence/tests/all.json; evidence/tests/sem_dados.json; evidence/tests/stdlib_AD.json

Estado registrado. CORRIGIDO_COM_GRUPOS_INDEPENDENTES

## R7 · Calibração

A auditoria registrou ECE de 0,0133 no BKT e 0,0122 na taxa por habilidade, com excesso de confiança em parte da ponta baixa. A Missão04 preservou as probabilidades e os parâmetros publicados. O calibrador anterior havia sido rejeitado na validação. O gate de integração adiciona controle de plausibilidade e incerteza, e toda habilidade ENEM sem mapeamento validado segue por fallback. Isso é uma mitigação de uso. A calibração em dados locais permanece pendente. O critério futuro é avaliar calibração em validação local e observar desempenho em uma amostra posterior, com a configuração previamente definida.

## R8 · Comparações múltiplas

As 56 categorias originais foram preservadas como triagem descritiva com intervalos marginais, sem reivindicação de controle familiar. A elegibilidade operacional é uma camada de requisitos adicionais. O novo intervalo global versus histórico foi solicitado após a avaliação original e é descrito como análise posterior. Os dois grupos extremos também são análises exploratórias. O critério de reprovação é apresentar esses resultados como confirmação originalmente pré-registrada ou como proteção contra todos os falsos positivos.

## R9 · Política do tutor

A coleta ASSISTments usa prática guiada e parada por domínio. T reflete as transições entre oportunidades retidas sob esse processo. A reprodução conserva o desenho sem esquecimento. O replay das sugestões usa respostas reais previamente observadas, mas os resultados das questões que seriam recomendadas não foram observados. O critério de aceitação é manter essas condições explícitas. Afirmar ganho causal de aprendizagem ou transferência automática ao ENEM reprovaria a conclusão.
