# Parecer

**APROVADO COM RESSALVAS para o módulo independente experimental e a reprodução source-only.**

A preparação a partir do CSV foi reconstruída com equivalência lógica completa, sem depender da chave original. Os 56 modelos e perdas foram reproduzidos exatamente. Os 44 testes finais passaram, com bloqueios devidamente identificados na execução sem dados.

A comparação posterior ao teste encontrou delta de log-loss -0.01696853, com IC95% de -0.02184936 a -0.01145902, a favor do BKT na média. Nos dois grupos extremos o histórico suavizado foi superior. A prova de conceito mantém modelo, estado, versão, idempotência, ordem e consentimento verificáveis.

O gate operacional permite 20 habilidades externas e encaminha 36 a fallback. O vínculo com ENEM permanece bloqueado para controle por BKT sem mapeamento validado. A política BKT fez mais ofertas e reversões que a regra simples, de modo que a superioridade da recomendação de dificuldade continua sem demonstração.

O parecer não encerra a integração na aplicação real, a validação pedagógica, a revisão humana e a prova externa de anterioridade histórica. Esses itens permanecem explícitos nos relatórios e no roteiro de auditoria.
