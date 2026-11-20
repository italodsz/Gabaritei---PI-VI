# Execução e contratos da Fase 4B

## Executar

Requer Node.js >=22.13, conferido com 24.11.1. Extraia o ZIP e, dentro de `projeto`, execute:

```powershell
npm start
```

Abra http://127.0.0.1:4173/#questoes e clique em **Para você**. Escolha área, assunto
e preferência, confirme o aceite e busque as candidatas. Estudar essas questões abre
a tela existente; espere o mínimo, responda e consulte o feedback. Novas recomendações
retorna ao painel. Meu histórico verificado consulta os dados do backend.

O aplicativo por catálogo não requer instalar pacotes, Python, GPU ou modelo remoto.
SQLite é criado em backend/dados; GABARITEI_DB permite outro caminho. PORT permite
outra porta. Não abrir o HTML por duplo clique. Não há deploy público nesta entrega.

## Reproduzir

```powershell
node scripts/validar-fase4b.mjs ../minhas-evidencias
```

Executa 98 testes, sonda de integridade 4A, sonda unificada 4B e hashes. Salva logs
completos e execucao.json. Usa bancos isolados; não altera o banco normal do app.

Para a conferência opcional da tela, preparar Playwright e Chrome. Não são dependências
do aplicativo. Se ainda não houver Playwright, instalar separadamente:

```powershell
npm install --prefix ../ferramentas-4b playwright@1.65.0
$env:PLAYWRIGHT_MODULE=(Resolve-Path ../ferramentas-4b/node_modules/playwright/index.mjs).Path
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node scripts/test-ui-4b.mjs ../evidencias-interface
```

Para o worker numérico, usar um ambiente Python separado com backend/requirements-dev.txt,
apontar GABARITEI_PYTHON para seu executável e executar npm run test:dev-model.
Essas dependências opcionais já estavam disponíveis no ambiente auditado.

Com os opcionais preparados:

```powershell
node scripts/validar-fase4b.mjs ../minhas-evidencias --ui --semantic
```

A execução entregue terminou com saída 0 nos seis componentes. Uma exceção fixture
rollback no log é deliberada: o teste verifica atomicidade. O aviso experimental de
SQLite também não representa falha do teste.

Para reproduzir os escores semânticos, com o ambiente numérico disponível:

```powershell
python -X utf8 scripts/exportar-escores-4b.py ../escores-reproduzidos.json
```

O exportador chama a rotina original e aborta se a ordem diferir do catálogo. Não treina,
gera embeddings ou baixa modelos. Hash esperado do arquivo:
5e5020339d05ef4786736b2f1bda74ac51bb33401b3ea495fdd5c20c0d01ae77.
Para equivalência byte a byte, manter o ambiente numérico declarado.

## Contratos implementados

Todas as rotas privadas resolvem a identidade no backend. Não enviar userId, perfil,
theta, n ou histórico para determinar o proprietário.

| Operação | Contrato |
|---|---|
| GET /api/unificado/opcoes | Público: áreas e assuntos controlados com TRI disponível |
| POST /api/unificado/recomendacoes | Área, assunto/título ou referência, preferência e modoRevisao opcional |
| GET /api/unificado/recomendacoes/{id} | Resultado persistido do próprio sujeito; alheio retorna 404 |
| POST /api/unificado/recomendacoes/{id}/exposicoes | Questão da recomendação e sessaoId; registra exposição e emite tentativa 4A |
| GET /api/unificado/historico | Estados por família, 100 eventos e 20 recomendações recentes próprios |
| GET /api/eu/perfil-tri | Perfil oficial da sessão, fluxo existente |
| POST /api/questoes/{id}/responder | Reutiliza tentativaId, selected e tempoMs do fluxo 4A |

Exemplo de solicitação de recomendações:

```json
{"area":"MT","titulo":"Geometria plana e semelhança","preferencia":"adaptativa","modoRevisao":false}
```

Alternativamente usar topicId, ou questaoRef de área compatível. Não combinar titulo
e topicId. Preferências: adaptativa, facil, media e dificil. A preferência é obrigatória;
o frontend pede aceite explícito. modoRevisao deve ser booleano.

Retorno 201: ID da recomendação, perfil provisório, proveniência, escores, posições,
estados, etapas e escassez. Solicitar recomendações não reserva nem apresenta todas
as questões. Sem login, a primeira solicitação cria cookie de exercício.
Campos desconhecidos/perfil forjado retornam 400. Assunto não encontrado ou referência
incompatível retorna 422. Não existe busca livre nem fallback para outro assunto.

Exposição recebe questaoId e sessaoId, exige que a recomendação pertença à sessão e
que a questão esteja em sua lista. Registra e emite/reutiliza a tentativa na mesma
transação. Reabrir a mesma questão/sessão reutiliza apresentação verificável. A prévia
do Top5 não é a exposição completa, conforme aviso na interface.

Resposta antes de oito segundos retorna 425; tempo inválido 422; payload conflitante
409. Retry idêntico retorna o recibo. Revisão não gera evidência nova e importação
não promove contadores. Não há endpoint novo que aceite proprietário arbitrário.

O histórico tem limites explícitos; não é uma exportação integral paginada. Reenvio
idempotente não cria linha adicional. Uma resposta posterior da família é revisão.

## Isolamento e administração

Login existente reutilizado; usuário autenticado prevalece sobre cookie anônimo.
Não há fusão automática de históricos. O teste com duas contas cobre as rotas novas,
respostas e perfis. Isso não homologa todas as rotas preexistentes para produção.

As APIs dev continuam desabilitadas por padrão e em produção. O laboratório local
exige habilitação explícita, loopback e token Bearer. A aba nova não depende dele.

## Pacote e incorporação posterior

- projeto/: código completo, incluindo 4A e 4B, sem .git.
- alteracoes_4b/: somente diferenças contra o pacote 4A validado.
- alteracoes_acumuladas/: diferenças totais contra o commit base Git.
- evidencias/: logs, sondas, capturas e validação do pacote extraído.
- manifesto.json: hashes, base e listas de alterações.
- mudancas_rastreadas.patch: diferenças rastreadas; novos arquivos estão nos overlays.
- Relatório PDF: cópia de leitura do relatório técnico.

Compare antes de incorporar em uma branch com trabalho de colegas. A branch de
trabalho é somente local; não existe novo commit ou publicação desta entrega.
