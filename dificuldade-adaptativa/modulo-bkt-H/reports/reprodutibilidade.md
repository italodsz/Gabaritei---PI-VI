# Recuperação de reprodução

Os três ZIPs anteriores foram extraídos em diretórios separados e conferidos por CRC e SHA-256. Os manifestos cobrem 54, 249 e 358 membros respectivamente, além dos próprios SHA256SUMS. O CSV disponível tem 64.412.812 bytes e SHA-256 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. Os oito arquivos privados originais também foram localizados e conferidos.

O novo modo source-only parte exclusivamente desse CSV e do código original da Fase01 incorporado, com as mesmas regras de limpeza. Seus identificadores alternativos são HMACs determinísticos com uma chave de reprodução derivada da edição. Essa chave pública de reprodução não oferece garantia de anonimização e os IDs individuais permanecem fora do ZIP.

A identidade canônica de um estudante usa sua menor ordem global de evento retido. Ela normaliza os IDs entre as representações, preservando item, habilidade, resultado, ordem, split e origem. Os eventos são ordenados por source_row e as sequências por habilidade e primeira ordem. Os hashes canônicos dos oito artefatos coincidiram. Isso permite testar a equivalência sem usar a chave privada anterior.

O modo alternativo reproduziu 214.417 eventos, 4.003 estudantes, 56 habilidades e a divisão 2.802/601/600. Os agregados completos são idênticos. Os hashes de arquivos pseudonimizados diferem, com somente exclusoes.csv igual. Uma execução adicional com a chave original reproduziu todos os oito hashes individuais.

O ajuste usou o algoritmo original da Fase02, com 20 inicializações, 500 iterações, ftol 1e-9 e restrições originais. Os 56 conjuntos de parâmetros e as perdas foram reproduzidos exatamente. As tolerâncias de aceitação, fixadas antes da comparação, são 1e-4 e 1e-8. Os modelos originais foram preservados e não houve procura por números melhores.

Uma execução integral em ambiente virtual limpo foi concluída a partir apenas do CSV e sem a chave anterior. O arquivo execucao_source_only.json registra comandos, durações, saídas e códigos de retorno. Os testes finais posteriores também cobrem a correção do adaptador de contrato.
