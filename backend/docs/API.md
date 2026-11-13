# API: recomendador por dificuldade

A documentação interativa (OpenAPI) fica em `http://localhost:8000/docs` com o servidor rodando. Todos os corpos rejeitam campos
desconhecidos (`extra=forbid`). Os erros de negócio retornam `{"detail": "..."}` com o código HTTP correspondente.

| Método e rota | Função | Observações |
|---|---|---|
| `GET /saude` | Versões e estado | Retorna hash do dataset, versão da política, cortes, total de itens ofertáveis e estado do adaptativo (`D_confirmado: false`). |
| `POST /alunos` | Cria aluno | Devolve `{aluno_id}` (ID interno). |
| `POST /sessoes` | **Cria sessão** | `{"aluno_id"?: str, "modo": "nivel"\|"automatico"\|"adaptativo"\|"diagnostico"}`. Cria o aluno se o ID não for informado. |
| `POST /sessoes/{id}/recomendacoes` | **Pede recomendações** | Corpo descrito abaixo. A resposta não contém gabarito. |
| `POST /apresentacoes` | **Registra apresentação** | `{"recomendacao_item_id"}` ou `{"sessao_id","questao_id"}` (revisão manual). Devolve a questão sem gabarito e grava a probabilidade prevista antes da resposta. |
| `POST /apresentacoes/{id}/resposta` | **Envia resposta** | `{"alternativa": "A".."E", "chave_idempotencia"?, "usou_dica"?, "tempo_resposta_ms"?}`. Corrige no servidor. Reenvio igual faz replay; reenvio diferente retorna 409. |
| `POST /apresentacoes/{id}/pular` | **Registra pulo** | Não conta como erro e é idempotente. Retorna 409 se a apresentação já foi respondida. |
| `POST /apresentacoes/{id}/dica` | Registra uso de dica | O catálogo não tem dicas revisadas; só o uso é registrado. |
| `POST /apresentacoes/{id}/revelar-gabarito` | Expõe o gabarito | Registra a exposição. Respostas futuras à questão ou a variantes não contam para θ. |
| `GET /alunos/{id}/progresso` | **Consulta progresso** | Por área: perfil (θ, dp, n, status, experimental), tentativas por tipo, acertos na primeira tentativa e pulos. |

## Pedido de recomendação

```json
{
  "area": "MT",
  "quantidade": 10,
  "lingua": "pt",
  "dificuldade": "media",
  "modo": "nivel",
  "formatos": ["standard"],
  "habilidade": "MT:H21",
  "objetivo": "pratica",
  "aceitar_experimental": false,
  "semente": 123
}
```

- `modo` padrão: `nivel` quando há `dificuldade`; caso contrário, `adaptativo`.
- `adaptativo` sem `aceitar_experimental=true` retorna `status: "adaptativo_indisponivel"`.
- `automatico` também exige `aceitar_experimental=true` e não recebe dificuldade manual. Retorna a estratégia escolhida em `estrategia`.
- `adaptativo` com perfil insuficiente retorna `status: "perfil_insuficiente"` e `limitacao.opcoes` (nível manual ou diagnóstico).
- `objetivo: "revisao"` só prioriza habilidades com evidência mínima (≥ 3 respostas e acurácia ≤ 50%). Sem evidência, devolve um aviso.

No automático, `limitacao.estoque_restante` e `limitacao.causa` distinguem esgotamento após filtros,
falta de adequação e limite de sondagens. Um cliente pode solicitar explicitamente `modo: "diagnostico"`
para explorar fora dos limites automáticos de acessibilidade. As probabilidades reais e a indicação de
itens fora da faixa-alvo continuam disponíveis; o perfil não é reiniciado.

## Resposta da recomendação

```json
{
  "recomendacao_id": "...", "status": "ok|parcial|sem_candidatos|perfil_insuficiente|adaptativo_indisponivel",
  "itens": [{"recomendacao_item_id": "...", "questao_id": "gq_...", "versao_id": "...", "area": "MT", "faixa": "media",
             "habilidade": "MT:H21", "ano": 2019, "prob_prevista": null,
             "razao": {"modo": "nivel", "faixa": "media", "tri_b": 1.9, "cortes_versao": "cortes-...", "criterios": ["..."]}}],
  "limitacao": {"motivo": "...", "solicitado": 10, "entregue": 4, "funil": {"validos": 1998, "area": 317, "...": 0},
                "etapa_mais_restritiva": "nivel"},
  "funil": {}, "experimental": false, "perfil": null, "avisos": [],
  "politica_versao": "dificuldade-v1.0.0+...", "cortes_versao": "cortes-...", "dataset_sha256": "...", "semente": 123
}
```

## Resposta do envio

```json
{"tentativa_id": "...", "apresentacao_id": "...", "versao_id": "...", "replay_idempotente": false, "pulada": false,
 "tipo": "primeira_sem_ajuda", "primeira_tentativa": true, "usou_dica": false, "gabarito_exposto_antes": false,
 "conta_para_perfil": true, "motivo_nao_conta": null, "prob_prevista_antes": 0.31, "alternativa": "B", "correta": false,
 "gabarito": "D", "perfil_area": {"area": "MT", "theta": -0.21, "dp": 0.83, "n_evidencias": 3, "status": "insuficiente",
 "versao": 3, "experimental": true}}
```
