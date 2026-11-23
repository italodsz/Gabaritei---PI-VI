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

**Esta questão**
- ID, matéria e tema, parâmetros TRI do INEP (a, b, c), chance estimada agora (com o ajuste δ da área,
  quando houver) e a faixa de dificuldade no acervo.
- As 10 primeiras parecidas no `titulo_area`, com a chance de cada uma para você.
- **Ver escores do ranking**: os produtos escalares reais de TF-IDF e Qwen e o escore RRF de cada
  sugestão, calculados sobre os índices existentes, em CPU. A primeira consulta carrega os índices.
  O escore ordena as sugestões; não é chance de acerto. Questões do conjunto de teste reservado não
  iniciam diagnóstico.

**Ao vivo**
- Perfil TRI por área (nota estimada, θ ± incerteza, respostas válidas, meta e δ).
- O que o recomendador aprendeu a cada resposta e cada escolha da próxima questão na prática sob medida.
- Aprendizado do sistema por área e calibração previsto × observado, com as respostas de todos os alunos
  com conta.
- A opção de mostrar ou esconder o card "O que o recomendador aprendeu" depois de cada resposta.

## Segurança

O servidor marca `usuario.dev` em `/api/eu`. As rotas `/api/dev/*` exigem login (401) e a conta de
desenvolvedor (403 para as outras). O botão só aparece para quem tem `usuario.dev`.

## Rotas

`GET /api/dev/resumo`, `GET /api/dev/questoes`, `GET /api/dev/questoes/gq_...`,
`GET /api/dev/dificuldade` e `POST /api/dev/diagnostico` (`{"questionId": "gq_...", "limit": 10}`).
