# Gabaritei — protótipo Canvas

Modelo visual independente inspirado na referência enviada: estrutura preta, cartões pastel, percurso conectado e ferramentas contextuais. O aplicativo ocupa a janela inteira, de borda a borda, sem moldura externa ou fundo de apresentação. Publicado na pasta `frontend` da branch `front-end` do repositório oficial `italodsz/Gabaritei---PI-VI`, para avaliação e desenvolvimento. Esta é uma exploração individual; não representa decisões oficiais do grupo.

## Executar no Windows

Requer Node.js 22. O pacote já inclui o motor de aprendizagem compilado; não é necessário instalar dependências para abrir o protótipo ou executar os testes.

```powershell
git clone --branch front-end https://github.com/italodsz/Gabaritei---PI-VI.git
cd Gabaritei---PI-VI\frontend
npm run dev
```

Abra http://127.0.0.1:4173. Para encerrar: Ctrl+C.

## Arquivos

- `index.html`: estrutura semântica e ícones SVG.
- `styles.css`: componentes, animações e adaptação para celular.
- `areas.css`: identidade cromática reforçada e cards editoriais das quatro áreas.
- `app.js`: busca, filtros, visualizações, atividades, prática, timer e lembrete.
- `learning-pages.js` e `learning-pages.css`: telas completas de Questões e Progresso, com estrutura do front anterior e o visual atual.
- `assets/learning-engine.js`: acervo e regras originais compilados para rodar no navegador.
- `learning-engine.ts`, `legacy/src/` e `build-engine.mjs`: fontes e compilação do motor reutilizado.
- `learning-checks.mjs`: testes de consistência dos filtros, listas, cronômetros e indicadores.
- `server.mjs`: servidor estático limitado ao computador local.
- `assets/`: fontes locais Inter e Bricolage Grotesque com suas licenças.

## O que funciona

- Navegação entre plano, questões, simulados e progresso.
- Busca por assunto e área (atalho `/`).
- Trilha, lista e grade; zoom do mural no desktop.
- Salvar, concluir e adicionar atividades.
- Questão fictícia com correção e explicação.
- Plano semanal, lembrete editável e timer de foco com pausa.
- Persistência separada em `gabaritei:canvas-prototype:v1`, com funcionamento em memória quando o armazenamento está indisponível.
- Restaurar demonstração pelo menu do perfil.
- Layout responsivo e respeito a `prefers-reduced-motion`.
- Quatro áreas com nomes completos, cards numerados e ilustrações SVG próprias: Linguagens, Códigos e suas Tecnologias (vermelho fechado), Ciências da Natureza e suas Tecnologias (verde), Ciências Humanas e suas Tecnologias (laranja) e Matemática e suas Tecnologias (azul).
- Cores das áreas compartilhadas entre questões, simulados, atividades e agenda. A página atual é preservada na URL (`#questoes`, por exemplo).

## Questões e Progresso do front anterior

As duas páginas reaproveitam os módulos puros do front anterior (snapshot documentado em `legacy/README.md`), preservando o funcionamento dos filtros, seleção de questões e cálculos. Os componentes visuais foram refeitos para o estilo Canvas.

- **Questões:** abas Montar lista, Recomendadas e IA escolhe por mim; 13 matérias nas quatro áreas oficiais; assuntos e subtópicos; 5, 10, 15, 20 ou 30 questões; anos de referência; resumo e contagem de disponibilidade; cronômetro opcional; seleção automática por regras locais.
- **Resolução:** listas reais do acervo autoral de 254 questões, cinco alternativas, textos e figuras, confirmação com gabarito e explicação, navegação, pausa, retomada, encerramento com aviso de questões em branco e resultado. Os tempos desconsideram as pausas.
- **Progresso:** diário, semanal e mensal; quatro indicadores; evolução de acerto, comparação de períodos, volume, distribuição por área, desempenho por matéria em barras e tabela, pontos fortes e fracos, calendário de 20 semanas, sequência, metas editáveis e recomendações de revisão.
- Os gráficos derivam de respostas registradas, incluindo o histórico fictício de demonstração e as práticas que você realizar nesta prévia. Nenhum indicador depende de números desenhados manualmente.
- O estado dessas telas fica em `gabaritei:canvas-learning:v1`, separado tanto do mural do protótipo quanto do armazenamento do front anterior (`gabaritei:v1`). O botão de restaurar demonstração no perfil atual continua restrito ao mural.
- Nas duas páginas, a agenda lateral e o dock dão lugar aos filtros, ao resumo da lista e aos painéis analíticos. O app continua ocupando a janela inteira.

### Verificação

```powershell
npm run test:learning
```

Os sete testes verificam o acervo, os filtros combinados, a seleção automática, as recomendações, a propagação de respostas para os indicadores, pausas e retomadas e a consistência entre gráficos, distribuição e calendário.

Para alterar os módulos TypeScript do motor, instale a dependência de desenvolvimento e gere novamente o bundle:

```powershell
npm install
npm run build:engine
```

## Limites

Nomenclatura das áreas conferida na [página oficial do ENEM no Inep](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem).

Dados fictícios. Sem autenticação, back-end, IA ou conexão com o banco oficial do ENEM. A página de Simulados e as atividades simples do mural continuam abrindo uma questão curta de demonstração; elas não usam o novo histórico de listas de Questões. O gráfico do painel de Progresso, por sua vez, é calculado a partir do histórico demonstrativo e das listas realizadas nessa tela. O timer de foco roda somente enquanto a página está aberta. A publicação na branch `front-end` não altera a `main`.

O front-end anterior, com Next.js e seu histórico original, também está preservado em [italodsz/Gabaritei-frontend-PI-VI](https://github.com/italodsz/Gabaritei-frontend-PI-VI).
