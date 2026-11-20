# Gabaritei

**Fase 4B - entrega local para auditoria.** Em Questões, abra a aba **Para você**.
Relatório: [Fase 4B](docs/fase4b/RELATORIO_TECNICO.md).
Execução e contratos: [Guia](docs/fase4b/EXECUCAO_E_CONTRATOS.md).
Arquitetura: [IA e fluxo](docs/fase4b/ARQUITETURA_E_IA.md).
Sem publicação automática ou avanço para Fase 5.

Aplicativo de estudos para o ENEM com o front-end conectado ao acervo real e ao
recomendador oficial `titulo_area`. Esta é a versão integrada para execução local,
com banco de dados SQLite (contas opcionais). O histórico TRI verificado é guardado no servidor,
associado à conta ou ao cookie de exercício. Outros dados de estudo continuam locais sem login. Detalhes em [docs/banco-de-dados.md](docs/banco-de-dados.md).
O recomendador de dificuldade (nota TRI estimada e um toque de dificuldade nas listas) está descrito em
[docs/recomendador-dificuldade.md](docs/recomendador-dificuldade.md).

## Abrir no Windows

Requer Node.js 22.13 ou superior (o banco usa o módulo `node:sqlite`, sem pacotes extras). Na raiz do projeto:

```powershell
npm start
```

Abra **http://127.0.0.1:4173**. Não é necessário instalar pacotes para executar:
o servidor usa os módulos do Node e o motor do navegador já está compilado.
Também funciona `cd frontend` seguido de `npm run dev`.
Para outra porta: `$env:PORT=4174; npm start`. Para encerrar: Ctrl+C.

## Em outra máquina

Esta entrega Fase 4B é local e ainda não foi publicada. Extraia o ZIP e entre em
`projeto/`. Requer Node.js 22.13 ou superior; a execução foi conferida com Node 24.11.1.
Não é preciso trocar para main nem atualizar uma branch remota.

```powershell
npm start
npm test
node scripts/validar-fase4b.mjs ../minhas-evidencias
```

A documentação anterior permanece em docs/fase4a; a atual está em docs/fase4b.
O estado inicial está no commit `f7ce6aca633f2543e0d8be18ae1a5a898a4ac929` da branch
`recomendador-dificuldade`; as alterações estão somente na branch local
`fase4b/recomendador-unificado`, sem commit ou push. A pasta extraída não inclui `.git`.
O ZIP contém também os arquivos alterados e um patch para inspeção antes da incorporação.
Dataset, catálogo e índices originais foram preservados.

O laboratório `/api/dev/*` fica **desabilitado por padrão**, inclusive a API usada
pela tela antiga `/dev`. O acesso de diagnóstico desta entrega exige habilitação
explícita, conexão local e token Bearer; a tela antiga não solicita esse token.
Use os testes ou um cliente HTTP local. Não publique o token nem habilite esses
endpoints em um serviço público. Em `NODE_ENV=production` eles retornam 404.
Esse bloqueio provisório não é um sistema definitivo de autorização.

Para os **escores ao vivo do laboratório dev**, prepare também Python 3.12, a versão
usada neste projeto. Na raiz, crie um ambiente separado e instale as dependências:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
npm run test:dev-model
npm start
```

No Linux/macOS, use `.venv/bin/python` no comando de instalação. O servidor detecta
esse ambiente automaticamente. Não precisa de GPU, CUDA ou baixar o Qwen para ler
os vetores existentes. As notas e o histórico ficam no navegador de cada máquina;
para levar as avaliações dev, use **Exportar sessão** no laboratório.

## Demonstrar o fluxo

1. Abra **Questões**, escolha uma matéria, assunto e ano e clique em **Começar lista**.
2. Marque uma alternativa e clique em **Confirmar resposta**. O back-end confere o
   gabarito oficial. As tabelas e descrições da base aparecem junto do enunciado.
3. Clique em **Semelhante**: a próxima questão vem do catálogo oficial, na ordem
   já calculada. Não há sorteio para completar listas de semelhantes.
4. Em **Questões → Recomendadas → Praticar semelhantes**, abra uma lista a partir
   da última questão respondida.
5. Confira **Histórico** e **Progresso**. Recarregue a página e retome a lista.
   Seus registros ficam apenas neste navegador.
6. Em **Simulados**, monte um treino por área e ano ou um simulado personalizado.
   O gabarito aparece ao finalizar; o resultado mostra acertos, sem estimar nota TRI.

## Base e recomendador

- Dataset: `e6712a8`, 3.086 registros, 2.731 elegíveis.
- Recomendador: resultado de `d10f5a3`, Qwen3-Embedding-8B NF4 4 bits, instrução
  conceito, limite de 8.192 tokens; índices já reconstruídos e versionados.
- Disponíveis no aplicativo: **2.657 questões**. As 67 com defeito e as 7 marcadas
  como duplicatas ficam fora da prática. O catálogo original mantém seus 2.731 IDs.
- Catálogo: até 50 sugestões, mediana 45, 68 listas vazias. Uma questão de Literatura
  pertence oficialmente à prova de CH de 2009 e não tem outra do mesmo título nessa área.
- O servidor confere o SHA-256 da base e a compatibilidade das sugestões ao iniciar.
- Para abrir o aplicativo, não é preciso Python, CUDA, baixar modelos ou recalcular vetores.

O histórico fictício do protótipo não entra nesta versão. O progresso com questões
oficiais usa novas chaves de armazenamento; dados antigos ficam preservados.

## Desenvolvimento e verificações

O [laboratório dev](DEV_LABORATORIO.md) está em **http://127.0.0.1:4173/dev**:
responda questões, inspecione escores e filtros, compare sugestões e exporte
avaliações separadas do progresso do estudante. A inspeção numérica usa Python
em CPU sobre os vetores existentes; as estatísticas continuam disponíveis sem ele.

```powershell
npm test
npm run test:dev-model    # teste numérico com o ambiente Python do recomendador
# Somente para alterar os módulos TypeScript do motor:
cd frontend
npm ci
npm run build:engine
```

Detalhes e limites: [INTEGRACAO_MAIN.md](INTEGRACAO_MAIN.md),
[back-end](backend/README.md), [front-end](frontend/README.md) e
[relatório da base final](recomendador/rrf-tfidf-minilm-J/RELATORIO_BASE_FINAL.md).
