# Front-end integrado

O front-end da main usa questões oficiais do ENEM fornecidas pelo back-end local.
O visual, a navegação, os simulados, as notas e as telas de histórico e progresso
foram preservados; o acervo fictício e o histórico demonstrativo não são carregados.

## Abrir

Requer Node.js 22+. Na raiz: `npm start`; ou, nesta pasta: `npm run dev`.
Abra http://127.0.0.1:4173. Não é necessário instalar pacotes para executar.
O servidor atende o front-end e a API no mesmo endereço e somente no computador local.

## Fluxos conectados

- O aplicativo carrega matérias, títulos, assuntos, anos e 2.657 questões liberadas
  por `/api/bootstrap`. Não recorre aos exemplos autorais se o servidor falhar.
- Listas filtram matéria, título, subtópico e ano oficiais, com até 30 questões.
- Confirmar resposta consulta o back-end, que confere o gabarito oficial.
- **Semelhante** usa o catálogo `titulo_area`, preserva a ordem e exclui as questões
  já respondidas/na sessão e suas famílias. Não completa sugestões com sorteio.
- **Recomendadas → Praticar semelhantes** abre uma lista a partir da última resposta.
- Os cartões de assuntos e a **Seleção automática** continuam usando regras de estudo
  do navegador (acerto por assunto, dificuldade declarada e tempo sem revisão).
  Essa seleção inicial é distinta da semelhança de questões do catálogo oficial.
- Simulados por área/ano e personalizados usam o mesmo acervo real, mostram a correção
  ao finalizar e calculam os acertos, sem apresentar nota TRI ilustrativa.
- Enunciados mostram tabelas, negrito e descrições aprovadas com HTML de origem escapado.
- Não há resolução comentada das questões: o feedback informa o gabarito e essa limitação.

## Progresso local

Práticas, simulados, favoritas, revisão, metas e perfil usam
`gabaritei:estudos:oficial:v1`. O plano usa `gabaritei:plano:oficial:v1`.
As chaves anteriores do protótipo são preservadas e não entram no histórico oficial.
Notas continuam em seu armazenamento próprio. Sem armazenamento, o estado fica em
memória e o aplicativo avisa que as práticas duram apenas aquela sessão.

Sem banco de dados, login ou sincronização entre navegadores. Limpar os dados do
site apaga o progresso local. O perfil é um espaço local; não representa autenticação.

## Alterar o motor

As telas acessam o acervo por `questionRepository`. O bootstrap instala a taxonomia e
as questões antes de montar as telas. Respostas, resultados, conquistas e gráficos
usam esse mesmo repositório, inclusive quando o app é recarregado.

```powershell
npm ci
npm run build:engine
npm run test:learning
```

O bundle `assets/learning-engine.js` é versionado. Não inclui o banco de questões
fictícias. As fontes antigas de fixtures permanecem como referência, sem uso no app.
Os testes completos da API e do motor ficam na raiz: `npm test`.

Fontes e limites da integração: [INTEGRACAO_MAIN.md](../INTEGRACAO_MAIN.md).
