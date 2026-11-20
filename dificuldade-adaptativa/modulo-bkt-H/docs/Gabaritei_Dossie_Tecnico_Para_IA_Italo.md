# Gabaritei — Dossiê técnico para a IA do Ítalo

Consolidação documental: 11/11/2026. Projeto PI VI. Módulo de dificuldade orientado por Gabriel.

## Como usar este arquivo

Este é o arquivo único solicitado para transferir o contexto técnico ao Ítalo ou ao chat responsável pela integração. Reúne, integralmente, os nove documentos identificados abaixo, preservando seus resultados e limitações. Não é uma nova rodada experimental nem transcrição literal de todo o chat. Os documentos de origem continuam no pacote para consulta separada.

O dossiê anterior estava distribuído em vários arquivos; o nome `Gabaritei_Dossie_Tecnico_Para_IA_Italo.md` ainda não existia na entrega. Esta atualização corrige essa ausência documental. Código, modelos, parâmetros e configurações permanecem com o mesmo conteúdo.

## Estado que deve ser preservado na continuidade

- A branch de destino é `dificuldade-adaptativa`; o pacote acrescenta somente `dificuldade-adaptativa/modulo-bkt-H`.
- O módulo de Gabriel recomenda faixa de dificuldade; Ítalo mantém a seleção e a relevância das questões.
- Os modelos BKT treinados são externos, do ASSISTments, sem validação de transferência para o ENEM. No fluxo ENEM entregue há fallback histórico identificado.
- A candidata antiga sensível ao item e o BKT clássico das Missões 01–04 são linhagens distintas, preservadas com seus parâmetros próprios.
- TRI b classifica o item; domínio do aluno é outro conceito. Cortes globais históricos, cortes arredondados e tercis por área não são configurações intercambiáveis.
- Sugestões nunca alteram a escolha sem aceite. Atualização do estado individual não comprova aprendizado contínuo global.
- A Fase 2 permanece em revisão. A numeração das missões científicas BKT não autoriza avanço das fases do produto. Não publicar, treinar ou integrar automaticamente com base neste dossiê.
- Testes funcionais aprovados não demonstram eficácia pedagógica no ENEM. Exemplos sintéticos estão identificados; respostas reais do Gabaritei continuam ausentes.

## Conteúdo consolidado

1. Visão executiva e decisões — origem: `docs/RELATORIO_EXECUTIVO.md`.
2. Arquitetura, modelos, parâmetros e evidência científica — origem: `docs/RELATORIO_TECNICO.md`.
3. Contratos de integração com Ítalo e backend — origem: `docs/CONTRATOS_INTEGRACAO.md`.
4. Requisitos: decisão versus implementação — origem: `docs/MATRIZ_REQUISITOS.md`.
5. Branches e incorporação posterior — origem: `docs/BRANCHES_E_INCORPORACAO.md`.
6. Instalação e reprodução — origem: `docs/REPRODUCAO.md`.
7. Resultados efetivamente executados — origem: `docs/RESULTADOS_ENTREGA.md`.
8. Limitações e pendências — origem: `docs/LIMITACOES.md`.
9. Fontes e rastreabilidade — origem: `docs/FONTES.md`.


---

## Parte 1 — Visão executiva e decisões

Documento de origem: `docs/RELATORIO_EXECUTIVO.md`.

### Relatório executivo · entrega consolidada

Data: 11/11/2026. Responsável pela orientação e decisões do módulo: Gabriel. Este relatório confronta decisões com arquivos e testes; não é transcrição integral de conversas nem certificação pedagógica.

#### O que foi construído

Foi recuperado um motor Python que acompanha respostas, guarda o estado entre sessões e pode **sugerir** fácil, média ou difícil. O aluno mantém sua escolha até aceitar. O módulo não seleciona questões: essa responsabilidade permanece com Ítalo. A entrega é uma pasta nova preparada para revisão na branch dificuldade-adaptativa, sem modificar o GitHub.

```text
Correção autorizada pelo futuro backend
        ↓
Histórico individual → BKT externo elegível / fallback ENEM
        ↓
Política: evidência mínima + margem + intervalo + estoque
        ↓
Oferta de faixa → aluno aceita ou recusa
        ↓
Ítalo seleciona questões mantendo seus critérios de relevância
```

Há duas capacidades diferentes. O BKT foi treinado com respostas reais externas do ASSISTments e atualiza o estado de cada aluno. Ainda não existe treinamento comprovado nas áreas do ENEM nem retreino contínuo do sistema em produção. Por segurança, a execução ENEM oferecida aqui usa histórico suavizado e o identifica como tal.

#### Decisões preservadas

| Decisão de Gabriel | Situação concreta |
|---|---|
| Dificuldade do item pelo b da TRI | Classificador explícito, com área/escala/versão; os cortes históricos e os do catálogo atual diferem |
| Trabalhar por MT/LC/CH/CN para reduzir falta de estoque | Interface isola áreas; estimativa ENEM ainda é fallback agregado |
| Estimar domínio com BKT | 56 modelos externos treinados, 20 permitidos pelo gate conservador |
| Não impor mudança ao aluno | Oferta, aceite, recusa e escolha manual persistentes e testados |
| Acumular evidência e evitar oscilações | Mínimo 5, margem .05, intervalo 5 respostas; eficácia pedagógica ainda inconclusiva |
| Diagnóstico de 10 questões | Decisão mantida, orquestração do diagnóstico pendente |
| Aprendizado contínuo | Estado individual se atualiza; ciclo global produtivo pendente |
| Preservar outros integrantes e histórico | ZIP acrescenta apenas modulo-bkt-H; nenhum arquivo remoto sobrescrito |

#### Evidência recuperada

No conjunto externo final, 29.948 respostas de 585 estudantes: log-loss BKT **0,5656**, histórico suavizado **0,5826**. A diferença BKT−histórico foi **−0,01697**, IC95% **[−0,02185; −0,01146]**, análise pareada posterior por estudante. Isso favorece a previsão de acerto global nessa base; nos grupos extremos, o histórico foi melhor. Não é taxa de acerto do recomendador ENEM.

No replay de validação da Missão 04, houve 2.515 ofertas BKT e 132 reversões, contra 868 ofertas e zero reversões da referência. Não houve alteração sem aceite. Como as respostas observadas não foram dadas às faixas sugeridas, o ensaio não mede melhoria de aprendizagem ou recomendação real.

Os ensaios antigos com respostas simuladas chegaram a 57,88% em oportunidades avaliadas, mas apenas 22,19% no horizonte completo nesse cenário. Todas as 2.304 trajetórias BKT encerraram por falta de itens na faixa. São alertas de projeto, não resultados de estudantes reais. Os testes dos classificadores textuais também são tarefa distinta: BERTimbau 0,5223 Macro-F1 em 2023 não representa personalização.

#### O que o Ítalo recebe

Código executável sem GPU nem pacotes externos no runtime; modelos, gate e política congelados; exemplo ENEM de dez respostas sintéticas e exemplo BKT externo; testes; instalação passo a passo; contratos; evidências e relatórios anteriores com hashes. A equipe pode extrair, executar e planejar integração. Os logs atuais de verificação estão em `evidence/entrega` e seu resumo em `docs/RESULTADOS_ENTREGA.md`.

#### Decisão de encerramento desta entrega

Entrega de engenharia para revisão, com viabilidade funcional do módulo independente. **Não equivale à aprovação pedagógica da Fase 2, à homologação da Missão 05 ou a um produto integrado.** Faltam conciliação de cortes e contratos, dados reais do Gabaritei, avaliação temporal da política, controle de repetição e ciclo global de retreinamento. Não houve novo treinamento, publicação ou avanço de fase nesta preparação.


---

## Parte 2 — Arquitetura, modelos, parâmetros e evidência científica

Documento de origem: `docs/RELATORIO_TECNICO.md`.

### Relatório técnico consolidado · Gabaritei PI VI

#### 1. Escopo, fontes e parecer

Data da montagem: 11/11/2026. O dossiê enviado por Gabriel foi tratado como contexto e confrontado com GitHub, código local e artefatos executados. Este documento orienta outro engenheiro ou IA sem exigir acesso ao chat. O resultado é uma entrega de engenharia independente para revisão, não homologação pedagógica ou aprovação automática da Fase 2. A sequência BKT01–04 designa missões científicas externas, distinta das Fases 1–5 do produto. Nenhuma fase futura foi executada.

Fontes primárias desta auditoria: `evidence/github/snapshot.json` (árvores e commits), `docs/proveniencia.json` (origem de arquivos), `models` (artefatos congelados), `references/avaliacao_final.json` (avaliação original), `reports/comparacao_estatistica.json`, `reports/politicas_validacao.json`, testes A–F e logs atuais `evidence/entrega`. Relatórios antigos são identificados como históricos e podem conter conclusões superadas; não são prova isolada da execução atual.

#### 2. Recuperação e versões arquiteturais

Existem pelo menos duas linhagens que o nome genérico “BKT + margem” ocultava. Preservá-las separadamente evita atribuir ao motor atual capacidades de outro ensaio.

| Linhagem | Estado e dados | Dificuldade do item | Política |
|---|---|---|---|
| Candidata histórica bkt_politica_1_4_0.09 | Parâmetros globais externos, bancada com perfis/respostas sintéticos; catálogo operacional de 41 itens com faixa local | Emissões transformadas com âncoras provisórias por faixa; não usa b bruto como escala calibrada | Mínimo 4 famílias, intervalo 1, margem .09, salto máximo 2 na busca |
| Missões BKT01–03 | 56 BKT clássicos ajustados separadamente por habilidade ASSISTments | Modelo binário por KC, sem b/a/c | Avaliação de previsão de respostas; não seleciona faixa |
| Missão04 | Motor transacional com os 56 modelos congelados e gate de 20 permitidos/36 fallback | Ainda BKT clássico externo; namespace ENEM força fallback | .4/.8, mínimo 5, margem .05, cooldown 5 respostas, auto_accept false |
| Preparação desta entrega | Mesmo motor/gate/política; fachada explícita por área e classificação TRI com versão; testes adicionais | item_level classifica o item separadamente; não transforma o BKT em modelo sensível ao b | Sem novo ajuste ou busca; consentimento mantido |

A linhagem histórica sensível ao item está em `historico/candidata_margem`, com fonte e entrada mínima reproduzível. Seus testes usam IDs reais de questões e respostas sintéticas; não produzem validação real. O runtime independente principal é o motor da Missão04. Isso é uma organização da evidência existente, não decisão de substituir a candidata nem declaração de superioridade da nova política. Selecionar arquitetura pedagógica final exige revisão formal.

#### 3. Preparação dos dados externos — BKT01

ASSISTments Skill Builder 2009–2010 corrigido/colapsado: 346.860 linhas, SHA-256 `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`. Após filtros: 214.417 eventos, 4.003 estudantes, 101 habilidades. Exclusões sequenciais: 63.755 sem KC, 47.037 multi-KC, 21.643 scaffold e 8 open_response auto-corrigidos. Filtros não devem ser somados a partir de versões diferentes.

Split por estudante com hash determinístico e semente 20261110: 2.802 treino, 601 validação e 600 teste. Critérios de elegibilidade de KC calculados apenas no treino: pelo menos 100 estudantes, 30 sequências com ≥5 eventos, 50 acertos e 50 erros. Selecionadas 56 habilidades. Suporte selecionado: treino 19.370 sequências/143.092 eventos/2.773 alunos; validação 4.253/29.780/596; teste 3.892/29.948/585. Não há alunos compartilhados entre splits.

Os scripts preservados estão em vendor/fase01. Reexecução independente desde o CSV tem modo determinístico sem chave privada histórica. Oito fingerprints canônicos verificam eventos e sequências após normalizar pseudônimos, enquanto agregados devem coincidir exatamente. Não confundir igualdade lógica com igualdade binária dos arquivos pseudonimizados. Os pseudônimos determinísticos permitem reprodução, mas são ligáveis à fonte.

#### 4. Treinamento e matemática — BKT02

Modelo latente binário K∈{0,1}, sem esquecimento. Parâmetros por KC: L0=P(K inicial=1), T=P(aprender|não domina), G=P(acerto|não domina), S=P(erro|domina). Para estado L antes da resposta:

```
p(acerto) = L*(1-S) + (1-L)*G
posterior_acerto = L*(1-S) / p(acerto)
posterior_erro = L*S / (L*S + (1-L)*(1-G))
L_proximo = posterior + (1-posterior)*T
```

Inferência usa probabilidade anterior à resposta para pontuar e normalização Bayesiana estável. MLE/SLSQP: 20 inicializações por habilidade, máximo 500 iterações, ftol 1e-9, epsilon 1e-4, limites e G+S≤.99 conforme configuração original. Convergiram as 1.120 otimizações principais documentadas. Bootstrap de parâmetros histórico: 100 reamostragens por estudante/KC, 5 inicializações, 5.600 reajustes e 28.000 otimizações. Houve 28 habilidades com algum intervalo de parâmetro amplo (> .3) e 7 na fronteira numérica (16,84,91,307,308,322,323). São diagnósticos históricos, não novo treinamento desta entrega.

O artefato models/parametros_originais.json contém os 56 conjuntos L0/T/G/S, suporte e diagnósticos, sem pickle executável. O gate operacional proíbe G≥.5 ou S≥.5, fronteiras e instabilidade elevada; exige categorias históricas A/B, largura preditiva mediana≤.1 e ECE≤.1. Passam 20 KCs; 36 caem em fallback. Os cinco G altos são 51,84,50,58,308, todos bloqueados. Esse gate é conservador e posterior ao teste; não foi escolhido com resultados ENEM.

#### 5. Avaliação externa — BKT03 e correção estatística BKT04

Conjunto final congelado: 29.948 eventos de 585 estudantes. Resultados originais:

| Método | Log-loss | Brier | AUC | Acurácia | ECE |
|---|---:|---:|---:|---:|---:|
| BKT | .5656081 | .1913322 | .7285724 | .7167090 | .0133132 |
| Histórico suavizado | .5825766 | .1990398 | .7135945 | .6939695 | .0481490 |
| Taxa por habilidade | .6254429 | .2177470 | .6103714 | .6633832 | .0122017 |

Baseline científico de histórico: `(acertos_anteriores + 2*taxa_KC_treino)/(n_anteriores+2)`. Não é igual ao fallback operacional Beta(1,1) `(acertos+1)/(n+2)`. Não transportar a vantagem de uma comparação para a outra. AUC histórica usa convenção de ranking/arredondamento registrada nos arquivos; não é acerto do nível fácil/médio/difícil.

Missão04 acrescentou bootstrap **pareado por estudante**, 2.000 réplicas, semente 20261111. Delta LL BKT−histórico −.0169685276, IC95 [−.0218493586; −.0114590235]. Há evidência favorável global nessa previsão externa. Grupo com taxa≤10%: 40 alunos/343 eventos, delta +.1114498, IC [.0493857;.1616608]. Grupo≥90%: 92/822, delta +.0252311, IC [.0149819;.0366061]. Nos extremos, histórico é melhor.

Análise posterior ao teste original; os ICs por KC e categorias A21/B14/C21/D0 são marginais/descritivos, sem correção por múltiplas comparações. Não representam validação ENEM, efeito causal ou redução de falsas mudanças. Revisão humana independente continua necessária.

#### 6. Política da Missão04

Arquivo models/politica_selecionada.json: limiares [.4,.8], mínimo 5, margem .05, cooldown 5, auto_accept false. Grade de validação: limiares (.35,.75)/(.4,.8), mínimo 5/10, intervalo 3/5, margem fixa .05. Seleção: menor número de reversões, depois ofertas, com cobertura≥.5. O intervalo do motor é contado em respostas, não distância entre IDs globais; a migração de last_offer_count foi testada.

A política transforma score em alvo e limita mudança ao nível adjacente. Seu teste de margem usa a distância ao limiar .4 para fácil, .8 para difícil e ponto médio .6 para alvo médio, conforme a implementação preservada. Essa definição não é uma margem psicométrica em b nem intervalo de confiança; avaliar sua adequação antes de uso real. Ela pode gerar maior frequência de ofertas apesar do cooldown.

Replay da validação: 17.373 eventos observados nos 20 KCs permitidos; 10.684 oportunidades (cobertura .61498). Referência histórica Beta1: 868 ofertas/0 reversões; BKT: 2.515/132. Nenhuma mudança não autorizada. Preferência inicial fixa média; estoque das três faixas assumido disponível na bancada. As respostas são reais, porém não foram respostas a itens selecionados pela política; não há estimativa contrafactual confiável da aprendizagem ou acerto de recomendação.

#### 7. TRI, áreas, diagnóstico e evolução do catálogo

TRI b é propriedade do item; BKT L é estado latente do aluno. A política .4/.8 não usa a escala do b. A auditoria Fase1 registrou cortes globais de tercis do treino .8005400000000001/1.56301, com intervalos inclusivos à esquerda superior conforme rótulos históricos. A regra .8/1.5 é arredondamento/decisão recuperada, não reprodução exata. O catálogo atual do Ítalo deriva tercis **por área** e usa `<` nos dois cortes. Não há evidência para declarar as três configurações equivalentes ou uma única configuração final adotada no produto. config/tri_versions.json deixa a versão ativa indefinida e exige escolha explícita.

`bkt04/enem.py` acrescenta interface de área e validação de rótulo TRI com cortes/versão/escala fornecidos. Não altera dados nem modelos, e não calcula tercis em validação/teste. Todas as áreas do ENEM permanecem fallback. O núcleo clássico não usa b para atualizar domínio; a candidatura antiga o aproxima com âncoras sintéticas não calibradas. Portanto o requisito de distinguir adequadamente erro em item difícil e falta de domínio permanece parcialmente implementado entre as linhagens, sem validação integrada.

| Total | Filtro e significado |
|---:|---|
| 2.971 | Catálogo histórico de 2009–2024; não são sequências de respostas de alunos |
| 2.063 | Elegibilidade textual da base congelada: 1.801 treino≤2022,136 validação2023,126 teste2024 já consultado historicamente |
| 41 | Ensaio operacional antigo: itens com faixa em três recortes locais (ano/caderno/área); outros71 apenas exibição/correção |
| 677 | Missão Dataset04 posterior: itens/famílias tecnicamente aptos A, não certificação de especialistas nem o catálogo antigo de41 |

MissãoDataset04 registrou A677/B85/C2174/D35 (765 documentalmente confirmados). 226 fáceis/237 médios/214 difíceis entre os aptos, 112 habilidades e 60 escalas, 575 grupos habilidade-escala, máximo3famílias por grupo. Não havia estoque para sequências4/5/6 no mesmo KC/escala. Esses resultados pertencem a outra revisão e filtro, não podem ser somados ou usados para afirmar10itens por assunto. O catálogo de Ítalo recebeu correções posteriores em sua própria branch: é necessária conciliação por ID/hash, sem substituir pela cópia antiga.

No ensaio antigo, CH2018/451 e CH2020/567 tinham 32IDs exercitados com respostas simuladas; o catálogo tinha41itens de faixa incluindo9CN não usados em H/I. Diagnóstico misto de10IDs funcionou em CH, mas faixa média fixa tinha7famílias e CN2020 tinha9. Todos os2.304trajetos BKT se esgotaram. Melhor639/1104=57,88% nas oportunidades versus639/2880=22,19% no horizonte. Falsas mudanças subiram em todos8recortes. São alertas para pré-checagem de estoque e reporte de denominadores, não precisão real do recomendador.

#### 8. Contratos e persistência

Consultar docs/CONTRATOS_INTEGRACAO.md. `Motor.respond` é transacional e idempotente; chave do estado aluno/namespace/skill/versão. Os recibos impedem dupla contagem do mesmo ID e rejeitam colisão de conteúdo/aluno; ordem deve crescer. Escolhas e ofertas são persistidas com revisão, dono e versão. Recusa mantém preferência; aceite explícito aplica. Não há alteração automática em respond. Inventory é validado mas fornecido externamente. O motor não escolhe questões nem autentica usuários.

SQLite sobrevive ao reinício e tem testes de concorrência. Não há implantação FastAPI/Supabase ou ligação ao navegador. O contrato Next.js antigo da branch dificuldade-adaptativa não é idêntico ao Canvas de main/front-end; foram inspecionados README e learning-engine.ts atuais, que exportam regras locais/fixtures e funções de sessão. A integração real segue pendente. A evidência remota atual identifica titulo_area como método de Ítalo; documentação antiga que dizia rrf_qwen deve ser lida como histórica.

O núcleo não guarda contexto completo de questão, dificuldade enfrentada e sessão; backend precisa mantê-lo. Novo ID na mesma questão não é bloqueado como repetição. O diagnóstico de10é decisão documentada e aparece na bancada antiga, mas não orquestrado no motor persistente atual (mínimo de5da política). Não alegar que os dez eventos da demo resolvem essa lacuna.

#### 9. Seis problemas da auditoria independente

A auditoria Claude de8páginas foi recuperada integralmente em reports/auditoria_claude_texto_integral.txt. Ela é avaliação independente automatizada, não revisão humana qualificada. A matriz detalhada com evidências e critérios está em reports/relatorio_seis_problemas.md. Resumo vigente:

| Problema | Tratamento na Missão04 | Aceitação e pendência |
|---|---|---|
| P1 Dados/chave impediam reprodução | Pipeline desde CSV com IDs alternativos e hashes canônicos | Agregados+8fingerprints iguais; chave antiga dispensada; termos/rede ainda necessários |
| P2 Baseline mais forte sem IC pareado | Comparação BKT−histórico por aluno | ICglobal negativo, mas extremos favorecem histórico; análise posthoc |
| P3 Sem prova de aplicação ENEM | Motor/adaptador executáveis, gate e fallback | Interface funcional; validaçãoENEM e integração real continuam reprovadas/pendentes |
| P4 G alto, fronteira e incerteza | Gate conservador20/56 | Bloqueia5Galtos e7fronteiras; não assegura validade pedagógica |
| P5 Protocolo sem anterioridade externa | Registro/hash de novo protocolo e transparência | Não recupera carimbo externo histórico; permanece pendente |
| P6 Coleção de testes dependente de privados | Grupos independentes e bloqueios explícitos | A/Dexecutam semdados; B/C/Ebloqueiam quando ausentes |

Ressalvas extras preservadas: ECE com suporte limitado, múltiplas comparações sem ajuste e viés de encerramento/esgotamento. O trabalho não pretende corrigir uma matemática já consistente por novo ajuste desnecessário; preenche rastreabilidade, análise e interfaces. Nenhum treino novo nesta entrega.

#### 10. Aprendizado contínuo e testes anteriores de modelos

Atualização de estado individual mantém L0/T/G/S congelados. Aprendizado contínuo global exige coleta, revisão, retreino ou atualização supervisionada, avaliação temporal, versionamento, promoção/rollback e monitoramento: ciclo não entregue. O SGD incremental histórico mostrou coeficientes atualizados, mas não ganho consistente: no recorte externo4.808eventos/26alunos, congelado AUC .6396/LL .5797 versus atualizado .6344/.5800, conforme relatórios históricos. É experimento separado, não componente obrigatório da candidata.

Classificação textual: BERTimbau parcial .5223Macro-F1/78de136val2023; MiniLM .4710; MiniLM+metadados .4923 sem ganho conclusivo; Qwen.4548; BGE.4350. Esses números constam da recuperação histórica, não foram retreinados ou reproduzidos nesta montagem; protocolos diferentes impedem comparação automática. Arquivos de encoder ou pesos completos não necessários ao runtime BKT não foram copiados. O anexo de testes históricos foi preservado e não equivale a afirmar que todos rodaram hoje.

#### 11. Execução desta entrega e critérios de aceitação

Logs integrais, comandos, versões, duração e códigos de saída: evidence/entrega. Resultado atual: docs/RESULTADOS_ENTREGA.md. Testes históricos e testes desta montagem têm rótulos separados. A suíte A–E verifica matemática, integridade de CSV e fingerprints, saídas de treino já existentes, inferência/SQLite/consentimento/concorrência e alinhamento/IC de previsões. O novo grupoF testa fronteirasTRI, tipos inválidos, incompatibilidade de escala e isolamento das quatroáreas com fallback.

Uma entrega funcional exige: extração com hashes íntegros, zero colisão com árvore alvo, ambiente limpo sem dependências para A/D/F, exemplos bem-sucedidos e ausência de dados individuais ou chave no ZIP. Suíte científica completa exige dadospreparados; bloqueio não pode contar como aprovação. Falha de teste, quebra de contrato, alteração involuntária de faixa ou parâmetrosENEM falsamente validados reprova a entrega. Testes locais não aprovam produção; qualidade pedagógica exige evidência externa adicional.

Os arquivos originais foram preservados; alterações de consolidação se restringem à cópia: remoção de duplicação de modelos e vendor/fase01 aninhado, reconstrução desse caminho apenas no job de pesquisa, README/contratos, interface de área/TRI e testesF. Não há novo parâmetro aprendido. O procedimento de deduplicação é identificado em docs/proveniencia.json e validado na entrega. O código original de inferência/política/treinamento foi mantido.

#### 12. Recomendação e limites finais

Manter BKT como candidato treinado externo e o motor transacional como base de engenharia; preservar a candidata sensível ao item para investigação, com suas hipóteses de escala explícitas. No Gabaritei, expor fallback como provisório e sem domínio inventado, respeitar escolha/estoque e manter Ítalo responsável pela relevância. A arquitetura final integrada ainda não pode ser considerada aprovada. Próxima decisão deve conciliar versõesTRI, contexto de tentativas, repetição e diagnóstico antes de qualquer autorização de novo treinamento ou implantação. Nenhuma lacuna foi preenchida com simulação não identificada.

A demo externa foi ajustada nesta cópia para gravar resultado_bkt_externo.json na pasta de execução informada, preservando relatórios congelados e a integridade do pacote. A matemática não mudou. A candidata histórica possui sua própria bancada separada; não é usada implicitamente pelo motor persistente.


---

## Parte 3 — Contratos de integração com Ítalo e backend

Documento de origem: `docs/CONTRATOS_INTEGRACAO.md`.

### Contratos para Ítalo e backend

#### Separação de responsabilidades

Este módulo produz estado e eventual oferta de faixa, nunca IDs de questões recomendadas. Ítalo mantém a lista de relevância e seus filtros. O backend futuro autentica, corrige, ordena e persiste os eventos; calcula estoque real após excluir família repetida, questões inválidas, idioma e conteúdo indisponível; chama o motor; apresenta uma oferta; só aplica a faixa aceita. Caso faltem itens no nível escolhido, devolver estado de estoque insuficiente e oferecer opções explícitas; nunca mudar a preferência ou completar com outra faixa silenciosamente.

O snapshot do GitHub aponta método oficial `titulo_area`, catálogo `recomendacoes_titulo_area.json`, branch recomendador em bd74deaa2d5a1e87acded278df4e1a8d393e725b. Há 23 questões sem sugestões descritas no LEIA remoto. `DECISAO_FINAL.json` tem campos históricos contraditórios: considerar a seção `oficial` e o LEIA atual para planejar integração e confirmar com Ítalo antes de ativá-la. Nada do módulo dele foi copiado ou alterado aqui.

#### Interface Python local

```python
from pathlib import Path
from bkt04.motor import Motor
from bkt04.enem import register_area_response

Path('local').mkdir(exist_ok=True)
motor = Motor(Path('local/estado.sqlite'))
resultado = register_area_response(
    motor, student_id='aluno-pseudonimo', area='MT',
    attempt_id='tentativa-canonica-servidor', correct=1,
    event_order=1, inventory={'facil': 12, 'media': 8, 'dificil': 4})
```

`area` deve ser MT, LC, CH ou CN. O estado agregado usa namespace `enem:<area>` e skill `area`; não há mistura com habilidades ASSISTments. `correct` é inteiro 0/1 autorizado pelo servidor; nunca confiar no acerto informado pelo cliente. `event_order` inteiro positivo estritamente crescente por estudante/escopo/versão; horário sozinho não ordena eventos simultâneos. Estoque exige três inteiros não negativos. IDs devem usar letras ASCII, dígitos, `_ . : -`, até 128 caracteres. Não enviar nome, CPF ou e-mail.

Saída: `student_id`, `skill_namespace`, `skill_id`, `attempt_id`, `event_order`, `model_version`, `strategy`, `eligibility`, `eligibility_reasons`, `predicted_correct` (antes da resposta), `mastery_before/posterior/updated`, `evidence_count`, `recommendation` e `recorded_utc`. No ENEM, strategy=`historico_suavizado`, mastery=null e motivo `mapeamento_ENEM_nao_validado`. O score histórico não é domínio certificado nem proficiência TRI. Contagem mínima é 5, não confundir com o diagnóstico pretendido de 10.

Uma oferta traz `suggested`, `reason`, `choice` e `offer_id`. Responder `motor.resolve_offer(student_id, offer_id, True/False)`. A primeira aceitação válida pode mudar a preferência; recusa preserva. Oferta de outro aluno, outra versão ou revisão defasada é recusada. Após aceitar/recusar, repetir a mesma decisão é idempotente; uma decisão conflitante é erro. Escolha manual: `motor.choose_level(student, namespace, skill, choice, event_id)`. Leitura: `motor.inspect(...)`. Escolha manual não apaga acertos, erros ou domínio.

O mesmo attempt_id com o mesmo payload retorna a resposta armazenada; conteúdo diferente ou outro aluno geram ValueError. **Inventory faz parte do payload:** numa repetição técnica, reenviar o inventário original; o backend deve persistir o contexto da tentativa ou responder a repetição antes de recalcular estoque. A escolha manual e a resposta usam a mesma tabela global de recibos; IDs de operação devem ser distintos.

`bkt04.adaptador.register_correction` preserva o contrato histórico do frontend da branch dificuldade-adaptativa: `EnvioResposta` contém questaoId, letra, modo, sessaoId, recomendacaoId, chaveIdempotencia; `Correcao` traz tentativaId e correta (bool). O ID canônico é o da correção, podendo diferir da chave do cliente. A questão deve fornecer id, skill_namespace e skill_id. O adaptador não autentica nem confere por si só o gabarito; seu chamador deve fazê-lo. Para uso por área preencher namespace=`enem:MT`, skill_id=`area`. Este contrato não foi conectado ao frontend novo de main/front-end, que divergem; será necessária conciliação antes da implantação.

#### TRI e catálogo

`bkt04.enem.item_level` usa apenas b para classificar o item, com cortes, área, versão e escala obrigatórios. Operadores desta interface: b<=corte1 fácil; corte1<b<=corte2 média; b>corte2 difícil. O arquivo config/tri_versions.json documenta a versão histórica global (.80054/1.56301), a simplificação .8/1.5 e a versão do catálogo do Ítalo. Não há versão ativa escolhida implicitamente.

O catálogo atual de Ítalo usa **<** nos dois limites e tercis por área. Para integrar seu catálogo, preservar seu campo nivel e cortes/versão em vez de chamar item_level com operadores diferentes. Não reclassificar o catálogo automaticamente. A compatibilidade de escalas entre anos/cadernos permanece pendente; scale_id e expected_scale_id verificam identidade declarada, não comprovam equivalência psicométrica. O BKT clássico distribuído não recebe b: errar item difícil ainda conta como erro binário, limitação fundamental para a futura arquitetura sensível à dificuldade.

#### Persistência e implantação futura

SQLite persiste estado por aluno+namespace+skill+versão, recibos e ofertas. Transações BEGIN IMMEDIATE, timeout de 10s, teste de concorrência e migração de last_offer_count disponíveis. É implementação local, não Supabase/Postgres. A autenticação, RLS, retenção e exclusão de dados, rotas FastAPI, migração transacional no backend e ligação com frontend ainda precisam ser implementadas e testadas.

O recibo atual não guarda questaoId, b, sessionId, timestamp original ou família. O backend deve manter um log de tentativas com esses campos, versão da questão/cortes/modelo, consentimento e ID da oferta, e controlar exposições repetidas. Idempotência técnica não impede responder novamente o mesmo conteúdo com outro ID. Sem esse log não se pode separar repetição de aprendizagem. Não expor um `predicted_correct` externo como probabilidade calibrada para ENEM.


---

## Parte 4 — Requisitos: decisão versus implementação

Documento de origem: `docs/MATRIZ_REQUISITOS.md`.

### Decisões versus implementação

| Requisito | Estado | Evidência e limite |
|---|---|---|
| Sem LLM no módulo | Implementado e verificado | bkt04 e exemplos; biblioteca padrão |
| Modelo realmente treinado | Implementado e verificado | 56 modelos externos; tests C com fit histórico |
| BKT validado no ENEM | Não implementado | namespace ENEM força fallback; nenhum mapeamento aprovado |
| Atualização de domínio individual | Implementado e verificado | BKT externo; testes A/D |
| Dificuldade do item separada do aluno | Parcialmente implementado | item_level separado; núcleo clássico ainda sem b |
| BKT sensível à dificuldade | Parcialmente implementado | bancada histórica com âncoras; sem calibração real ENEM |
| Área MT/LC/CH/CN | Implementado e verificado | fachada por área/fallback; testes F |
| Domínio de cada assunto por área agregada | Não implementado | agregação não equivale a domínio de subassuntos |
| Classificação TRI b | Implementado e verificado | item_level, cortes/versão/escala explícitos, testes F |
| Cortes finais únicos no produto | Sem evidência suficiente | global histórico x arredondado x catálogo por área |
| Diagnóstico10questões | Parcialmente implementado | bancada antiga; motor persistente não orquestra diagnóstico |
| Mínimo5/margem.05/cooldown5 | Implementado e verificado | models/politica_selecionada.json; testes A/D |
| Aceite e recusa | Implementado e verificado | resolve_offer, owner/revisão/versão e idempotência |
| Escolha manual preserva histórico | Implementado e verificado | choose_level e testes D |
| Persistência entre sessões | Implementado e verificado | SQLite local; não backend implantado |
| Log completo questão/TRI/sessão | Parcialmente implementado | recibos operacionais não guardam contexto completo |
| Repetição versus aprendizagem | Parcialmente implementado | IDs/famílias na bancada; runtime só idempotência de tentativa |
| Estoque antes de oferta | Implementado e verificado | inventário fornecido pelo chamador; tests A/D |
| Resolver esgotamento sem violar escolha | Parcialmente implementado | abstém; fluxo de produto pendente |
| Integração com Ítalo | Parcialmente implementado | contrato e responsabilidades; sem conexão real |
| Backend/autenticação/RLS | Não implementado | árvores inspecionadas; motor local não servidor |
| Frontend atual ligado ao módulo | Não implementado | contratos divergentes, sem requisições reais ao BKT |
| Retreino periódico produtivo | Não implementado | ajustes offline existentes não são ciclo global |
| Ganho estatístico sobre histórico | Implementado e verificado | posthoc externo global; extremos desfavoráveis |
| Qualidade pedagógica da política | Sem evidência suficiente | replay não mede respostas às faixas recomendadas |
| Revisão pedagógica humana qualificada | Sem evidência suficiente | auditoria automatizada não certifica pedagogia |
| Prova externa do protocolo histórico | Sem evidência suficiente | carimbo externo não recuperado |
| Não publicar/não avançar | Implementado e verificado | apenas pasta de entrega; consulta remota GET |
| Missão05homologada | Sem evidência suficiente | não executada nesta entrega |


---

## Parte 5 — Branches e incorporação posterior

Documento de origem: `docs/BRANCHES_E_INCORPORACAO.md`.

### Inspeção remota e incorporação posterior

Consulta GET ao GitHub em 11/11/2026, sem checkout, fetch ou escrita em qualquer branch. A URL real confirmada é https://github.com/italodsz/Gabaritei---PI-VI . A URL com travessão do pedido não é a identidade canônica do repositório.

Foram inspecionadas as árvores recursivas completas de **todas as sete branches**, sem truncamento, os cinco commits mais recentes de cada uma e arquivos relevantes de código/documentação. Isso é um levantamento de componentes e contratos, não auditoria linha a linha de cada arquivo de todos os integrantes. O snapshot bruto inclui caminhos, hashes Git e commits em `evidence/github/snapshot.json`.

| Branch | Commit conferido | Arquivos blob | Conteúdo e preservação |
|---|---|---:|---|
| dataset | `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` | 180 | Base de trabalho congelada em Dataset/base_trabalho; preservar. |
| dificuldade-adaptativa | `e00f20c0d534a2bdd1a845d71cb791a16e3f4212` | 178 | Fase 1 publicada; frontend Next.js histórico; nenhum BKT publicado. |
| front-end | `1ada7f3a2e5f1d80fc9d5c9e08df4aaf2a52c461` | 85 | Frontend Canvas estático e learning-engine/regras locais; não é backend BKT. |
| main | `90d54984c21982c89e0d645ecfa78b1442b813b9` | 78 | Frontend Canvas estático e learning-engine/regras locais; não é backend BKT. |
| paridade-p1 | `50060d0f5ff8494226905c2b0c023c84214983a7` | 298 | Trabalho visual histórico; preservar. |
| recomendador | `bd74deaa2d5a1e87acded278df4e1a8d393e725b` | 385 | Seleção semântica de Ítalo, modelos/vetores, avaliações e catálogo titulo_area; preservar. |
| wardrobe | `ea3f28d22f805dea191e12130e14a3034099cf43` | 35 | Arquivo de versões, partes ZIP e base de João; não incorporar ao módulo. |

A branch de destino está em **e00f20c0d534a2bdd1a845d71cb791a16e3f4212**, posterior ao commit de origem bc77b0a. O único componente de dificuldade publicado são os nove arquivos da auditoria Fase 1. O README menciona experimento Fase 2 cujos caminhos não existem nessa árvore: descrição antiga não comprova publicação. Os BKT das missões aqui recuperados estavam nas entregas locais, não no remoto.

#### Regra de extração

O ZIP contém exclusivamente `dificuldade-adaptativa/modulo-bkt-H/**`, pasta ausente em todas as sete árvores verificadas. Na raiz da cópia local da branch de destino, extraia preservando essa estrutura. Não extraia dentro de dificuldade-adaptativa, pois duplicaria o caminho. Não substitua a raiz do repositório.

Antes da extração, se modulo-bkt-H já existir por outro trabalho posterior, pare e compare; o snapshot não garante ausência futura. Confirme manualmente a branch e o status local. Os arquivos da Fase 1, frontend, Dataset e recomendador não estão no ZIP e não serão substituídos. A conferência automática de sobreposição registra zero colisões contra o snapshot da branch.

A integração futura deve conciliar o frontend Canvas atual de main/front-end com o contrato Next.js histórico da branch de destino. O motor Python não é executável diretamente no navegador. Não há backend BKT identificado nas árvores. O servidor server.mjs serve arquivos estáticos e não implementa autenticação/correção BKT.

Nenhum commit novo é fornecido: esta é uma entrega de arquivos para revisão e publicação posterior pelo responsável. Não existe PR ou merge criado por esta tarefa. Ao publicar mais tarde, revisar o diff apenas desta pasta e manter os dados individuais fora do Git.


---

## Parte 6 — Instalação e reprodução

Documento de origem: `docs/REPRODUCAO.md`.

### Reprodução e separação de execução

#### Sem dados de alunos

Inferência e teste funcional usam Python 3.11+ e biblioteca padrão (inclui SQLite). Versão efetivamente testada consta em `evidence/entrega/ambiente.json`. O exemplo tem respostas sintéticas identificadas. Comandos na pasta do módulo:

```powershell
python -m venv .venv
./.venv/Scripts/python.exe -B testar.py --groups A,D,F --out local/testes_funcionais.json
./.venv/Scripts/python.exe -B exemplo_enem.py local/exemplo-1
./.venv/Scripts/python.exe -B demo.py local/externo-1
```

No Linux/macOS usar `.venv/bin/python`. Não é necessário instalar bibliotecas nem baixar modelos para executar o módulo. Não há suporte de serviço HTTP, autenticação ou frontend no ZIP.

#### Conferir evidência científica com os dados preparados

Para os grupos B/C/E instalar `requirements-research.txt`. O lock completo `requirements-lock.txt` registra o ambiente científico original; compatibilidade em todas as versões de Python/OS não foi testada. O ambiente que reproduziu a pesquisa usa Python 3.14.

```powershell
./.venv/Scripts/python.exe -m pip install -r requirements-research.txt
$env:BKT04_SOURCE = 'CAMINHO_DO_CSV_OFICIAL'
$env:BKT04_WORK = 'CAMINHO_DA_REPRODUCAO_PREPARADA'
./.venv/Scripts/python.exe -B testar.py --out local/testes_completos.json
```

O CSV oficial não é privado do autor, mas não acompanha o ZIP por conter eventos individuais. Edição corrigida colapsada: https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010 . SHA-256 obrigatório: `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`; 64.412.812 bytes. `obter_dataset.py CAMINHO` faz download e valida; bloqueios de rede devem ser reportados, sem substituir por outra edição. Observar os termos de acesso e uso da fonte; este pacote não concede nova licença sobre os dados.

#### Reconstrução científica desde o CSV (inclui ajuste de parâmetros)

O comando abaixo é o procedimento histórico reproduzível, disponibilizado para revisão. **Não foi acionado nesta entrega. Sua execução futura inclui treinamento e deve ser autorizada pelo responsável.**

```powershell
./.venv/Scripts/python.exe -B obter_dataset.py local/raw/assistments.csv
./.venv/Scripts/python.exe -B executar.py local/raw/assistments.csv local/reproducao
```

Execute em uma cópia de pesquisa, pois o pipeline atualiza relatórios e artefatos dessa cópia. A chave privada histórica não é exigida. O modo determinístico alternativo verifica oito representações canônicas dos históricos e seus agregados. Identificadores determinísticos são ligáveis à fonte e não garantem anonimização. Os arquivos individuais preparados ficam apenas em `local/reproducao`, que deve ter acesso restrito e não deve ser publicado.

Nesta entrega os testes completos releram a execução real anterior existente; não houve novo ajuste SLSQP nem bootstrap de parâmetros. O teste estatístico refaz o bootstrap pareado de estudantes sobre previsões congeladas. Isso recalcula um intervalo, sem treinar o BKT. Os comandos, códigos de saída e saída integral ficam em `evidence/entrega`.

Sem dados preparados: A/D/F executam; B/C/E ficam bloqueados, nunca aprovados por ausência. O runner retorna 0 para aprovação, 1 para falha/erro e 2 para bloqueio. Executar todos os grupos requer NumPy mesmo quando dados estão ausentes, por importações da suíte científica. Para ambiente sem dependências usar explicitamente A,D,F.


---

## Parte 7 — Resultados efetivamente executados

Documento de origem: `docs/RESULTADOS_ENTREGA.md`.

### Resultados reais da entrega · 11/11/2026

| Execução | Coletados | Aprovados | Falhas/erros | Bloqueados | Código |
|---|---:|---:|---:|---:|---:|
| A/D/F em venv novo, sem pip/NumPy/SciPy | 38 | 38 | 0 | 0 | 0 |
| A–F sem os dados de alunos, ambiente científico | 51 | 38 | 0 | 13 | 2 |
| A–F com CSV e artefatos reais já preparados | 51 | 51 | 0 | 0 | 0 |
| Candidata histórica, em cópia isolada | 8 | 7 | 0 | 1 | 0* |

As linhas são execuções sobrepostas, não devem ser somadas como 148 testes distintos. A suíte principal tem 51 testes distintos: 9A,4B,4C,22D,5E,7F. A bancada histórica separada tem 8 casos, com C bloqueado por falta de faixa operacional em MT. *O runner antigo usa skip e retorna0; o bloqueio é explicitamente contabilizado aqui, sem convertê-lo em aprovação.*

Passaram também os dois exemplos: ENEM por área em fallback e BKT externo treinado, ambos com respostas sintéticas identificadas. O exemplo ENEM conferiu dez eventos, área MT isolada, persistência após reinício e mudança de nível somente após aceite explícito. A demo externa conferiu idempotência e o bloqueio da transferência automática para ENEM.

O loader do estimador original importou com a única cópia de preparação Fase01. Foram incluídos todos os modelos externos congelados e a configuração original, sem novo treinamento. A suíte científica releu saídas já existentes, verificou hashes, convergência das20inicializações porKC, restrições e previsões; o bootstrap pareado de estudantes foi recalculado pelo teste. Não se executou ajuste SLSQP ou bootstrap de parâmetros nesta entrega.

Logs integrais: `evidence/entrega/*.log`; relatórios individuais com nome/status/fonte/hash/duração: funcionais.json, sem_dados.json, com_dados.json. Comandos exatos e códigos: execucoes.json. Ambiente: ambiente.json. Os logs de extração e instalação do ZIP são adicionados em `evidence/entrega/instalacao_extraida.log` e `evidence/entrega/verificacao_arquivo.json`.

Os13bloqueios semdataset correspondem aos gruposB/C/E, não a falhas matemáticas. A revisão humana, qualidade da recomendação ENEM, integração real e aprendizado contínuo global não são testados por uma suíte de unidade: continuam pendências explícitas.

Não houve falha nos testes executados nesta montagem. Isso não altera ressalvas históricas ou bloqueios de aplicação. Sistemas operacionais/versõesPython diferentes dos registrados não foram executados.


---

## Parte 8 — Limitações e pendências

Documento de origem: `docs/LIMITACOES.md`.

### Limitações e pendências acionáveis

1. **Transferência ENEM:** nenhuma associação ASSISTments→ENEM foi validada. Todos os namespaces ENEM usam fallback. Necessário coletar eventos reais e avaliar por área/habilidade antes de treinar/promover modelo local.
2. **Sensibilidade ao item:** o BKT clássico congelado recebe apenas respostas binárias por habilidade; não consome b/a/c. A política usa seu estado, mas não compensa a dificuldade enfrentada. Não declarar que o motor já distingue integralmente errar uma difícil de errar uma fácil.
3. **Adaptação por área:** interface separa MT/LC/CH/CN, porém agrega histórico com Beta(1,1); não há parâmetros BKT por área do ENEM. Resultado agregado não prova domínio de assuntos específicos.
4. **Política:** mínimo 5, margem .05 e cooldown 5 respostas são escolhas experimentais; aumentaram ofertas/reversões no replay. Nenhuma eficácia pedagógica demonstrada. Ausência de violação de consentimento não garante boa sugestão.
5. **Diagnóstico:** dez questões por matéria é decisão de produto; não há seleção/balanceamento ou encerramento de diagnóstico implementados. Dez eventos sintéticos no exemplo não suprem isso.
6. **Estoque:** motor bloqueia oferta para faixa sem estoque, mas depende da contagem correta fornecida pelo chamador. Não escolhe questões nem resolve esgotamento de uma sessão. Há histórico de 2.304 trajetórias esgotadas.
7. **Repetição:** reenvio da mesma tentativa é idempotente; nova tentativa do mesmo item/família pode atualizar de novo. Repetição versus aprendizagem não foi validada. Controle por questão/família e log de exposição pertencem ao futuro backend.
8. **Persistência:** SQLite local comprovado; não existe integração entregue com FastAPI, Supabase, autenticação, RLS ou frontend atual. IDs não devem ser dados pessoais. Recibos não substituem log completo de questões/sessões/TRI.
9. **TRI:** cortes globais históricos diferem de cortes arredondados e do catálogo por área do Ítalo. Não há configuração final única comprovada. Não misturar escalas/anos automaticamente. b classifica item, não aluno.
10. **Incerteza:** gate limita parâmetros com G/S altos, fronteiras, instabilidade e calibração ruim; não fornece garantia individual calibrada. ECE e classes A/B/C são descritivos; não há correção por múltiplas comparações.
11. **Aprendizado contínuo:** atualização Bayesiana do estado individual comprovada no externo; nenhum ciclo produtivo de retreino, promoção, rollback e monitoramento global implementado. SGD histórico é ensaio separado sem ganho consistente.
12. **Validação externa:** nenhuma resposta real de aluno do Gabaritei disponível; simulações, exemplos e ASSISTments não medem aprendizagem ENEM. Missão 05 e fases futuras não executadas nesta entrega.
13. **Anterioridade:** não se recuperou prova externa da data do protocolo histórico; logs/hash locais e declaração de pré-especificação não são registro independente.
14. **Portabilidade:** execução atual em Windows/Python 3.14; documentação para 3.11+ e Linux/macOS não equivale a teste nessas plataformas. Dependências científicas fixadas podem requerer a versão de Python compatível.

Prioridades: conciliar contrato/cortes com Ítalo; construir log autenticado com consentimento e contexto; pilotar com dados reais e revisão pedagógica; só então autorizar ajustes e avaliação temporal independente, incluindo repetição, abstenção, estoque e falsas mudanças. Não há correção definitiva do dataset ou recomendador completo neste pacote.


---

## Parte 9 — Fontes e rastreabilidade

Documento de origem: `docs/FONTES.md`.

### Fontes e rastreabilidade

#### GitHub consultado

Repositório canônico: https://github.com/italodsz/Gabaritei---PI-VI . Todas as árvores e últimos5commits porbranch foram obtidos via conector GitHub somente GET; snapshot completo em evidence/github/snapshot.json. Inspeção adicional do frontend em evidence/github/frontend_atual.json. Metadados não foram inferidos de screenshots antigos.

- Branch alvo e nove arquivos Fase1: https://github.com/italodsz/Gabaritei---PI-VI/tree/e00f20c0d534a2bdd1a845d71cb791a16e3f4212/dificuldade-adaptativa
- Código de Ítalo: https://github.com/italodsz/Gabaritei---PI-VI/blob/bd74deaa2d5a1e87acded278df4e1a8d393e725b/recomendador/rrf-tfidf-minilm-J/recomendador.py
- Catálogo e situação atual: https://github.com/italodsz/Gabaritei---PI-VI/blob/bd74deaa2d5a1e87acded278df4e1a8d393e725b/recomendador/rrf-tfidf-minilm-J/catalogo/LEIA.md
- Frontend atual: https://github.com/italodsz/Gabaritei---PI-VI/tree/90d54984c21982c89e0d645ecfa78b1442b813b9/frontend
- Dataset congelado original: https://github.com/italodsz/Gabaritei---PI-VI/tree/7e720fa876beb7249adab2f05d3ecf33ae5a2c51/Dataset/base_trabalho

#### Dados e evidências locais

ASSISTments corrigido/colapsado, origem oficial: https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010 . Hash e procedimento em REPRODUCAO.md. O pacote não redistribui suas linhas individuais nem concede direitos sobre os dados da fonte.

Os arquivos de origem das missões foram recuperados das entregas em Downloads; hashes porarquivo em proveniencia.json e porZIP em evidence/entrega/integridade_originais.json. O relatório PDF do Claude foi lido na missão anterior; sua extração integral preservada está em reports/auditoria_claude_texto_integral.txt e o tratamento em reports/relatorio_seis_problemas.md. Isso é auditoria automatizada independente, sem certificação humana.

O dossiê de11/11deGabriel e as mensagens do chat registram decisões e intenção; evidência de implementação é código/teste, não a declaração isolada. Relatórios históricos dos encoders/SGD permanecem identificados como recuperação, sem nova execução nesta entrega.

#### Uso e autoria dos materiais

Organização do módulo de dificuldade e decisões conforme orientação de Gabriel; preparação e conferências automatizadas assistidas por IA. Nenhuma revisão qualificada foi inventada. O código e avaliações de Ítalo permanecem na sua branch e não integram este runtime. Não foi criada licença fictícia: a equipe deve confirmar sua licença de código e os termos dos datasets antes de redistribuição externa.
