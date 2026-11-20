# Gabaritei · Refinamento da confiabilidade

## Auditoria

Os dois ZIPs históricos solicitados não estavam na raiz do workspace. Os scripts, relatórios e JSON locais correspondentes estavam disponíveis. O script verificou 12.363 eventos e AUCs 0,500/0,678/0,692/0,693 no estudo ASSISTments e confirmou 51,12%/50,53%/47,51%/48,90% para a política de margem, na ordem registrada. Essa checagem confirma o conteúdo local. A integridade dos arquivos ZIP ausentes ficou sem verificação.

O experimento de respostas reais usa BKT ajustado com replay por aluno e habilidade e SGD treinado em atributos anteriores à resposta. Os grupos originais têm alunos disjuntos, mas os períodos globais podem se sobrepor. A evidência temporal de encerramento usa períodos e alunos separados. O BKT ajusta o estado individual a cada resposta; o SGD modifica parâmetros globais em lotes. A atualização original melhorou ligeiramente a AUC e piorou Log Loss e calibração. A rodada atual mantém o modelo congelado e não repete treinamento global.

## Protocolo e diagnóstico

Dois geradores e dois regimes foram utilizados. Em escolha fixa nenhuma oferta é aceita. No ciclo fechado 65% das ofertas recebem aceite simulado. O comparador usa os mesmos sorteios, sem passar o domínio latente ao estimador. Foram 243 trajetórias por regime no desenvolvimento e 486 no teste, com sementes separadas. A política candidata precisa reduzir ou manter a taxa de falsas mudanças e preservar pelo menos 75% das ofertas da referência em todos os recortes de desenvolvimento. Entre as elegíveis, maximiza o pior acerto. O teste não muda a seleção. A meta de 60% continua exploratória.

Falsa mudança é uma oferta quando a dificuldade escolhida já corresponde ao alvo do simulador, dividida por todas as ocasiões em que o aluno está no nível correto. Precisão de oferta é a fração de ofertas que coincidem exatamente com o alvo. Cobertura estudantil é a fração de trajetórias com pelo menos uma oferta. Taxa sem oferta inclui manutenção, falta de evidência e outros bloqueios. Reversões contam mudança de direção entre ofertas sucessivas por habilidade. O teste usa bootstrap pareado por trajetória.

Os fatores foram isolados em políticas conservadora, com suporte posterior Rasch de 65% ou 75%, com confirmação em duas estimativas consecutivas na mesma direção, e combinações dessas condições. Comparar com a política de margem mostra se a redução de erros vem de exigir mais evidências, mais persistência ou menos ofertas. A confirmação de interface é requisito comum a todos os métodos. O suporte posterior é uma hipótese de incerteza sob Rasch, não uma probabilidade calibrada no ENEM.

## Compatibilidade e limites

Use `question_id` estável e chave composta área/habilidade validada. Conteúdos inferidos precisam de marcação de procedência. A TRI separa discriminação, dificuldade e acerto casual. Os valores da simulação não são valores TRI do ENEM. Para itens sem TRI, mantenha a ausência explícita e sinalize a fonte da classe textual. Para alunos novos ou habilidades sem cobertura, abstenha-se e preserve a preferência. Registre primeira tentativa, ordem, habilidade, ID da família, resposta, oferta e aceite, além das versões de catálogo e modelo. Avalie com alunos e períodos separados e calibração por área. ASSISTments serve como evidência externa de previsão de respostas, sem equivalência de habilidades com o ENEM.

A simulação usa duas habilidades sintéticas e janelas de 36 passos. A rodada não mede latência de serviço, consumo de memória, desempenho detalhado por habilidade ou efeitos com históricos muito longos. O JSON registra tempo total local. Os testes cobrem abstenção, estabilidade básica, reprodução, dificuldade, separação de sementes e consentimento. Persistência de um modelo treinado em serviço não foi implementada nem validada nesta rodada.

## Reprodução

Da raiz, com Python 3.14, NumPy 2.4.3 e SciPy 1.17.1:

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/refinar.py
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -v
```

## Resultados e decisão

**PROMISSOR COM RESSALVAS.** A seleção em desenvolvimento escolheu a histerese, que exige duas estimativas consecutivas na mesma direção. Ela reduziu falsos alertas com pouca alteração na cobertura por aluno, mas diminuiu o acerto total e o número de ofertas. A referência de margem continua tendo maior acerto total. Não houve política dominante.

| Cenário | Acerto total margem → histerese | Falsas mudanças | Cobertura por estudante | Ofertas |
|---|---|---|---|---|
| Logístico fixo | 50,97% → 50,60% | 22,89% → 22,38% | 96,09% → 95,88% | 7.335 → 7.196 |
| Logístico com aceite | 50,34% → 48,82% | 9,02% → 6,60% | 96,09% → 95,88% | 3.502 → 2.815 |
| Acerto casual fixo | 47,91% → 47,58% | 22,89% → 22,62% | 93,21% → 93,21% | 6.878 → 6.782 |
| Acerto casual com aceite | 48,41% → 46,84% | 8,82% → 6,65% | 93,21% → 93,21% | 3.237 → 2.635 |

Em ciclo fechado, a confirmação reduziu as reversões brutas de 288 para 233 e de 235 para 192. As reversões também precisam ser lidas com o número de ofertas, que caiu cerca de 19%. Na escolha fixa, as ofertas ficaram quase no mesmo volume e a redução de erros foi pequena. Isso sugere que confirmar direção ajuda a conter sugestões precipitadas em parte das trajetórias. A simulação não isola causalmente erro ocasional, acerto casual e metadados mal rotulados, pois a mudança de gerador altera também a curva de dificuldade.

O filtro posterior forte teve a maior precisão de ofertas nos dois ciclos fechados, 68,49% e 69,16%. A cobertura caiu para 63,79% e 58,44%, respectivamente. A política atual mais restritiva teve a menor taxa de falsas mudanças em escolha fixa. A referência de margem teve o melhor acerto total nos quatro cenários. A histerese é candidata ao melhor equilíbrio para um piloto com aceite. O total da execução foi 53,86 s. Sem medir latência separada, o custo relativo observado em código é que o filtro posterior recalcula uma distribuição em grade; a histerese só consulta a direção anterior.

O JSON traz todas as políticas, intervalos, métricas de abstinência de oferta e volumes. Os 12 testes passaram e não houve mudança sem aceite. A meta de 60% em acerto total segue distante. O próximo teste deve separar estimativa contínua do nível e emissão de notificações, com limites de cobertura e falsas mudanças predefinidos, e validar as taxas de aceite e a calibração no ENEM. A Fase 3 segue fora do escopo.
