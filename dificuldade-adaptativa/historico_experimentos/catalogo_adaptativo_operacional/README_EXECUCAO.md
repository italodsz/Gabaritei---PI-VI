# Catálogo operacional do Gabaritei

Este pacote foi gerado separadamente da base de origem e contém três listas exclusivas. A decisão técnica de exibição depende de C1–C4. Antes de disponibilizar ao estudante, conferir direitos, fluxo de correção e a renderização no aplicativo.

| Arquivo | Conteúdo |
| --- | --- |
| `catalogo_adaptativo_pronto.csv` e `.jsonl` | Enunciados, opções, gabarito, recursos, origem e elegibilidade para dificuldade |
| `catalogo_adaptativo_condicional.csv` | Itens recuperáveis sem falha impeditiva confirmada. Nenhum pode ser exibido enquanto estiver nesta lista |
| `catalogo_bloqueado.csv` | Itens com falha impeditiva ou variante reservada. Inclui o motivo por ID |
| `catalogo_dificuldade.csv` | TRI original, alertas, fonte e faixa relativa quando aplicável |
| `auditoria_por_questao.csv` | Seis critérios por ID, evidências, notas e decisões |
| `fila_recuperacao_priorizada.csv` | Pendências ordenadas por potencial, com fontes e estimativas de esforço |
| `cobertura.csv` e `metricas.json` | Distribuições, lacunas, revisão da base e hashes |
| `evidencia_cadernos.jsonl` | Blocos comparados integralmente, página, posição, códigos compatíveis e hashes de prova e gabarito |
| `revisao_visual.json`, `amostra_*.png` e `recursos/` | Pareceres da amostra, recortes examinados e material que deve acompanhar itens específicos |
| `contrato_eventos_resposta.json` e `plano_aprendizado_incremental.md` | Campos, protocolo de simulação, atualização e avaliação futura |
| `fontes/manifesto.json` | URLs dos 64 PDFs e hashes conferidos |
| `RELATORIO_EQUIPE.md`, `*.log` e `SHA256SUMS.txt` | Parecer, execução, testes e integridade do pacote |

## Abrir ou reproduzir

Os arquivos de resultados abrem diretamente após extrair o ZIP. CSV usa UTF-8 e ponto e vírgula. Para consumo pelo aplicativo, prefira JSONL, preserve a versão e envie o gabarito apenas ao componente de correção do servidor. Para reproduzir em Python 3.14:

```sh
python -m pip install PyMuPDF==1.27.2.2 requests beautifulsoup4
python -B dificuldade-adaptativa/catalogo_adaptativo_operacional/baixar_fontes.py --restaurar
python -B dificuldade-adaptativa/catalogo_adaptativo_operacional/gerar.py
python -B -m unittest discover -v -s dificuldade-adaptativa/catalogo_adaptativo_operacional
```

O comando de restauração requer internet e `curl` se os PDFs ainda não estiverem na pasta. O ZIP traz o manifesto para baixar os mesmos arquivos de fonte, cerca de 216 MB. A restauração interrompe se algum documento não estiver disponível com o hash original. Os dois recortes prontos e as imagens amostrais estão no ZIP. A reprodução verificada usou uma extração limpa com os 64 PDFs preservados da coleta.

## Regra e fontes

Reutilizamos a triagem anterior para ordenar a fila, a auditoria TRI de 2009 a 2024 para validar procedência, a revisão pedagógica para preservar assuntos e o MVP para rastrear decisões. Os 16 CSVs do INEP foram relidos. A revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` e o SHA-256 do JSONL estão em `metricas.json`. A rubrica foi confrontada com os descritores da Matriz por área e conserva evidência pedagógica por ID. [Microdados do INEP](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem) · [Matriz de Referência](https://download.inep.gov.br/download/enem/matriz_referencia.pdf)

O confronto em lote exige enunciado e cinco opções completos iguais ao trecho oficial, com normalização de espaços, aspas tipográficas e hífen invisível. Exige também conciliação de posição, item, área e resposta nos microdados e no gabarito publicado. O item é avaliado quanto a imagens, vetores, expoentes e indícios de material ou notação. A leitura anterior das 14 questões foi preservada quando as quatro portas continuaram satisfeitas. A prova em outro caderno só entra como evidência quando é uma versão do mesmo código de item com texto, opções e resposta coincidentes. Havendo mais de um código de caderno compatível, as possibilidades ficam registradas. Uma falta de extração ou divergência textual fica em revisão até que a versão seja resolvida. A aplicação regular Azul cobre os dois dias por edição. Primeiras posições de língua estrangeira, reaplicações, cadernos adaptados e PDFs com extração defeituosa podem exigir leitura dirigida. [Provas e gabaritos do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos)

Na dificuldade, o valor `b` é usado apenas para ordenar itens do **mesmo ano, código de prova e área**, após excluir alertas TRI e exigir ao menos nove candidatos com separação nos dois limites dos tercis. Os nomes baixo, médio e alto descrevem o recorte local de itens prontos. Nenhum limiar global foi estimado. A cobertura exclui habilidade e assunto quando C5 não passou. [Procedimentos de análise do ENEM](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_da_educacao_basica/enem_procedimentos_de_analise.pdf)
