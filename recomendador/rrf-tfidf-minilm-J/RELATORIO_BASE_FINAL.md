# Migração para a base final — 13/11/2026

## Base

Fonte congelada: branch dataset, commit e6712a8, Dataset/base_trabalho.
Copiados sem transformação questions.jsonl e ids_elegiveis.json. SHA-256 conferido:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
Nenhum arquivo da branch dataset foi alterado.

Antes: 2.971 registros, 2.063 elegíveis (1.801 treino, 136 validação, 126 teste).
Depois: 3.086 registros, 2.731 elegíveis (2.382 treino, 175 validação, 174 teste).
O carregador legado deixou de exigir contagens fixas; preserva as verificações de
IDs únicos, composição dos splits e isolamento das famílias.

Nove IDs antigos não existem na base final (remoção das versões adaptadas documentada
no README do dataset):

- gq_053cef1eadda732d756e224f
- gq_0ca35992cee4d0404c69cc2c
- gq_43af5e0298b07a51facf3218
- gq_52354dffa0cf4a5a24a74a46
- gq_5ee286b3a6bb12356cd757c3
- gq_837a844ed0ca7c39ff0303e9
- gq_98b71afcfadc707111984efc
- gq_a691bb3047c6a701effb18bd
- gq_f8f72f54cff2ecccfac8b197

Auditoria detalhada: resultados/base_final/auditoria_base.json. O utilitário
migrar_base_final.py reproduz a cópia e a auditoria a partir da base anterior;
não deve ser executado como atualização incremental.

## Andamento

- Base copiada e conferida.
- Texto, classificação, índices, catálogo e comparação: em execução.
- 681 elegíveis sem rótulo: 283 MT, 170 CN, 63 CH e 165 LC.
- 165 descrições elegíveis ao recomendador têm text_scope de texto completo
  reescrito do caderno do ledor, sem alternativas; são incluídas conforme solicitado.
- Arquivos com NAO_ABRIR no nome não foram consultados.
