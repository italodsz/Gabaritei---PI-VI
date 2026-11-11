# "Assunto primeiro" em todas as matérias — relatório (11/11/2026)

## O que é a dinâmica

O método oficial (`titulo_area`) filtra as sugestões pela mesma matéria e pelo mesmo título amplo. Em seguida, ordena pela receita da matéria.

O "assunto primeiro" muda essa ordem: as questões do **mesmo assunto da árvore** vêm no topo, e o resto do título completa a lista. A ordem dentro de cada grupo continua a da receita da matéria.

## Como foi testado

**Física** passou por um processo mais completo, que serviu de piloto:
- conferência manual da classificação das 114 questões (3 corrigidas e 1 assunto novo, "Cor e visão");
- 24 referências no teste;
- ajuste por título;
- confirmação com 20 referências novas.

**As outras 13 matérias** seguiram um protocolo fixado antes de qualquer nota (`PROTOCOLO.md`):
- 12 referências por matéria, sorteadas com semente fixa, sem repetir referências de testes anteriores;
- comparação das 5 primeiras sugestões do método atual com as 5 primeiras do "assunto primeiro";
- notas dadas pela IA às cegas, com a régua 2 (mesmo conteúdo vale 9 a 10, tema próximo vale cerca de 5), mais 1 isca por bloco;
- as notas foram registradas com sha256 antes de abrir a chave;
- só foram avaliados os itens que mudam entre as duas listas, porque os itens em comum se anulam na diferença;
- **critério:** ligar o método se a diferença média por referência for de pelo menos +0,3 e o limite inferior do IC95 for maior que 0;
- as matérias que passaram foram confirmadas com 12 referências novas, pelo mesmo critério.

## Resultado por matéria

| Matéria | Diferença (rodada 1) | IC95 | Melhor / pior / igual | Confirmação | Decisão |
|---|---|---|---|---|---|
| **Física** (piloto) | +0,35 → +0,40 com ajuste por título | 0,18 a 0,65 | 9 / 1 / 14 | **+0,46 (0,11 a 0,81)** | ✅ **Ligado** em Mecânica, Termologia, Física moderna e Eletricidade. Ondulatória e óptica ficou de fora (−0,17). |
| Língua Portuguesa | +0,42 | 0,08 a 0,83 | 4 / 0 / 8 | +0,13 (−0,05 a 0,40) | ❌ Não confirmou. Somando as 24 referências: +0,27 (0,07 a 0,52). Promissor. |
| Química | +0,35 | 0,03 a 0,78 | 6 / 1 / 5 | +0,02 (−0,33 a 0,35) | ❌ Não confirmou. Somando as 24 referências: +0,18 (−0,07 a 0,48). |
| TIC | +0,17 | −0,23 a 0,57 | 7 / 5 / 0 | — | ❌ Inconclusivo |
| História | +0,07 | −0,05 a 0,22 | 2 / 2 / 8 | — | ❌ Inconclusivo. Quase nada muda: os assuntos são pequenos demais. |
| Matemática | 0,00 | −0,10 a 0,10 | 2 / 2 / 8 | — | ❌ Indiferente. A receita atual já põe o mesmo assunto no topo em quase todos os casos. |
| Literatura | 0,00 | −0,27 a 0,28 | 4 / 6 / 2 | — | ❌ Indiferente |
| Artes | −0,02 | −0,18 a 0,13 | 3 / 3 / 6 | — | ❌ Indiferente |
| Filosofia | −0,05 | −0,57 a 0,38 | 6 / 3 / 3 | — | ❌ Indiferente |
| Educação Física | −0,12 | −0,37 a 0,18 | 1 / 5 / 6 | — | ❌ Tende a piorar |
| Geografia | −0,15 | −0,40 a 0,13 | 2 / 6 / 4 | — | ❌ Tende a piorar |
| Sociologia | −0,22 | −0,57 a 0,17 | 2 / 6 / 4 | — | ❌ Tende a piorar |
| Língua estrangeira | −0,27 | −0,65 a 0,22 | 3 / 9 / 0 | — | ❌ Tende a piorar |
| Biologia | −0,30 | −1,05 a 0,33 | 4 / 6 / 2 | — | ❌ Tende a piorar |

## Leitura dos resultados

1. **O método funciona onde o assunto é igual ao conteúdo cobrado e a receita atual ainda mistura assuntos.** É o caso de Física e, em parte, de Língua Portuguesa (argumentação, variação linguística, coesão) e de Química (cálculos de concentração e estequiometria).
2. **Em Matemática, nada muda.** A receita atual, que usa só o Qwen, já põe o mesmo assunto no topo, e o método não acrescenta nada.
3. **Em Humanas, Biologia e Língua estrangeira, o método piora.** Nessas matérias o assunto da árvore é mais largo ou mais "temático" do que o conteúdo cobrado. Exemplos:
   - Biologia: "Relações ecológicas" junta controle biológico, competição e espécies invasoras;
   - Língua estrangeira: o assunto separa inglês de espanhol, mas não o tipo de leitura;
   - Sociologia: "Cultura e identidade" é muito amplo.

   Forçar o mesmo assunto nessas matérias tira do topo sugestões melhores de assuntos vizinhos.
4. **História tem assuntos pequenos demais** (mediana de 3 questões), e o método quase não altera as listas.
5. **Língua Portuguesa e Química melhoraram na primeira rodada, mas o ganho não se repetiu nas referências novas.** O ganho real deve ser menor do que o da primeira rodada. Somando as 24 referências, LP fica em +0,27 e o IC95 não cruza o zero, o que é um resultado promissor, mas abaixo do mínimo combinado (+0,3).

## Estado final do recomendador

- O "assunto primeiro" está **ligado só na Física**, em 4 dos 5 títulos (`busca_por_area_v1.json` → `assunto_primeiro`).
- Nas outras matérias, o método continua como estava.
- O catálogo não precisou ser regenerado, porque a configuração não mudou desde a Física.

## Limites

- As notas são da IA, não humanas. A calibração anterior mostrou boa concordância com o Ítalo (Spearman 0,95), mas uma checagem humana ainda falta.
- 12 referências por matéria detectam diferenças a partir de uns 0,4 ponto. Efeitos menores ficam inconclusivos.
- Só a Física teve a classificação conferida à mão antes do teste. Em Biologia e Química, conferir a classificação, como foi feito na Física, pode mudar o resultado.
- Correção técnica feita antes de abrir a chave: os códigos de Língua estrangeira colidiam com os de Literatura e foram renomeados para "LE".

## Próximos passos possíveis

1. Língua Portuguesa: um teste humano curto ou uma terceira rodada para decidir se o método deve ser ligado.
2. Química e Biologia: conferir a classificação e dividir assuntos largos, como foi feito na Física com "Cor e visão", e testar de novo.

## Arquivos

- `PROTOCOLO.md`
- `DIARIO.md`
- `preparar.py`, `resultado.py`, `confirmar.py`
- `notas_IA.txt` e `notas_IA_confirmacao.txt` (com sha256)
- `chave_*.json`
- `resultado_IA.json`, `resultado_confirmacao.json`
