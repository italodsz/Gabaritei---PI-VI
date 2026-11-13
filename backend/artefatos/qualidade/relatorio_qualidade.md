# Relatório de qualidade dos dados — Gabaritei

Gerado em 2026-11-11T15:32:36.801117+00:00. Resultado da auditoria: **aprovado**.

SHA-256 de `questions.jsonl`: `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5` (release v2.1-rc1).

## Contagens

| Item | Valor |
|---|---:|
| Questões no catálogo | 2971 |
| Split train (linhas) | 2616 |
| Split validation (linhas) | 177 |
| Split test (linhas) | 178 |
| Elegíveis train | 1801 |
| Elegíveis validation | 136 |
| Elegíveis test | 126 |
| Bloqueados | 1 |
| Disponíveis para oferta | 2013 |
| Disponíveis com faixa (após triagem TRI) | 1998 |
| Habilidades distintas (area, skill) | 120 |
| Disponíveis sem habilidade | 159 |

Motivos de indisponibilidade entre os elegíveis: alerta_grave_texto=50.

## Checagens

| Checagem | Status |
|---|---|
| sha256_questions_confere | ok |
| ids_unicos | ok |
| release_unico_esperado | ok |
| split_train_registros_iguais_ao_catalogo | ok |
| split_train_campo_split_consistente | ok |
| split_validation_registros_iguais_ao_catalogo | ok |
| split_validation_campo_split_consistente | ok |
| split_test_registros_iguais_ao_catalogo | ok |
| split_test_campo_split_consistente | ok |
| splits_disjuntos_por_id | ok |
| splits_cobrem_catalogo | ok |
| split_temporal_por_ano | ok |
| elegiveis_existem_no_catalogo | ok |
| elegiveis_no_split_declarado | ok |
| elegiveis_tem_ready_text | ok |
| bloqueados_fora_dos_elegiveis | ok |
| ready_text_sem_estar_elegivel | ok |
| aviso_indices_hash_derivado_confere | ok |
| schema_valido_nos_elegiveis | ok |
| schema_valido_no_catalogo_total | aviso |
| midia_disponivel_nos_elegiveis | ok |
| ready_multimodal_com_midia_ausente | aviso |
| catalogo_conteudo_mesmo_corpus | ok |
| catalogo_conteudo_sha_procedencia | ok |
| grupos_de_conteudo_nao_cruzam_splits_elegiveis | ok |

## Triagem de parâmetros TRI

Regras (fixadas antes dos cortes): a < 0.3; ou b > 3.0 com a < 0.5. Itens excluídos: **15** (valores originais preservados; ficam sem faixa).

| id | área | split | a | b | c | motivos |
|---|---|---|---:|---:|---:|---|
| gq_cdc4346f90dd7b164d751ff7 | LC | train | 0.17448 | 1.72689 | 0.03047 | discriminacao_muito_baixa |
| gq_1913dfee169d1efadf52cfca | CH | train | 0.2097 | 7.3295 | 0.0435 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_57b19727ae90bf6674cb0576 | LC | train | 0.30081 | 4.17509 | 0.20994 | dificuldade_alta_com_discriminacao_baixa |
| gq_cf15f16c076fceccbc04a730 | CN | train | 0.01929 | 61.05459 | 0.21513 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_64ab0c5be892c9a552e3e8a9 | LC | train | 0.25565 | 8.28479 | 0.09336 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_5d5f51a40497323078d2af26 | MT | train | 0.32005 | 6.3679 | 0.15202 | dificuldade_alta_com_discriminacao_baixa |
| gq_8d92a6be83842fc46071a607 | LC | train | 0.49981 | 3.32746 | 0.04951 | dificuldade_alta_com_discriminacao_baixa |
| gq_c51d9e7318fadbcdcf7773e5 | MT | train | 0.24681 | 3.47775 | 0.02647 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_e2f5c8e6168fc710b38be957 | CN | train | 0.38139 | 3.36471 | 0.06869 | dificuldade_alta_com_discriminacao_baixa |
| gq_63abb69716ebeba164a92e7f | MT | train | 0.1828 | 12.4166 | 0.11617 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_2bfcce13287daa55e2bb19f0 | CN | train | 0.29544 | 3.80025 | 0.02691 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_5bbf49289d96383386b8e22e | MT | train | 0.38226 | 4.96788 | 0.08061 | dificuldade_alta_com_discriminacao_baixa |
| gq_5fc9cc5ab60559c3aa518e4c | MT | train | 0.24441 | 4.65334 | 0.03228 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |
| gq_0a743d5fdb70d03a1842dc30 | MT | train | 0.48694 | 4.48651 | 0.14739 | dificuldade_alta_com_discriminacao_baixa |
| gq_3e25bf1d5bf4b645a2ec4316 | CH | test | 0.20704 | 11.14224 | 0.17137 | discriminacao_muito_baixa, dificuldade_alta_com_discriminacao_baixa |

Sinais informativos (sem exclusão): {'b_outlier_iqr_area': 45, 'b_extremo': 17, 'c_outlier_iqr_area': 24, 'a_outlier_iqr_area': 27}.

## Cortes de dificuldade (congelados)

Versão `cortes-e6739b83d908`, tercis de tri.b por área no treino aprovado. Categorias operacionais do catalogo; nao sao categorias oficiais do Inep.

| Área | c1 (fácil ≤) | c2 (média ≤) | n treino |
|---|---:|---:|---:|
| CH | 0.814577 | 1.447713 | 573 |
| CN | 0.94236 | 1.609903 | 372 |
| LC | 0.536787 | 1.114723 | 533 |
| MT | 1.6446 | 2.35816 | 262 |

## Distribuição de faixas (disponíveis)

- **train**: CH:dificil=191, CH:facil=191, CH:media=191, CN:dificil=124, CN:facil=124, CN:media=124, LC:dificil=178, LC:facil=178, LC:media=177, MT:dificil=87, MT:facil=88, MT:media=87
- **validation**: CH:dificil=7, CH:facil=22, CH:media=8, CN:dificil=13, CN:facil=8, CN:media=11, LC:dificil=11, LC:facil=16, LC:media=11, MT:dificil=8, MT:facil=13, MT:media=5
- **test**: CH:dificil=5, CH:facil=23, CH:media=13, CN:dificil=4, CN:facil=4, CN:media=10, LC:dificil=7, LC:facil=19, LC:media=11, MT:dificil=6, MT:facil=15, MT:media=8

## Duplicações e famílias de conteúdo

Grupos com mais de um item: 21 (42 itens). Uniões por critério: {'texto': 1, 'content_family': 9, 'jaccard': 11}. Pares Jaccard ≥ limite: 20. Triagem lexical: nao detecta parafrases, equivalencias matematicas nem conteudo visual.

Pares de família de conteúdo entre elegíveis (padrão × adaptado): 9; os valores de b diferem dentro do par, o que reforça a cautela sobre comparabilidade de escala.

## Escala e parâmetro D

Origem declarada dos parametros: tabela de itens do Inep (evidence_id). A documentacao local nao informa D nem comprova equalizacao entre anos/formatos; pares da mesma familia de conteudo em formato padrao x adaptado tem b diferentes. Adaptativo restrito a grupos de escala configurados e marcado como experimental.

## Mídia

Itens marcados `ready_multimodal` sem arquivo local: 880 (não oferecidos).

## Pedagogia e interações

Topicos de pedagogy gerados por regras sem revisao humana; usados apenas como sinal fraco de diversidade.

Nenhum historico de respostas de alunos no dataset nem nos branches do repositorio.
