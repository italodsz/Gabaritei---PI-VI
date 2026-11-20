# Plano de aprendizado incremental

## Evidência disponível

Na base de 2.971 itens e nos artefatos reusados não há eventos individuais de alunos do Gabaritei respondendo ENEM. As trajetórias sintéticas são simulações. ASSISTments contém respostas de outro domínio. Serve como referência metodológica e não confirma desempenho educacional no Gabaritei. Nesta etapa não foram coletados eventos, treinados modelos ou alterados parâmetros.

## Coleta e decisão

Colete o evento de resposta no servidor após correção, com alternativa, resultado, horário, duração, primeira tentativa, item, família de variantes, versões e grupo de dificuldade. Deduplicate pelo ID do evento, derive a correção no servidor e rejeite versão ou item incompatível. Use pseudônimos, adesão ao piloto e acesso restrito. Registre também a emissão de ofertas e a decisão do estudante separadamente quando não houver resposta. Mantenha a escolha de área e dificuldade do estudante. Em história curta ou faixa sem candidatos, explique que faltam dados e ofereça manter o filtro escolhido.

## Modelo e prova de atualização

Para uma etapa autorizada, teste regressão logística com SGD e atualização em pequenos lotes por `partial_fit`. Use atributos conhecidos antes da resposta, como área, dificuldade local quando disponível, primeiras tentativas anteriores e intervalo entre sessões. Separe estado individual de coeficientes globais. O estado é atualizado com a resposta. Os coeficientes só mudam quando o lote supervisionado elegível é processado. Compare com o mesmo modelo congelado e uma regra simples de faixa, com as mesmas restrições de catálogo. Para demonstrar a atualização, registre hash e norma dos coeficientes antes e depois de um lote sintético não degenerado e compare as probabilidades de itens de controle. Teste idempotência, rollback, lote vazio e ausência de atualização sem rótulo. A demonstração sintética só comprova a mecânica.

## Avaliação

Separe estudantes disjuntos e janelas de tempo crescentes. Ajuste a versão inicial no grupo de treino, escolha parâmetros no grupo de validação e avalie estudantes reservados em período posterior. Em avaliação sequencial, produza a previsão antes de ver o rótulo e use apenas eventos anteriores em uma trilha incremental separada. Registre tamanho das amostras, log loss, calibração, AUC quando houver duas classes, tempo e variação de parâmetros. Compare as recomendações ao longo da trajetória, incluindo cobertura, abstenção, ofertas incorretas, aceitação e acertos em itens de famílias inéditas. Relate repetição em separado. Só considere promoção se o ganho se sustentar em alunos reais e sobre o controle simples, com incerteza reportada.
