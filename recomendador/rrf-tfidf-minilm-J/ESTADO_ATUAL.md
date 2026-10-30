# Estado do recomendador — 30/10/2026

## O que está disponível

RRF de TF-IDF + MiniLM multilíngue em blocos, k=60, sem reordenação adicional.
Código, base e índices já estavam publicados no commit
`c790a971f06f338f3b1e50b98638b8c971561267` e foram preservados nesta atualização.
Não houve treinamento, recodificação, execução de benchmark ou alteração de algoritmo nesta publicação.

Base de trabalho: 2.971 questões, das quais 2.063 elegíveis para esta busca textual:
1.801 na galeria de treino, 136 na validação e 126 no teste.
SHA-256 da base registrado em `indice/config.json`:
`22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`.

A busca utiliza enunciado e alternativas, restringe à mesma área e exclui/deduplica
famílias de conteúdo. Não há personalização pela dificuldade do aluno.
O código permite buscas em todas as áreas: qualquer cautela com CN/CH descrita aqui
é uma recomendação de uso, não um bloqueio implementado.

## Evidência e limites

- Validação de desenvolvimento: RRF 34/44 comparações, TF-IDF 30/44, MiniLM 24/44.
  São comparações de ordenação entre pares de notas diferentes, não taxa de acerto
  de alunos ou 44 consultas independentes. As notas são majoritariamente de IA.
- Primeira avaliação humana registrada no repositório: Ítalo, 12/24 sugestões
  fortemente relevantes e 21/24 ao menos parcialmente relevantes; aprovação no limite.
  LC: 5/6 com nota 2; MT: 4/6; CN: 2/6; CH: 1/6.
- Segunda avaliação: o histórico posterior relata 3/24 notas 2, 13/24 notas 1 ou 2
  e autoria humana (Teles/Ítalo). O DOCX disponível se declara preenchido por IA,
  não avaliação humana independente, e contém 3/24 notas 2 e 11/24 notas 1 ou 2.
  Existem divergências em S61, S62, S82 e S83. As fontes são registradas separadamente
  em `resultados/avaliacao2_fontes.json`; não foi escolhida arbitrariamente uma delas.
- Terceira avaliação: segundo o histórico, compara RRF e filtro por habilidade;
  o preenchimento disponível é assistido por IA e a avaliação humana permanece pendente.
  Esse filtro não foi incorporado ao código atual.

Os resultados posteriores reforçam a cautela com relevância pedagógica, sobretudo CN/CH,
mas a avaliação 2 precisa de conciliação de procedência antes de ser apresentada como
validação humana confirmada. Semelhança temática não garante o mesmo conhecimento exigido.
Não declarar um vencedor geral nem aprovação para todas as áreas.

## Pendências técnicas

1. Recuperar a ficha humana original da avaliação 2 e conciliar as quatro divergências.
2. Consolidar a lista de defeitos textuais relatados, com IDs estáveis e fontes.
   O histórico menciona pelo menos 18 ocorrências; esse total não foi auditado aqui
   como 18 questões únicas. Conferências anteriores de gabaritos não foram repetidas.
3. Corrigir os textos em uma nova versão rastreável, preservando as bases congeladas.
4. Recodificar o vetor MiniLM da V01 (`gq_14561aefce51ecddf26b4262`), ainda sinalizado
   em `indice/config.json`, e verificar hashes e alinhamento entre IDs e vetores.
5. Concluir a avaliação humana independente e usar exemplos novos para testar
   alterações posteriores; não reutilizar avaliações já consultadas como teste intocado.
6. Só depois retomar personalização com respostas reais dos alunos.
   Logistic Regression, Random Forest e XGBoost não foram treinados nesta atualização.

## Limites desta publicação

A atualização é documental e registra o estado verificável mais as pendências do histórico.
O arquivo `recomendador-avaliacao2.bundle` citado no histórico não foi localizado entre
os arquivos acessíveis; portanto, não se afirma ter importado seu conteúdo ou código posterior.
Os originais PDF/DOCX não foram incluídos neste commit; foram transcritos apenas os
resultados e a identificação das fontes. Nenhuma chave da avaliação humana pendente foi aberta
ou publicada. A avaliação 1 e seus arquivos históricos foram mantidos intactos.

Qwen fica adiado por decisão do usuário. Nenhum download ou execução dele foi feito.
Não houve alteração no frontend, na `main`, no branch `wardrobe`, na base ou nos índices.
O código e os índices não foram executados novamente nesta publicação: a verificação
é de integridade dos arquivos Git e consistência dos registros documentais.

Fontes consultadas: arquivos já versionados deste recomendador;
`Gabaritei — Histórico completo do recomendador.pdf`;
`Avaliacao_Cega_2_Gabaritei_CN_CH_Preenchida.docx` (versão 1).
