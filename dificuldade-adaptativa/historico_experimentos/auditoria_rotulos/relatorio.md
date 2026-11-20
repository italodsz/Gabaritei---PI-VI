# Pré-auditoria independente dos rótulos do Gabaritei

**Conclusão.** Os assuntos atuais não estão validados para supervisão. As habilidades têm códigos catalogados, mas sua atribuição por questão precisa de confirmação. O catálogo pode continuar servindo a experimentos com texto e TRI sob o protocolo anterior. Usar assunto, subassunto e habilidade como verdade supervisionada fica pendente.

## Integridade e origem

Confirmei 2.971 IDs únicos, 560 questões sem assunto e 192 sem habilidade. O catálogo original coincide com o SHA-256 auditado, `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Os ZIPs anteriores não estavam na raiz disponível, mas os relatórios e JSON de enriquecimento e ablação estavam presentes. A contagem foi refeita nos bytes originais. Não houve escrita no catálogo.

## Amostra e evidência

São 300 questões, 75 por área, com estratos de ano, classe TRI operacional e score do assunto, incluindo ausentes. A semente 42 e a rotação por estratos estão no script. A amostra cobre 2009–2024, com 102 fáceis, 96 médias e 102 difíceis. A seleção equilibra estratos para inspeção e não estima diretamente a composição do catálogo. O score de origem é bruto e não calibrado.

A triagem lexical leu enunciado e alternativas antes de consultar o rótulo existente. Ela registrou marcadores de seis temas, sem inferir habilidade. A amostra inclui 98 itens com recursos catalogados e um sem enunciado. As referências dos recursos foram preservadas na ficha cega. As imagens não foram inspecionadas. Em 279 casos a triagem não encontrou marcador conclusivo; 14 tiveram sinal compatível e sete sinal concorrente. Esses sinais não são decisões de correção, e alternativas incorretas podem ativá-los.

Revisei textualmente os sete sinais concorrentes em uma segunda etapa dirigida, já com o rótulo visível. A tabela separada registra uma provável classificação temática errada, casos plausíveis e casos de possível multirrótulo. Por exemplo, um item rotulado Geometria pede diretamente a variância das produções. Em outro, “ângulo” é figurativo num problema sobre a Gália merovíngia. Esses casos mostram tanto um risco do catálogo quanto falsos alertas da triagem. A revisão dirigida foi feita por uma IA, sem adjudicação humana e sem base para extrapolar sua taxa de erro.

## Métricas e pendências

| Campo | Ausente na amostra | Inconclusivo na auditoria | Confirmado |
|---|---:|---:|---:|
| Assunto | 101/300 (33,67%) | 199/300 (66,33%) | Sem adjudicação |
| Subassunto | 101/300 (33,67%) | 199/300 (66,33%) | Sem adjudicação |
| Habilidade | 18/300 (6,00%) | 282/300 (94,00%) | 0/300 com junção oficial executada |

As 282 habilidades presentes têm códigos no intervalo formal H1–H30. A chave válida é área e habilidade. Isso verifica a forma, e não a atribuição ao item. A matriz foi consultada como referência de códigos. A tentativa de obter os microdados de 2024 falhou com erro 502 no acesso web e conexão encerrada no download direto. Não houve junção com as tabelas oficiais nesta rodada. A planilha registra ano, código do item, caderno, posição, arquivo de origem e identificador de evidência para fazer essa conferência depois. [Matriz do Inep](https://download.inep.gov.br/download/enem/matriz_referencia.pdf) · [Microdados oficiais](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

As **300 questões** exigem revisão adicional para fechar a amostra. As **560 sem assunto** e **192 sem habilidade** são pendências no catálogo completo e podem se sobrepor. O JSON registra contagens por área e ano. Taxas de correção, erro e intervalos de confiança ficaram sem estimativa válida na ausência de veredito independente. Zero confirmações nesta rodada descreve cobertura de verificação oficial, e não taxa de erro.

## Impacto e correções

O BERTimbau com cabeça neural atingiu macro-F1 0,5223 e o MiniLM congelado com assunto e habilidade 0,4923 na validação anterior. Assunto sozinho piorou a ablação e o ganho do MiniLM ao incluir também habilidade teve intervalo pareado que cruzou zero. A amostra fornece mecanismos plausíveis de ruído, como vocabulário incidental, distratores, subassuntos genéricos e itens multirrótulo. Ela não estabelece que esse ruído causou a queda.

Distribua a ficha cega a duas pessoas, mantendo a planilha de rótulos atuais separada. Cada avaliador deve propor assunto, subassunto, múltiplos rótulos quando cabível e evidência textual ou visual. Adjudique divergências com um terceiro parecer. Compare separadamente com os códigos de habilidade dos microdados por ano, código de item, área e, quando necessário, caderno, posição e gabarito. Divergências e vínculos ambíguos devem continuar explícitos. Só depois estime confiabilidade por estrato e decida se vale retreinar.

## Reprodução

Da raiz, com Python 3.14 e a cópia auditada da revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`:

```powershell
python -B dificuldade-adaptativa/auditoria_rotulos/auditar.py base-oficial/Dataset/base_trabalho
```

As duas planilhas são CSV UTF-8 com separador ponto e vírgula e abrem no Excel. A ficha cega é destinada aos revisores. A tabela de auditoria é destinada à adjudicação. O script não sobrescreve o catálogo. O ZIP contém manifesto SHA-256.
