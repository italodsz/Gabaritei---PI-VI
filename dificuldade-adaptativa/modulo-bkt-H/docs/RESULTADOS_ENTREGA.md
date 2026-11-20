# Resultados reais da entrega · 11/11/2026

| Execução | Coletados | Aprovados | Falhas/erros | Bloqueados | Código |
|---|---:|---:|---:|---:|---:|
| A/D/F em venv novo, sem pip/NumPy/SciPy | 38 | 38 | 0 | 0 | 0 |
| A–F sem os dados de alunos, ambiente científico | 51 | 38 | 0 | 13 | 2 |
| A–F com CSV e artefatos reais já preparados | 51 | 51 | 0 | 0 | 0 |
| Candidata histórica, em cópia isolada | 8 | 7 | 0 | 1 | 0* |

As linhas são execuções sobrepostas, não devem ser somadas como 148 testes distintos. A suíte principal tem 51 testes distintos: 9A,4B,4C,22D,5E,7F. A bancada histórica separada tem 8 casos, com C bloqueado por falta de faixa operacional em MT. *O runner antigo usa skip e retorna0; o bloqueio é explicitamente contabilizado aqui, sem convertê-lo em aprovação.*

Passaram também os dois exemplos: ENEM por área em fallback e BKT externo treinado, ambos com respostas sintéticas identificadas. O exemplo ENEM conferiu dez eventos, área MT isolada, persistência após reinício e mudança de nível somente após aceite explícito. A demo externa conferiu idempotência e o bloqueio da transferência automática para ENEM.

O loader do estimador original importou com a única cópia de preparação Fase01. Foram incluídos todos os modelos externos congelados e a configuração original, sem novo treinamento. A suíte científica releu saídas já existentes, verificou hashes, convergência das20inicializações porKC, restrições e previsões; o bootstrap pareado de estudantes foi recalculado pelo teste. Não se executou ajuste SLSQP ou bootstrap de parâmetros nesta entrega.

Logs integrais: `evidence/entrega/*.log`; relatórios individuais com nome/status/fonte/hash/duração: funcionais.json, sem_dados.json, com_dados.json. Comandos exatos e códigos: execucoes.json. Ambiente: ambiente.json. Os logs de extração e instalação do ZIP são adicionados em `evidence/entrega/instalacao_extraida.log` e `evidence/entrega/verificacao_arquivo.json`.

Os13bloqueios semdataset correspondem aos gruposB/C/E, não a falhas matemáticas. A revisão humana, qualidade da recomendação ENEM, integração real e aprendizado contínuo global não são testados por uma suíte de unidade: continuam pendências explícitas.

Não houve falha nos testes executados nesta montagem. Isso não altera ressalvas históricas ou bloqueios de aplicação. Sistemas operacionais/versõesPython diferentes dos registrados não foram executados.
