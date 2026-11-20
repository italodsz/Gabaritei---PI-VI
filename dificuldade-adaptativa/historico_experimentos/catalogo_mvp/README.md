# Como abrir e reproduzir a seleção

Extraia o ZIP. Os CSVs usam UTF-8 e ponto e vírgula como separador. No Excel, use **Dados → De Texto/CSV** e selecione esse separador. Os arquivos usam apóstrofo inicial em textos que poderiam ser interpretados como fórmulas.

| Arquivo | Conteúdo |
| --- | --- |
| `catalogo_A_mvp.csv` | Questões para a demonstração interna supervisionada |
| `catalogo_B_condicional.csv` | Reserva por área, condicionada à revisão antes da exibição |
| `questoes_C_revisao.csv` | Questões com revisão pendente e seus sinais |
| `questoes_D_bloqueadas.csv` | Questões impedidas de uso e os motivos |
| `auditoria_todas_questoes.csv` | Uma linha por questão, com origem, critérios, descritor, evidência e restrições |
| `questoes_recuperadas.csv` | Comparação com o piloto anterior. Apenas cabeçalho quando não há recuperação |
| `cobertura_para_recomendador.csv` | Contagens por grupo, área, assunto, habilidade, ano e partição histórica |
| `metricas.json` | Totais recontados, distribuição e hashes das fontes principais |
| `matriz_inep_referencias.md`, `matriz_1.pdf`, `matriz_codigos.json` | Referências oficiais, documento usado e extração dos códigos |
| `criterios_e_taxonomia.md` | Regras de seleção e distinção entre assunto, habilidade e TRI |
| `evidencias.json` | Pareceres técnicos pontuais, com trechos conferíveis por ID |
| `impacto_na_IA.md` | Integração possível, restrições de uso e o que falta testar |
| `RELATORIO_EXPLICADO_PARA_EQUIPE.md` | Parecer, exemplos e próximos passos |
| `matriz.py`, `selecionar.py`, `test_selecao.py` | Extração, seleção e verificação |
| `execucao.log`, `testes.log`, `reproducao.log`, `ocorrencias.log` | Saída da seleção, testes, comparação e ocorrências |
| `../revisao_pedagogica/` | Entradas da auditoria anterior usadas para reproduzir a seleção |
| `SHA256SUMS.txt` | Hashes dos arquivos incluídos no pacote |

## Reprodução

No diretório extraído, use a revisão pública indicada em `matriz_inep_referencias.md`. Você pode reutilizar uma cópia local dessa revisão, apontando para `Dataset/base_trabalho`. Para obter uma cópia isolada de leitura:

```sh
git clone --branch dataset https://github.com/italodsz/Gabaritei---PI-VI.git fonte-gabaritei
git -C fonte-gabaritei checkout --detach 7e720fa876beb7249adab2f05d3ecf33ae5a2c51
python -m pip install pypdf==6.9.2
python -B dificuldade-adaptativa/catalogo_mvp/matriz.py
python -B dificuldade-adaptativa/catalogo_mvp/selecionar.py fonte-gabaritei/Dataset/base_trabalho
python -B -m unittest discover -v -s dificuldade-adaptativa/catalogo_mvp
```

A extração do PDF é opcional quando se usa a tabela JSON incluída. A seleção e os testes usam somente a biblioteca padrão do Python. A execução documentada usou Python 3.14.0. O programa confere o hash do catálogo depois de normalizar as quebras de linha de Windows e verifica o hash do PDF. A auditoria lê os arquivos originais e grava suas saídas somente na pasta `catalogo_mvp`.
