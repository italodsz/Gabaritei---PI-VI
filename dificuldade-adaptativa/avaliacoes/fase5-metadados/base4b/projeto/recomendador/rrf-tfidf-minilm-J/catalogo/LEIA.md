# Catálogo de recomendações

> **Situação em 13/11/2026:** nenhum app ou backend usa estes arquivos ainda. São listas de sugestões
> calculadas de antemão e guardadas aqui, à espera da integração (o backend aguarda aprovação).
> Também não existe recomendador por dificuldade: o campo `nivel` é só uma informação guardada, não é usado
> por nenhum método.

## Catálogo do método oficial: `recomendacoes_titulo_area.json`

Gerado por `python recomendador.py exportar` (padrão `--metodo titulo_area`). Para cada uma das 2.731
questões elegíveis, guarda até 50 sugestões, da mais para a menos parecida.

- As sugestões são sempre da **mesma matéria e do mesmo título** da questão (ex.: Física › Ondulatória e
  óptica). Matéria e título são classificação nossa (árvore v1.2), não dado do INEP.
- As listas podem ter **menos de 50** sugestões (mediana 45), porque cada título é finito.
  A menor lista não vazia tem 7 sugestões; **68 questões têm lista vazia** (67 bloqueadas
  por defeito de texto e uma sem candidato compatível após os filtros).
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
ele já respondeu e as de `alerta_grave`, e mostrar as primeiras, junto com a matéria e o título. Para as 68
questões sem lista, mostrar "sem sugestões". Usar `nivel` para filtrar por dificuldade é uma possibilidade
futura, ainda não decidida nem avaliada.

## Outros arquivos

- `alertas_texto.json`: 67 bloqueios por defeito e duas ressalvas da prova original. Os alertas antigos
  corrigidos foram removidos; histórico em `../resultados/base_final/auditoria_alertas.json`.
- Os catálogos antigos `recomendacoes_rrf_qwen.json`, `recomendacoes_arvore.json` e
  `recomendacoes_titulo.json` permanecem nas branches de pesquisa. Não foram trazidos
  para a main, que usa somente o resultado final `titulo_area`.

Base final do dataset: e6712a8. SHA-256 `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
Conferências, limitações e validação em [RELATORIO_BASE_FINAL.md](../RELATORIO_BASE_FINAL.md).
