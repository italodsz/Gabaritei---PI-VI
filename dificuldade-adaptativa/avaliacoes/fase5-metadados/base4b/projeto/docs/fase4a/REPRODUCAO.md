# Como executar e reproduzir a Fase 4A

## Conteúdo do ZIP

- `projeto/`: checkout completo preparado, sem `.git`, credenciais ou banco de usuário.
- `alteracoes/`: somente arquivos novos/modificados, com caminhos relativos preservados.
- `evidencias/`: logs reais antes/depois, sondas JSON e capturas da tela.
- `mudancas_rastreadas.patch`: diferenças dos arquivos anteriormente rastreados;
  arquivos novos estão no overlay, portanto não usar o patch sozinho como entrega completa.
- `manifesto.json`: base, branch local, alterações e hashes dos arquivos do pacote.

## Abrir o aplicativo

Instalar Node.js >=22.13 (conferido: 24.11.1). Extraia para uma pasta nova; no PowerShell:

```powershell
cd caminho-da-extracao/projeto
npm start
```

Abra http://127.0.0.1:4173. A execução por catálogo não requer instalar pacotes Node
ou Python. O SQLite é criado localmente. Dados oficiais e índices já estão no pacote.
O aplicativo requer servidor; não abrir o HTML diretamente por duplo clique.

## Repetir testes e sonda

```powershell
node scripts/validar-fase4a.mjs ../minhas-evidencias
```

Esse comando executa a suíte de 84 casos e a sonda HTTP, salva saídas completas e
valida os hashes do dataset e catálogo. O arquivo `execucao.json` registra comandos,
códigos de saída e ambiente. O teste usa banco em memória e, no caso de persistência,
banco temporário isolado; não altera o banco normal do aplicativo.

Para apenas um componente:

```powershell
npm test
node scripts/sonda-integridade.mjs ../sonda-reexecutada.json
```

## Conferência opcional da tela

Requer Chrome e Playwright. Esses programas só são necessários ao teste, não ao app.
Instale Playwright em um diretório de ferramentas separado se ainda não o tiver:

```powershell
npm install --prefix ../ferramentas-fase4a playwright@1.65.0
$env:PLAYWRIGHT_MODULE=(Resolve-Path ../ferramentas-fase4a/node_modules/playwright/index.mjs).Path
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node scripts/test-ui-integridade.mjs ../evidencias-ui
```

O teste usa Chrome instalado e a tela real com fixture de sessão, aguarda o tempo
real, verifica 3/7/8 segundos, Enter, duplo clique e Anterior. Não constitui teste
com estudante real. O contador visual atualiza a cada segundo; a liberação pode
aparecer no próximo tick depois dos oito segundos. O servidor nunca libera antes.

## Conferência opcional do worker semântico

O app não depende desse worker para consultar o catálogo. Para o laboratório numérico,
use um ambiente Python separado e as dependências `backend/requirements-dev.txt`.
Não reinstale dependências do projeto sem necessidade. No ambiente usado nesta
entrega elas já estavam disponíveis e o teste foi executado:

```powershell
python -m venv ../venv-diagnostico
../venv-diagnostico/Scripts/python -m pip install -r backend/requirements-dev.txt
$env:GABARITEI_PYTHON=(Resolve-Path ../venv-diagnostico/Scripts/python.exe).Path
npm run test:dev-model
```

Consulte a variável de Python efetivamente suportada em `backend/dev-worker.mjs`
antes de alterar o ambiente. A evidência entregue usa os índices existentes,
sem gerar embeddings, treinar ou consultar modelos remotos.

Para o validador com todos os componentes opcionais preparados:

```powershell
node scripts/validar-fase4a.mjs ../minhas-evidencias --ui --semantic
```

## Incorporar posteriormente ao Git

O commit de base é `f7ce6aca633f2543e0d8be18ae1a5a898a4ac929`, branch de origem
`recomendador-dificuldade`. A branch local de trabalho é `fase4a/integridade-tri`.
Nenhuma publicação foi feita. Compare `alteracoes/` com a branch de destino e revise
conflitos antes de copiar. Não sobreponha trabalho recente de colegas às cegas.
O pacote completo é executável sem Git; o overlay não substitui a base inteira.
O usuário decide quando e onde publicar após auditoria. Não há comando automático
que altere branches, faça commit, push, merge ou pull request.
