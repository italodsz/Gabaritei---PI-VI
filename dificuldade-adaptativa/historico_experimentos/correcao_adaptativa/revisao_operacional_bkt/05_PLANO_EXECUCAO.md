# 05 · Plano mínimo para autorizar

Somente a auditoria tabular foi executada. Os comandos de comportamento abaixo ficam aguardando autorização. O mínimo para avançar a discussão é um replay funcional com catálogo e política congelada, seguido de uma avaliação comparativa de segurança. O treino integrado é uma decisão posterior e separada.

## 1. Congelar insumos e portas

**15–30 minutos.** Confirmar revisão, hashes, regras de elegibilidade e os IDs em [fixtures.json](fixtures.json). A auditoria de dados desta revisão pode ser repetida sem importar o estimador:

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/revisao_operacional_bkt/auditar_cobertura.py
```

Antes de qualquer teste de comportamento, registrar quais resultados são esperados em A–J. Definir o limite de falsas mudanças com a equipe. O valor de +5 pp na matriz é proposta e ainda não é critério aprovado pelo usuário.

## 2. Confirmar a parte executável já existente

**1–2 minutos de execução local**, com Python 3.14, NumPy e SciPy no ambiente. Comandos exatos para futura autorização:

```powershell
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -p test_rodada.py -v
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -p test_busca_autonoma.py -v
```

Essas suítes exercitam sensibilidade, repetição, abstenção e consentimento em seus recortes históricos, incluindo simulação. Elas não validam seleção com os IDs reais. Repetir o confronto histórico completo é opcional, pois os números já foram reproduzidos. Para preservar o resultado original, use cópia de trabalho isolada que mantenha a estrutura de pastas. Nessa cópia, execute:

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/revisao_fase_02/comparar_regra.py
```

O script escreve o JSON no próprio diretório. O histórico deve permanecer intocado no workspace de referência. A rodada continua retrospectiva.

## 3. Autorizar somente a implementação mínima do adaptador de testes

**2–4 horas de engenharia e 1–5 minutos de execução**, estimativas. Preparar uma camada de teste offline que recebe IDs, revisão, preferência, ofertas e eventos sintéticos, consulta os catálogos e chama o estimador histórico congelado. Manter a política histórica e seus parâmetros, com validações de elegibilidade, faixa disponível, versão, ordem, primeira tentativa, diagnóstico e aceite do lado do adaptador. O comando exato planejado para o arquivo a criar é:

```powershell
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa/revisao_operacional_bkt -p test_catalogo_bkt.py -v
```

`test_catalogo_bkt.py` ainda não existe. O comando só será executável após implementar o adaptador offline e os testes A, B, D, E, F, G e J. C permanece bloqueado pelos dados. O adaptador deve ser descartável e não alterar o produto ou o módulo de Ítalo. Aprovação técnica do replay exige passar todas as portas funcionais. O relatório deve indicar quantas sessões conseguem completar dez questões, quantas se abstêm e por quê.

## 4. Autorizar a comparação de segurança em catálogo real

**2–4 horas de preparação e até 30 minutos de execução**, dependendo dos cenários. Fixar antecipadamente o gerador sintético e o alvo, sementes novas separadas, a métrica de falsa mudança e o tratamento de falta de itens. Repetir H e I com os métodos congelados. A regra simples deve ver os mesmos IDs disponíveis e usar as mesmas portas. Se a intenção for medir o efeito do estimador, executar também o controle de cadência idêntica. Reportar se as métricas representam intenção de oferta ou mudança efetiva após aceite. Nenhuma comparação que reutilize a seleção histórica deve ser chamada de validação independente.

## 5. Evidência necessária para treino integrado

A configuração integrada deve declarar a origem dos parâmetros de BKT, qual componente é ajustado, quais são congelados e em que dados. Um replay de dez respostas altera o estado individual. Um treinamento do estimador requer uma função de perda, conjuntos separados de alunos e tempo, ajuste registrado, parâmetros e checkpoint com hash e um teste posterior. Uma busca de margem requer seleção no desenvolvimento e avaliação separada. Uma atualização supervisionada global exige eventos rotulados, pesos antes/depois e comparação com versão congelada. O SGD não integra obrigatoriamente a candidata.

Sem respostas reais do Gabaritei, é possível demonstrar a mecânica de treino integrado com dados externos ou sintéticos explicitamente rotulados **depois de autorização própria**. Isso não calibra as probabilidades no ENEM. Para evidência pedagógica, faltam eventos de alunos do Gabaritei, rótulos adequados e disponibilidade de itens no fluxo real. Não usar 2024 como teste inédito.
