# Estado em 13/11/2026 — integração na main

Base final: dataset `e6712a8`, 3.086 registros, 2.731 elegíveis (treino 2.382,
validação 175, teste 174). SHA-256:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.

Recomendador final: `recomendador-base-final@d10f5a3`, método `titulo_area`.
TF-IDF, MiniLM e Qwen reconstruídos; catálogo compatível já versionado. O aplicativo
consulta esse catálogo pelo back-end local, sem carregar modelos e sem banco de dados.

O catálogo mantém todos os 2.731 IDs, com 68 listas vazias e mediana de 45 sugestões.
O aplicativo oferece 2.657 questões, excluindo 67 com defeito e 7 duplicatas da prática.
Nenhum bloqueio foi retirado para a demonstração.

Testes de integração na raiz: `npm test`. Para abrir: `npm start` e
http://127.0.0.1:4173. Progresso salvo somente no navegador.

Continuam pendentes a conferência humana das 100 questões sorteadas e a correção
dos defeitos pelo responsável pelo dataset. A revisão externa informada pelo grupo
conferiu 30 classificações (29 corretas e uma aceitável), sem substituir a amostra completa.

Ver `../../INTEGRACAO_MAIN.md` e `RELATORIO_BASE_FINAL.md`.
