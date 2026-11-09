# Gabaritei — front-end

Front-end do Gabaritei: estrutura preta, cartões pastel, percurso conectado e ferramentas contextuais. O aplicativo ocupa a janela inteira, de borda a borda, sem moldura externa ou fundo de apresentação. Publicado na pasta `frontend` da branch `front-end` do repositório oficial `italodsz/Gabaritei---PI-VI`, para avaliação e desenvolvimento.

## Executar no Windows

Requer Node.js 22. O pacote já inclui o motor de aprendizagem compilado; não é necessário instalar dependências para abrir o app ou executar os testes.

```powershell
git clone --branch front-end https://github.com/italodsz/Gabaritei---PI-VI.git
cd Gabaritei---PI-VI\frontend
npm run dev
```

Abra http://127.0.0.1:4173. Para encerrar: Ctrl+C.

## Arquivos

- `index.html`: estrutura semântica e ícones SVG.
- `styles.css`: componentes, animações e adaptação para celular.
- `practice-screen.js`, `question-screen.css` e `practice-screen.css`: tela de resolução, réplica da sessão de prática do front anterior (cabeçalho com cronômetro, olho, pausa, modo leitura, painel e Finalizar; cartão da questão; alternativas; feedback com explicação; painel de navegação, marcação, favoritas e atalhos; tela de pausa e "Bem-vindo de volta!"; animações com os mesmos tempos e curvas). Só o ícone da marca mudou. A tela de resultado fica em `practice-screen.css`.
- `history-page.js` e `history-page.css`: página Histórico, com o mesmo fluxo do front anterior.
- `cards.css`: cards do mural no modelo do "Seu próximo passo", com a cor da área e detalhes da área no fundo. O mural mostra só as atividades que ainda faltam; o filtro azul da guia rápida ("Concluídas") inclui as já feitas, mais apagadas e com o ✓ marcado (clicar reabre). Na trilha, os cards ficam em duas colunas em zigue-zague e os tracinhos que os ligam são desenhados a partir da posição de cada card (`drawTrail`, em `app.js`), para qualquer quantidade de atividades.
- `sidebar.css`: navegação no topo, sempre visível ao rolar (logo, menu, perfil) com as guias rápidas — as bolinhas coloridas — na ponta direita. No tablet o menu fica só com ícones; no celular, os 5 itens ficam em colunas.
- `areas.css`: identidade cromática reforçada e cards editoriais das quatro áreas.
- `app.js`: busca, filtros, visualizações, atividades, prática, timer e lembrete.
- `learning-pages.js` e `learning-pages.css`: telas completas de Questões e Progresso, com estrutura do front anterior e o visual atual.
- `assets/learning-engine.js`: acervo e regras originais compilados para rodar no navegador.
- `learning-engine.ts`, `legacy/src/` e `build-engine.mjs`: fontes e compilação do motor reutilizado.
- `learning-checks.mjs`: testes de consistência dos filtros, listas, cronômetros e indicadores.
- `server.mjs`: servidor estático limitado ao computador local.
- `assets/`: fontes locais Inter e Bricolage Grotesque com suas licenças.

## O que funciona

- Navegação entre plano, questões, simulados, histórico e progresso.
- Busca por assunto e área (atalho `/`).
- Trilha, lista e grade; zoom do mural no desktop.
- Salvar, concluir e adicionar atividades.
- Atividades do plano, da agenda e os cards de área de Simulados abrem listas reais do acervo na tela de resolução. Concluir a lista de uma atividade marca a atividade como concluída.
- Plano semanal, lembrete editável e timer de foco com pausa.
- Persistência separada em `gabaritei:plano:v1`, com funcionamento em memória quando o armazenamento está indisponível.
- Restaurar demonstração pelo menu do perfil.
- Layout responsivo e respeito a `prefers-reduced-motion`.
- Quatro áreas com nomes completos, cards numerados e ilustrações SVG próprias: Linguagens, Códigos e suas Tecnologias (terracota `#be471c`), Ciências Humanas e suas Tecnologias (mostarda `#e4b324`), Ciências da Natureza e suas Tecnologias (verde `#39a250`) e Matemática e suas Tecnologias (azul `#3e5ac6`). Essas cores ficam em `areas.css` (`--linguagens`, `--humanas`…) e em `learning-pages.js`; texto e botões usam um tom mais escuro da mesma cor (`--linguagens-ink`…), que mantém contraste de pelo menos 4,5:1.
- Cores das áreas compartilhadas entre questões, simulados, atividades e agenda. A página atual é preservada na URL (`#questoes`, por exemplo).

## Histórico

Mesmo fluxo do Histórico do front anterior, com a paleta atual:

- **Atividades:** listas e simulados, concluídos ou interrompidos. Filtros por tipo, situação, matéria, período (padrão: últimos 30 dias) e resultado; contagem de atividades encontradas; 12 por vez com “Mostrar mais”. Cada card mostra acertos, percentual e barra de resultado, e abre com as matérias, os números e as ações: **Ver resultado** (e **Revisão**, nos simulados) quando concluída; **Continuar** e **Excluir** (com confirmação) quando interrompida.
- **Erradas:** questões cujo último registro foi um erro, com a data do último erro. Refazer não mostra a resposta anterior.
- **Favoritas** e **Para revisar:** questões guardadas durante a resolução, com botão para remover.
- Nas três coleções: filtro por matéria, seleção de questões (ou todas), **Praticar** uma questão sozinha e o painel **Começar**, que monta uma lista com as selecionadas ou com todas do filtro (até 30).
- O resultado de simulados abre na mesma tela de resultado, só para leitura. **Continuar** um simulado interrompido ainda avisa que a prova completa está em construção.

## Questões e Progresso do front anterior

As duas páginas reaproveitam os módulos puros do front anterior (snapshot documentado em `legacy/README.md`), preservando o funcionamento dos filtros, seleção de questões e cálculos. Os componentes visuais foram refeitos para o estilo Canvas.

- **Questões:** abas Montar lista, Recomendadas e IA escolhe por mim; 13 matérias nas quatro áreas oficiais; assuntos e subtópicos; 5, 10, 15, 20 ou 30 questões; anos de referência; resumo e contagem de disponibilidade; cronômetro opcional; seleção automática por regras locais.
- **Resolução:** igual à sessão de prática do front anterior, inclusive atalhos (A–E, Enter, ← →, P, M, F), questão semelhante/aleatória, figura ampliável com zoom, pausa que esconde a questão e confirmação ao finalizar. Os tempos desconsideram as pausas.
- **Progresso:** diário, semanal e mensal; quatro indicadores; evolução de acerto, comparação de períodos, volume, distribuição por área, desempenho por matéria em barras e tabela, pontos fortes e fracos, calendário de 20 semanas, sequência, metas editáveis e recomendações de revisão.
- Os gráficos derivam de respostas registradas, incluindo o histórico fictício de demonstração e as práticas que você realizar aqui. Nenhum indicador depende de números desenhados manualmente.
- O estado dessas telas fica em `gabaritei:estudos:v1`, separado tanto do mural quanto do armazenamento do front anterior (`gabaritei:v1`). O botão de restaurar demonstração no perfil atual continua restrito ao mural.
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

Dados fictícios. Sem autenticação, back-end, IA ou conexão com o banco oficial do ENEM. A prova de simulado completa (cronômetro regressivo e mapa de 1 a 90) ainda não foi feita; por enquanto, Simulados oferece treinos de 10 questões por área. O gráfico do painel de Progresso, por sua vez, é calculado a partir do histórico demonstrativo e das listas realizadas nessa tela. O timer de foco roda somente enquanto a página está aberta. A publicação na branch `front-end` não altera a `main`.

O front-end anterior, com Next.js e seu histórico original, também está preservado em [italodsz/Gabaritei-frontend-PI-VI](https://github.com/italodsz/Gabaritei-frontend-PI-VI).
