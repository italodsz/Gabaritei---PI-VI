# Gabaritei · Auditoria e enriquecimento do catálogo ENEM

**Decisão: PROMISSOR COM RESSALVAS.** O cruzamento por ID é reproduzível dentro da revisão auditada. A qualidade dos rótulos de conteúdo ainda é insuficiente para fine-tuning supervisionado de assunto, subassunto ou habilidade. A ablação não demonstrou ganho relevante na previsão de dificuldade.

## Catálogo e qualidade

A auditoria leu os bytes originais da revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` e comparou os hashes dos insumos com a Fase 1. O SHA-256 do catálogo foi `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Nenhum registro foi removido. O enriquecimento foi escrito em arquivo lateral, unido pelo ID.

| Campo | Resultado em 2.971 questões |
|---|---:|
| Áreas | LC 801, CH 766, CN 708, MT 696 |
| Anos | 2009–2024 |
| IDs de catálogo únicos | 2.971 |
| Referência com código de item, arquivo de origem e ano coerente | 2.971 |
| TRI completa | 2.971 |
| Habilidade presente | 2.779 |
| Assunto e subassunto inferidos | 2.411 |
| Metadados pedagógicos marcados como gerados por regra e sem revisão | 2.971 |
| Itens com recursos associados | 878 |
| Menção lexical a figura, gráfico, tabela ou imagem | 738 |
| Itens sem enunciado e sem gabarito válido entre as opções | 2 em cada checagem |
| Grupos de enunciado normalizado repetido no catálogo | 10 |

As flags por registro e os totais por ano estão no JSON. A decodificação UTF-8 passou e nenhum caractere de substituição foi encontrado. Isso não certifica legibilidade nem correção de OCR. As opções e o gabarito foram checados quanto à consistência interna, sem confrontar cada questão com seu caderno. Os indicadores de recursos visuais têm critérios distintos, e menção textual não implica dependência de uma figura. O experimento usa enunciado somente e não interpreta recursos visuais.

Verifiquei igualdade de registros com o catálogo nos splits, separação de IDs elegíveis e ausência de sobreposição de família, família de conteúdo e código do item entre splits elegíveis. São 1.801/136/126 itens em treino, validação e teste. Essa triagem não esgota paráfrases ou equivalência visual. A paridade de bytes com a Fase 1 confirma a versão local. O Inep registra correções em edições históricas de microdados. A etapa ainda não refez a junção com os arquivos externos ano a ano. [Microdados oficiais e correções](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

## Matriz e taxonomia

A chave de habilidade é `área:Hn`, porque cada área tem sua própria numeração. `matriz_codigos.json` registra limites inclusivos por competência em ordem. Por exemplo, em LC a primeira competência termina em H4 e a segunda em H8. A competência no catálogo lateral é derivada do código já existente. A validade formal de um código na matriz não certifica que ele corresponde à questão. Os microdados de itens são a fonte externa prioritária para essa verificação. A associação deve conferir código, ano, área, edição/caderno e evidência de ligação do texto. Quando houver ambiguidade, mantenha o caso pendente. [Matriz oficial de referência](https://download.inep.gov.br/download/enem/matriz_referencia.pdf?EPU=false)

A área agrupa o domínio do exame, a disciplina identifica um ramo curricular, assunto e subassunto descrevem conteúdo, competência é um agrupamento da matriz e habilidade identifica uma operação esperada. A taxonomia de trabalho agrupa 21 pares área–assunto inferido e seus subassuntos observados. Ela preserva as categorias existentes, que misturam disciplinas e temas e precisam de revisão semântica. A coluna disciplina permanece nula. Os campos de assunto e subassunto são listas para permitir multirrótulo futuro, com zero ou um rótulo observado nesta versão. A matriz não foi usada para inventar habilidades. O score original das regras é registrado como não calibrado.

## TRI e ablação

O catálogo preserva o registro de origem e os três parâmetros. A discriminação `a` indica sensibilidade à proficiência, `b` localiza o item na escala, e `c` representa a assíntota inferior do modelo. Dez itens têm `a < 0,25`. A Fase 1 observou um extremo `b=61,05459` com baixa discriminação. A comparabilidade por área e ano não foi recalibrada. Para itens com TRI disponível e ligação confiável, prefira o valor observado. O campo operacional de dificuldade usa os tercis de `b` ajustados somente no treino elegível, em 0,80054 e 1,56301. Esses cortes não correspondem a níveis oficiais. [Nota técnica de TRI do Inep](https://download.inep.gov.br/educacao_basica/enem/nota_tecnica/2011/nota_tecnica_tri_enem_18012012.pdf)

| LinearSVC com TF-IDF de caracteres | Macro-F1 em 2023 | Acurácia |
|---|---:|---:|
| Só texto | 0,4188 | 58/136 |
| Texto + assunto inferido | 0,4062 | 56/136 |
| Texto + assunto inferido + código de habilidade | 0,4200 | 58/136 |

Usei as mesmas 1.801 questões de treino e 136 de validação. Vetorização e codificação categórica foram ajustadas no treino. Nenhuma entrada contém TRI. O alvo é a classe derivada de `b`. As opções experimentais são atributos de catálogo disponíveis antes da previsão, incluindo assunto sem revisão. O teste de 2024 não foi pontuado. O ganho de 0,0011 sobre texto isolado é pequeno e não sustenta promoção. Adicionar assunto isoladamente piorou o resultado. Matrizes, precisão, recall, macro-F1 e métricas por área estão em `ablacao.json`.

## Viabilidade de treino e integração

O catálogo tem 192 habilidades ausentes e 560 itens sem assunto. A cobertura dos campos restantes não confirma sua exatidão. Para treinar habilidade, confirme as associações com microdados e a qualidade da ligação. Para assunto e subassunto, faça dupla anotação cega por área, permita múltiplos rótulos e registre divergências, adjudicação e versões. Separe conjuntos por ano e famílias antes de anotar para avaliação. A classificação supervisionada por conteúdo ficou pendente. Os resultados anteriores de MiniLM e BERTimbau são de dificuldade, e não constituem avaliação de assunto. TF-IDF é a referência inicial mais barata após obter rótulos. MiniLM congelado e BERTimbau ajustado entram na mesma comparação quando houver cobertura suficiente.

O catálogo versionado pode fornecer IDs, área, habilidade verificada, tópicos com procedência e TRI ao módulo adaptativo. BKT atualiza estado por habilidade a partir de respostas anteriores. Em ausência de habilidade verificada, use estado por área com granularidade explícita. SGD recebe o estado, histórico e atributos de item para estimar acerto, com atualização em lote e avaliação temporal antes de promover versões. O recomendador fornece candidatos e conserva a preferência do estudante. A classificação de novos itens é outra tarefa. O classificador de conteúdo precisa de reavaliação e retreino periódico quando houver novas anotações. SGD suporta atualização de parâmetros e BKT atualiza o estado do aluno. Não houve implantação nem treino adaptativo nesta execução.

## Dicionário e reprodução

| Campo do catálogo lateral | Origem |
|---|---|
| id, year, area, co_item, official_reference, evidence_id | Valores de ligação preservados do catálogo |
| discipline | Desconhecida nesta versão |
| topics_inferred, subtopics_inferred | Campos de regras preservados em listas |
| topic_method, topic_review_status, topic_confidence_uncalibrated | Proveniência e score bruto |
| catalog_skill | Código catalogado, nullable |
| competence_from_catalog_skill | Derivação pela matriz na área, nullable |
| tri | Parâmetros originais do catálogo |
| difficulty | 0 fácil, 1 média, 2 difícil, tercis de treino |
| flags | Diagnóstico por item |

O texto, as alternativas, o gabarito e os recursos continuam no catálogo original. Una pelo ID e exija a revisão e o hash registrados. Da raiz, com Python 3.14, pandas 2.3.3 e scikit-learn 1.8.0:

```powershell
python -B dificuldade-adaptativa/enriquecimento/executar.py base-oficial/Dataset/base_trabalho
python -B -m unittest discover -s dificuldade-adaptativa/enriquecimento -v
```

O comando de preparação da base está no README do módulo. Os quatro testes de matriz, consistência, reprodutibilidade, preservação e separação passaram. O manifesto contém os hashes do pacote.
