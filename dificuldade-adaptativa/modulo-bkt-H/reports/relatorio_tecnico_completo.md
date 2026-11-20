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


# Recuperação de reprodução

Os três ZIPs anteriores foram extraídos em diretórios separados e conferidos por CRC e SHA-256. Os manifestos cobrem 54, 249 e 358 membros respectivamente, além dos próprios SHA256SUMS. O CSV disponível tem 64.412.812 bytes e SHA-256 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. Os oito arquivos privados originais também foram localizados e conferidos.

O novo modo source-only parte exclusivamente desse CSV e do código original da Fase01 incorporado, com as mesmas regras de limpeza. Seus identificadores alternativos são HMACs determinísticos com uma chave de reprodução derivada da edição. Essa chave pública de reprodução não oferece garantia de anonimização e os IDs individuais permanecem fora do ZIP.

A identidade canônica de um estudante usa sua menor ordem global de evento retido. Ela normaliza os IDs entre as representações, preservando item, habilidade, resultado, ordem, split e origem. Os eventos são ordenados por source_row e as sequências por habilidade e primeira ordem. Os hashes canônicos dos oito artefatos coincidiram. Isso permite testar a equivalência sem usar a chave privada anterior.

O modo alternativo reproduziu 214.417 eventos, 4.003 estudantes, 56 habilidades e a divisão 2.802/601/600. Os agregados completos são idênticos. Os hashes de arquivos pseudonimizados diferem, com somente exclusoes.csv igual. Uma execução adicional com a chave original reproduziu todos os oito hashes individuais.

O ajuste usou o algoritmo original da Fase02, com 20 inicializações, 500 iterações, ftol 1e-9 e restrições originais. Os 56 conjuntos de parâmetros e as perdas foram reproduzidos exatamente. As tolerâncias de aceitação, fixadas antes da comparação, são 1e-4 e 1e-8. Os modelos originais foram preservados e não houve procura por números melhores.

Uma execução integral em ambiente virtual limpo foi concluída a partir apenas do CSV e sem a chave anterior. O arquivo execucao_source_only.json registra comandos, durações, saídas e códigos de retorno. Os testes finais posteriores também cobrem a correção do adaptador de contrato.


# Comparação com o histórico suavizado

Esta análise foi solicitada depois da avaliação original e tem caráter posterior ao teste. As previsões foram regeneradas dos históricos reconstruídos, com parâmetros oficiais preservados e origem alinhada por event_id. A probabilidade foi calculada antes da resposta. O baseline é (acertos anteriores + 2·taxa de treino da habilidade)/(oportunidades anteriores + 2), reproduzindo a Fase03.

O bootstrap reamostra estudantes inteiros com reposição e mantém todos os seus eventos. Foram 2.000 réplicas, com semente 20261111 no total, 20261112 na faixa baixa e 20261113 na alta. O intervalo usa os percentis 2,5 e 97,5. O resultado é ponderado por evento em cada amostra.

| Grupo | Estudantes | Eventos | Delta log-loss BKT − histórico | IC95% | Resultado |
| --- | ---: | ---: | ---: | --- | --- |
| Geral | 585 | 29948 | -0.01696853 | [-0.02184936, -0.01145902] | vantagem_BKT |
| Taxa ≤10% | 40 | 343 | 0.11144977 | [0.04938568, 0.16166079] | vantagem_historico |
| Taxa ≥90% | 92 | 822 | 0.02523110 | [0.01498192, 0.03660610] | vantagem_historico |

A log-loss global foi 0.56560806 para BKT e 0.58257659 para histórico. A diferença favorece BKT nesse conjunto, com o intervalo inteiramente negativo. Nos dois grupos extremos, os intervalos são positivos e favorecem o histórico suavizado. Esses grupos são definidos pela taxa observada de acerto no teste, com fronteiras inclusivas de 10% e 90%, para reproduzir os recortes anteriores. Isso serve à descrição e não foi usado para escolher parâmetros ou a política desta missão.

Os intervalos de Brier e todas as réplicas estão no JSON. A vantagem global não sustenta superioridade universal por estudante nem demonstra recomendação pedagógica melhor. O teste era público para esta missão e a seleção do comparador ocorreu após a auditoria. Uma confirmação prospectiva deve usar novas observações.


# Motor e arquitetura confirmada

Foram inspecionados package.json, o contrato Api, types.ts, mock/engine.ts e http/client.ts do frontend disponível. Ele usa Next.js 16.4.3 e React 19.3.0. O contrato confirma enviarResposta, EnvioResposta e Correcao. A implementação HTTP lança indisponível em todas as operações. O material disponível contém um mock local e o backend real não foi confirmado.

A entrega implementa um módulo Python independente com adaptador para registrar uma correção autorizada, persistência SQLite e controle por estudante, namespace, habilidade e versão. O ID canônico da tentativa vem da correção do servidor e pode ser diferente da chave idempotente enviada pelo cliente. A primeira versão do adaptador exigia igualdade entre esses campos. O teste de regressão demonstrou essa restrição indevida e a correção preservou a distinção do contrato real.

A transação reúne estado, recibo idempotente e eventual oferta. O intervalo entre ofertas é contado por respostas processadas, independentemente dos saltos de order_id. Um teste reproduziu ofertas excessivas quando a distância entre IDs era usada como contagem. A correção passou a persistir last_offer_count, com migração transacional que recupera a contagem de recibos anteriores sem perder o estado. Tentativas repetidas com o mesmo conteúdo devolvem o recibo original. Reutilização conflitante ou entre estudantes é rejeitada. A ordem deve ser estritamente posterior à última observação. O identificador da versão inclui modelos, gate e política, isolando estados entre versões. Uma falha injetada antes do recibo confirmou rollback integral. Dezesseis chamadas concorrentes da mesma tentativa resultaram em um único evento persistido.

O motor retorna domínio anterior, previsão anterior, posterior, domínio para a próxima oportunidade, versão, elegibilidade, estratégia e motivo. Para fallback, os campos de domínio são nulos e a previsão usa taxa suavizada Beta(1,1). A sugestão de faixa conserva a preferência até aceite ou escolha manual explícita. Ofertas têm dono e revisão do estado, com rejeição de aceite cruzado ou oferta desatualizada.

A lista operacional permite 20 habilidades externas e usa fallback para 36. As cinco com G≥0,5, as sete de fronteira e os casos de evidência insuficiente estão protegidos. Adotei adicionalmente o bloqueio de intervalos amplos de parâmetros, porque a política usa domínio latente. Esse gate é mais conservador que a categoria preditiva A/B. Todas as habilidades ENEM sem mapeamento validado usam fallback.

A demo usa IDs e respostas sintéticos claramente identificados e parâmetros reais. Ela verificou dez eventos, replay, reinício e fallback ENEM. O teste é da interface do módulo. A ligação na aplicação real, autenticação, transações compartilhadas com a correção do backend e um piloto com estudantes continuam pendentes.


# Investigação das políticas de dificuldade

O experimento usa exclusivamente a validação das habilidades que passaram no gate operacional. Foram 2116 sequências em 20 habilidades. Os limiares, os mínimos de observação e os intervalos entre ofertas foram especificados antes do replay. A escolha minimiza reversões e mudanças, com cobertura mínima de 50%. O objetivo é estabilidade das sugestões, sem rótulo observado de dificuldade ideal.

A política de referência usa (acertos+1)/(respostas+2). A candidata usa o domínio BKT após a resposta e a transição. As duas recebem o mesmo histórico, preferência inicial média, margem e disponibilidade assumida das três faixas. A preferência fica fixa no replay, sem aceite automático.

A configuração selecionada foi {'cooldown': 5, 'margin': 0.05, 'minimum_observations': 5, 'thresholds': [0.4, 0.8]}. A política BKT fez 2515 ofertas e 132 reversões. O baseline fez 868 ofertas e 0 reversões. As mudanças de preferência sem aceite foram zero.

A maior frequência e as reversões do BKT não sustentam superioridade da política sobre a regra simples. As respostas observadas foram dadas às questões históricas e não às questões que cada política sugeriria. Os estados iniciais, mínimos de evidência, limites adjacentes, falta de estoque e preferência foram testados em fixtures do módulo.

O ganho preditivo global no ASSISTments é distinto do comportamento das sugestões e de eventual ganho pedagógico no ENEM. A qualidade da recomendação continua indeterminada.


# Testes e ambiente

Os grupos são independentes. A usa somente matemática e política em biblioteca padrão. B usa o CSV e o corpus reconstruído. C verifica os ajustes efetivamente executados. D verifica o motor, o adaptador e a persistência. E verifica perdas e bootstrap com respostas reais.

Na execução completa, o resultado foi {'aprovado': 44}, com 0 falhas e 0 erros. A execução sem dados coletou todos os testes e teve {'aprovado': 31, 'bloqueado': 13}, retornando código 2. Isso identifica bloqueio por dependência e evita aprovação falsa. A e D também foram executados em um venv criado sem pip nem pacotes externos, com {'aprovado': 31}.

A primeira execução de D terminou com um erro de limpeza do arquivo SQLite porque uma conexão aberta no próprio teste não tinha sido fechada. O harness foi corrigido para fechar a conexão. A regressão posterior do adaptador demonstrou a exigência incorreta de igualdade entre ID de tentativa do servidor e chave do cliente, que foi removida. Um teste adicional demonstrou que ordens com saltos encurtavam indevidamente o intervalo entre sugestões. A correção usa contagem de respostas e inclui teste da migração do banco anterior. As falhas e os retestes foram preservados.

Os dados e o treinamento foram reexecutados em ambiente virtual limpo com as dependências fixadas. O relatório ambiente_verificado.json registra versões reais. A análise estatística e o replay usam fontes reais. Os exemplos de integração são sintéticos e não medem desempenho educacional.


# Limitações e pendências

A cronologia externa do congelamento das Fases01–03 não pode ser reconstruída retroativamente. O hash da Missão04 foi comunicado no chat antes de suas análises, mas isso não é um atestado temporal independente nem transforma o teste já público em amostra inédita.

A reprodução com dados foi executada neste ambiente limpo pelo mesmo responsável. O modo source-only permite uma nova auditoria sem chave privada, mas a reexecução desse modo por terceiro e uma revisão científica humana continuam pendentes.

A infraestrutura disponível do Gabaritei confirma frontend e contrato, com cliente HTTP indisponível. O motor e o adaptador foram testados separadamente. A conexão no backend real, sua autenticação, o acoplamento transacional à correção oficial e a implantação continuam pendentes.

Os parâmetros são ASSISTments. O mapeamento pedagógico para o ENEM, a calibração com respostas locais e a adequação das faixas exigem coleta e avaliação próprias. A atualização do domínio usa parâmetros fixos e não implementa retreinamento periódico.

O BKT teve vantagem média de previsão, enquanto o histórico suavizado foi melhor nos grupos extremos. As políticas não têm desfechos observados para suas recomendações. As diferenças de sugestões não demonstram melhora de aprendizagem. As categorias anteriores são descritivas e os efeitos da política de parada do tutor acompanham a interpretação de T.


# Parecer

**APROVADO COM RESSALVAS para o módulo independente experimental e a reprodução source-only.**

A preparação a partir do CSV foi reconstruída com equivalência lógica completa, sem depender da chave original. Os 56 modelos e perdas foram reproduzidos exatamente. Os 44 testes finais passaram, com bloqueios devidamente identificados na execução sem dados.

A comparação posterior ao teste encontrou delta de log-loss -0.01696853, com IC95% de -0.02184936 a -0.01145902, a favor do BKT na média. Nos dois grupos extremos o histórico suavizado foi superior. A prova de conceito mantém modelo, estado, versão, idempotência, ordem e consentimento verificáveis.

O gate operacional permite 20 habilidades externas e encaminha 36 a fallback. O vínculo com ENEM permanece bloqueado para controle por BKT sem mapeamento validado. A política BKT fez mais ofertas e reversões que a regra simples, de modo que a superioridade da recomendação de dificuldade continua sem demonstração.

O parecer não encerra a integração na aplicação real, a validação pedagógica, a revisão humana e a prova externa de anterioridade histórica. Esses itens permanecem explícitos nos relatórios e no roteiro de auditoria.
