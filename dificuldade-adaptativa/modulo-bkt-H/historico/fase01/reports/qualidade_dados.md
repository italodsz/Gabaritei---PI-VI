# Qualidade dos dados e reconstrução dos históricos

## Identidade da fonte e perdas

O arquivo oficial de 64.412.812 bytes foi obtido do Drive indicado pelo ASSISTments. O SHA-256 é 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. Coincide com a cópia histórica da PI6 e com o perfil anterior. A edição original tem 4.217 estudantes, 26.688 itens e 123 IDs atômicos observados, contando componentes de rótulos múltiplos apenas para descrever o inventário. A fonte contém 223.818 rótulos 1 e 123.042 rótulos 0 antes dos filtros.

| Motivo principal da exclusão | Registros |
| --- | ---: |
| Habilidade ausente | 63.755 |
| Habilidade composta | 47.037 |
| Andaime após os filtros precedentes | 21.643 |
| Resposta aberta marcada automaticamente | 8 |
| Total excluído | 132.443 |
| Total retido | 214.417 |

Os motivos são exclusivos. A fonte tem 71.402 linhas de andaime, das quais 49.759 já saem nos filtros anteriores de habilidade. Identificadores de estudante, item e ordem são válidos nos 346.860 registros. O arquivo verificado não apresenta chaves repetidas, conflito de ordem nem valores de acerto fora de 0 e 1. O manifesto inclui zero para todos os filtros sem ocorrência. O perfil histórico foi reproduzido com 214.425 eventos. A aplicação da regra de resposta aberta, documentada pelo publicador e já usada no fechamento de viabilidade, reduz o total para 214.417 e os históricos com cinco eventos ou mais de 15.073 para 15.072. As 32.070 sequências e os 4.003 estudantes continuam presentes.

## Transformações e ordem

O parser usa latin-1 para ler o CSV com campos de texto livre de codificação não uniforme. O teste de UTF-8 estrito e seu erro constam no log. Os campos utilizados para a preparação são numéricos ou categorias ASCII. O processamento não exporta respostas textuais, IDs de escola ou turma, nem professor.

A chave lógica é estudante e ordem. Projeções idênticas preservam a primeira posição do CSV. Chaves com projeções incompatíveis ou ordens vinculadas a mais de um estudante são excluídas em bloco. A validação também rejeita empates numa sequência canônica. A coluna order_id identifica um registro de problema e fornece a ordem relativa documentada. A comparação de opportunity_original entre eventos adjacentes retidos encontrou 182.347 aumentos, com 5.022 saltos e zero empates ou quedas. O contador funciona como evidência complementar. O pipeline usa ordem numérica por estudante e habilidade e deixa timestamp_utc_nullable vazio. ms_first_response representa duração, em milissegundos. A ordenação não mede intervalo de tempo nem o instante real da ação no relógio. [Dicionário do ASSISTments 2009–2010](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data)

A observação binária é a coluna correct. O valor 0 pode representar erro ou solicitação de ajuda. original=1 identifica a questão principal. A primeira ação 0 identifica tentativa, 1 dica e 2 abertura de andaime. O indicador de ajuda segue essa codificação e fica nulo para códigos desconhecidos. Nas 151.015 linhas de treino, as 14.284 com ajuda inicial têm rótulo 0. Essa concordância é uma verificação empírica adicional. [Descrição da ação inicial por Ostrow et al.](https://files.eric.ed.gov/fulltext/ED615335.pdf)

Cada interação preserva item, habilidade, ordem, resultado e posição do registro no CSV, indexada a partir de 1 após o cabeçalho. A identidade do aluno é pseudonimizada por HMAC-SHA256 com chave local de 32 bytes. A vinculação ao arquivo bruto exige a revisão oficial e, para conferir a identidade transformada, a chave local. As oito saídas processadas com dados individuais têm hash no manifesto local. Os rótulos de validação e teste ficam nos seus respectivos arquivos privados.

## Ordem das decisões e controle de vazamento

A limpeza usa regras fixadas pela documentação da edição e pelo protocolo histórico, incluindo domínio binário válido. Os estudantes elegíveis são ranqueados por SHA-256 da semente 20261110 com o ID original, com desempate pelo ID e quotas de maiores restos. A alocação obtida foi 69,9975% / 15,0137% / 14,9888%, com desvio inferior a 0,014 ponto percentual em cada grupo. Todas as interações e habilidades do estudante ficam no mesmo conjunto. O ordenamento para divisão independe de respostas, volumes por habilidade e chave de pseudonimização. Depois do split, a função de suficiência aceita exclusivamente observações marcadas como treino. As decisões usam respostas somente desse grupo.

A auditoria separada em SQLite reconstruiu o recorte diretamente do CSV, conferiu os 214.417 eventos, as 32.070 sequências, as exclusões, a proveniência e a elegibilidade. As interseções de alunos e eventos foram zero. Há itens compartilhados entre conjuntos, coerentes com a pergunta sobre alunos novos. Entre 9.264 itens no teste, 8.802 aparecem também no treino. O teste não representa uma partição de itens novos. Os rótulos retidos foram usados pela auditoria para confirmar fidelidade e domínio, sem estimar desempenho. O conjunto de teste fica congelado pelo hash.

A verificação em SQLite foi produzida pelo mesmo responsável da implementação principal, com código e mecanismo de cálculo separados. Nove exemplos estratificados por conjunto e tamanho de histórico foram registrados de forma agregada. A auditoria comparou o universo de registros, além dessa amostra.
