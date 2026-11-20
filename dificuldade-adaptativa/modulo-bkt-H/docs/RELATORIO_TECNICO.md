# Relatório técnico consolidado · Gabaritei PI VI

## 1. Escopo, fontes e parecer

Data da montagem: 11/11/2026. O dossiê enviado por Gabriel foi tratado como contexto e confrontado com GitHub, código local e artefatos executados. Este documento orienta outro engenheiro ou IA sem exigir acesso ao chat. O resultado é uma entrega de engenharia independente para revisão, não homologação pedagógica ou aprovação automática da Fase 2. A sequência BKT01–04 designa missões científicas externas, distinta das Fases 1–5 do produto. Nenhuma fase futura foi executada.

Fontes primárias desta auditoria: `evidence/github/snapshot.json` (árvores e commits), `docs/proveniencia.json` (origem de arquivos), `models` (artefatos congelados), `references/avaliacao_final.json` (avaliação original), `reports/comparacao_estatistica.json`, `reports/politicas_validacao.json`, testes A–F e logs atuais `evidence/entrega`. Relatórios antigos são identificados como históricos e podem conter conclusões superadas; não são prova isolada da execução atual.

## 2. Recuperação e versões arquiteturais

Existem pelo menos duas linhagens que o nome genérico “BKT + margem” ocultava. Preservá-las separadamente evita atribuir ao motor atual capacidades de outro ensaio.

| Linhagem | Estado e dados | Dificuldade do item | Política |
|---|---|---|---|
| Candidata histórica bkt_politica_1_4_0.09 | Parâmetros globais externos, bancada com perfis/respostas sintéticos; catálogo operacional de 41 itens com faixa local | Emissões transformadas com âncoras provisórias por faixa; não usa b bruto como escala calibrada | Mínimo 4 famílias, intervalo 1, margem .09, salto máximo 2 na busca |
| Missões BKT01–03 | 56 BKT clássicos ajustados separadamente por habilidade ASSISTments | Modelo binário por KC, sem b/a/c | Avaliação de previsão de respostas; não seleciona faixa |
| Missão04 | Motor transacional com os 56 modelos congelados e gate de 20 permitidos/36 fallback | Ainda BKT clássico externo; namespace ENEM força fallback | .4/.8, mínimo 5, margem .05, cooldown 5 respostas, auto_accept false |
| Preparação desta entrega | Mesmo motor/gate/política; fachada explícita por área e classificação TRI com versão; testes adicionais | item_level classifica o item separadamente; não transforma o BKT em modelo sensível ao b | Sem novo ajuste ou busca; consentimento mantido |

A linhagem histórica sensível ao item está em `historico/candidata_margem`, com fonte e entrada mínima reproduzível. Seus testes usam IDs reais de questões e respostas sintéticas; não produzem validação real. O runtime independente principal é o motor da Missão04. Isso é uma organização da evidência existente, não decisão de substituir a candidata nem declaração de superioridade da nova política. Selecionar arquitetura pedagógica final exige revisão formal.

## 3. Preparação dos dados externos — BKT01

ASSISTments Skill Builder 2009–2010 corrigido/colapsado: 346.860 linhas, SHA-256 `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`. Após filtros: 214.417 eventos, 4.003 estudantes, 101 habilidades. Exclusões sequenciais: 63.755 sem KC, 47.037 multi-KC, 21.643 scaffold e 8 open_response auto-corrigidos. Filtros não devem ser somados a partir de versões diferentes.

Split por estudante com hash determinístico e semente 20261110: 2.802 treino, 601 validação e 600 teste. Critérios de elegibilidade de KC calculados apenas no treino: pelo menos 100 estudantes, 30 sequências com ≥5 eventos, 50 acertos e 50 erros. Selecionadas 56 habilidades. Suporte selecionado: treino 19.370 sequências/143.092 eventos/2.773 alunos; validação 4.253/29.780/596; teste 3.892/29.948/585. Não há alunos compartilhados entre splits.

Os scripts preservados estão em vendor/fase01. Reexecução independente desde o CSV tem modo determinístico sem chave privada histórica. Oito fingerprints canônicos verificam eventos e sequências após normalizar pseudônimos, enquanto agregados devem coincidir exatamente. Não confundir igualdade lógica com igualdade binária dos arquivos pseudonimizados. Os pseudônimos determinísticos permitem reprodução, mas são ligáveis à fonte.

## 4. Treinamento e matemática — BKT02

Modelo latente binário K∈{0,1}, sem esquecimento. Parâmetros por KC: L0=P(K inicial=1), T=P(aprender|não domina), G=P(acerto|não domina), S=P(erro|domina). Para estado L antes da resposta:

```
p(acerto) = L*(1-S) + (1-L)*G
posterior_acerto = L*(1-S) / p(acerto)
posterior_erro = L*S / (L*S + (1-L)*(1-G))
L_proximo = posterior + (1-posterior)*T
```

Inferência usa probabilidade anterior à resposta para pontuar e normalização Bayesiana estável. MLE/SLSQP: 20 inicializações por habilidade, máximo 500 iterações, ftol 1e-9, epsilon 1e-4, limites e G+S≤.99 conforme configuração original. Convergiram as 1.120 otimizações principais documentadas. Bootstrap de parâmetros histórico: 100 reamostragens por estudante/KC, 5 inicializações, 5.600 reajustes e 28.000 otimizações. Houve 28 habilidades com algum intervalo de parâmetro amplo (> .3) e 7 na fronteira numérica (16,84,91,307,308,322,323). São diagnósticos históricos, não novo treinamento desta entrega.

O artefato models/parametros_originais.json contém os 56 conjuntos L0/T/G/S, suporte e diagnósticos, sem pickle executável. O gate operacional proíbe G≥.5 ou S≥.5, fronteiras e instabilidade elevada; exige categorias históricas A/B, largura preditiva mediana≤.1 e ECE≤.1. Passam 20 KCs; 36 caem em fallback. Os cinco G altos são 51,84,50,58,308, todos bloqueados. Esse gate é conservador e posterior ao teste; não foi escolhido com resultados ENEM.

## 5. Avaliação externa — BKT03 e correção estatística BKT04

Conjunto final congelado: 29.948 eventos de 585 estudantes. Resultados originais:

| Método | Log-loss | Brier | AUC | Acurácia | ECE |
|---|---:|---:|---:|---:|---:|
| BKT | .5656081 | .1913322 | .7285724 | .7167090 | .0133132 |
| Histórico suavizado | .5825766 | .1990398 | .7135945 | .6939695 | .0481490 |
| Taxa por habilidade | .6254429 | .2177470 | .6103714 | .6633832 | .0122017 |

Baseline científico de histórico: `(acertos_anteriores + 2*taxa_KC_treino)/(n_anteriores+2)`. Não é igual ao fallback operacional Beta(1,1) `(acertos+1)/(n+2)`. Não transportar a vantagem de uma comparação para a outra. AUC histórica usa convenção de ranking/arredondamento registrada nos arquivos; não é acerto do nível fácil/médio/difícil.

Missão04 acrescentou bootstrap **pareado por estudante**, 2.000 réplicas, semente 20261111. Delta LL BKT−histórico −.0169685276, IC95 [−.0218493586; −.0114590235]. Há evidência favorável global nessa previsão externa. Grupo com taxa≤10%: 40 alunos/343 eventos, delta +.1114498, IC [.0493857;.1616608]. Grupo≥90%: 92/822, delta +.0252311, IC [.0149819;.0366061]. Nos extremos, histórico é melhor.

Análise posterior ao teste original; os ICs por KC e categorias A21/B14/C21/D0 são marginais/descritivos, sem correção por múltiplas comparações. Não representam validação ENEM, efeito causal ou redução de falsas mudanças. Revisão humana independente continua necessária.

## 6. Política da Missão04

Arquivo models/politica_selecionada.json: limiares [.4,.8], mínimo 5, margem .05, cooldown 5, auto_accept false. Grade de validação: limiares (.35,.75)/(.4,.8), mínimo 5/10, intervalo 3/5, margem fixa .05. Seleção: menor número de reversões, depois ofertas, com cobertura≥.5. O intervalo do motor é contado em respostas, não distância entre IDs globais; a migração de last_offer_count foi testada.

A política transforma score em alvo e limita mudança ao nível adjacente. Seu teste de margem usa a distância ao limiar .4 para fácil, .8 para difícil e ponto médio .6 para alvo médio, conforme a implementação preservada. Essa definição não é uma margem psicométrica em b nem intervalo de confiança; avaliar sua adequação antes de uso real. Ela pode gerar maior frequência de ofertas apesar do cooldown.

Replay da validação: 17.373 eventos observados nos 20 KCs permitidos; 10.684 oportunidades (cobertura .61498). Referência histórica Beta1: 868 ofertas/0 reversões; BKT: 2.515/132. Nenhuma mudança não autorizada. Preferência inicial fixa média; estoque das três faixas assumido disponível na bancada. As respostas são reais, porém não foram respostas a itens selecionados pela política; não há estimativa contrafactual confiável da aprendizagem ou acerto de recomendação.

## 7. TRI, áreas, diagnóstico e evolução do catálogo

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

## 8. Contratos e persistência

Consultar docs/CONTRATOS_INTEGRACAO.md. `Motor.respond` é transacional e idempotente; chave do estado aluno/namespace/skill/versão. Os recibos impedem dupla contagem do mesmo ID e rejeitam colisão de conteúdo/aluno; ordem deve crescer. Escolhas e ofertas são persistidas com revisão, dono e versão. Recusa mantém preferência; aceite explícito aplica. Não há alteração automática em respond. Inventory é validado mas fornecido externamente. O motor não escolhe questões nem autentica usuários.

SQLite sobrevive ao reinício e tem testes de concorrência. Não há implantação FastAPI/Supabase ou ligação ao navegador. O contrato Next.js antigo da branch dificuldade-adaptativa não é idêntico ao Canvas de main/front-end; foram inspecionados README e learning-engine.ts atuais, que exportam regras locais/fixtures e funções de sessão. A integração real segue pendente. A evidência remota atual identifica titulo_area como método de Ítalo; documentação antiga que dizia rrf_qwen deve ser lida como histórica.

O núcleo não guarda contexto completo de questão, dificuldade enfrentada e sessão; backend precisa mantê-lo. Novo ID na mesma questão não é bloqueado como repetição. O diagnóstico de10é decisão documentada e aparece na bancada antiga, mas não orquestrado no motor persistente atual (mínimo de5da política). Não alegar que os dez eventos da demo resolvem essa lacuna.

## 9. Seis problemas da auditoria independente

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

## 10. Aprendizado contínuo e testes anteriores de modelos

Atualização de estado individual mantém L0/T/G/S congelados. Aprendizado contínuo global exige coleta, revisão, retreino ou atualização supervisionada, avaliação temporal, versionamento, promoção/rollback e monitoramento: ciclo não entregue. O SGD incremental histórico mostrou coeficientes atualizados, mas não ganho consistente: no recorte externo4.808eventos/26alunos, congelado AUC .6396/LL .5797 versus atualizado .6344/.5800, conforme relatórios históricos. É experimento separado, não componente obrigatório da candidata.

Classificação textual: BERTimbau parcial .5223Macro-F1/78de136val2023; MiniLM .4710; MiniLM+metadados .4923 sem ganho conclusivo; Qwen.4548; BGE.4350. Esses números constam da recuperação histórica, não foram retreinados ou reproduzidos nesta montagem; protocolos diferentes impedem comparação automática. Arquivos de encoder ou pesos completos não necessários ao runtime BKT não foram copiados. O anexo de testes históricos foi preservado e não equivale a afirmar que todos rodaram hoje.

## 11. Execução desta entrega e critérios de aceitação

Logs integrais, comandos, versões, duração e códigos de saída: evidence/entrega. Resultado atual: docs/RESULTADOS_ENTREGA.md. Testes históricos e testes desta montagem têm rótulos separados. A suíte A–E verifica matemática, integridade de CSV e fingerprints, saídas de treino já existentes, inferência/SQLite/consentimento/concorrência e alinhamento/IC de previsões. O novo grupoF testa fronteirasTRI, tipos inválidos, incompatibilidade de escala e isolamento das quatroáreas com fallback.

Uma entrega funcional exige: extração com hashes íntegros, zero colisão com árvore alvo, ambiente limpo sem dependências para A/D/F, exemplos bem-sucedidos e ausência de dados individuais ou chave no ZIP. Suíte científica completa exige dadospreparados; bloqueio não pode contar como aprovação. Falha de teste, quebra de contrato, alteração involuntária de faixa ou parâmetrosENEM falsamente validados reprova a entrega. Testes locais não aprovam produção; qualidade pedagógica exige evidência externa adicional.

Os arquivos originais foram preservados; alterações de consolidação se restringem à cópia: remoção de duplicação de modelos e vendor/fase01 aninhado, reconstrução desse caminho apenas no job de pesquisa, README/contratos, interface de área/TRI e testesF. Não há novo parâmetro aprendido. O procedimento de deduplicação é identificado em docs/proveniencia.json e validado na entrega. O código original de inferência/política/treinamento foi mantido.

## 12. Recomendação e limites finais

Manter BKT como candidato treinado externo e o motor transacional como base de engenharia; preservar a candidata sensível ao item para investigação, com suas hipóteses de escala explícitas. No Gabaritei, expor fallback como provisório e sem domínio inventado, respeitar escolha/estoque e manter Ítalo responsável pela relevância. A arquitetura final integrada ainda não pode ser considerada aprovada. Próxima decisão deve conciliar versõesTRI, contexto de tentativas, repetição e diagnóstico antes de qualquer autorização de novo treinamento ou implantação. Nenhuma lacuna foi preenchida com simulação não identificada.

A demo externa foi ajustada nesta cópia para gravar resultado_bkt_externo.json na pasta de execução informada, preservando relatórios congelados e a integridade do pacote. A matemática não mudou. A candidata histórica possui sua própria bancada separada; não é usada implicitamente pelo motor persistente.
