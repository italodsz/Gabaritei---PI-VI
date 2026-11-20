# Proposta: comparação inicial por metadados, sem mudar o recomendador

## Decisão sobre a referência

Área, matéria e título já são filtros do titulo_area. O assunto da árvore também
participa da prioridade de algumas matérias. Usar essas coincidências como gabarito
principal seria circular. Os campos pedagógicos previstos por regras e não revisados
também não são padrão-ouro.

A referência externa candidata é CO_HABILIDADE, confrontado nas tabelas locais
ITENS_PROVA de 2009-2024 por ano, prova, item, área, posição e gabarito. A competência
é derivada da Matriz oficial por área. Os PDFs locais de 2012 e 2026 têm o mesmo mapa
numérico de 120 habilidades. Isso não certifica o vínculo do enunciado com o código
oficial nem substitui uma avaliação humana de pertinência temática.

## O que os números medirão

**Alinhamento de códigos da Matriz ENEM**, um proxy de objetivo cognitivo. Não chamar
esses resultados de Precision/Recall/NDCG humanos nem de validação pedagógica final.
Uma habilidade pode aparecer em assuntos diferentes; assuntos próximos podem avaliar
habilidades diferentes. A referência será independente dos escores, mas não se afirma
independência estatística de todo o processo histórico de elaboração dos metadados.

- Grau 2: mesma área e mesma habilidade oficial confirmada.
- Grau 1: mesma área e competência, com habilidade diferente.
- Grau 0: outra competência na mesma área.
- Sem código confirmado: desconhecido, nunca convertido em zero.

Antes de calcular as métricas, testar em memória que alterar o campo skill não muda
o texto do encoder nem os rankings da rotina original. Nenhum arquivo de produção
será alterado pelo teste. A competência é derivada, não uma segunda anotação independente.

## Desenho da comparação

Manter as 20 consultas congeladas, cinco por área, sem substituição por resultado.
Usar perfil controlado idêntico: distribuição θ=0, DP=0,25 e n=80 artificial; sem
histórico para isolar a ordenação temática. Não são estudantes nem evidências reais.
Manter os parâmetros da 4B. Aleatório terá 20 sementes por consulta.

Definir L como a lista semântica congelada de até 50 IDs, K como seus itens com
referência oficial confirmada e E como o subconjunto de K com os mesmos critérios
de elegibilidade, TRI, piso semântico e margem máxima para todas as estratégias.

1. Produzir a ordem completa congelada de cada estratégia antes de consultar notas.
2. Para unificado, ampliar somente o limite de leitura para inspecionar a ordem inteira
   e conferir que seu prefixo coincide com o Top5 original. Não mudar pesos ou margens.
3. Filtrar itens sem referência e manter a ordem, retornando até cinco em E.
4. Calcular P@5 (grau 2/5), R@5 em K e também R@5 em E. Informar a cobertura K/L e E/K.
5. NDCG usa ganho 2^grau-1 e IDCG em K; informar adicionalmente NDCG em E.
6. Se não houver grau 2 no universo, Recall é null; se IDCG=0, NDCG é null.
   Listas curtas continuam com denominador cinco na Precision.
7. Publicar também uma leitura sem remover desconhecidos do Top5 de produção:
   limites de Precision e Recall/NDCG null quando o universo não estiver todo rotulado.

O resultado principal é condicionado à disponibilidade de códigos e ao pool declarado;
não é Recall de todo o ENEM nem exatamente o Top5 servido com candidatos desconhecidos.
Isso precisa aparecer junto à tabela, e não somente em nota escondida.

## Agregação e incerteza

Média macro por consulta; aleatório primeiro faz média das 20 sementes por consulta.
Apresentar cinco consultas por área e 20 no total, com denominadores por métrica.
Bootstrap pareado estratificado por área, 2.000 reamostragens de consultas e semente
20261118; para a baseline aleatória, incluir sua variabilidade entre sementes.
Apresentar diferenças unificado menos cada baseline e IC95% nominais exploratórios.
Para as três comparações primárias de NDCG, incluir também intervalo 98,33% como
ajuste Bonferroni. Amostra pequena e proxy limitado impedem conclusão pedagógica geral.

## Aprovação e escopo

Esta proposta define apenas avaliação externa, autorizada pelo pedido de comparação.
Nenhuma mudança no modelo é autorizada por estes experimentos. Qualquer ajuste de
pesos, filtros, treino ou publicação será apresentado ao usuário para aprovação.
A avaliação humana permanece pendente até haver revisores qualificados e julgamentos.
