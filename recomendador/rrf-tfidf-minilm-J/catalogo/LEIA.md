# Catálogo de recomendações (RRF TF-IDF + Qwen)

`recomendacoes_rrf_qwen.json` tem, para cada uma das 2.063 questões elegíveis, as 50 sugestões
do recomendador oficial (`rrf_qwen`), da mais para a menos relevante. Gerado por
`python recomendador.py exportar`. É o arquivo que o app lê: não precisa rodar modelo nenhum.

Estrutura:
- `questoes`: para cada id, `area`, `ano`, `habilidade` (INEP), `tri_b` (dificuldade da TRI)
  e `nivel` (facil, media ou dificil, pelos tercis de b do treino: 0,8005 e 1,5630).
- `recomendacoes`: para cada id, a lista ordenada de 50 ids sugeridos.

Regras já aplicadas: mesma área; nunca a própria questão nem outra da mesma família.
A galeria aqui inclui todas as questões elegíveis (treino, validação e teste); nas avaliações
a galeria era só o treino.

Uso no app: pegar a lista da questão que o aluno acabou de fazer, tirar as que ele já
respondeu e mostrar as 5 primeiras. Para filtrar por nível, manter a ordem e ficar só com as do
nível escolhido. Com 50 sugestões, a mediana disponível por nível é de 14 a 17; em poucas
listas sobram menos de 5 (fácil 227, média 7, difícil 90 de 2.063): nesses casos, completar
com o nível mais próximo.
