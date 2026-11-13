# Formato de importação de interações

As avaliações de previsão leem arquivos **JSONL** (um objeto JSON por linha, UTF-8).

- **Interações reais**: mantenha-as localmente, com `"origem": "real"`, e informe o arquivo ao comando de avaliação. Os dados dessa pasta não são versionados.
- **Avaliação avulsa**: `python -m gabaritei_rec.avaliacao.previsao --interacoes ARQUIVO.jsonl`.
- **Exportação**: o próprio backend exporta as tentativas registradas neste formato com `Servico.exportar_interacoes()`.

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `origem` | `"real"` \| `"sintetico"` | sim | Procedência. Dados sintéticos nunca entram na avaliação "real". |
| `aluno_id` | string | sim | Identificador interno e pseudônimo, sem dado pessoal. |
| `questao_id` | string | sim | `id` do catálogo (`gq_...`). |
| `versao_id` | string | recomendado | Versão apresentada (`id:hash_questao:hash_gabarito`). |
| `area` | `CH`\|`CN`\|`LC`\|`MT` | sim | Área da questão. |
| `apresentado_em` | ISO 8601 com fuso | recomendado | Instante em que a questão foi apresentada. |
| `enviado_em` | ISO 8601 com fuso | sim | Instante do envio; define a ordem cronológica. |
| `alternativa` | `A`–`E` \| null | recomendado | Alternativa marcada (null se pulada). |
| `correta` | bool \| null | sim | Acerto **calculado pelo servidor** (null se pulada). |
| `pulada` | bool | sim | Pulo não é erro e é descartado da previsão. |
| `tipo` | string | sim | `primeira_sem_ajuda`, `primeira_com_dica`, `repeticao`, `apos_exposicao_gabarito` ou `pulada`. |
| `usou_dica` | bool | recomendado | Uso de dica. |
| `gabarito_exposto_antes` | bool | recomendado | O gabarito da questão ou de uma variante já tinha sido exposto. |
| `prob_prevista` | float \| null | opcional | Probabilidade prevista pelo sistema antes da resposta. |
| `politica_versao` | string | recomendado | Versão da política que recomendou a questão. |
| `tempo_resposta_ms` | int \| null | opcional | Informação auxiliar. Não é tratado como sinal de dificuldade. |

## Regras aplicadas pela avaliação

1. Ordenação por `enviado_em`. Os cortes de tempo por quantis (padrão 60%/80%) separam os períodos de ajuste, validação e teste.
2. Só entram previsões de **primeiras tentativas sem ajuda, não puladas**. A segunda resposta do mesmo aluno a qualquer item do mesmo grupo de conteúdo (variante) é descartada.
3. O perfil usado para prever cada resposta considera **apenas respostas anteriores** do mesmo aluno, na mesma área.
4. O limiar de decisão é 0,50, declarado antes. Também é reportado o limiar escolhido **na validação**. Nunca se ajusta no teste.
5. Alunos novos (primeira resposta no período de teste) são reportados à parte. Os intervalos de confiança reamostram alunos.

## Exemplo

```json
{"origem": "real", "aluno_id": "a-0001", "questao_id": "gq_fe98fbce5f01e83b2fafee8b", "versao_id": "gq_fe98fbce5f01e83b2fafee8b:1a2b3c4d5e6f:0a1b2c3d", "area": "CH", "apresentado_em": "2027-03-01T13:00:00+00:00", "enviado_em": "2027-03-01T13:02:10+00:00", "alternativa": "B", "correta": true, "pulada": false, "tipo": "primeira_sem_ajuda", "usou_dica": false, "gabarito_exposto_antes": false, "prob_prevista": 0.41, "politica_versao": "dificuldade-v1.0.0+8238f3c4c5", "tempo_resposta_ms": 130000}
```
