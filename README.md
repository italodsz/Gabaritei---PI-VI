# Gabaritei

Aplicativo de estudos para o ENEM com o front-end conectado ao acervo real e ao
recomendador oficial `titulo_area`. Esta é a versão integrada para execução local,
sem banco de dados e sem cadastro.

## Abrir no Windows

Requer Node.js 22 ou superior. Na raiz do projeto:

```powershell
npm start
```

Abra **http://127.0.0.1:4173**. Não é necessário instalar pacotes para executar:
o servidor usa os módulos do Node e o motor do navegador já está compilado.
Também funciona `cd frontend` seguido de `npm run dev`.
Para outra porta: `$env:PORT=4174; npm start`. Para encerrar: Ctrl+C.

## Em outra máquina

Instale Node.js 22 ou superior. Para baixar a versão integrada:

```powershell
git clone --branch main https://github.com/italodsz/Gabaritei---PI-VI.git
cd Gabaritei---PI-VI
npm start
```

Se já tiver o repositório, entre na branch `main` e use `git pull --ff-only origin main`.
Dataset, catálogo, vetores e front-end compilado já estão no GitHub.
O `.gitattributes` preserva os bytes dos arquivos com hash, inclusive quando o Git
da outra máquina estiver configurado para converter fins de linha no Windows.

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
