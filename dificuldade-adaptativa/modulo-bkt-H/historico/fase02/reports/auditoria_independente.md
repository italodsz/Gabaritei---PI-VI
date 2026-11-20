# Auditoria matemática por implementação separada

A verificação usa um forward de matrizes 2×2 escrito separadamente, com escalonamento em cada observação. Ele foi aplicado aos 143,092 eventos de treino e às 56 habilidades. O maior erro absoluto de NLL média em relação ao objetivo vetorizado foi 2.52e-14. O gradiente analítico foi comparado a diferenças finitas, com maior diferença 4.51e-06, dentro do critério de 1e-4, incluindo soluções próximas à fronteira.

Foram enumeradas 62 sequências binárias de tamanho 1 a 5 por aritmética de frações, somando todas as configurações de estados. A auditoria conferiu os 1.120 ajustes principais, as restrições de todas as soluções, a escolha por objetivo de treino, a convenção de estados, a normalização das matrizes e a inferência prospectiva. Conferiu também os metadados e a viabilidade dos 5.600 reajustes bootstrap.

As previsões do forward alternativo reproduziram as métricas de validação. A primeira comparação exigia diferença inferior a 1e-11 em todas as métricas. A AUC diferiu em 1,2642e-8, decorrente de pequenas diferenças de previsão de até 6,14e-13 alterarem ranks de valores praticamente empatados. A tolerância da comparação de AUC foi ajustada para 1e-7, com 1e-11 mantido para as demais métricas. A falha e o diagnóstico estão preservados.

A primeira validação também encontrou um estado de domínio ligeiramente acima de 1 após erro com domínio igual a 1. A atualização anterior obtinha a probabilidade do erro por subtração 1−p, provocando cancelamento numérico. A implementação foi corrigida para normalizar diretamente as duas massas de emissão. O teste de regressão reproduziu 1,0000000000000882 e o reteste produziu exatamente 1,0.

A primeira suíte teve 24 aprovações e uma falha na igualdade literal entre parâmetros ajustados em contextos numéricos distintos. A diferença observada era da ordem de 1e-13. O teste passou a usar tolerância absoluta de 1e-10 para comparação entre contextos e preserva igualdade exata entre duas chamadas no mesmo contexto. A reprodução integral posterior, com threads fixas e ambiente isolado, teve diferença observada zero.

A suíte final executou 25 testes, com 0 falhas e 0 erros. A matriz de evidências associa requisitos, resultados observados, código, versão, data, comando e logs.

O conjunto de teste teve os hashes conferidos. O carregador desta fase recusa solicitá-lo para treino ou validação. Os testes críticos de entrada inspecionam o contrato e os rótulos binários para fidelidade. O ajuste, o bootstrap de parâmetros e a seleção usam treino. As métricas desta fase usam validação.

A autoria da auditoria e da implementação principal é a mesma. Esta entrega inclui testes automatizados e auditoria por implementação separada. A revisão externa por outra pessoa ou equipe permanece pendente.
