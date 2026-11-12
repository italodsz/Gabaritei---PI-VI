# Recomendadores do Gabaritei

Cada pasta é um recomendador. O nome termina com a sigla de quem fez:
D = Cauê, K = João, H = Gabriel, U = Teles, J = Ítalo.

| Pasta | Autor | Situação |
|---|---|---|
| `rrf-tfidf-minilm-J/` | Ítalo | Versão de trabalho; 1ª avaliação aprovada no limite. Pendências e fontes posteriores em ESTADO_ATUAL.md |

Para adicionar o seu: crie um branch `nome/tarefa`, crie a pasta
`recomendador/<tecnica>-<SIGLA>/` com o código e um `README.md` (autor, o que faz,
como rodar, resultado), acrescente uma linha nesta tabela e abra um pull request.

## Origem da base de questões

`rrf-tfidf-minilm-J/base/questions.jsonl` vem da base de trabalho da branch `dataset`
(`Dataset/base_trabalho/`, gerada pelo pipeline de limpeza do João). Esta é a versão em uso:
depois de copiada, recebeu o texto oficial do INEP em 22 enunciados truncados e a correção de
área de uma questão de Literatura (detalhes em `rrf-tfidf-minilm-J/ESTADO_ATUAL.md`).
Não use a cópia da branch `dataset` para o recomendador.
