# Fase 2 · Ensaio offline com IDs reais

**Parecer.** O BKT + margem congelado funciona como prova de conceito funcional em Humanas por área e escala da prova. A comparação sintética favorece a candidata no acerto do nível, mas mostra aumento de falsas mudanças e esgotamento da faixa escolhida em todas as trajetórias da bancada. A evidência não sustenta aprovação da fase, validação pedagógica ou adoção produtiva.

## O que efetivamente entrou no estado

| Recorte executado | Resultado |
| --- | --- |
| Diagnóstico funcional misto CH 2018/451 | Dez respostas sintéticas em dez IDs e famílias reais. Dez atualizações do estado. Sem oferta antes de concluir o diagnóstico, por uma porta do adaptador |
| Diagnóstico com faixa fixa | Sete famílias no máximo na faixa média do recorte testado. Abstenção de diagnóstico |
| Diagnóstico misto em Natureza 2020/597 | Nove famílias. Abstenção de diagnóstico |
| Testes funcionais em conjunto | Dez IDs distintos atualizaram o BKT. Dois serviram apenas para prática e um entrou no histórico contextual. Esses três não atualizaram o BKT |
| Simulação H/I em CH 2018/451 e CH 2020/567 | 32 IDs distintos atualizaram o estado BKT. Todos eram aptos à escala local. A simulação só forneceu itens aptos para evitar atribuir dificuldade a itens de prática |
| Catálogo operacional | 41 itens com faixa local, incluindo os nove de Natureza que ficaram fora de H/I. Outros 71 estão prontos apenas para exibição e correção. Esses totais descrevem elegibilidade, sem alegar que os 71 foram exercitados |

IDs e famílias, motivo por entrada e snapshots antes/depois estão em `funcionais.json`. A simulação registra 28.498 respostas sintéticas no braço BKT, incluindo as 23.040 respostas dos diagnósticos. São eventos em sessões independentes, sem equivalência a 28.498 questões. Depois dos diagnósticos, foram 5.458 oportunidades avaliadas de 13.824 previstas. O BKT fez 2.097 ofertas e se absteve em **3.361 oportunidades avaliadas**, por margem insuficiente (3.075) ou indisponibilidade da faixa sugerida (286). Houve ainda **2.304 encerramentos por esgotamento da faixa escolhida**, um por trajetória desse braço. Restaram 8.366 vagas de item somadas entre sessões, em outras faixas. Assim, ter itens no catálogo não garante continuidade na faixa do aluno. O denominador de abstenções é oportunidade, não questão distinta.

## Testes funcionais A–G e J

| Caso | Estado | Evidência |
| --- | --- | --- |
| A · Elegibilidade | Passou | Bloqueios, revisão divergente, família divergente, escala diferente e área diferente não atualizaram o estado. Item de faixa local com rótulo incerto só usou a área |
| B · Diagnóstico | Passou | Checkpoints 0, 1, 3, 4 e 10. A porta experimental do diagnóstico preservou a preferência e segurou ofertas antes de dez respostas |
| C · Assunto/habilidade | Bloqueado | IDs reais de Geometria e Números foram conferidos, mas nenhum tem faixa operacional em MT. Sem teste positivo fabricado |
| D · Sensibilidade | Passou | Com prior 0,72751, erro em faixa baixa deixou 0,32799 e em alta 0,55783. Acerto deixou 0,79772 e 0,91578, respectivamente. Comparação de quatro estados separados com o mesmo prior |
| E · Metadados ausentes | Passou | Uma faixa válida sem assunto usou fallback por área. Um item sem faixa nem habilidade serviu para prática. Um item com habilidade sustentada sem faixa ficou em histórico contextual |
| F · Repetição | Passou | Repetir o mesmo ID não alterou estado. A variante real bloqueada não ganhou elegibilidade, inclusive após observar a família canônica |
| G · Consentimento | Passou | Oferta, recusa, ID ou versão inválidos, aceite válido, troca manual, oferta vencida e indisponibilidade foram verificados. Nenhuma troca involuntária |
| J · Contrato por IDs | Passou | A ordem dos candidatos externos foi preservada. A resposta devolveu só nível, motivo e identificadores da oferta ou apenas motivo de abstenção. Nenhuma chamada a Ítalo |

Sete testes passaram, um ficou bloqueado documentalmente e nenhum falhou. Os números de domínio são saídas algébricas com respostas sintéticas. A faixa baixa/média/alta foi associada às três âncoras sintéticas históricas **por configuração explícita da bancada**. O valor bruto de TRI b não foi convertido nem usado no estado. A camada de teste separa as escalas por ano, prova e área.

## H/I · Comparação controlada

O protocolo foi salvo e seu SHA-256 registrado antes da simulação. As seis sementes 821, 823, 827, 829, 839 e 853 são distintas das sementes de seleção e teste da busca histórica. A candidata e a margem ficaram congeladas. A comparação é nova para esses cenários, mas reaproveita parâmetros e critérios de simulação. Os perfis são sintéticos. Cada linha representa 288 trajetórias por método, com dois geradores e dois regimes por escala.

Os métodos começam com os mesmos IDs, na mesma ordem externa, com diagnóstico idêntico por trajetória e sorteios pareados. O braço com aceite pode seguir outra história depois de mudar a faixa. A bancada conserva as cadências históricas na comparação principal. O controle de cadência usa o mínimo e intervalo da candidata na regra simples, retirando sua persistência, mas preserva o passo adjacente e os limiares da taxa. Isso aproxima a frequência de oferta e ainda não isola o efeito do estimador. A regra não recebe uma função de margem equivalente.

| Escala e cenário | Acerto regra | Acerto BKT | Ganho BKT e IC 95% pareado, pp | Acerto regra com cadência pareada | Falsas mudanças regra → BKT |
| --- | ---: | ---: | --- | ---: | --- |
| CH 2018, logístico fixo | 34,94% | 51,52% | +16,57 [10,71; 22,08] | 42,52% | 11/336 → 120/336 |
| CH 2018, logístico com aceite | 38,16% | 49,17% | +11,01 [5,06; 16,83] | 44,92% | 11/386 → 67/427 |
| CH 2018, 3PL fixo | 35,23% | 56,53% | +21,31 [15,92; 26,80] | 42,80% | 2/336 → 98/336 |
| CH 2018, 3PL com aceite | 37,52% | 57,88% | +20,36 [14,66; 26,05] | 49,60% | 2/385 → 60/507 |
| CH 2020, logístico fixo | 33,33% | 40,63% | +7,29 [2,08; 12,50] | 34,72% | 0/96 → 19/96 |
| CH 2020, logístico com aceite | 33,33% | 40,63% | +7,29 [2,08; 12,50] | 34,72% | 0/96 → 19/96 |
| CH 2020, 3PL fixo | 33,33% | 49,31% | +15,97 [10,76; 21,18] | 37,85% | 0/96 → 9/96 |
| CH 2020, 3PL com aceite | 33,33% | 49,31% | +15,97 [10,76; 21,18] | 37,85% | 0/96 → 9/96 |

Os ICs descrevem a diferença entre taxas agregadas por oportunidade, reamostrando trajetórias pareadas. A quantidade de oportunidades avaliadas pode divergir após aceite. A métrica principal mede o nível **sugerido**, ou a preferência mantida quando não há oferta. Ela não mede a acurácia de previsão de respostas nem o efeito pedagógico do nível aceito. O relatório estruturado inclui também acertos sobre o horizonte inteiro, desafios fora da faixa, cobertura por oportunidade e por trajetória, ofertas, mudanças aceitas, abstenções por motivo, IDs, famílias e inventário restante.

No melhor cenário, foram **639/1.104 (57,88%)** entre oportunidades avaliadas, ou **639/2.880 (22,19%)** se o horizonte inteiro for o denominador. A meta histórica de 60% não foi atingida. As falsas mudanças aumentaram em todos os oito recortes. No cenário logístico fixo de CH 2018, passaram de **3,27% para 35,71%**. O limite de +5 pp segue uma proposta sem aprovação e não foi usado como regra de decisão. Com controle de cadência, o IC para o ganho de BKT no cenário logístico com aceite de CH 2018 inclui zero (−0,39 a +8,62 pp). Houve **495 mudanças aceitas** e **zero alterações sem aceite** no braço BKT. Em CH 2020, cada trajetória só teve uma oportunidade depois do diagnóstico. O desenho não mede efeito longitudinal do aceite nesse recorte.

## Treinamento e proveniência

O código usa `Estimator` de `rodada.py` e confere os parâmetros de `viabilidade/fechamento.json` antes e depois. Os quatro parâmetros são aproximadamente 0,72750857, 0,05112968, 0,30865529 e 0,20001032. Vieram do ajuste histórico de BKT no treino do ASSISTments, 13.905 eventos e 297 estudantes, com otimização de perda logarítmica. O ajuste original foi externo. A transformação sensível à dificuldade altera as emissões a partir da âncora de entrada e reaproveita esses parâmetros. A atualização após resposta muda o estado individual, sem atualização de pesos globais. A margem 0,09, o mínimo de quatro famílias, o intervalo de uma e o salto máximo de dois vieram da busca histórica `busca_margem.json`. O adaptador acrescenta as portas de catálogo, diagnóstico e aceite.

O ensaio não executou `fit`, treinamento, fine-tuning ou SGD. Nenhum dado real de estudante Gabaritei foi usado. Treinamento e avaliação da arquitetura integrada continuam pendentes, assim como a validação pedagógica. A Fase 2 fica em revisão.

## Reprodução

Da raiz do workspace, ambiente verificado com NumPy 2.4.3 e SciPy 1.17.1:

```powershell
$d='dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem'
$env:PYTHONIOENCODING='utf8'
Get-FileHash "$d/protocolo.json"
python -B "$d/test_catalogo_bkt.py" 2>&1 | Tee-Object "$d/testes.log"
python -B "$d/simular.py" 2>&1 | Tee-Object "$d/simulacao.log"
```

`protocolo_congelado.log` guarda o hash anterior à execução. `funcionais.json`, `simulacao.json` e `trajetorias.jsonl` são as evidências estruturadas. Os logs e código estão no mesmo diretório, com referências aos catálogos e aos artefatos congelados.
