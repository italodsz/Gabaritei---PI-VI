# Assunto primeiro em todas as matérias — protocolo (fixado em 11/11/2026, antes de qualquer nota)

- **Matérias:** todas, exceto Física, que já foi testada e confirmada.
- **Referências:** 12 por matéria, sorteadas com a semente `gabaritei-ap-todas-2026-11-11`. Ficam de fora as questões com defeito e as referências usadas em testes anteriores de Física. Só entram referências cujo assunto tenha pelo menos mais uma questão; nas outras o método não muda nada.
- **Comparação:** as 5 primeiras sugestões do método atual (`titulo_area`) contra as 5 primeiras do "assunto primeiro" (mesmo assunto da árvore no topo, o resto do título completa).
- **O que é avaliado:** só os itens que aparecem em uma lista e não na outra, mais 1 isca por bloco. Itens presentes nas duas listas se anulam na diferença. A média completa de cada lista é estimada usando a nota desses itens comuns: os comuns também recebem nota, mas só quando o bloco tem 3 itens ou menos que diferem. Se nada difere, a diferença do bloco é 0.
  - Simplificação usada no lugar disso: **todos os itens das duas listas são avaliados**. Ficam lado a lado, embaralhados, junto com a isca.
- **Avaliação:** feita às cegas pela IA, com a régua 2 (mesmo conteúdo vale 9 a 10, tema próximo vale cerca de 5). As notas são registradas com sha256 antes de abrir a chave.
- **Critério por matéria:** o método é ligado na matéria se a diferença média por referência for de pelo menos +0,3 e o limite inferior do IC95 (bootstrap) for maior que 0.
  - Se a diferença ficar entre 0 e 0,3, ou se o IC95 cruzar o zero, o método fica desligado e a matéria é marcada como "inconclusivo".
  - Na matéria, a decisão é tudo ou nada. Com 12 referências, decidir título por título seria sobreajuste. O resultado por título aparece só como informação.
- **Limite:** a classificação das matérias não foi conferida à mão antes do teste, como foi feito na Física.

**Ajuste feito antes de qualquer nota:** a avaliação cobre só os itens que diferem entre as duas listas, mais a isca. Os itens comuns entram com o mesmo valor nas duas médias e se anulam. Por isso, a diferença por referência é calculada como (soma das notas só do novo − soma das notas só do atual) / 5, que dá exatamente o mesmo resultado. As médias absolutas não entram no relatório.
