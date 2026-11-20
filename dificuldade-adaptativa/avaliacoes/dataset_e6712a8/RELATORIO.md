# Conferência do novo dataset — Gabaritei

Conferência técnica de 13/11/2026. Sem alterações no projeto, treinamento ou publicação.

## Versão examinada

Branch `dataset`, commit `e6712a8a6b4bffffadbe75bd4e8d520ec7628e4d`, publicado por Felipe Teles em 13/11/2026 às 17:28:10 UTC. [Commit verificável](https://github.com/italodsz/Gabaritei---PI-VI/commit/e6712a8a6b4bffffadbe75bd4e8d520ec7628e4d).

SHA-256 do arquivo questions.jsonl: `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`, correspondente ao AVISO_INDICES.json publicado. As fontes e URLs exatas estão em results/fontes.json.

## Contagens confirmadas

| Indicador | Versão anterior, 67a5036 | Versão nova, e6712a8 |
|---|---:|---:|
| Questões no arquivo | 3.086 | 3.086 |
| Elegíveis para busca textual | 2.563 | 2.731 |
| Elegíveis de treino | 2.214 | 2.382 |
| Elegíveis de validação | 175 | 175 |
| Elegíveis de teste | 174 | 174 |
| Fora da elegibilidade textual | 523 | 355 |

Há 626 registros alterados, nenhum ID adicionado nem removido em relação à versão imediatamente anterior. Mudaram descrições em 624 questões, quality_review em 626, enunciado em 427, ready_text em 168 e alternativas em 4. A conferência identifica campos alterados, não certifica semanticamente cada correção. TRI não mudou nos registros compartilhados.

Em relação à base antiga do recomendador, de 2.971 questões e 2.063 elegíveis, a versão nova tem 124 IDs novos e 9 removidos, resultando em 3.086 registros. O ganho acumulado de elegibilidade é de **668 questões**. Isso explica o relato de aproximadamente 600–700 recuperadas: recuperação para busca não significa necessariamente inserir 700 registros novos no arquivo. Essa comparação usa a base antiga presente no snapshot do recomendador, cujo texto já tinha alterações em relação ao dataset histórico da Fase 1.

As quatro áreas estão presentes: CH 780, CN 744, LC 835 e MT 727. Cobertura temporal: 2009 a 2024. Quantidades por ano estão em results/resumo.json.

## Campos necessários ao módulo de dificuldade

Todas as 3.086 questões têm TRI a/b/c numérica finita; a é positiva e c está em [0,1). Identificadores são únicos, os IDs elegíveis existem na base e os arquivos de splits correspondem aos registros centrais. As cinco alternativas e o pertencimento do gabarito ao conjunto de letras foram conferidos estruturalmente. O conteúdo visual e a correção pedagógica de cada alternativa não foram revalidados nesta etapa.

Portanto, o parâmetro b e a área continuam disponíveis para filtragem por dificuldade. Isso não garante que as 3.086 possam ser apresentadas ao aluno: 355 permanecem fora da elegibilidade textual, nem demonstra estoque suficiente em cada combinação de matéria, habilidade e faixa. Os parâmetros aprendidos pelo BKT no ASSISTments continuam sem validação em estudantes ENEM do Gabaritei. Nenhum corte de dificuldade ou parâmetro BKT foi alterado nesta análise.

## Descrições de imagens: principal mudança de integração

Existem 1.152 registros de descrição em 759 questões. Aplicando estritamente `use_for_recommender == true` e texto não vazio, há 629 descrições habilitadas em **588 questões**. Esses números incluem escopos distintos: as 424 questões mencionadas no aviso são as que tiveram descrições retiradas do enunciado, não todo o universo com descrição habilitada.

O README informa que o aluno deve ver enunciado e imagem, enquanto a descrição serve à busca; em casos sem imagem disponível, a descrição continua no enunciado. Parte das descrições contém o texto completo do caderno do ledor, sem alternativas. Não concatenar indiscriminadamente todas as descrições: existem registros automáticos e históricos que não estão habilitados para busca. Também é preciso tratar sobreposição textual e avaliar truncamento quando o encoder tiver limite de tokens.

As 629 descrições habilitadas têm origem declarada: 371 ledor INEP em caderno adaptado, 255 ledor INEP via audiodescrição, 2 ledor declarado pelo publicador e 1 Maritaca sem ledor confirmado. São campos de procedência da base, não validação independente das fontes ou equivalência visual feita aqui. A associação de cada descrição com a imagem correta e o conteúdo integral dos PDFs não foi reavaliada.

## O código já aproveita isso?

**Ainda não na branch recomendador examinada.** Sua revisão permanece `a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef`. A função `pipeline_baseline.question_text`, linhas 67–70, junta apenas enunciado e textos das alternativas. [Código publicado](https://github.com/italodsz/Gabaritei---PI-VI/blob/a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef/recomendador/rrf-tfidf-minilm-J/pipeline_baseline.py#L67).

A função `load_source` do mesmo arquivo ainda contém assertivas fixas de 2.971 registros e splits antigos. Logo, só trocar o JSONL nesse fluxo pode falhar mesmo antes da indexação. A cópia do código consultado está em baselines/ para rastreabilidade; não foi executada nem modificada.

O próprio [aviso da nova base](https://github.com/italodsz/Gabaritei---PI-VI/blob/e6712a8a6b4bffffadbe75bd4e8d520ec7628e4d/Dataset/base_trabalho/AVISO_INDICES.json) informa que os vetores anteriores não são válidos para esta derivação e que a construção do texto precisa ler descrições habilitadas. É necessário atualizar o contrato do texto, conferir regras de elegibilidade e reconstruir os índices compatíveis antes de avaliar as novas listas. Isso não foi executado: nenhum treinamento ou recodificação está autorizado nesta conferência.

## Limitações restantes

- 355 itens não elegíveis: 284 outside_text_scope, 68 figure_description_not_from_reliable_source e 3 image_required_text_disabled.
- 195 questões sem skill; 682 sem topic_predicted. Os campos pedagógicos preservam 2.962 registros rule_generated_unreviewed e 124 absent. São campos específicos do dataset; não substituem eventuais rótulos mantidos em arquivos separados pelo Ítalo e não devem ser apresentados como revisão humana certificada.
- O README ainda relata 20 questões de alternativas em desenho e 6 de canção/poema ausentes da base, além de riscos residuais de fórmulas achatadas. São pendências documentadas pelo time, não itens recuperados ou verificados nesta conferência.
- Não fizemos nova auditoria pedagógica integral, conferência individual de todos os PDFs, download e inspeção de cada imagem, nem avaliação do ranqueamento atualizado.
- As métricas de relevância calculadas antes desta atualização continuam sendo históricas. Não transferir os valores de Precision, Recall e nDCG para esta nova versão.

## Verificações executadas e próximos passos

Oito verificações estruturais passaram: IDs únicos, SHA-256 correspondente ao aviso, existência dos IDs elegíveis, ausência de IDs repetidos entre listas elegíveis, alternativas e gabaritos estruturalmente válidos, TRI completa, domínios a/c e coerência dos splits. Log completo em logs_execucao.txt. Não são oito testes de eficácia do recomendador.

Próxima alteração a planejar com o time: adaptar a leitura do texto para descrições habilitadas e revisar contagens fixas; atualizar a base do recomendador e seus índices; verificar imagens e estoque por faixa; então repetir a avaliação de relevância com julgamentos adequados à nova versão e testar a integração ao filtro de dificuldade, preservando consentimento. Nenhuma dessas alterações foi aplicada agora.

Para reproduzir esta conferência, basta Python >=3.10 e `python auditar.py` na pasta extraída. As fontes e os dois baselines estão incluídos; se o arquivo de uma fonte nova estiver ausente, o script baixa sua revisão fixa. O script não executa código do repositório e apenas grava resultados nesta própria pasta. As comparações são de conteúdo e campos, não desempenho treinado.

Não foram lidas branches do João; não houve commit, push, merge, alteração no dataset original ou avanço de fase.
