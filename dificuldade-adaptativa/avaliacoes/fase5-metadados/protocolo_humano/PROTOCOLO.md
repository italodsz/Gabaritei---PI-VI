# Avaliação humana pendente - conjunto final de julgamentos

Dois avaliadores humanos qualificados, trabalhando separadamente, avaliam cada par.
Os arquivos A/B têm ordens diferentes e não mostram escores, posições, TRI, rótulo de
assunto atribuído, algoritmo que recuperou o item ou notas históricas.
Nenhum preenchimento foi produzido pela IA. Há cinco consultas por área, 20 no total.
O número de pares por avaliador é registrado em resultados/protocolo_humano.json.

O texto das questões é a consulta contextual; não é necessário aceitar o rótulo atual
como prova de correção. A área é mostrada para enquadrar o conteúdo. Consultar a fonte
oficial e imagens quando necessárias; se não estiverem disponíveis, marcar inconclusivo,
sem transformar falta de evidência em grau zero. Descrições aprovadas estão no texto.

## Escala

- 0: não ajuda a estudar o conteúdo/contexto solicitado.
- 1: parcialmente relacionada, mas trabalha objetivo diferente ou exige contexto adicional.
- 2: diretamente relacionada ao objetivo; permite estudar o mesmo conteúdo de modo pertinente.
- Inconclusivo: material insuficiente, imagem ausente, ambiguidade ou competência não dominada
  pelo avaliador. Preencher o campo inconclusive e justificar; deixar grade vazia.

Registrar identificação do avaliador, qualificação, origem humana, data e justificativa.
Não discutir notas até concluir a avaliação independente. Um coordenador compara os
resultados, registra divergências e adjudica com evidência. Calcular concordância ordinal
e informar amostra, desacordos e casos inconclusivos. Duas execuções de IA não são dois
avaliadores humanos. A qualificação e independência precisam de conferência documental.

## Universo e métricas

Julgar toda a lista congelada do titulo_area de cada referência, até 50 candidatas.
Isso permite Recall@5 **restrito a esse universo declarado**, depois de todos os pares
receberem decisão. Não será Recall sobre todas as 2.657 questões da plataforma.
Precision@5 usa denominador cinco, incluindo posições não preenchidas; NDCG usa ganho
2^grau-1 e IDCG do universo julgado. Relevância binária primária: grau 2.
Um relatório secundário com grau >=1 pode ser apresentado sem substituir o primário.

Avaliar quatro estratégias sobre o mesmo conjunto elegível, sem ajustar pesos com
essas novas notas. Para Recall apenas de itens elegíveis, declarar separadamente o
universo filtrado e sua cobertura. Nunca considerar não julgados como negativos.
Quando há inconclusivos no Top5, dar limites de Precision em vez de estimativa completa.

Congelar versão dos textos, lista, filtros e política antes de distribuir os formulários.
Os pares históricos de desenvolvimento não entram como notas finais. O corpus já foi
visto no pipeline: a independência nova é dos julgamentos, não de questões nunca vistas.
Não usar esse conjunto para simultaneamente escolher e homologar parâmetros.

## Resultado e próxima execução

Produzir julgamentos_adjudicados.jsonl com pair_id, grade, reviewer_A, reviewer_B,
reviewer_A_kind e reviewer_B_kind iguais a human, e adjudication_note.
Executar node scripts/avaliar_humano.mjs. O programa só aceita conjunto completo e
identidades distintas declaradas. A declaração em arquivo não comprova sozinha que
houve revisão humana; o coordenador deve validar a documentação e as qualificações.
Este protocolo foi preparado e não executado por revisores humanos nesta Fase 5.
