# Catálogo de recomendações

> **Situação em 11/11/2026:** nenhum app ou backend usa estes arquivos ainda. São listas de sugestões
> calculadas de antemão e guardadas aqui, à espera da integração (o backend aguarda aprovação).
> Também não existe recomendador por dificuldade: o campo `nivel` é só uma informação guardada, não é usado
> por nenhum método.

## Catálogo do método oficial: `recomendacoes_titulo_area.json`

Gerado por `python recomendador.py exportar` (padrão `--metodo titulo_area`). Para cada uma das 2.063
questões elegíveis, guarda até 50 sugestões, da mais para a menos parecida.

- As sugestões são sempre da **mesma matéria e do mesmo título** da questão (ex.: Física › Ondulatória e
  óptica). Matéria e título são classificação nossa (árvore v1.2), não dado do INEP.
- As listas podem ter **menos de 50** sugestões (mediana 34), porque cada título é finito. Nenhuma lista
  tem entre 1 e 4; **23 questões têm lista vazia** (sem rótulo por defeito de texto).
- Nunca aparecem como sugestão: a própria questão, outra da mesma família, questões com defeito e
  duplicatas. Em inglês/espanhol, só questões da mesma língua.

Por que é o oficial: ver `../DECISAO_FINAL.json` (campo `oficial`) e `../resultados/avaliacao_ia_50/`.

## Estrutura dos arquivos (vale para todos os catálogos)

- `questoes`: para cada id, `area`, `ano`, `habilidade` (INEP), `tri_b` (dificuldade oficial da TRI, do
  INEP), `nivel` (facil, media ou dificil: tercis de `tri_b` no treino, calculados por área, cortes em
  `cortes_nivel_por_area_tri_b`), `alerta_texto` (defeitos de texto conhecidos) e `alerta_grave` (defeito
  de conteúdo, como expoente, fórmula ou equação perdidos). Só marcadores `##` não contam como grave.
  No catálogo oficial, cada questão traz também `materia`, `titulo`, `grande_tema`, `assunto`, `lingua`,
  `defeito` e `duplicata`.
- `recomendacoes`: para cada id, a lista ordenada de ids sugeridos.

A galeria inclui todas as questões elegíveis (treino, validação e teste); nas avaliações era só o treino.

## Sugestão para quando houver integração (ainda não implementado)

Uma forma simples de usar o catálogo: pegar a lista da questão que o aluno acabou de fazer, tirar as que
ele já respondeu e as de `alerta_grave`, e mostrar as primeiras, junto com a matéria e o título. Para as 23
questões sem lista, mostrar "sem sugestões". Usar `nivel` para filtrar por dificuldade é uma possibilidade
futura, ainda não decidida nem avaliada.

## Outros arquivos

- `alertas_texto.json`: os 181 defeitos de texto conhecidos (131 só de `##`), vindos de uma busca
  automática, das avaliações cegas 1 e 2 e da avaliação em escala. É a lista de partida para corrigir a base.
- `recomendacoes_rrf_qwen.json`: catálogo do método `rrf_qwen` (oficial de 06/11 a 11/11/2026), mesma
  área sem filtro de título. Só histórico.
- `recomendacoes_arvore.json` e `recomendacoes_titulo.json`: candidatos testados e não adotados.
