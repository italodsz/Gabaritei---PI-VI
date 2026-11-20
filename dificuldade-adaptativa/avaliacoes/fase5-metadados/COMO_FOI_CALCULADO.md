# O que foi levado em conta

## Fonte e versão

Base congelada 4B, commit de origem f7ce6aca633f2543e0d8be18ae1a5a898a4ac929.
Esse hash identifica a origem, não um commit desta entrega. Dataset local:
base4b/projeto/Dataset/base_trabalho/data/questions.jsonl, SHA-256
6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f.
3.086 registros nessa versão; não misturar com o catálogo histórico de 2.971.

Conferência de habilidade: ano, CO_PROVA, CO_ITEM, área, posição e gabarito nas
cópias locais ITENS_PROVA 2009–2024. 2.891 registros com habilidade confirmada
na cópia tabular; 195 ausentes. Ausência não significa habilidade incorreta.
O mapa área/habilidade/competência foi extraído de dois PDFs locais da matriz,
com 120 associações numéricas coincidentes. Fontes e hashes em fontes/manifesto_fontes.json.
Isso confirma consistência documental e estrutural, não certificação humana do
vínculo entre o conteúdo de cada questão e seu identificador oficial.

## Referência de relevância usada neste ensaio

Grau 2: mesma área e habilidade confirmada da questão de referência da consulta.
Grau 1: mesma área e competência, com outra habilidade.
Grau 0: outra competência; códigos iguais em áreas diferentes não são equivalentes.
Sem habilidade confirmada: desconhecido, nunca convertido em erro ou grau zero.
Competência é derivada da habilidade, não uma segunda avaliação independente.

Área, matéria e título já são filtros do recomendador; não foram usados como
gabarito principal para evitar avaliação circular. Assuntos inferidos por regras
não foram tratados como rótulos humanos confiáveis. A sonda mostrou que skill
não altera a inferência nas 20 consultas atuais; isso não prova independência de
todas as decisões históricas tomadas no desenvolvimento.

Essa referência mede alinhamento de objetivo da Matriz. Questões tematicamente
parecidas podem ter habilidades diferentes e vice-versa. Não mede, sozinha,
se a recomendação ensina o assunto solicitado ou é adequada ao estudante.

## Comparação controlada

20 consultas congeladas, cinco por área, 746 pares, 700 com referência conhecida.
Mesmo perfil artificial para todas: theta=0, desvio-padrão alvo=0,25, n=80,
sem histórico. São condições controladas, não alunos reais. Perfil representado
na grade TRI do motor; suas estatísticas efetivas são calculadas pelo próprio motor.

L: lista original de até 50 candidatas por consulta. K: itens de L com referência
conhecida. E: itens de K que passam pelos filtros comuns de elegibilidade, TRI,
piso semântico e margem de dificuldade. Cada estratégia ordena as mesmas
candidatas elegíveis. Aleatória usa 20 sementes fixas; semântica mantém posição
original; TRI ordena por adequação; unificada usa os pesos congelados da 4B.
Portanto, 'somente TRI' aqui ainda respeita o pool semântico comum: não é busca
TRI livre em todo o catálogo.

Preservamos a ordenação antes de remover desconhecidos. Para inspecionar a ordem
completa da unificada, somente o limite de retorno foi ampliado em uma configuração
local de avaliação; o script verifica que o prefixo coincide com o Top 5 original.
Não houve mudança do modelo nem renormalização dos escores depois da filtragem.

## Fórmulas

Precision@5 = número de itens de grau 2 no Top 5 / 5.
Listas curtas mantêm denominador cinco.

Recall@5 = número de itens de grau 2 no Top 5 / total de itens de grau 2 em K.
Há também Recall@5Eligible, cujo denominador usa somente E.
Se não há positivos, o resultado é nulo e a consulta não entra naquela média.
Esse Recall é condicional ao pool conhecido, não ao catálogo inteiro.

DCG@5 = soma, para i de 1 a 5, de (2^grau_i - 1) / log2(i+1).
IDCG@5 usa os melhores graus de K ordenados de forma ideal.
NDCG@5 = DCG@5 / IDCG@5. IDCG zero implica resultado nulo.
NDCG@5Eligible usa E como universo ideal.

Cada consulta tem o mesmo peso. A média aleatória primeiro agrega suas 20
sementes. Intervalos: 2.000 reamostragens de consultas estratificadas por área,
incluindo sorteio de semente aleatória. Diferenças são pareadas nas mesmas
consultas. NDCG principal inclui IC98,33% com correção para três comparações.
Sementes e parâmetros completos em resultados/plano_metadados_congelado.json.

## Limitações e resultados humanos pendentes

Nenhum nome, formação ou julgamento humano foi inventado. Há 746 pares por
avaliador planejado e zero notas recebidas. As métricas humanas ficam nulas.
185 das 721 questões únicas do universo de revisão têm recursos visuais
declarados cujos arquivos não estão na base congelada. A avaliação documental
não substitui uma revisão completa de enunciado, alternativas e imagens.
As 20 consultas são poucas e foram herdadas do protocolo anterior; não constituem
um teste final novo nem uma amostra aleatória representativa de todo o ENEM.
Não ajustar pesos e depois apresentar este mesmo conjunto como validação independente.

Plano posterior: dois revisores qualificados, avaliações cegas, registro de
inconclusivos, análise de concordância e adjudicação. Recall humano só será
calculado para um universo de referência explicitamente e suficientemente julgado.
Não ocorreu treinamento ou alteração de produção. Nenhuma aprovação pedagógica
ou homologação integral decorre destes números.
