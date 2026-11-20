# Cálculos de ranking — Gabaritei, Fase 5

Avaliação exploratória por metadados da Matriz ENEM. Não é avaliação humana,
medida de aprendizagem ou taxa de acerto do estudante. Não altera o modelo.

## Resultados executados

| Estratégia | Precision@5 | Recall@5 | NDCG@5 |
|---|---:|---:|---:|
| aleatorio | 0.1715 | 0.2092 | 0.3247 |
| semantico | 0.2500 | 0.2572 | 0.3926 |
| tri | 0.1700 | 0.2175 | 0.3322 |
| unificado | 0.1900 | 0.2235 | 0.3745 |

20 consultas, cinco por área. Média por consulta; para seleção aleatória, média
de 20 sementes por consulta antes da média geral. Precision tem 20 consultas
válidas; Recall, 16; NDCG, 19. Denominadores sem positivos ficam nulos, não zero.

O resultado é condicionado aos itens com metadados confirmados e ao conjunto
de candidatas descrito em PROPOSTA_METODOLOGICA.md. Não é Recall de todo o ENEM
nem o Top 5 integral servido em produção com itens de referência desconhecida.

## Como ler as pastas

- `scripts/`: fórmulas, auditoria dos metadados, comparação e testes.
- `resultados/comparacao_agregada_metadados.json`: médias, intervalos de confiança
  e diferenças pareadas; arquivo principal desta entrega.
- `resultados/comparacao_por_execucao.json`: 460 execuções e seus Top 5, IDs,
  métricas, distância de dificuldade e leitura do ranking sem remover desconhecidos.
- `resultados/comparacao_por_consulta.json`: 80 combinações consulta/estratégia.
- `resultados/rotulos_metadados.json`: 746 pares, referência automática e campo
  humanGrade nulo. Não são julgamentos humanos.
- `resultados/auditoria_metadados.json` e `referencias_por_questao.json`:
  verificações individuais e cobertura das fontes.
- `resultados/tabela_humana_pendente.json`: métricas humanas ainda nulas.
- `resultados/resumo_metricas.csv`: tabela de médias e intervalos para planilha.
- `fontes/`: cópias locais das tabelas de itens e matrizes, com manifesto de origem
  e hashes. Não se afirma nova aquisição online dessas tabelas nesta execução.
- `protocolo_humano/`: formulários e universo congelado, sem nomes ou notas inventados.
- `evidencias/`: logs reais de execução e testes.
- `base4b/projeto/`: cópia congelada do código, dataset e escores necessários
  para reprodução independente. É referência da avaliação, não atualização de produção.
- `resultados/baselines.json`, `metricas_consolidadas.json` e `protocolo_humano.json`:
  contexto herdado da avaliação anterior; não substituir os resultados novos por eles.

## Reproduzir o cálculo principal sem Python nem baixar modelos

Instale Node.js >=22.13; esta execução usou Node 24.11.1. Abra um terminal nesta pasta:

```powershell
node --test scripts/metricas.test.mjs
node scripts/comparar_metadados.mjs
```

O cálculo usa os escores já existentes, referências e cópia congelada incluídos.
Não há treinamento, geração de embeddings ou ajuste de pesos nesses comandos.
Para executar a regressão da base congelada:

```powershell
cd base4b/projeto
node --test backend/*.test.mjs frontend/learning-checks.mjs
```

## Reproduzir também a conferência das fontes e independência técnica

Python 3.11 ou posterior, ambiente virtual recomendado. As versões efetivamente
instaladas estão em evidencias/ambiente.json; as dependências são separadas por uso.

```powershell
python -m pip install -r requirements-auditoria.txt
python scripts/auditar_metadados.py
python -m pip install -r requirements-sonda.txt
python scripts/testar_independencia_skill.py
node scripts/comparar_metadados.mjs
```

A auditoria encontra todas as fontes dentro de `fontes/`. Não remova os PDFs e
tabelas antes de reproduzir. A sonda usa índices e vetores congelados incluídos,
sem carregar ou treinar o modelo neural original. Não executar comandos de
construção de índice ou treinamento citados na documentação histórica da base.

## Testes executados nesta entrega

98/98 testes de regressão e 4/4 testes das métricas aprovados, zero falhas.
Comparação reexecutada com sucesso. Conferência skill: rankings e texto do
encoder permaneceram iguais nas 20 consultas após alteração somente em memória.
Os logs completos estão em evidencias/. Isso não valida pedagogia ou calibração real.
O cálculo também foi repetido a partir de uma extração limpa do ZIP em outra
pasta: o SHA-256 do resultado agregado permaneceu idêntico. Evidência em
evidencias/reproducao_zip_limpo.log.

## Conclusão

Semântica tem os maiores valores pontuais; não há diferença demonstrada entre
unificado e semântica. Unificado supera TRI no NDCG deste recorte: diferença
0,04225, IC95% [0,01190; 0,07456], e IC98,33% [0,00525; 0,08113] para três
comparações principais. Não extrapolar esse resultado para eficácia educacional.

Faltam avaliadores humanos, julgamentos de relevância e calibração com respostas
reais suficientes. A homologação integral permanece pendente. Nenhum commit,
push, merge, deploy, treinamento ou mudança de pesos foi feito nesta entrega.
