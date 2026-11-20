# Gabaritei · módulo de dificuldade adaptativa H

Entrega para revisão na branch **dificuldade-adaptativa**, preparada em 11/11/2026. Extraia a pasta `dificuldade-adaptativa/modulo-bkt-H` na raiz da cópia do repositório. A entrega acrescenta somente essa pasta; preserva o README da Fase 1, frontend, dataset e recomendador do Ítalo. Não há publicação automática.

**Estado:** motor independente experimental executável. Modelos BKT realmente treinados no ASSISTments, com gate de 20 habilidades externas permitido e 36 em fallback. **ENEM usa histórico suavizado identificado; não há BKT treinado ou validado para suas áreas/habilidades.** Qualidade pedagógica da política, integração real e aprendizado contínuo global seguem pendentes.

## Executar em cinco passos

1. Instale Python 3.11+; versão comprovada Python 3.14. Abra PowerShell na pasta `dificuldade-adaptativa/modulo-bkt-H`.
2. Crie ambiente: `python -m venv .venv`.
3. Rode testes sem dados: `./.venv/Scripts/python.exe -B testar.py --groups A,D,F --out local/testes.json`.
4. Rode exemplo ENEM: `./.venv/Scripts/python.exe -B exemplo_enem.py local/exemplo-1`.
5. Abra `local/exemplo-1/resultado_enem.json`. Os dez acertos são uma fixture sintética; o exemplo comprova escopo por área, persistência e aceite, sem medir desempenho educacional. Use outra pasta em cada execução.

Não precisa de GPU, LLM, API paga, rede ou dataset para esses passos. SQLite faz parte do Python; runtime não exige pacotes de terceiros. `instalar.ps1` automatiza a criação do ambiente e os testes (executar com `./instalar.ps1` se a política local de scripts permitir). Em Linux/macOS substituir o executável por `.venv/bin/python`.

Para exemplo do **BKT externo treinado**: `./.venv/Scripts/python.exe -B demo.py local/externo-1`. As respostas desse exemplo também são sintéticas; os parâmetros são treinados. Não confundir os dois modos.

## O que vem no pacote

| Caminho | Conteúdo |
|---|---|
| bkt04 | BKT, política, SQLite, adaptador e interface por área |
| models | 56 modelos originais congelados, gate e política selecionada |
| config | Experimento e versões de cortes TRI |
| tests | Grupos A–F: matemática, dados, treino, integração, avaliação e entrega |
| vendor | Preparação Fase BKT01 e estimador Fase BKT02, sem cópias aninhadas |
| historico | Relatórios e fontes congeladas das missões anteriores |
| reports / references | Evidências científicas e referências verificáveis |
| evidence/entrega | Logs reais desta montagem, ambiente, resultados e conferência |
| docs | Relatórios executivo/técnico, contratos, limites e reprodução |

Leia primeiro [relatório executivo](docs/RELATORIO_EXECUTIVO.md). Para Ítalo: [contratos de integração](docs/CONTRATOS_INTEGRACAO.md). Para revisão independente: [relatório técnico](docs/RELATORIO_TECNICO.md), [reprodução](docs/REPRODUCAO.md) e [limitações](docs/LIMITACOES.md). O resultado final dos testes está em docs/RESULTADOS_ENTREGA.md.

## Testes científicos opcionais

Os grupos B/C/E requerem CSV oficial, históricos reconstruídos e NumPy/SciPy; instruções e hashes em docs/REPRODUCAO.md. Sua ausência é bloqueio e nunca aprovação. `executar.py` inclui um ajuste histórico do BKT e deve ser usado somente quando houver autorização para treinamento. Não foi executado nesta preparação. O modelo já está no ZIP: instalação e exemplo não treinam nada.

Não se deve promover esta entrega a produção ou considerar a Fase 2 homologada apenas por os testes funcionais passarem. Revisão humana, evidência ENEM e decisão formal continuam necessárias.

Conferir integridade antes de executar: `python verificar_pacote.py`. A demo externa salva `resultado_bkt_externo.json` na pasta informada. A candidata histórica sensível ao item está preservada em `historico/candidata_margem`, com instruções e ressalvas próprias; seus parâmetros e política não são os da Missão04.

Dossiê único para encaminhar ao Ítalo ou a outra IA: [**Gabaritei_Dossie_Tecnico_Para_IA_Italo.md**](docs/Gabaritei_Dossie_Tecnico_Para_IA_Italo.md). Consolida decisões, arquitetura, contratos, resultados, limitações e fontes em um só arquivo.
