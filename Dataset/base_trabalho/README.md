# Base de trabalho (versão atual)
É a v2.1-rc1 (no branch wardrobe, pasta Dataset/experimento_v2_1_rc1) com a fórmula da questão
gq_14561aefce51ecddf26b4262 corrigida, a questão gq_29b02702604175cb29267886 bloqueada
e as revisões de 11/11 e 12/11/2026 descritas abaixo (ver qualidade/). 2.971 questões; 2.052 elegíveis
para recomendação por texto (1.796 treino, 134 validação, 122 teste), listadas em ids_elegiveis.json.
Não inclui vetores: os índices precisam ser refeitos (ver AVISO_INDICES.json).
SHA-256 de data/questions.jsonl:
4d1ea0244821dcf627a0560e905dc45010b1bebd479542a9507a44c9ae321ecd.
Versão de 11/11/2026: d9c80533bbda575375eb2697d5923bd54406fe99faa1d0a02dfa7c550b41a8bb.
Versão de 29/10/2026: 22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5.
É a base usada pelo recomendador oficial, no branch recomendador
(recomendador/rrf-tfidf-minilm-J/), que ainda está na versão anterior.

## Revisão de 11/11/2026

44 registros alterados. Nenhuma questão foi criada ou apagada. Gabarito, TRI, co_item, split e
idioma não mudaram em nenhuma questão. Cada alteração, com o texto antes e depois, está em
qualidade/alteracoes_revisao_2026-11-11.json.

1. Conteúdo trocado entre questões (33 registros): textos e alternativas conferidos com as provas
   e os gabaritos oficiais do INEP (caderno azul). Os 33 gabaritos já estavam corretos; o problema
   era o texto associado a eles (questões partidas em duas, alternativas de outra questão, inglês
   com o texto do espanhol, registros vazios). Dessas 33, 22 ficam elegíveis e corretas; 11 dependem
   de imagem e ficam fora da recomendação por texto. Destas 11, 4 ainda estão incompletas
   (2018 q34, 2020 q175, 2021 q120 e 2021 q135).
2. Questões duplicadas (9 pares de 2022 a 2024): a versão da prova adaptada (caderno laranja /
   leitor de tela) tinha enunciado, alternativas e gabarito idênticos aos da prova comum. Foi
   mantida a versão da prova comum; a adaptada continua na base, fora da lista de elegíveis, com
   quality_review.duplicate_of apontando para a comum.
3. Alternativas e tabelas (8 registros): alternativas corrigidas pela prova em 2018 q169 (o
   gabarito C apontava para o texto errado), 2019 q169, 2020 q65 e 2021 q150; cabeçalho de 4
   tabelas de 2022 e 2024 sem as sobras "Unnamed"/"nan", sem alterar nenhum valor.
4. Cinco questões com imagem (2020 q44, q51, q119; 2021 q122, q156) receberam a imagem recortada
   da prova (pasta media/) e a descrição da base de audiodescrição tardellirs/enem-audiodescricao.
   Continuam fora da recomendação por texto até o grupo definir o padrão das questões com imagem.

Efeito na lista de elegíveis: 2.063 para 2.054. Os conjuntos de validação e teste perderam
duplicatas (136 para 134 e 126 para 122), então resultados anteriores e posteriores não são
comparáveis diretamente.

## Revisão de 12/11/2026: textos truncados

21 questões de 2011 a 2021 tinham só o comando, sem o texto-base. O texto foi conferido com o PDF
oficial do INEP (caderno azul). Gabarito, TRI, co_item, área e split não mudaram. Antes e depois
de cada registro, com a fonte e a conferência, em qualidade/alteracoes_textos_truncados_2026-11-12.json.

1. 18 questões restauradas e conferidas resolvendo cada uma: a resposta bate com o gabarito oficial.
   Fórmulas escritas no mesmo padrão da revisão de 11/11 (10^-10, C2H2, log10(3)); em 2015 q152
   os expoentes perdidos das alternativas foram restaurados (8 000 · (1,5)^(t - 1)).
2. 2019 q174 (MT): texto restaurado, mas a resposta depende de dois gráficos de barras que a base
   não tem; sai da lista de elegíveis.
3. 2018, co_item 88520 (gq_d729403b0e500b7ef02bef0a): o comando é da questão de Kelsen/Bobbio, mas
   alternativas e gabarito (C) são de outra questão. A questão de Kelsen já está correta em
   gq_b5d827ac61f9e4d37ce96739. O registro fica marcado como pendente e sai da lista de elegíveis.
4. 2009, posição 69 (gq_1a3a6d4a138f7ba1fba29cef): continua em CH. É uma questão de Literatura,
   mas está na prova de Ciências Humanas, e a área segue o INEP.

Efeito na lista de elegíveis: 2.054 para 2.052 (treino 1.798 para 1.796).

## Problemas conhecidos (próxima revisão)

- 2018 q125 e q126 têm textos trocados entre si e com uma questão de genética que não tem
  registro próprio; as duas já estão fora da recomendação.
- 2021 q8 está com o texto de outras questões (fora da recomendação).
- 2018 co_item 88520: falta o texto da questão das alternativas sobre madeira de reflorestamento
  (fora da recomendação).
- Faltam na base as questões 5 de espanhol de 2018 e de 2021.
- 12 questões com fórmulas achatadas (expoentes, frações e índices viraram números soltos).
- Lote das questões com imagem que têm descrição na base tardellirs/enem-audiodescricao.
