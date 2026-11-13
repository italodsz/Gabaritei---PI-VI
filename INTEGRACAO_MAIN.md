# Integração na main — 13/11/2026

## Fontes

- Front-end: `main@90d5498`, incluindo Perfil e o protótipo Canvas atual.
- Dataset: `dataset@e6712a8`, pasta `Dataset/` completa. Nenhum registro de questão,
  split, imagem ou lista de elegíveis foi alterado. O README teve o topo corrigido
  para dizer que a catalase já estava desbloqueada e recebeu a nota de integração.
- Recomendador final: `recomendador-base-final@d10f5a3`. Foram trazidos o catálogo
  oficial, os índices reconstruídos, rótulos, taxonomia, configurações, código de
  consulta/geração, verificações e evidências da base final. Resultados experimentais
  e catálogos anteriores não foram incorporados ao app.
- O trabalho foi preparado em uma cópia separada para preservar os arquivos locais
  modificados nos outros clones. Não foi feita uma mescla geral de branches que
  pudesse substituir o front-end atual por uma versão antiga.

SHA-256 do dataset: `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
SHA-256 do catálogo: `c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb`.
SHA-256 Qwen: `10f44a7935e23b9922305cbe9ded397e74f10619adc90e0826858834e410d1c5`.

## Funcionamento

O back-end Node lê os arquivos, verifica os hashes da base e do catálogo e valida
os IDs e as restrições das sugestões. Serve a API e o front-end no mesmo endereço.
Não há banco, configuração de MySQL, login, criação de contas ou serviço externo.
O acervo é carregado na memória do servidor; a prática fica no armazenamento do navegador.

São 3.086 registros, 2.731 elegíveis e 2.657 disponíveis na prática. Os 67 defeitos
e as 7 duplicatas marcadas são bloqueados. Os 68 resultados vazios do catálogo são
preservados e recebem uma mensagem quando não há sugestão compatível.

O front-end recebe os títulos e assuntos reais da árvore, com 15 matérias (incluindo
Educação Física e Tecnologias), anos de 2009 a 2024, enunciados, alternativas e as
descrições aprovadas. Texto e tabelas são renderizados com conteúdo escapado.
O índice numérico de dificuldade ausente é mostrado como não informado; não é inventada
uma resolução comentada ou uma nota TRI para as questões oficiais.

Confirmar resposta consulta o gabarito no back-end. O mesmo repositório abastece
práticas, simulados, resultados, conquistas e gráficos. O histórico fictício deixou
de ser carregado; as chaves anteriores foram preservadas e novas chaves guardam
o progresso com questões oficiais. Recarregar permite retomar a lista pausada.

O botão **Semelhante** e **Recomendadas → Praticar semelhantes** usam a ordem exata
do catálogo `titulo_area`. Não calculam outra semelhança nem completam com sorteio.
Excluem as questões já usadas/respondidas e as respectivas famílias. A seleção
inicial de assuntos do plano continua seguindo as regras de estudo do front-end;
ela não é apresentada como uma execução do Qwen por usuário.

## Conferências

- `npm run build:engine`: bundle atualizado e sem carregar o banco fictício.
- `npm test`: 17 testes da API, renderização de tabelas e motor de aprendizagem.
  Incluem ordem/exclusões do catálogo completo, filtros, gabaritos, pausas,
  resultados, simulados e propagação das respostas para os indicadores.
- Fluxo conferido no navegador: lista de Matemática de 2023, correção oficial,
  inserção de semelhante de 2022, tabela legível, recarregamento e retomada pelo
  Histórico e criação de lista pela aba Recomendadas.
- A validação de desenvolvimento do recomendador continua 8/10 para `titulo_area`
  e 41/44 para `rrf_qwen`; não houve nova escolha de modelo, pesos ou filtros.

Captura da resolução de uma lista do recomendador: [demonstração integrada](docs/demonstracao-integrada.png).

## Pendências preservadas

A conferência humana da amostra de 100 e a recuperação do texto dos 67 defeitos
continuam pendentes do grupo. A integração para demonstração foi autorizada com
esses bloqueios. A revisão externa informada pelo usuário (30 questões, 29 corretas
e uma aceitável) não foi registrada como uma validação independente já concluída
da amostra inteira.

Catalase: o dado já estava correto; corrigiu-se apenas o topo desatualizado do README.
Lúcio Cardoso: a questão de Literatura em CH mantém a área oficial de 2009 e a lista
de sugestões vazia. Não se alterou o dado para contornar o filtro do recomendador.

Sem banco, o progresso não sincroniza entre dispositivos e se perde ao limpar os
dados do site. A API de estudo inclui gabaritos para permitir a revisão e os
simulados locais; não foi construída como uma plataforma de avaliação sigilosa.
O uso é local. Autenticação, persistência no servidor e implantação pública ficam
para outra etapa.
