# Gabaritei PI VI · Auditoria da base oficial

**Decisão da Fase 1.** Aprovada para experimentação supervisionada de dificuldade populacional no recorte elegível por texto, com as ressalvas abaixo. A evidência de personalização com alunos reais permanece pendente. Os cortes são operacionais e provisórios.

## Proveniência e reprodução

A execução usou a branch `dataset`, revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`. O SHA-256 de `questions.jsonl` foi `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`, igual ao publicado. O notebook registra o ambiente, o horário e os hashes dos insumos. A análise é determinística.

No Google Colab, use **Arquivo → Fazer upload de notebook** e selecione `fase_01_auditoria.ipynb`. Para conferir a execução anterior, veja as saídas salvas nas células. Para repetir a auditoria em uma sessão limpa, altere `DOWNLOAD_DATASET` para `True` na primeira célula de código e use **Ambiente de execução → Executar tudo**. O notebook busca a revisão fixada do GitHub em `base-oficial/Dataset/base_trabalho/`. Essa etapa requer Git, acesso à rede e acesso de leitura ao repositório. Se precisar usar uma cópia local, disponibilize a mesma revisão nesse caminho, preserve os bytes originais e deixe `DOWNLOAD_DATASET = False`. A análise usa apenas a biblioteca padrão do Python, sem instalação por pip.

## Catálogo e isolamento

| Partição | Anos | Linhas do JSONL | Elegíveis | Linhas adicionais |
|---|---|---:|---:|---:|
| Treino | 2009–2022 | 2.616 | 1.801 | 815 |
| Validação | 2023 | 177 | 136 | 41 |
| Teste | 2024 | 178 | 126 | 52 |
| Total | 2009–2024 | 2.971 | 2.063 | 908 |

Cada registro dos splits corresponde ao catálogo. Todos os elegíveis constam na partição indicada e têm `ready_text=true`. Use `ids_elegiveis.json` como filtro explícito. O bloqueio `gq_29b02702604175cb29267886` permanece no catálogo com `ready_text=false` e está fora dos elegíveis. O item com fórmula corrigida está presente. O aviso de índices invalida os vetores anteriores para esta derivação.

O notebook encontrou zero IDs duplicados e zero sobreposições entre splits por ID, família, família de conteúdo, código do item ou enunciado normalizado. A triagem lexical de trigramas tampouco sinalizou pares no intervalo de Jaccard de 0,8 a abaixo de 1. A triagem tem cobertura limitada para paráfrases, equivalências matemáticas e conteúdo visual.

## TRI e metadados

Os 2.971 registros têm `a`, `b` e `c` finitos dentro dos domínios verificados. No catálogo, a regra de 1,5 IQR sinalizou 38 valores de `a`, 60 de `b` e 42 de `c`. O caso mais extremo foi `gq_cf15f16c076fceccbc04a730`, de CN em 2015, com `b=61,05459` e `a=0,01929`. A discriminação muito baixa reduz a confiança prática nesse rótulo. Os sinalizadores IQR servem para inspeção, sem exclusão automática. O notebook registra medianas por área, ano e tipo de aplicação. A comparabilidade da escala entre áreas e aplicações continua uma hipótese.

Os tercis foram calculados exclusivamente nas 1.801 questões elegíveis do treino. Fácil corresponde a `b ≤ 0,80054`, média a `0,80054 < b ≤ 1,56301` e difícil a `b > 1,56301`. O parâmetro `b` expressa localização na escala TRI.

| Partição elegível | Fácil | Média | Difícil |
|---|---:|---:|---:|
| Treino | 601 | 600 | 600 |
| Validação | 54 | 42 | 40 |
| Teste | 53 | 42 | 31 |

Há estratos pequenos. Por exemplo, o teste contém três itens difíceis de LC e quatro itens fáceis de MT. No treino elegível, 164 itens não têm habilidade preenchida. Os 2.971 registros têm metadados pedagógicos gerados por regras e marcados como sem revisão. Trate habilidade, assunto previsto e dificuldade como variáveis distintas.

## Evidências disponíveis

O catálogo e os splits não contêm eventos individuais de respostas. Na árvore da revisão auditada, não foram identificados os relatórios históricos nomeados no briefing nem o enunciado original do PI. A ausência nesse recorte não estabelece ausência em outros sistemas ou branches. Os resultados históricos de modelos seguem sem verificação nesta fase.

### Plano para as Fases 3 e 4

A ausência de eventos individuais de estudantes na base auditada permite encerrar a auditoria da dificuldade dos itens e limita a avaliação da personalização. A Fase 3 usará inicialmente respostas sintéticas identificadas no conjunto de dados, nas tabelas e nos gráficos. A Fase 4 separará os eventos de atualização dos eventos futuros de avaliação e comparará o modelo congelado com o incremental, incluindo mudanças nas probabilidades e sugestões de dificuldade. A equipe buscará um piloto com estudantes reais, com coleta mínima e autorização institucional aplicável. A validação com estudantes dependerá dos resultados desse piloto.

### Resultado das verificações

A revalidação executou a auditoria sobre os arquivos oficiais e salvou a saída em `results/fase_01_auditoria.log` e os resultados estruturados em `results/fase_01.json`. A suíte de testes gera seu próprio JSON a partir dos dados oficiais. Ela confirma contagens, cortes, hash e escopo dos eventos, além de alterar uma cópia do catálogo para verificar que a auditoria rejeita bytes divergentes. Os três testes passaram, conforme `results/fase_01_testes.log`. A reprodução independente e a aprovação formal estão pendentes.

Passaram as verificações de SHA-256, contagens, correspondência dos registros com o catálogo, IDs únicos, elegibilidade, exclusão do item bloqueado, disjunção entre splits e domínios TRI. As distribuições e os cortes foram calculados novamente e salvos no notebook. Nenhuma verificação automatizada falhou na execução entregue. Os splits brutos contêm linhas adicionais em relação ao recorte elegível, conforme a tabela acima. A triagem de similaridade, os valores TRI extremos e a falta de eventos individuais são limitações registradas.

## Matriz inicial de requisitos

Esta matriz deriva do briefing. A redação oficial do professor ainda precisa ser confrontada com o enunciado original.

| Requisito | Implementação prevista | Teste | Evidência atual |
|---|---|---|---|
| Problema real com solução de IA | Sugestão de dificuldade em questões objetivas ENEM | Casos de uso nas quatro áreas e escolha manual preservada | Escopo registrado |
| Dataset adequado e tratado | Catálogo fixado por revisão, filtro elegível, rótulo TRI | Hash, integridade, isolamento temporal e cobertura | Notebook da Fase 1 |
| ML treinado pela equipe | Modelo supervisionado de dificuldade | Baselines, macro-F1, acurácia, matriz de confusão e análise por área | Fase 2 pendente |
| Aprendizado contínuo | Atualização incremental por respostas | Comparar modelo congelado e atualizado em eventos futuros | Fase 4 pendente |
| Alteração das decisões | Política consome estimativas atualizadas | Medir mudanças de probabilidade e sugestão, preservando a escolha manual | Fases 3 a 5 pendentes |
| Documentação e avaliação | Notebooks, métricas, contrato proposto e registro de decisões | Reprodução e rastreabilidade por versão | Auditoria de dados disponível |

## Plano para a Fase 2

Fixar o filtro e os cortes com o treino elegível. Comparar uma baseline de classe majoritária e uma baseline textual supervisionada, sem usar parâmetros TRI ou campos derivados do rótulo como preditores. Documentar separadamente a referência direta por `tri.b`, que define os rótulos. Analisar sensibilidade a casos de discriminação muito baixa usando treino e validação, congelar as escolhas antes do teste de 2024 e reportar suporte, matriz de confusão, macro-F1 e acurácia geral e por área. Comparar com MiniLM + LinearSVC histórico somente após confirmar os artefatos e a paridade do protocolo.
