# Catálogo do MVP do Gabaritei

## Fatos verificados

Foram triadas as **2.971 questões das 16 edições de 2009 a 2024**. A revisão do catálogo do Gabaritei foi cruzada com os resultados da auditoria anterior de assuntos e vínculos com os microdados. O PDF oficial da Matriz de Referência foi baixado e convertido em uma lista de 120 habilidades com suas competências. Para as nove questões A, uma leitura dirigida do material disponível comparou enunciado, opções e gabarito com o descritor oficial e o rótulo de conteúdo. Para os demais itens, predomina a triagem automatizada. [Matriz de Referência do INEP](https://download.inep.gov.br/download/enem/matriz_referencia.pdf)

| Grupo | Linguagens | Humanas | Natureza | Matemática | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| A · Demonstração interna | 2 | 2 | 2 | 3 | 9 |
| B · Reserva condicionada | 454 | 432 | 255 | 164 | 1.305 |
| C · Revisar antes de usar | 345 | 331 | 449 | 528 | 1.653 |
| D · Bloquear | 0 | 1 | 2 | 1 | 4 |
| **Total** | **801** | **766** | **708** | **696** | **2.971** |

Das 1.329 questões do piloto anterior, 1.314 permaneceram em A ou B e 15 saíram desses grupos. Foram recuperadas **zero** questões de fora do piloto. A triagem não encontrou evidência nova suficiente para autorizar uma recuperação. Foram recontadas 560 questões sem assunto, 192 sem habilidade, 55 alertas de assunto e 18 sugestões da revisão anterior. Esses totais medem coisas diferentes e podem se sobrepor.

## Cinco decisões rastreáveis

| ID | Grupo | Evidência e motivo |
| --- | --- | --- |
| `gq_0ce853f2f184539bec5a8494` | A | O comando distingue a produção artesanal. A alternativa B descreve suas características, de acordo com Humanas H18, sobre processos de produção. |
| `gq_2e43b65b90c2d47a8e1921b5` | A | O comando pede evidência sobre a origem da mitocôndria. DNA circular próprio sustenta a alternativa D e a associação com Natureza H16, sobre evolução. |
| `gq_ce3c79382005b3009d018ca2` | A | Escalar 25 cm³ pelo cubo de 400 resulta em 1.600 m³, alternativa C. O comando é coerente com Matemática H11, sobre escalas. |
| `gq_1bf495a5eda4568d0ea676d2` | C | O comando pede para classificar um fragmento que não aparece no material disponível. O código de habilidade por si só não resolve a falta. |
| `gq_d729403b0e500b7ef02bef0a` | D | O comando pergunta sobre democracia. As opções abordam móveis e conservação, inviabilizando a correção até recuperar o caderno. |

## Inferência para a demonstração

Nove questões são suficientes para demonstrar uma sessão curta com escolha de área, resposta e correção, após a conferência dos direitos. A cobre sete anos, oito pares de área e habilidade e sete pares de área e assunto. B abrange 14 anos, 115 pares de área e habilidade e 21 pares de área e assunto nos rótulos originais. O volume de B representa uma fila de revisão. A cobertura útil para a demonstração está restrita a A. Temas amplos, sequências longas e progressão por nível exigem mais itens conferidos. A integração proposta agora é a lista A por ID, com escolha de área preservada. C, D e os B ainda sem conferência ficam fora da exibição.

## Limitações a registrar no trabalho acadêmico

A matriz confirma o significado dos códigos por área. A correspondência entre questão e descritor tem evidência tabular prévia e, para A, uma leitura técnica pontual. A matriz não certifica assunto, completude do texto, licenciamento ou aprendizagem. As imagens não foram abertas. Todas as questões têm revisão de publicação pendente. A escala dos parâmetros TRI entre provas não foi verificada e por isso não há faixas agregadas. Nenhuma das nove questões teve certificação humana. Elas são exemplos escolhidos para demonstração e vieram da partição histórica de treino. O catálogo não contém eventos individuais e o módulo semântico final não estava disponível para teste. Essas limitações impedem concluir que o modelo acompanha o estudante ou melhora as recomendações.

## Prioridades até o fim de novembro

| Ordem | Entrega verificável | Esforço estimado |
| --- | --- | --- |
| 1 | Conferir com a equipe o caderno de origem e a permissão de uso interno das nove questões A. Suspender qualquer uma que não passar. | 3–5 horas, além de eventual resposta sobre os direitos |
| 2 | Conferir com Ítalo a junção por ID e revisão, a tela de respostas e uma sessão curta em cada área. | 2–4 horas |
| 3 | Se faltar variedade, revisar de três a cinco itens B por área em que houver lacuna. Registrar decisão e evidência antes de promover. | 3–6 horas |
| 4 | Definir o registro pseudônimo de respostas, a distinção entre repetição e item inédito e a mensagem para histórico insuficiente. | 4–8 horas |

## Como a equipe pode conferir

Comece pelo `README.md` e pelo `metricas.json`. Abra os quatro CSVs de grupos para conferir a decisão por item. Busque o mesmo ID em `auditoria_todas_questoes.csv` para ver fonte, descritor e restrições. `questoes_recuperadas.csv` documenta a ausência de recuperações. `cobertura_para_recomendador.csv` mostra a distribuição de A e B. Use `matriz_inep_referencias.md`, o PDF e `matriz_codigos.json` para conferir códigos. Consulte `criterios_e_taxonomia.md` e `impacto_na_IA.md` para conferir regras e limites. Os scripts, testes, logs e hashes permitem reproduzir e verificar o pacote.
