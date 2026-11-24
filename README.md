# Gabaritei

Aplicativo de estudos para o ENEM com o front-end conectado ao acervo real e ao
recomendador oficial `titulo_area`. Esta é a versão integrada para execução local,
com banco de dados SQLite (contas opcionais). Sem entrar, o progresso fica só no navegador;
entrando, ele é guardado no servidor. Detalhes em [docs/banco-de-dados.md](docs/banco-de-dados.md).
O recomendador de dificuldade (nota TRI estimada e um toque de dificuldade nas listas) está descrito em
[docs/recomendador-dificuldade.md](docs/recomendador-dificuldade.md).

## Rodar localmente

Requer Python 3.12. Node 22.13 ou mais recente é necessário para os testes JavaScript
e para os atalhos npm; o servidor pode ser iniciado diretamente pelo Python.

```sh
git clone --branch main https://github.com/italodsz/Gabaritei---PI-VI.git
cd Gabaritei---PI-VI
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m backend
```

No Windows, crie o ambiente com `py -3.12 -m venv .venv` e use
`.venv\Scripts\python.exe` no lugar de `.venv/bin/python`.

Abra **http://127.0.0.1:4173**. A documentação interativa está em **/docs**.
Para mudar a porta, use a variável `PORT`. Para encerrar, pressione Ctrl+C.
Os comandos `npm start` na raiz e `npm run dev` em `frontend/` também iniciam o FastAPI
depois que o ambiente Python estiver pronto.

O SQLite continua em `backend/dados/gabaritei.db` por padrão. O servidor lê o mesmo
banco da versão Node, com as contas, senhas, sessões e progresso existentes.

## Hospedagem

O Railway publica automaticamente a branch `main`, servindo o front-end, a API e as imagens
no mesmo serviço. O SQLite fica no volume persistente `/data`, com
`GABARITEI_DB=/data/gabaritei.db` e `GABARITEI_COOKIE_SEGURO=1`.

## Imagens das questões

O servidor exibe as imagens verificadas que estiverem em `Dataset/base_trabalho/media/`.
As descrições aprovadas continuam disponíveis mesmo quando uma imagem falta. Para baixar
as imagens para uso local, com a API parada:

```sh
.venv/bin/python -m pip install pyarrow
.venv/bin/python -m backend.baixar_imagens
```

O script consulta as fontes, confere SHA-256 e tamanho, e registra ausências em
`backend/dados/relatorio-imagens.json`. Se faltar algum arquivo, o script retorna
código 1. Reinicie o servidor após baixar. As 622 imagens verificadas são versionadas e publicadas junto com a aplicação no Railway.
A base registra revisão de licença pendente para redistribuição pública.

## Demonstrar o fluxo

1. **Início → Prática sob medida** (modo padrão): escolha por onde começar (uma questão, um tema
   ou aleatório). Cada próxima questão é a parecida com a anterior pelo `titulo_area`, com o
   ajuste do recomendador de dificuldade; o motivo aparece em cima da questão.
2. Depois de confirmar uma resposta, o card **O que o recomendador aprendeu** mostra a chance que
   ele previa, o nível (θ) e a nota estimada antes e depois.
3. **Início → Até onde você chega?**: escada de dificuldade (começa fácil e sobe a cada acerto).
4. **Questões → Montar lista**: filtros por matéria, assunto e ano; a lista livre carrega de 20 em 20
   pela dificuldade. **Semelhante** traz a próxima do catálogo oficial.
5. **Simulados**: por área (formato do dia do ENEM) ou personalizado; o gabarito aparece ao finalizar.
6. **Entrar ou criar conta** (menu do perfil): o progresso e o perfil TRI passam a ficar no banco.
7. **Modo dev** (só a conta de desenvolvedor): botão no topo da tela da questão que abre o painel dos
   recomendadores, com TRI e parecidas da questão, perfil TRI, aprendizado e calibração. Veja
   [docs/modo-dev.md](docs/modo-dev.md).

## Base e recomendador

- Dataset: `e6712a8`, 3.086 registros, 2.731 elegíveis.
- Recomendador: resultado de `d10f5a3`, Qwen3-Embedding-8B NF4 4 bits, instrução
  conceito, limite de 8.192 tokens; índices já reconstruídos e versionados.
- Disponíveis no aplicativo: **2.657 questões**. As 67 com defeito e as 7 marcadas
  como duplicatas ficam fora da prática. O catálogo original mantém seus 2.731 IDs.
- Catálogo: até 50 sugestões, mediana 45, 68 listas vazias. Uma questão de Literatura
  pertence oficialmente à prova de CH de 2009 e não tem outra do mesmo título nessa área.
- O servidor confere o SHA-256 da base e a compatibilidade das sugestões ao iniciar.
- O FastAPI e o modo dev usam os índices já calculados, em CPU.

O histórico fictício do protótipo não entra nesta versão. O progresso com questões
oficiais usa novas chaves de armazenamento; dados antigos ficam preservados.

## Desenvolvimento e verificações

O [modo dev](docs/modo-dev.md) fica na tela da questão, só para a conta de desenvolvedor
(`backend/dados/devs.txt` ou `GABARITEI_DEVS`). A inspeção dos escores usa Python em CPU
sobre os vetores existentes, carregados na primeira consulta.

```sh
.venv/bin/python -m pytest
npm test                 # testes do navegador e paridade TRI com JavaScript
# Somente para alterar os módulos TypeScript do motor:
cd frontend
npm ci
npm run build:engine
```

## Estrutura da versão final

- `frontend/`: telas, estilos e bundle do app. `legacy/src/` contém os módulos
  TypeScript ainda usados por `learning-engine.ts`; não é um segundo aplicativo.
- `backend/`: FastAPI, SQLite, migrações, TRI, catálogo e diagnóstico do modo dev.
- `tests/`: testes Python; os testes JavaScript também ficam em `backend/` e `frontend/`.
- `Dataset/base_trabalho/`: base oficial, IDs elegíveis e partições de treino,
  validação e teste. `media/` é opcional e fica fora do Git.
- `recomendador/rrf-tfidf-minilm-J/`: catálogo `titulo_area`, índices, base,
  classificador e código para consulta e reconstrução. Cinco JSONs em
  `resultados/base_final/` alimentam o resumo da API do modo dev.
- `avaliacao/dificuldade/`: comparação dos três recomendadores com o ENEM 2024;
  não participa da inicialização do servidor.
- `docs/`: banco de dados e MER, recomendação de dificuldade e modo dev.

A base e o catálogo têm SHA-256 congelados: não edite esses arquivos para fazer
o servidor iniciar. Reconstruções precisam ser uma atualização deliberada e
compatível da base, classificação, índices, catálogo e hashes.
Relatórios antigos e registros de processo permanecem no histórico do Git.

Detalhes: [back-end](backend/README.md), [front-end](frontend/README.md),
[base](Dataset/base_trabalho/README.md), [recomendador](recomendador/rrf-tfidf-minilm-J/README.md)
e [avaliação de dificuldade](avaliacao/dificuldade/README.md).
