# Catálogo de recomendações (RRF TF-IDF + Qwen)

`recomendacoes_rrf_qwen.json` tem, para cada uma das 2.063 questões elegíveis, as 50 sugestões
do recomendador oficial (`rrf_qwen`), da mais para a menos relevante. Gerado por
`python recomendador.py exportar`. É o arquivo que o app lê: não precisa rodar modelo nenhum.

Estrutura:
- `questoes`: para cada id, `area`, `ano`, `habilidade` (INEP), `tri_b` (dificuldade da TRI),
  `nivel` (facil, media ou dificil, pelos tercis de b do treino calculados POR ÁREA, em
  `cortes_nivel_por_area_tri_b`), `alerta_texto` (defeitos de texto conhecidos) e `alerta_grave`
  (defeito de conteúdo, como expoente, fórmula ou equação perdidos: o app deve evitar sugerir).
  Só marcadores `##` não contam como grave: basta removê-los na exibição.
- `recomendacoes`: para cada id, a lista ordenada de 50 ids sugeridos.

Regras já aplicadas: mesma área; nunca a própria questão nem outra da mesma família.
A galeria aqui inclui todas as questões elegíveis (treino, validação e teste); nas avaliações
a galeria era só o treino.

Uso no app: pegar a lista da questão que o aluno acabou de fazer, tirar as que ele já
respondeu e mostrar as 5 primeiras. Para filtrar por nível, manter a ordem e ficar só com as do
nível escolhido, sem as de `alerta_grave`. Com os cortes por área, cada área tem cerca de um
terço das questões em cada nível, e a mediana disponível por nível é de 16 a 17; só 24 (fácil),
0 (média) e 9 (difícil) das 2.063 listas ficam com menos de 5: nesses casos, completar com o
nível mais próximo.

`alertas_texto.json` reúne os 181 defeitos conhecidos (131 só de `##`), vindos de uma busca
automática e das avaliações cegas 1 e 2 e da avaliação em escala. É a lista de partida para
corrigir a base.

## Candidato: `recomendacoes_arvore.json`

Mesma estrutura, gerado com `--metodo arvore` (ver README do recomendador). Cada questão traz também
`grande_tema`, `assunto`, `lingua`, `defeito` e `duplicata`, e `quantas_do_mesmo_assunto` diz quantas
das 50 sugestões são do mesmo assunto. Defeitos e duplicatas nunca aparecem como sugestão; em língua
estrangeira, só aparecem questões da mesma língua. O app deve continuar a usar `recomendacoes_rrf_qwen.json`
até a avaliação cega decidir a troca.
