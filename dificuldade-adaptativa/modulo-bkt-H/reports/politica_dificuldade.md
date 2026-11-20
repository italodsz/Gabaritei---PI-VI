# Investigação das políticas de dificuldade

O experimento usa exclusivamente a validação das habilidades que passaram no gate operacional. Foram 2116 sequências em 20 habilidades. Os limiares, os mínimos de observação e os intervalos entre ofertas foram especificados antes do replay. A escolha minimiza reversões e mudanças, com cobertura mínima de 50%. O objetivo é estabilidade das sugestões, sem rótulo observado de dificuldade ideal.

A política de referência usa (acertos+1)/(respostas+2). A candidata usa o domínio BKT após a resposta e a transição. As duas recebem o mesmo histórico, preferência inicial média, margem e disponibilidade assumida das três faixas. A preferência fica fixa no replay, sem aceite automático.

A configuração selecionada foi {'cooldown': 5, 'margin': 0.05, 'minimum_observations': 5, 'thresholds': [0.4, 0.8]}. A política BKT fez 2515 ofertas e 132 reversões. O baseline fez 868 ofertas e 0 reversões. As mudanças de preferência sem aceite foram zero.

A maior frequência e as reversões do BKT não sustentam superioridade da política sobre a regra simples. As respostas observadas foram dadas às questões históricas e não às questões que cada política sugeriria. Os estados iniciais, mínimos de evidência, limites adjacentes, falta de estoque e preferência foram testados em fixtures do módulo.

O ganho preditivo global no ASSISTments é distinto do comportamento das sugestões e de eventual ganho pedagógico no ENEM. A qualidade da recomendação continua indeterminada.
