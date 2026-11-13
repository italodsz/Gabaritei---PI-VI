# Arquitetura: recomendador por dificuldade

Backend em Python, com FastAPI e SQLAlchemy 2. O alvo de produção é PostgreSQL; desenvolvimento e testes usam SQLite.
O projeto não tinha backend: o front (Next.js) usa um mock que prevê uma FastAPI. Por isso esta foi a stack escolhida.

## Módulos (`gabaritei_rec/`)

| Módulo | Responsabilidade |
|---|---|
| `importacao.py` | Importação e auditoria reproduzíveis: hashes, schema, IDs, alternativas e gabarito, splits, elegibilidade, bloqueios, mídia, duplicações e famílias, triagem TRI, cortes e relatório de qualidade. |
| `catalogo.py` | Catálogo em memória, carregado dos artefatos com verificação de hash. `visao_publica()` nunca inclui o gabarito. |
| `psicometria.py` | Triagem de parâmetros, tercis por área, 3PL numericamente estável e EAP em grade. |
| `perfil.py` | Classificação das tentativas (primeira, dica, repetição, exposição, pulo), pesos e proficiência por área. |
| `recomendacao.py` | Política pura (sem banco): modos `nivel`, `automatico`, `adaptativo` (experimental), `diagnostico` e `aleatorio` (referência). |
| `servico.py` | Sessões, recomendações, apresentações, respostas com correção no servidor, pulos, dicas, revelação, progresso e exportação. |
| `db.py` | Modelo relacional e geração da migração PostgreSQL. |
| `api.py` | Endpoints HTTP. |
| `avaliacao/` | Métricas probabilísticas e avaliação cronológica de interações, sem incluir dados de alunos no repositório. |

## Fluxo de dados

```
Dataset/base_trabalho ──importacao──▶ artefatos/{catalogo,cortes,manifesto}.json + qualidade/
                                          │ (hash do corpus, versão dos cortes e da triagem)
                                          ▼
                      Catalogo ──▶ Servico ──▶ banco (versao_item, recomendacao, apresentacao, tentativa, perfil...)
                                          ▲
                                  FastAPI (api.py)
```

## Separação de conceitos

- **Dificuldade da questão**: `tri.b` e a faixa operacional por área (`facil`/`media`/`dificil`). Os cortes são tercis do treino aprovado, congelados e versionados (`artefatos/cortes.json`). São categorias do catálogo, não do Inep.
- **Proficiência do aluno**: θ por área (CH, CN, LC, MT), nunca uma proficiência única. É estimado por EAP com prior N(0,1) e guarda desvio-padrão posterior e número de evidências.
- **Adequação da recomendação**: probabilidade preditiva de acerto (integrada sobre o posterior) comparada à faixa-alvo configurável de 0,65–0,80. A faixa é uma hipótese inicial, não garantia de aprendizagem.

## Decisões importantes

| Tema | Decisão |
|---|---|
| Elegibilidade | Para oferecer um item, ele precisa estar em `ids_elegiveis.json`, ter `ready_text`, não estar bloqueado, ter schema válido, ter a mídia necessária presente e não ter `alerta_grave` no catálogo de conteúdo. Esse catálogo vem do branch `recomendador` (commit `390d786`) e tem o mesmo hash do corpus. |
| Triagem TRI | Exclui itens com `a < 0,3`, ou com `b > 3` e `a < 0,5`. Os valores originais são preservados e cada decisão é registrada. Os itens excluídos ficam sem faixa e fora dos modos `nivel` e `adaptativo`. |
| Cortes | Tercis por área, calculados só no treino aprovado. Um teste prova que alterar validação ou teste não muda os cortes. |
| Constante D | **Não confirmada** na documentação local. O modo adaptativo só roda com `aceitar_experimental=true`, com D experimental 1,0 (configurável) e rótulos "experimental" em toda saída. O modo `nivel` não depende de D. |
| Escala | O adaptativo usa só itens `standard`/`regular` (configurável). Os pares padrão × adaptado da mesma família têm b diferentes, então a comparabilidade não é presumida. |
| Duplicação | Um grupo de conteúdo reúne `family_id`, `content_family_id`, texto idêntico normalizado e Jaccard de trigramas ≥ 0,8. Há no máximo um item por grupo no lote, e itens ou grupos expostos recentemente (janela de 30 dias ou mesma sessão) não voltam. |
| Falta de candidatos | Status `parcial` ou `sem_candidatos`, com funil e etapa mais restritiva. Nunca troca nível, língua ou área, e nunca relaxa bloqueios. |
| Histórico vazio | O adaptativo devolve `perfil_insuficiente` com opções explícitas: escolha manual de nível ou diagnóstico. O diagnóstico inicial distribui itens entre as três faixas, priorizando ganho de informação esperado. |
| Tentativas | Precedência: `repeticao` > `apos_exposicao_gabarito` > `primeira_com_dica` > `primeira_sem_ajuda`. Por padrão, só a primeira sem ajuda conta para θ. A exposição fica também em flag própria. Pulo não é erro. |
| Correção | Feita no servidor, com o gabarito da **versão apresentada** (`versao_item`). Campos extras como `is_correct` são rejeitados (422). |
| Idempotência | `UNIQUE(tentativa.apresentacao_id)`. Um reenvio igual devolve o mesmo resultado (`replay_idempotente`); um reenvio diferente devolve 409. |
| Concorrência do perfil | `perfil.versao` é coluna de versão do SQLAlchemy (bloqueio otimista). O perfil é recalculado das tentativas que contam, com retry em `StaleDataError`, `IntegrityError` ou lock. |
| Versões | Cada recomendação guarda política, dataset, cortes e semente. Cada apresentação e cada tentativa apontam para `versao_item` (hash da questão, do gabarito e dos parâmetros) e para a política. |
| Tempo de resposta | É armazenado como dado auxiliar e não é usado como sinal de dificuldade. |
| Busca semântica | O catálogo `titulo_area` do branch `recomendador` foi avaliado e reaproveitado para os alertas de qualidade, com hash do corpus conferido. Ele pode gerar candidatos por conteúdo no futuro, mas não substitui o controle de dificuldade. Os vetores do índice não foram usados, por causa de `AVISO_INDICES.json`. |

## Banco (tabelas)

`versao_dataset`, `versao_politica`, `versao_item`, `aluno`, `sessao_estudo`, `recomendacao`, `recomendacao_item`,
`apresentacao`, `tentativa`, `exposicao_gabarito`, `perfil`. A DDL PostgreSQL está em `migrations/0001_inicial.sql`.

Campos de interação registrados: aluno, sessão, recomendação e versão da política, questão e versão apresentada,
instante da apresentação, alternativa, acerto calculado pelo servidor, instante do envio, primeira tentativa ou repetição,
uso de dica, exposição ao gabarito, probabilidade prevista antes da resposta, razão da recomendação e tempo de resposta (auxiliar).
