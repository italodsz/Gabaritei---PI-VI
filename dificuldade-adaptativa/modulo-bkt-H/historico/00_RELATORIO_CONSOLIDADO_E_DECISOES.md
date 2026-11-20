# Gabaritei PI VI · Relatório consolidado e registro de decisões

**Data de referência** · 09/11/2026  
**Escopo** · Auditoria do catálogo ENEM, dificuldade dos itens, arquitetura adaptativa, testes e decisões das cinco fases.

## 1. Estado atual

| Fase | Estado | Evidência |
| --- | --- | --- |
| 1 · Auditoria dos dados | **Aprovada pelo usuário** | Dataset fixado por revisão e hash, notebook executado, três testes e reprodução documentada |
| 2 · Arquitetura e experimentação | **Em revisão** | Modelos de dificuldade treinados, BKT ajustado externamente, experimentos incrementais separados e prova de conceito offline do BKT + margem |
| 3 · Personalização por estudante | Planejada | Protótipos e históricos sintéticos. Faltam eventos reais do Gabaritei e autorização de abertura |
| 4 · Aprendizado contínuo | Planejada | Alteração global de pesos demonstrada no ASSISTments, com ganho inconsistente. Falta validação em serviço no Gabaritei |
| 5 · Progressão e integração | Planejada | Contratos e testes offline por ID. Integração produtiva com Ítalo pendente |

Ítalo seleciona questões semanticamente relevantes. O módulo adaptativo propõe uma faixa e preserva a escolha explícita. Dificuldade do item, domínio estimado e decisão de sugerir outra faixa são variáveis distintas. Um erro isolado em item difícil não estabelece domínio baixo. Um acerto após repetição não comprova transferência de aprendizagem.

## 2. Registro de decisões

O registro segue a sequência do projeto. As orientações recuperadas estão no [índice de anexos](INDICE_ORIENTACOES.md) e no [volume de orientação](01_ORIENTACAO_TODAS_AS_FASES.md).

| Nº | Decisão | Motivo e consequência | Situação |
| ---: | --- | --- | --- |
| 01 | Auditar o catálogo antes de escolher modelos | Separar itens existentes, elegíveis para texto e exibíveis | Concluída na Fase 1 |
| 02 | Fixar dataset e reproduzir por hash | O primeiro pacote dependia de uma base já instalada. A preparação documentada permitiu reproduzir em cópia limpa | Aprovada na Fase 1 |
| 03 | Exigir aprovação explícita entre fases | A Fase 2 preliminar começou antes da aprovação. Preservamos os experimentos e regularizamos a entrega anterior | Vigente |
| 04 | Preservar a main e o controle de Git do usuário | Houve autorização específica para publicar a Fase 1 na branch própria. O usuário manteve a decisão de merge | Vigente. Autorizações antigas não se estendem às demais rodadas |
| 05 | Separar dificuldade da recuperação semântica | Ítalo escolhe candidatos. O módulo adaptativo sugere nível | Vigente |
| 06 | Usar TRI como alvo na classificação de dificuldade | Incluir os próprios parâmetros na previsão desse alvo geraria vazamento. Dificuldade conhecida pode entrar na tarefa distinta de previsão de acerto | Vigente |
| 07 | Preservar baseline e encoders promissores | TF-IDF + LinearSVC ficou como referência leve. MiniLM e BERTimbau mereceram atenção. Qwen 0.6B e BGE-M3 ficaram como comparações históricas | Referências experimentais |
| 08 | Evitar promoção pelo melhor número isolado | O melhor BERTimbau mudou também a representação textual, e o IC pareado incluiu zero. O teste de 2024 já foi consultado | Vigente |
| 09 | Auditar rótulos antes de personalizar por eles | Assunto foi inferido por regras. Validade formal e coincidência tabular de habilidade não certificam a associação pedagógica | Vigente |
| 10 | Conferir todas as edições e preservar o original | A auditoria só de 2024 era insuficiente. Sugestões e recuperações ficaram em derivados com IDs e fontes | Vigente |
| 11 | Separar busca textual, exibição e seleção adaptativa | A recuperação operacional passou a exigir enunciado, opções, gabarito, apoio e origem | Vigente |
| 12 | Limitar a dificuldade à escala local | Os 41 itens com faixa pertencem a três recortes de ano, prova e área. A equivalência global não foi demonstrada | Vigente no protótipo |
| 13 | Usar metadados opcionais conforme a confiança | Faixa local permite atualizar BKT por escala. Rótulo sustentado sem faixa permite histórico contextual. Área e resposta permitem prática geral | Demonstrada funcionalmente |
| 14 | Investigar estimadores e políticas com papéis separados | BKT, Elo, Rasch e SGD foram examinados em tarefas diferentes. As métricas não são intercambiáveis | Investigação registrada |
| 15 | Manter SGD incremental como experimento separado | Os pesos mudaram em dados externos, com ganho inconsistente em previsão posterior | Vigente |
| 16 | Manter BKT sensível ao item + margem como candidata congelada | Houve ganhos em simulação e preservação de consentimento. A arquitetura final segue em revisão | Candidata bkt_politica_1_4_0.09 |
| 17 | Exigir comparação direta com regra simples | Acrescentamos a regra de taxa suavizada sob os mesmos cenários e sementes históricos | Executada em simulação retrospectiva |
| 18 | Conferir cobertura antes do teste com IDs reais | Só dois recortes de Humanas comportam dez itens em faixas mistas. Natureza tem nove no melhor recorte. Linguagens e Matemática não têm faixa operacional | Concluída |
| 19 | Autorizar adaptador isolado e simulação offline | O usuário autorizou testes sem alterar parâmetros. As seis novas sementes não foram usadas para ajustar a candidata | Executada |
| 20 | Separar viabilidade funcional de qualidade | A prova de conceito funcionou em Humanas. Falsas mudanças subiram nos oito recortes e todas as trajetórias BKT esgotaram a faixa escolhida | Parecer atual |
| 21 | Separar aviso de estoque de sugestão pedagógica | Falta de questões não informa domínio. Outra faixa pode ser apresentada como opção explícita para continuar | Proposta para a próxima rodada |
| 22 | Publicar os dois denominadores de acerto | O melhor 57,88% entre oportunidades avaliadas equivaleu a 22,19% no horizonte completo | Decisão de reporte |
| 23 | Condicionar aprovação a treino e avaliação integrada comprovados | Ajuste externo, atualização de estado e busca de margem têm provas próprias. O chat de revisão confirmou que não treinou nem reproduziu o conjunto integrado | Fase 2 em revisão |

## 3. Trabalho realizado e resultados

### Auditoria e recuperação

A revisão do dataset é `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`. O SHA-256 normalizado é `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Foram auditadas **2.971 questões de 2009 a 2024**. O recorte textual de **2.063** tinha 1.801 de treino, 136 de validação e 126 de teste. Os cortes iniciais de b, definidos só no treino, foram 0,80054 e 1,56301.

| Rodada | Resultado | Decisão de uso |
| --- | --- | --- |
| Pré-auditoria de rótulos | 300 itens, com 279 sinais inconclusivos, 14 compatíveis e sete concorrentes | Sem estimativa independente da taxa de erro pedagógico |
| TRI e revisão integral | 2.971 conjuntos de parâmetros coincidiram com as tabelas, com 46 alertas heurísticos. 560 assuntos e 192 habilidades ausentes. Revisão posterior marcou 55 suspeitos e 18 sugestões | Preservar rótulos originais e manter adjudicação humana pendente |
| MVP A/B/C/D | 9 prioritárias, 1.305 condicionadas, 1.653 em revisão e 4 bloqueadas | Demonstração técnica curta, sujeita a direitos |
| Recuperação multitararefa | 2.032 aptas a texto, 14 à recomendação e 12 à demo | Separar evidência textual de exibição |
| Catálogo operacional | **112 prontas, 2.822 condicionais, 37 bloqueadas** | **41** com faixa local. Só uma dessas também tem assunto e habilidade tecnicamente sustentados |

A recuperação operacional consultou 32 pares oficiais de prova e gabarito, inspecionou oito itens e reabriu dois recortes de apoio. Foram 98 novas prontas em relação à rodada anterior. Os 112 registros ainda dependem de conferência de direitos e teste de apresentação antes do uso com estudantes.

### Classificação da dificuldade do item

Na validação de 2023, o Macro-F1 foi **0,4188** para TF-IDF de caracteres, **0,4710** para MiniLM, **0,4548** para Qwen 0.6B, **0,4350** para BGE-M3 e **0,5223** para o melhor BERTimbau parcialmente ajustado, com 78/136 acertos. MiniLM com assunto e habilidade chegou a **0,4923**, com intervalo pareado incluindo zero. Assunto sozinho piorou as configurações comparadas.

A investigação incluiu 36 configurações reformuladas, fine-tuning, cabeças ordinais, regressão Ridge, ablações, truncamento e erros por classe. A classe média seguiu difícil. Os resultados medem a dificuldade do item. Os protocolos, falhas e métricas estão no [relatório extenso de testes](02_RELATORIO_EXTENSO_DOS_TESTES.md) e no [anexo numérico](03_ANEXO_RESULTADOS.md).

### Domínio individual e política

Os quatro parâmetros do BKT foram ajustados historicamente no ASSISTments. A variante sensível à dificuldade reaproveitou esses parâmetros e alterou as emissões conforme a dificuldade de entrada. Em **4.808 eventos de 26 estudantes** externos, o SGD congelado fez AUC **0,6396** e Log Loss **0,5797**. O atualizado fez **0,6344** e **0,5800**. Ensaios separados registraram mudança global de coeficientes em dez lotes por taxa. DKT foi investigado como alternativa e ficou sem treino registrado.

Na simulação inicial, a regra simples fez 34,22% e o híbrido BKT + SGD, 32,42%. BKT sensível com persistência ganhou em alguns cenários, abaixo do ganho mínimo daquela rodada. Buscas seguintes testaram persistência, margem e filtros. A configuração congelada passou a usar quatro famílias mínimas, intervalo de uma observação, salto máximo de dois níveis e margem de 0,09 diante do alvo experimental de 0,70.

A comparação retrospectiva direta mostrou ganhos de **11,81 a 17,06 pp** frente à regra simples, com mais falsas mudanças nos quatro cenários. O ensaio reutilizou sementes consultadas e manteve a cadência original de cada método. Isso motivou a verificação com inventário real.

## 4. Último ensaio offline com IDs reais

Foram usados IDs ENEM e **respostas sintéticas identificadas**. As faixas ordinais da mesma prova foram ligadas às três âncoras sintéticas por configuração explícita. O b bruto não foi convertido automaticamente. Não houve treino, alteração dos parâmetros ou atualização global de pesos.

| Verificação | Resultado |
| --- | --- |
| Funcionais A, B, D, E, F, G e J | Sete passaram. Cobriram elegibilidade, diagnóstico, dificuldade, rótulos ausentes, repetição, consentimento e contrato por IDs |
| Funcional C | Bloqueado por cobertura. Matemática carece de faixa operacional |
| Questões usadas | 10 IDs distintos atualizaram BKT nos funcionais, dois serviram para prática e um para histórico contextual. H/I usou 32 IDs distintos de Humanas |
| Consentimento | Zero alterações sem aceite. 495 mudanças aceitas no braço BKT sob regra sintética |
| Abstenção e estoque | 3.361 de 5.458 oportunidades avaliadas sem oferta. 2.304 encerramentos por esgotamento da faixa escolhida |
| Comparação | 288 trajetórias por método e cenário, oito cenários, seis sementes novas. Ganho de **7,29 a 21,31 pp** contra a regra simples entre oportunidades avaliadas |
| Melhor recorte | **639/1.104 = 57,88%** entre oportunidades avaliadas e **639/2.880 = 22,19%** sobre o horizonte previsto |
| Falsas mudanças | Aumento nos oito recortes. No logístico fixo de CH 2018, **11/336 → 120/336**, ou **3,27% → 35,71%** |
| Controle de cadência | Aproximou frequência e mínimo de evidência, preservando diferenças de margem e salto. No logístico com aceite de CH 2018, o IC de ganho incluiu zero |

A bancada encerrou a trajetória quando não restaram questões elegíveis na faixa escolhida. Podiam restar itens em outras faixas. O protocolo preservou a escolha, mas não testou o fluxo de oferecer outra faixa apenas para continuar a sessão. O limite exploratório de +5 pp de falsas mudanças segue sem aprovação formal.

O [relatório do ensaio](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/RELATORIO.md), os [resultados estruturados](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/simulacao.json) e o [log funcional](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/testes.log) guardam os detalhes. O [parecer de cobertura](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/revisao_operacional_bkt/06_PARECER.md) registra a etapa anterior à autorização de execução.

## 5. Parecer e pendências

**Manter** o adaptador offline e a candidata para uma prova de conceito restrita por área e escala local em Humanas. **Manter em revisão** a adequação das sugestões. Uma nova avaliação precisa separar os efeitos de cadência e estoque, com regras de segurança definidas antes do teste. Reportar acerto, falsas mudanças, cobertura, abstenção, aceite e desempenho no horizonte previsto.

Para considerar aprovação ainda faltam evidência de treino e avaliação integrada, com alegações compatíveis com o domínio dos dados. Atualização de estado, ajuste externo do BKT e atualização global de SGD são evidências distintas. Validação educacional requer eventos reais e consentidos do Gabaritei. Uso produtivo também exige verificação de direitos, candidatos disponíveis e contrato no fluxo real.

Esta consolidação incorporou os resultados já salvos e as decisões da conversa. Não houve nova rodada experimental nem nova aprovação.
