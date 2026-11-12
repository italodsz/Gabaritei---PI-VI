# Base de trabalho (versão atual)
É a v2.1-rc1 (no branch wardrobe, pasta Dataset/experimento_v2_1_rc1) com a fórmula da questão
gq_14561aefce51ecddf26b4262 corrigida, a questão gq_29b02702604175cb29267886 bloqueada
e as revisões de 11/11 e 12/11/2026 descritas abaixo (ver qualidade/). 3.086 questões; 2.370 elegíveis
para recomendação por texto (2.021 treino, 175 validação, 174 teste), listadas em ids_elegiveis.json.
Não inclui vetores: os índices precisam ser refeitos (ver AVISO_INDICES.json).
SHA-256 de data/questions.jsonl:
369c948c15be29d1b270a8d5ce218c2c2e97ffd64cfcabf0db1ebcb158923d65.
Versão de 12/11/2026 (descrições próprias retiradas): 4049931c386c18db42336773dea31b97298af9bbcc64bb88ea7a57522c3c92a6.
Versão de 12/11/2026 (descrições do Tardelli): f8d42fa77d5ab756e416ec75bbb5fd5950270b12915231a3e25a5c2c9995b6dd.
Versão de 12/11/2026 (descrições do Tardelli, 1ª parte): f23e2b67810eb569a56e85f3641022f70a84ca2cc9842eb942359035f20c66dd.
Versão de 12/11/2026 (versões adaptadas removidas): 8409158caa0faab7914c0248a6caaf20aa3dbfabdde0438c4a6918bb18433089.
Versão de 12/11/2026 (faltantes 2009–2024): c689261e892c9e07cec054b4b2ba53c9e43d5bee52a33655e0820db94608624f.
Versão de 12/11/2026 (faltantes 2018/2021): ac096a18cd8786892027d78b327e5a4fc79f75ec1f5a2626723207fdb1ce9034.
Versão de 12/11/2026 (espanhol): 06d44ebaf465a73c5f39912c7f9cbf16a6708ddf3db08a930c0fab3dcb49856f.
Versão de 12/11/2026 (lote 5): c2ddda4715cd127a0f2c8afb9bdf4ca838b093433a0020a70d2a374a0077204e.
Versão de 12/11/2026 (lote 4): 7fda16152615b25f51c48d392babb491b47ad44fef3c608ad0253b2deda87be6.
Versão de 12/11/2026 (defeitos de texto, lote 3): f6b907c94b268f9e11c5b0991708fa6b30a33c127acf78e276dd9fa33c39d624.
Versão de 12/11/2026 (títulos em negrito): 09aacb125efe4a50b714dca581ce341798d0ce25a5a366a8d962d3675b6c82ce.
Versão de 12/11/2026 (pendências, lote 2): 09531345ba96aa3ab04dc07a8fe3590f93b735d95ba091cd98618ea108e51a3c.
Versão de 12/11/2026 (pendências, lote 1): c323cd16f59049687ad41d2e48ed64e18a12b379288f50c94fee8dc5bd019906.
Versão de 12/11/2026 (textos truncados): 4d1ea0244821dcf627a0560e905dc45010b1bebd479542a9507a44c9ae321ecd.
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
   mantida a versão da prova comum; a adaptada foi removida da base em 12/11/2026 (ver seção
   "Versões adaptadas removidas").
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

## Pendências, lote 1 (12/11/2026)

7 questões que estavam fora da recomendação por pendência se resolvem pelo próprio texto. Cada uma
foi conferida resolvendo a questão: a resposta bate com o gabarito oficial. Gabarito, TRI, co_item,
área e split não mudaram. Antes e depois em qualidade/alteracoes_pendencias_lote1_2026-11-12.json.

- 2014 q139 e 2015 q168 (MT): frações achatadas ("1 8") reescritas como 1/8.
- 2016 q180 (MT): texto de fonte secundária, coerente com o gabarito; liberada.
- 2018 q129 (CN): o texto basta; espaço que faltava na alternativa E.
- 2020 q155 (MT): alternativas 2^(-99) no lugar da notação LaTeX.
- 2020 q160 (MT): problema só de texto; liberada.
- 2024 q164 (MT): alternativas escritas para ledor ("fração, numerador…") reescritas como 7!/(3! × 4!).

Efeito na lista de elegíveis: 2.052 para 2.059 (treino 1.796 para 1.802, teste 122 para 123).

## Pendências, lote 2 (12/11/2026)

20 questões conferidas com os PDFs oficiais do INEP (caderno azul, aplicação regular, impresso).
19 voltam para a recomendação; 1 fica fora. Gabarito, TRI, co_item, área e split não mudaram.
Antes e depois, com o PDF, a página e a conta de conferência, em
qualidade/alteracoes_pendencias_lote2_2026-11-12.json.

- Gráficos, mapas, figuras e matrizes que faltavam foram transcritos entre colchetes no enunciado,
  com os valores lidos na prova: 2018 q67, q74, q88, q108, q136; 2019 q169, q172; 2020 q65 (CH),
  q129, q130, q148, q164; 2021 q144, q149, q150, q151, q157.
- Alternativas diferentes das da prova azul foram trocadas pelas da prova: 2018 q108 (gráficos
  descritos), 2020 q164, 2021 q144 e 2021 q151 (comando e alternativas de outra versão da questão).
- 2018 co_item 88520: o registro passa a ter o texto certo (silvicultura × extrativismo vegetal).
- 2021 q163: expoentes das unidades restaurados (kg·m^-1·s^-2).
- 2022 catalase: texto e quadro iguais aos da prova azul (questão 120 do caderno 7); desbloqueada.
- 2019 q146 fica fora: alternativas e gráfico transcritos da prova, mas o gabarito oficial (A, só o
  dia 1) não bate com a leitura do gráfico, em que o dia 12 (40 °C e 20%) também atende ao alerta
  laranja. Precisa de conferência humana.

Efeito na lista de elegíveis: 2.059 para 2.078 (treino 1.802 para 1.821).

## Títulos em Markdown (12/11/2026)

Os títulos marcados com `##` ou `###` (172 marcas em 169 questões, 131 delas elegíveis) passaram a
`**negrito**`, o mesmo padrão já usado em outras 498 questões. Nenhuma palavra mudou: antes e
depois em qualidade/alteracoes_titulos_markdown_2026-11-12.json. A lista de elegíveis não muda.

## Defeitos de texto, lote 3 (12/11/2026)

49 registros conferidos com os PDFs oficiais do INEP (caderno azul; aplicação regular e, quando a
questão é da 2ª aplicação, a prova da 2ª aplicação). 46 foram corrigidos, 2 voltaram para a
recomendação e 3 ficaram sem mudança. Gabarito, TRI, co_item, área e split não mudaram. Antes e
depois, com a página da prova e a conferência, em
qualidade/alteracoes_defeitos_texto_lote3_2026-11-12.json.

- Erros de digitação e de cópia: "contnua", "adaplado", "Acessoem", "mihões", "todos o aparelhos",
  "Puertal", "descontamento", "decoagulação", "estudants", "grupos s funcionais" e outros.
- Fórmulas, expoentes e cargas: 10^-4, mol^-1, g cm^-3, m s^-1, Na⁺ e HCO3⁻, ²³⁵U, Na2CO3,
  frações e expoentes das alternativas de matemática.
- Versos e estrofes refeitos pela prova: 2018 q10, 2019 q7, 2021 q11; títulos e parágrafos da
  2015 q108 (2ª aplicação); trecho corrompido de "Negrinha" (2010 q129) restaurado.
- Conteúdo que faltava: Texto II da 2019 q26 (infográfico transcrito), equação da 2020 q120, fontes
  da 2023 q49 e q79.
- Alternativas diferentes das da prova, trocadas pelas da prova: 2020 q96 (alternativa E) e
  2020 q120 (todas). O gabarito oficial continua o mesmo e bate com a conta.
- 2021 q119 (questão 120 do caderno azul): a base tinha o comando de outra pergunta (antocianinas);
  comando, textos e figuras restaurados. A dúvida de gabarito desaparece: a resposta oficial (A)
  é a certa para a pergunta da prova.
- Liberadas: 2015 q104 (poema concreto; a disposição da prova é a mesma da base) e 2015 q4
  (2ª aplicação; imagem das geleiras descrita).
- Sem mudança: 2010 q32 ("garantido-lhes" está assim na prova), 2011 q164 ("kW por hora" é do
  próprio enunciado) e 2015 q104 (texto igual ao da prova).

Efeito na lista de elegíveis: 2.078 para 2.080 (treino 1.821 para 1.823).

## Lote 4 (12/11/2026)

Antes e depois em qualidade/alteracoes_lote4_2026-11-12.json. Gabarito, TRI, co_item e split não mudaram.

- Marcadores de supressão escapados (`\[…\]`) passaram a `[…]` em 34 questões (33 elegíveis); nenhuma
  palavra mudou.
- 2019 q146 liberada: o gabarito oficial (A, só o dia 1) está certo. No dia 12 a temperatura é
  exatamente 40 °C, e "variar entre 35 °C e 40 °C" não inclui o 40; o dia 13 falha pela umidade.
- 2018 q125 e q126 (CN) remontadas pela prova (2º dia, caderno 7 azul, p. 12). O registro 125 tinha as
  alternativas certas e o comando da 126; o 126 tinha o texto de uma questão de genética de outra
  prova. Agora: q125 com o prisma e a figura descrita (o diagrama do prisma, que estava nos arquivos
  da q126, passou para a q125); q126 com o texto dos tensoativos e as cinco fórmulas estruturais
  descritas. As duas voltam para a recomendação.

Efeito na lista de elegíveis: 2.080 para 2.083 (treino 1.823 para 1.826).

## Lote 5 (12/11/2026)

Antes e depois em qualidade/alteracoes_lote5_2026-11-12.json. Gabarito, TRI, co_item e split não mudaram.

- 2021 q8 (LC) remontada pela prova: o registro tinha o título da questão 9 e alternativas de outra
  questão; agora tem o texto do documentário *O menino que fez um museu*, o comando e as
  alternativas da prova (gabarito C). Volta para a recomendação.
- Fórmulas achatadas encontradas por busca automática nas elegíveis: 2009 q30 e q38, 2015 q157,
  2016 q151 e q163 (2ª aplicação), 2018 q114 (equação da glicose), 2019 q137, 2020 q128, 2022 q126.
  As de 2009 e 2016 não foram conferidas na prova (conversão de notação sem ambiguidade).

Efeito na lista de elegíveis: 2.083 para 2.084 (treino 1.826 para 1.827).

## Questões de espanhol adicionadas (12/11/2026)

7 questões de espanhol que nunca tinham entrado na base: 2018 q2 e q5 e 2021 q1 a q5 (1º dia, caderno 1
azul, aplicação regular). Texto e alternativas transcritos da prova oficial; co_item, gabarito,
habilidade e parâmetros da TRI tirados dos microdados do INEP (ITENS_PROVA_2018.csv e
ITENS_PROVA_2021.csv, TP_LINGUA = 1). Cada gabarito foi conferido resolvendo a questão. A charge da
2021 q5 está descrita em texto (a imagem não está na base). Os 3 registros de espanhol de 2018 que já
existiam (q1, q3 e q4) conferem com os microdados. Detalhes em
qualidade/questoes_espanhol_adicionadas_2026-11-12.json.

Efeito: 2.971 para 2.978 questões; elegíveis de 2.084 para 2.091 (todas no treino).

## Questões faltantes de 2018 e 2021 adicionadas (12/11/2026)

19 questões em português que nunca tinham entrado na base: 2018 q56, q91, q92, q117, q127 (pólen de
pequizeiros), q128, q165, q173, q175, q178; 2021 q36, q88, q105, q107, q125, q161, q162, q165, q177.
Texto transcrito da prova oficial (caderno azul); gráficos e quadros descritos em texto entre colchetes.
co_item, gabarito, habilidade e TRI dos microdados do INEP; cada gabarito conferido resolvendo a questão.
Ficaram de fora 5 questões cujas alternativas são só desenhos (2018 q95 e q159; 2021 q102, q126 e q137)
e as 5 anuladas pelo INEP (2018 q163; 2021 q24, q43, q118 e q138). Detalhes em
qualidade/questoes_faltantes_2018_2021_adicionadas_2026-11-12.json.

Efeito: 2.978 para 2.997 questões; elegíveis de 2.091 para 2.110 (todas no treino).

## Questões faltantes de 2009 a 2024 adicionadas (12/11/2026)

Cruzamento da base com os microdados do INEP (ITENS_PROVA de 2009 a 2024, sem 2018 e 2021) mostrou 119
questões válidas sem registro. Foram adicionadas 92 (2009: 4; 2010: 4; 2011: 17; 2012: 11; 2013: 7;
2014: 8; 2015: 4; 2016: 3; 2019: 6; 2020: 11; 2022: 6; 2023: 5; 2024: 6), com texto transcrito da prova
oficial (caderno azul) e gráficos, figuras e fórmulas descritos em texto entre colchetes. co_item,
gabarito, habilidade e TRI vêm dos microdados; cada gabarito foi conferido resolvendo a questão.
Em 2011 (Ciências Humanas, caderno branco) e em 2022 a 2024 (cadernos laranja) a posição registrada é a
do caderno usado pela base; a posição correspondente no caderno azul está no arquivo de qualidade.
Ficaram de fora 21 questões cujas alternativas são só desenhos (circuitos, estruturas químicas,
projeções etc.) e 6 cujo texto-base é letra de canção ou poema contemporâneo. Lista completa em
qualidade/questoes_faltantes_2009_2024_adicionadas_2026-11-12.json.

Efeito: 2.997 para 3.089 questões; elegíveis de 2.110 para 2.202 (todas no treino).

## Versões adaptadas removidas (12/11/2026)

Removidas 9 questões que eram versões adaptadas (caderno para candidatos com necessidades específicas) de
questões já presentes na versão padrão: 2022 MT q152, q154, q173; 2023 MT q146, q163; 2024 CN q115 e
MT q168, q173, q178. Nenhuma estava na lista de elegíveis. Lista em
qualidade/versoes_adaptadas_removidas_2026-11-12.json.

Efeito: 3.089 para 3.080 questões; elegíveis inalteradas (2.202).

## Descrições do Tardelli incorporadas (12/11/2026)

Fonte: tardellirs/enem-audiodescricao (977 descrições de 2019 a 2025, extraídas dos cadernos ledor do
INEP; pacote baixado em 12/11/2026, revisão 6fdfa6e3b96579549e31b2138f956d9644be58c1).

1. **Casamento com a base.** Só a aplicação regular de 2019 a 2024. Pelo texto do enunciado dentro do mesmo
   ano (e, em 2022 a 2024, também pela posição, que coincide com a numeração do Tardelli em 100% dos casos),
   sempre conferido pelo gabarito: 293 de 295 casamentos automáticos com gabarito igual; os 2 restantes
   são de inglês/espanhol, em que o Tardelli não traz gabarito.
2. **232 questões liberadas.** A descrição entra no texto da questão, entre colchetes (`[Descrição do
   gráfico: ...]`), no lugar do marcador `[[placeholder]]`/`[IMAGEM: ...]`; sem marcador, entra antes da linha
   de crédito (`Disponível em`) ou, se não houver, no início. A regra aplicada a cada questão está em
   `quality_review.image_description_rule`. Status `image_described_by_inep_ledor_tardelli`. Por ano: 2019: 36,
   2020: 33, 2021: 37, 2022: 37, 2023: 39, 2024: 50.
3. **Descrições de IA removidas.** As 137 descrições do candido-ai/enem-ocr (97 questões de 2019 a 2021) foram
   retiradas de `descriptions`: contra o Tardelli a similaridade mediana é 0,22 e nenhuma passa de 0,8; em
   exemplos conferidos, a IA descrevia outra imagem. Os textos removidos estão no log.
4. **Maritaca conferida.** Em 105 de 116 questões as descrições da Maritaca e do Tardelli têm similaridade de pelo
   menos 0,95. Nas 11 restantes o Tardelli é de 1,2 a 2,8 vezes maior: a Maritaca descreveu só uma das figuras.
   As descrições da Maritaca continuam em `descriptions` (`used_in_question_text: false`) com
   `similarity_with_tardelli`.
5. **Rótulo ledor corrigido.** 12 questões de 2024 (posições 2, 3, 4, 12, 16, 18, 23, 27, 69, 72, 78, 91) têm
   `ledor=false` na própria Maritaca; a origem dessas descrições passou de `ledor_INEP_declarado_pelo_publicador`
   para `maritaca_descricao_sem_ledor_confirmado`. Em 11 delas o texto agora usa a descrição do Tardelli.
6. **Revisão das 33 não casadas** (ver `qualidade/revisao_nao_casadas_tardelli_2026-11-12.json`): 13 aceitas por
   posição/alternativas e gabarito, 2 já elegíveis, 4 itens anulados pelo INEP (2022 q92, q112, q177; 2023 q138),
   8 sem correspondente na base (itens exclusivos do caderno adaptado de 2019 a 2021) e 6 questões novas.
7. **6 questões novas** (alternativas em figura, antes pendentes): 2022 q128 e q131; 2024 q93, q122, q128 e
   q180. Texto e descrição de cada alternativa vêm do Tardelli; gabarito, habilidade e TRI do INEP (o gabarito
   do INEP é igual ao do Tardelli nas seis).

As descrições do Tardelli seguem a leitura do caderno ledor: unidades e símbolos por extenso ("miligrama
por litro", "abre parêntese"). As imagens em si não estão no repositório (só o hash, em `assets`); as imagens
do pacote ficam fora do git.

Efeito: 3.080 para 3.086 questões; elegíveis de 2.202 para 2.440 (232 já na base mais 6 novas). Os conjuntos
de validação e teste cresceram (134 para 173 e 123 para 173), então resultados anteriores e posteriores não
são comparáveis diretamente.

## Descrições da Maritaca incorporadas (12/11/2026)

Três questões sem cobertura do Tardelli já tinham descrição da Maritaca na base: 2023 posições 7 e 54 e 2024
posição 4 (inglês). O gabarito da Maritaca é igual ao da base nas três. A descrição entra no texto no lugar do
`[[placeholder]]` (status `image_described_by_maritaca`). A de 2024 posição 4 vem de item que a própria
Maritaca marca como `ledor=false`; a descrição transcreve a carta e é coerente com o gabarito oficial, o que
está anotado no registro. Log em qualidade/descricoes_maritaca_incorporadas_2026-11-12.json.

Efeito: elegíveis de 2.440 para 2.443 (validação 175, teste 174).

## Descrições próprias substituídas ou retiradas (12/11/2026)
Regra adotada: o recomendador só usa descrição de imagem vinda de fonte confiável (audiodescrição do ledor INEP
via Tardelli, ou Maritaca). Das 97 questões elegíveis que ainda tinham descrição de figura escrita por nós (IA):
- 24 tiveram a descrição própria trocada pela do Tardelli (casamento por texto e gabarito conferidos);
- 73 saíram do recomendador (continuam na base, com quality_review.status = figure_description_not_from_reliable_source,
  text_experiment_eligible = false e ready_text = false), pois não há descrição confiável: 2009–2015 e 2018 (sem fonte),
  parte de 2020–2023, e casos em que o Tardelli não descreve cada alternativa (2021 pos. 105/161/162, 2023 pos. 164)
  ou casou com a versão em inglês (2022 pos. 1 e 5).
Tabelas, quadros e fórmulas escritas como texto continuam como estão (são transcrição, não descrição de imagem).
Efeito: elegíveis de 2.443 para 2.370 (treino 2.021, validação 175, teste 174). Log: qualidade/descricoes_proprias_substituidas_ou_retiradas_2026-11-12.json.

## Problemas conhecidos (próxima revisão)

- 20 questões só com alternativas em desenho (5 de 2018/2021 e 15 de outros anos) e 6 com letra de
  canção ou poema ainda não estão na base.
- 643 questões continuam fora da recomendação por texto por depender de imagem: 607 de 2009 a 2018 (sem descrição
  profissional; o Tardelli só cobre 2019 a 2025 e a Maritaca só 2022 a 2024) e 36 de 2019 a 2021 sem
  correspondente no Tardelli.
- A busca automática por fórmulas achatadas não pega todos os formatos; pode haver outras.
