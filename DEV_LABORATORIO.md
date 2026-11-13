# Laboratório do recomendador

Abra **http://127.0.0.1:4173/dev**, com o projeto iniciado por `npm start`.
O menu do perfil do aplicativo também tem o link **Laboratório do recomendador**.
É uma tela de desenvolvimento local, separada da prática do estudante.

Captura: [ranking e valores reais](docs/laboratorio-dev.png).

## Explorar e responder

Filtre por área, matéria, ano, conjunto e situação. Busque pelo ID, assunto ou
texto completo do enunciado/descrições; sorteie uma questão dentro dos filtros.
O painel permite ler também registros com defeito e fora das elegíveis, com o
motivo da classificação. Esses registros não são liberados para prática.

Respostas são conferidas pelo mesmo back-end que o app. Os registros ficam em
`gabaritei:dev:v1`; não entram no histórico, nas metas ou nos gráficos do estudante.
Acertar ou errar **não muda a receita**: o recomendador atual busca semelhantes
à questão de referência, sem personalizar seus pesos pela alternativa escolhida.

## Inspecionar os escores reais

A consulta chama o próprio `Indice.ranking(..., 'titulo_area', 'treino')` e observa
`_ordem_por_area`. Não altera filtros, pesos, vetores ou rótulos. Usa os arquivos
TF-IDF, MiniLM e Qwen existentes em CPU; não carrega o modelo, não baixa pesos e
não gera novos embeddings. O processo Python é aberto somente ao pedir escores
e reutiliza os índices e sinais nas consultas seguintes.

Cada sugestão mostra os produtos escalares reais de TF-IDF, Qwen e MiniLM,
suas posições por sinal, o escore RRF, a posição no catálogo publicado e, quando
ativo, o bônus de nomes. MiniLM é uma referência diagnóstica com peso zero no
método oficial. A comparação detalha as contribuições:

`contribuição = peso / (60 + posição)`

Essa soma é um escore de ordenação, **não uma probabilidade de acerto**. O produto
escalar do Qwen é o usado pelo método, sem renormalização posterior. Em parte da
Física, o mesmo assunto vem primeiro; por isso a posição final pode contrariar a
ordem só pelo valor numérico do escore. A decomposição é conferida contra o escore
real com tolerância de `1e-12` em cada consulta.

O funil mostra as exclusões por conjunto, área, família, qualidade, idioma, título,
quase duplicata (`Qwen >= 0,97`) e família já sugerida. Inclui exemplos de registros
eliminados, o texto exato de busca e dimensões/normas dos vetores.

**Escopo:** consultas de treino/validação, galeria apenas de treino. O app usa a
galeria completa, então sua posição no catálogo e seus escores podem diferir.
Os IDs do conjunto reservado de teste são somente para leitura e não iniciam
diagnóstico. As partições seguem `ids_elegiveis.json`, não um corte inferido pelo
ano: há quatro registros de 2023 e dez de 2024 no treino por agrupamento de famílias.
A tela apresenta esse cruzamento explicitamente; não modifica a partição para
contornar a diferença. Nenhum arquivo com `NAO_ABRIR` foi consultado.

## Comparar, avaliar e exportar

Abra **Comparar / avaliar** para ler referência e sugestão lado a lado e registrar
**Boa sugestão**, **Parcial**, **Ruim** ou **Problema de texto**, com observação.
Uma nova avaliação do mesmo par/versão/galeria substitui a anterior. Nada muda no
dataset ou na classificação oficial. É uma anotação para revisão posterior.

**Minha sessão dev** separa seu acerto das avaliações de relevância e mostra o
tempo até responder (inclui a inspeção). Registros de outra base ficam preservados
na exportação, fora dos indicadores da versão atual. É possível remover o último
registro e desfazer a remoção enquanto a tela estiver aberta.

JSON inclui os hashes de origem, IDs, galeria, receita, escores, contribuições,
avaliações e respostas. CSV oferece as colunas principais, com notas multilinha e
proteção contra interpretação de texto como fórmula. Sem banco: exporte os arquivos
para compartilhar com o grupo. Não há envio automático a outras pessoas.

## Estatísticas

As contagens do acervo, situações, distribuição de listas, cobertura e cruzamento
conjunto × ano são calculados dos arquivos ao abrir o laboratório. A participação
de **classificações novas** usa `auditoria_base.sem_rotulo_ids`: 3.165 de 13.315
ocorrências no top 5 (23,8%). Esse recorte não é uma medida de qualidade nem a
definição de “resgatada” usada em outros levantamentos.

As notas de validação, o ambiente da geração e a auditoria dos índices são
**registros da migração**, identificados como tal; o painel não os apresenta como
uma avaliação ou leitura dos pacotes refeita agora. A amostra humana de 100 e os
67 defeitos continuam pendentes.

## Ambiente e verificações

Para estatísticas, leitura e resposta, basta Node.js 22+. Para escores, é preciso
Python com numpy, scipy, scikit-learn, joblib e threadpoolctl. O servidor procura
o ambiente `.venv` do projeto e o ambiente existente do recomendador no clone local.
Também é possível indicar o executável explicitamente antes de iniciar:

```powershell
$env:GABARITEI_PYTHON = 'C:\caminho\do\ambiente\Scripts\python.exe'
npm start
```

Se o ambiente faltar, o painel informa a falha e mantém o resto disponível,
sem inventar valores ou trocar de modelo. Não exige torch, bitsandbytes ou CUDA
para consultar os vetores já calculados.

```powershell
npm test                 # API, sessão dev e motor do app
npm run test:dev-model   # Python real: cinco receitas/prioridades + API HTTP completa
```

Os testes numéricos conferem os IDs, a ordem, os escores e suas somas para Matemática,
Literatura, Filosofia, Tecnologias e Física, além de exclusões, listas vazias e recusa
do teste reservado. O teste HTTP atravessa Node → Python → índices, sem simular escores.
