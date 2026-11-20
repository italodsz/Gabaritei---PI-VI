# Gabaritei — pastas para a branch dificuldade-adaptativa

**NADA DESTE PACOTE FOI PUBLICADO POR ESTA MONTAGEM.** Você fará o upload. A versão identifica esta organização de arquivos; não indica novo treinamento ou aprovação da arquitetura.

## Onde colocar no GitHub

Extraia o ZIP. Dentro dele há somente a pasta `dificuldade-adaptativa`, com as pastas de trabalho diretamente dentro dela. Copie seu conteúdo para a pasta `dificuldade-adaptativa` já existente na branch de mesmo nome, sem criar outra pasta aninhada. Não existe pasta intermediária de entrega ou versão.

Os arquivos da Fase 1 já publicados, o README da raiz e o frontend não fazem parte deste ZIP e não devem ser substituídos. Esta organização acrescenta os diretórios listados no mapa e os arquivos de documentação/inventário. A revisão remota consultada foi e00f20c0d534a2bdd1a845d71cb791a16e3f4212. Confira possíveis alterações posteriores antes da cópia. Nenhum upload foi realizado.

## O que já está publicado

Na branch conferida: `dificuldade-adaptativa/docs/fase_01_auditoria.ipynb`, `docs/relatorio_fase_01.md`, scripts da Fase 1 em `experiments/`, resultados/logs em `results/`, `tests/test_auditoria.py` e README da Fase 1. O frontend também já está na branch e é preservado. As pastas novas deste pacote ainda não estão publicadas nessa revisão remota. O novo dataset está na branch dataset, não foi incorporado automaticamente à dificuldade-adaptativa.

## Mapa das pastas novas

```text
dificuldade-adaptativa/
  modulo-bkt-H/              # módulo experimental executável principal
  historico_experimentos/     # códigos, relatórios e resultados anteriores
  avaliacoes/                 # métricas e conferência do dataset novo
  integracao_planejada/       # contratos e análise, ainda sem integração
  demonstracoes/              # HTMLs históricos explicativos
  evidencias_montagem/        # testes, logs e exemplo executados
  LEIA_PRIMEIRO.md            # instruções de uso e incorporação
  MAPA_DAS_PASTAS.md          # conteúdo e estado publicado/local
  VERSAO.json                 # metadados de rastreabilidade, sem pasta de versão
  CHANGELOG.md               # alterações da organização
  INVENTARIO.json            # arquivos, tamanhos e SHA-256
  EXCLUSOES.json              # arquivos omitidos e motivos
  SHA256SUMS.txt              # integridade
```

### modulo-bkt-H — pasta para executar

- `bkt04/`: motor de domínio, política de dificuldade, persistência SQLite, adaptador e interface por área.
- `models/`: parâmetros BKT treinados historicamente no ASSISTments, gate de elegibilidade e política congelada. Não validados para ENEM.
- `config/`: configurações e versões de cortes TRI; não recalculados aqui.
- `tests/`: grupos A–F. Nesta montagem foram rodados A, D e F; B/C/E dependem de dados científicos e não foram reexecutados. Há testes de treinamento nesses grupos: não executá-los sem autorização.
- `vendor/`: implementação histórica de preparação e estimação probabilística usada na reprodução científica.
- `historico/`: fontes e relatórios das missões anteriores, incluindo a candidata de margem. Não confundir essa candidata com o runtime da Missão04.
- `reports/`, `references/`, `external_review/`: evidências científicas e revisão externa preservadas, com datas e limitações originais.
- `docs/`: relatórios técnico/executivo, limitações, contratos e dossiê para Ítalo.
- `integration/`: contrato e guia de integração; não corresponde a backend já conectado.
- `evidence/`: evidências históricas; para os resultados desta montagem, consultar evidencias_montagem na pasta superior.
- `requirements*.txt`, `instalar.ps1`: dependências e instalação. O exemplo e os testes funcionais não exigem GPU/LLM.
- `exemplo_enem.py`: fixture sintética identificada, útil para conferir funcionamento, persistência e consentimento.
- `executar.py` e `reproduzir_treino.py`: rotinas científicas que podem treinar; não foram executadas nesta entrega.

**Atenção:** o runtime documenta fallback suavizado no ENEM, não BKT treinado para áreas ENEM. A candidata histórica sensível à dificuldade e política de margem está preservada separadamente. Não declarar integração, aprendizado contínuo global ou eficácia pedagógica como concluídos.

### historico_experimentos — memória do trabalho, não outro runtime aprovado

Mantém a estrutura anterior: `src`, `experiments`, `tests`, `models`, `results`, `docs`, `viabilidade`, `validacao_adaptativa`, `correcao_adaptativa`, `catalogo_adaptativo_operacional`, `auditoria_global`, `auditoria_rotulos`, `validacao_tri`, `revisao_pedagogica`, `enriquecimento`, `catalogo_mvp` e `recuperacao_catalogo`. Cada pasta mantém os próprios relatórios. Scripts históricos podem conter caminhos antigos ou requerer dados externos; não são promessa de reprodução integral neste pacote.

Esta separação preserva rastreabilidade sem substituir o módulo executável pelos ensaios anteriores. Resultados numéricos históricos não foram recalculados ou promovidos a resultados atuais. Não se reproduziram todos os treinamentos históricos nesta montagem.

### avaliacoes — trabalho recente

- `metricas_recomendacao/`: Precision@K, Recall@K no pool e nDCG@K, fontes humanas/IA distinguidas, código e resultados. A comparação principal é de listas semânticas do Ítalo em 11 consultas, não desempenho do BKT. Recalcular com `python calcular_metricas.py` nessa pasta.
- `dataset_e6712a8/`: conferência da nova base: 3.086 registros, 2.731 elegíveis, 355 fora; mudanças individuais e resultados estruturais. O JSONL não foi duplicado, pois pertence à branch dataset. O script desta pasta é uma referência de auditoria; exige baselines do pacote de auditoria completo para reproduzir a comparação. Links e hashes estão no relatório e fontes.json.

### integracao_planejada

Documentos de planejamento; o contrato é RASCUNHO_NAO_IMPLEMENTADO. Análises anteriores usam o dataset 67a5036 e devem ser lidas com o relatório e6712a8. A nova base exige incluir descriptions habilitadas no texto de busca e atualizar índices do Ítalo; isso ainda não foi implementado. Não ligar catálogos de hashes diferentes como se fossem a mesma versão.

### demonstracoes

HTMLs explicativos e de sessões anteriores. Usam dados/fluxos congelados nas respectivas versões; não são o backend de produção nem a nova base já integrada. As respostas de demonstração são simuladas e identificadas como tal. Não confundir mudança da dificuldade do item exibido com domínio do aluno ou consentimento para trocar sua faixa.

## Como experimentar sem instalar modelos

Abra um terminal em `dificuldade-adaptativa/modulo-bkt-H` com Python 3.11+:

```text
python -B verificar_pacote.py
python -B testar.py --groups A,D,F --out local/testes.json
python -B exemplo_enem.py local/minha-primeira-sessao
```

Use uma pasta de sessão nova a cada exemplo. O runtime usa somente biblioteca padrão para esse caminho. Consulte o README do módulo para as demais rotinas. Os grupos científicos B/C/E não foram executados agora; sua ausência não conta como aprovação. Não inicie novos treinamentos apenas para instalar ou conferir a entrega.

## O que foi verificado nesta montagem

Integridade original do módulo, grupos funcionais A/D/F e execução do exemplo ENEM. Contagens reais dos grupos: `{"aprovado": 38}`. Logs e fixture resultante em evidencias_montagem. A montagem não repetiu a avaliação educacional, o treinamento ou a auditoria pedagógica integral. Fase 2 continua em revisão.

## O que ficou fora

Caches de modelos/ambientes, metadados Git, arquivos compilados, pacotes ZIP duplicados, bancos de sessões, pesos/vetores pesados, provas PDF e imagens históricas e arquivos históricos maiores que 10 MiB. As provas e mídias históricas continuam nas fontes originais; não são necessárias para o exemplo e os testes funcionais. EXCLUSOES.json lista cada caminho omitido, tamanho e motivo; os originais locais não foram apagados. Não se deve interpretar este ZIP como backup byte a byte de todo o workspace. Modelos BKT em JSON necessários ao runtime foram incluídos. Pesos antigos de encoders e seus caches não são necessários para executar o módulo.

## Versão e publicação

Este pacote é local. Nenhum commit, push, merge, PR ou avanço de fase foi realizado. Cabe a você conferir a branch destino e publicar as pastas e arquivos novos. A branch do João não foi analisada.
