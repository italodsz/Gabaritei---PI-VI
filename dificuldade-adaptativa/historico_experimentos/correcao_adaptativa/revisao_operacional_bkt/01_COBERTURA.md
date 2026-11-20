# 01 · Cobertura operacional

A auditoria fez a junção por ID dos 2.971 registros do catálogo original, da auditoria operacional, da tabela de dificuldade e da revisão pedagógica. Conferiu o SHA-256 normalizado do JSONL, a correspondência da área, a presença dos 112 itens prontos e a unicidade de famílias em cada escala. O script só lê os insumos. Os hashes, totais e IDs dos nove itens com rótulos tecnicamente sustentados estão em [cobertura.json](cobertura.json).

| Categoria | CH | CN | LC | MT | Total | Uso tecnicamente justificável |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| A · Pronto, rótulos sustentados e faixa local | 1 | 0 | 0 | 0 | 1 | Pode alimentar uma sessão na escala local. Um item não sustenta um estado por assunto ou habilidade |
| B · Pronto, faixa local e rótulo ausente ou incerto | 31 | 9 | 0 | 0 | 40 | Somente área e escala. Ignorar rótulos pedagógicos não confirmados |
| C · Pronto, rótulos sustentados e faixa indisponível | 1 | 2 | 2 | 3 | 8 | Exibir e corrigir. Conferir rótulo no catálogo, sem converter em dificuldade operacional |
| D · Pronto, insuficiente para personalização específica | 0 | 29 | 13 | 21 | 63 | Exibir e corrigir por área. Não alimentar o BKT sensível com uma dificuldade inventada |
| E · Condicional ou bloqueado | 733 | 668 | 786 | 672 | 2.859 | Fora do uso operacional. São 2.822 condicionais e 37 bloqueados |

Adotamos C5 aprovado, com assunto e habilidade utilizáveis, como critério de **confiança técnica** de A e C. Isso reaproveita o parecer anterior e não equivale a certificação pedagógica humana. Os 112 tecnicamente prontos ainda têm revisão de direitos pendente. Os 2.063 elegíveis para texto pertencem a outra triagem. A contagem de habilidades presentes em 2.779 itens também não serve como aprovação pedagógica.

| Categoria | Assunto e subassunto ausentes | Habilidade ausente | Interpretação dos preenchidos |
| --- | ---: | ---: | --- |
| A | 0 | 0 | Um vínculo tecnicamente sustentado |
| B | 9 | 0 | Os demais assuntos e as 40 habilidades preenchidas ficam fora da personalização granular |
| C | 0 | 0 | Oito vínculos tecnicamente sustentados, sem faixa local |
| D | 13 | 1 | Campos preenchidos sem confirmação integral C5 |
| E | 538 | 191 | Fora de operação, inclusive o conflito de assunto do item de variância `gq_e898766ae6adc513f38c0641` |

O [CSV de cobertura por rótulo](cobertura_por_rotulo.csv) tem matéria, assunto, subassunto e habilidade, com estado de evidência e contagem. [Itens por categoria](itens_por_categoria.csv) rastreia cada decisão. A competência pode ser consultada pelo par área e habilidade na [Matriz extraída anteriormente](../../catalogo_mvp/matriz_codigos.json). A derivação estrutural herda a incerteza do código e não habilita um filtro próprio.

## Faixas de dificuldade e diagnóstico

| Escala ano/prova/área | Baixa | Média | Alta | Famílias distintas | Dez itens misturando faixas | Dez itens mantendo uma única faixa |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 2018/451/CH | 6 | 7 | 7 | 20 | Cabe no catálogo antes do filtro semântico | Não |
| 2020/567/CH | 4 | 4 | 4 | 12 | Cabe antes do filtro, com somente dois itens restantes | Não |
| 2020/597/CN | 3 | 3 | 3 | 9 | Não | Não |
| LC e MT | 0 | 0 | 0 | 0 | Não na versão com dificuldade comparável | Não |

Os 41 itens são relativos a três escalas distintas. A faixa deriva de tercis dentro do próprio recorte operacional. Não há equivalência demonstrada entre recortes. Somar os dois recortes de CH como se a dificuldade fosse comparável produziria uma cobertura indevida. Os itens de exibição sem faixa podem compor uma lista inicial de prática, mas as respostas a eles não contam como diagnóstico validado do BKT sensível à dificuldade.

O catálogo inteiro é um teto de disponibilidade. A lista de candidatos do Ítalo pode ser menor, e o aluno pode já ter visto famílias. Um diagnóstico em faixas mistas exige que essa modalidade tenha sido escolhida explicitamente. Sem esse aceite, o protótipo mantém a faixa pedida e informa que não tem dez famílias adequadas. A última resposta de um diagnóstico não abre uma nova escala automaticamente.
