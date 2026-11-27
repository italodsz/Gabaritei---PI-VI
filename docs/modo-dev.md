# Modo dev

Painel dos recomendadores dentro da tela da questão. Aparece só para a conta de desenvolvedor e
substitui a antiga página `/dev`.

## Como ligar

1. Diga ao servidor quais contas são de desenvolvedor, de um destes jeitos:
   - arquivo `backend/dados/devs.txt`, com um e-mail por linha (a pasta `backend/dados/` fica fora do Git);
   - variável de ambiente `GABARITEI_DEVS`, com os e-mails separados por vírgula.
   Sem nenhum dos dois, ninguém vê o modo dev.
2. Reinicie o servidor e entre no app com essa conta.
3. Abra uma lista de questões. No topo da tela aparece o botão **Modo dev**: ele liga e desliga o painel.
   A escolha fica salva neste navegador (`gabaritei:modo-dev:v1`).

## O que o painel mostra

Duas colunas (um filtro no topo mostra uma de cada vez ou as duas juntas; a escolha fica salva neste
navegador em `gabaritei:modo-dev:colunas:v1`):

**1. Questão agora**
- Matéria na árvore (área › matéria › título › assunto).
- Nota do aluno nesta área, com os 3 passos: média do ENEM 2023, θ atual depois de N respostas válidas,
  e a nota pela tabela do INEP.
- Chance de acertar esta questão: os parâmetros a, b, c do INEP, o gabarito, a fórmula 3PL com os
  números substituídos e a chance final (com e sem o ajuste δ da área, quando houver).
- Se acertar e se errar: θ e nota antes e depois nos dois casos (simulação local, não grava nada).

**2. Próxima questão**
- O pipeline em 3 etapas (Semântica/Qwen → TRI → Escore).
- O θ usado e a meta do desafio atual.
- As 20 parecidas do `titulo_area`, com similaridade Qwen, dificuldade (b), chance e escore de cada
  uma; a 1ª (a escolhida) é sempre a mesma questão que a prática sob medida escolheria de verdade.
  Mostra as 5 primeiras, com "ver as outras 15"; se a meta não é alcançável entre as 20, mostra a meta
  efetiva usada; e a conta do escore da escolhida.

## Segurança

O servidor marca `usuario.dev` em `/api/eu`. As rotas `/api/dev/*` exigem login (401) e a conta de
desenvolvedor (403 para as outras). O botão só aparece para quem tem `usuario.dev`.

## Rotas

`GET /api/questoes/{id}/recomendacoes?limite=20` (as parecidas do `titulo_area`) e
`POST /api/dev/diagnostico` (`{"questionId": "gq_...", "limit": 20}`, para a similaridade Qwen de
cada uma). As demais rotas de `/api/dev/*` (`resumo`, `questoes`, `dificuldade`) continuam existindo
no servidor, mas não são mais usadas por este painel.
