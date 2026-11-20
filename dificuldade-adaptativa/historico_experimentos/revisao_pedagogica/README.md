# Gabaritei · Auditoria pedagógica do catálogo

## Resumo executivo

**O catálogo está pronto para revisão humana e para um piloto técnico com ressalvas.** A auditoria percorreu os 2.971 registros e produziu evidência por item. Restaram 1.329 itens no recorte provisório e zero com certificação pedagógica documentada. Todos os assuntos continuam pendentes de adjudicação humana. A associação tabular de habilidade e TRI tem uma evidência separada.

## Inventário e integridade

A revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` preservou SHA-256 `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Os 2.971 IDs, os anos 2009–2024 e as quatro áreas foram cruzados com a auditoria tabular. O catálogo derivado contém o enunciado, as alternativas, o gabarito, os rótulos originais e os parâmetros TRI. Os arquivos originais não receberam alterações. Os ZIPs históricos nomeados não estavam na raiz. Usei os respectivos artefatos locais, inclusive a auditoria global, a pré-auditoria e a conferência das 16 tabelas.

O anexo disponível termina no meio da descrição da fase 11. As instruções complementares foram usadas para definir o restante da entrega. As fases 12 e 13 do texto original não puderam ser conferidas literalmente.

## Como a auditoria foi feita

Foram separadas três camadas. O rótulo original continua preservado. A camada tabular comprova que 2.779 códigos de habilidade e os parâmetros TRI dos 2.971 itens coincidem com as tabelas anuais para as chaves ligadas. A camada pedagógica ainda precisa de revisão. A competência derivada usa o agrupamento área/habilidade da matriz; o valor original foi mantido quando disponível. As 192 habilidades ausentes também estavam vazias nas tabelas ligadas. Não atribuí códigos candidatos sem evidência de que a operação exigida pelo item corresponda à habilidade. Para esses casos, a ficha oferece campo para o especialista registrar código candidato e justificativa baseada no comando. [Matriz de Referência](https://download.inep.gov.br/download/enem/matriz_referencia.pdf?EPU=false) · [Microdados oficiais do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

A triagem de assuntos usa 15 regras restritas à área, sobre os dois últimos blocos do enunciado e até 650 caracteres. Os marcadores são extraídos antes de cotejar o rótulo existente, sem usar TRI ou distratores. Uma palavra no texto de apoio ainda pode gerar alerta. Cada proposta registra marcador, assunto e subassunto alternativos e motivo. Uma proposta plausível continua sendo uma hipótese. As 18 propostas ficam em arquivo separado, sem substituir nenhum campo.

O vocabulário original tem 29 combinações observadas de área, assunto e subassunto. Algumas categorias misturam disciplina, tema e habilidade. O arquivo `taxonomia_proposta.json` descreve um vocabulário experimental com disciplina em aberto e suporte a múltiplas sugestões. Área delimita a matriz. Disciplina organiza o currículo. Assunto e subassunto indicam o que está em jogo. Habilidade e competência indicam o que o estudante precisa fazer. Não há equivalência automática entre esses eixos. Variações de nomenclatura e granularidade devem ser resolvidas na adjudicação antes de normalizar a taxonomia.

## Resultados

| Indicador | Quantidade |
|---|---:|
| Assuntos preenchidos | 2.411 |
| Assuntos ausentes | 560 |
| Assuntos preenchidos com sinal compatível, ainda sem revisão | 61 |
| Assuntos suspeitos por triagem | 55 |
| Assuntos preenchidos inconclusivos sem sinal suficiente | 2.293 |
| Casos inconclusivos por conteúdo incompleto | 2 |
| Propostas temáticas | 18, incluindo duas em itens sem assunto |
| Habilidades preenchidas e conferidas na tabela | 2.779 |
| Habilidades ausentes | 192 |
| Divergências de código de habilidade contra a tabela ligada | 0 |
| Itens com recursos catalogados | 878 |
| Itens pendentes de revisão pedagógica | 2.971 |
| Itens provisórios para piloto técnico | 1.329 |
| Itens certificados por especialistas | 0 |

As categorias de status são mutuamente exclusivas. Os dois casos com conteúdo incompleto estão na categoria de conteúdo, portanto essa classificação tem precedência. Os 52 alertas anteriores foram incluídos integralmente em `prioridade_52.csv` e na ficha cega. A ausência de conflito lexical não estabelece correção. Não foi estimada uma taxa de incompatibilidade entre assunto e habilidade porque a ligação é pedagógica e multirrótulo, sem correspondência unívoca. Tampouco há uma estimativa válida de quantas questões são semanticamente classificáveis ou dependem realmente de uma imagem. O padrão restrito de apontador sem asset não sinalizou casos nesta rodada. Esse zero não confirma que todas as figuras estejam disponíveis. Os recursos foram inventariados, sem inspeção visual. As flags por item mostram possíveis imagens, gráficos, tabelas, fórmulas e problemas de extração.

Um caso prioritário reproduzido é `gq_e898766ae6adc513f38c0641`: o catálogo indica Geometria, mas o comando pede variância e a área do talhão serve para conversão de unidades. A classificação sugerida é Probabilidade e estatística, com variância e conversão de unidades como subassunto a revisar. Os pareceres dirigidos anteriores, incluídos como evidência, mostram também alertas enganosos por metáfora ou distrator e casos multirrótulo. Eles foram feitos com apoio de IA e continuam pendentes de revisão humana.

## TRI e piloto provisório

O JSON apresenta mínimo, mediana, máximo e suporte de b por assunto e habilidade dentro de área. Em Geometria de MT, por exemplo, 126 itens têm mediana 1,94345, com intervalo de 0,465 a 12,4166. Física de CN tem 242 itens, mediana 1,56059 e máximo 61,05459. O extremo já foi conferido na tabela e tem discriminação baixa. Essas diferenças servem para localizar lacunas e outliers. Não validam o rótulo e não autorizam comparar áreas como se partilhassem uma escala pedagógica. Nenhum parâmetro foi alterado.

O recorte de 1.329 é a interseção do subconjunto anterior de 1.331 itens de treino com os filtros de conteúdo e conflito atualizados. Mantém TRI e habilidade tabular conferidas e assunto preenchido, ainda não certificado. Use-o apenas como catálogo provisório, com fallback por área e procedência explícita. Qualquer questão fora do recorte continua no catálogo derivado.

## Protocolo humano e impacto no recomendador

A ficha cega contém 300 itens, 75 por área, variando período, assunto, habilidade, sinalização, presença de recursos e score de origem. Cada revisor recebe uma cópia sem rótulos, score ou gabarito. Dois avaliadores qualificados devem trabalhar separadamente, registrar a evidência textual/visual, permitir multirrótulo e marcar quando o conteúdo é insuficiente. Um terceiro resolve divergências. Recursos catalogados devem ser abertos e, se necessário, confrontados com o caderno. Só estime concordância e taxa de erro após obter avaliações reais. A amostra prioriza alertas e não deve ser extrapolada sem ponderação.

Assunto ruidoso pode trazer candidatos irrelevantes. Habilidade mal ligada pode acumular acertos na dimensão errada, mascarando lacunas e confundindo a progressão. A TRI não resolve a identificação de conteúdo. No futuro, a recuperação semântica deve fornecer IDs e relevância. O catálogo entrega área, habilidade com origem e versão, TRI e assunto com status explícito. O módulo individual usa primeira tentativa, ordem, histórico por habilidade e item. A camada incremental deve distinguir mudança de estado individual de mudança de parâmetros, com avaliação temporal e rollback. Não houve novo treinamento nesta entrega.

## Reprodução

Da raiz, com Python 3.14 e o dataset da revisão auditada:

```powershell
python -B dificuldade-adaptativa/revisao_pedagogica/revisar.py base-oficial/Dataset/base_trabalho
python -B -m unittest discover -s dificuldade-adaptativa/revisao_pedagogica -v
```

O script usa a conferência tabular anterior incluída no pacote. A primeira execução não produziu sugestões devido a caracteres de controle no padrão lexical e falhou ao escrever uma tabela vazia. Corrigi os padrões e reexecutei. Os quatro testes finais passaram. O ZIP inclui scripts, CSVs, JSON, logs, evidências anteriores e manifesto SHA-256.
