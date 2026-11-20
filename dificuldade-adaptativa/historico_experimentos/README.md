# Dificuldade adaptativa · Gabaritei

A branch do módulo partiu de `main` no commit `bc77b0aedd9b1bf3c0743588903e2d416d3591ab`. O dataset é lido de uma cópia externa fixada em `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`.

## Fase 1 · Auditoria

Da pasta do módulo, execute com Python 3.10+, Git e acesso ao GitHub:

```bash
python experiments/preparar_fase_01.py
```

O script baixa a revisão pública em uma pasta temporária, verifica o SHA-256 do catálogo, executa a auditoria e roda os três testes sobre a cópia baixada. Os logs completos são gravados em `results/fase_01_auditoria.log` e `results/fase_01_testes.log`. O resultado estruturado fica em `results/fase_01.json`. Esta fase usa somente a biblioteca padrão do Python.

Os arquivos da Fase 1 são `experiments/preparar_fase_01.py`, `experiments/fase_01_auditoria.py`, `tests/test_auditoria.py`, `docs/fase_01_auditoria.ipynb`, `docs/relatorio_fase_01.md` e os arquivos `results/fase_01*`.

Para manter uma cópia dos dados e executar manualmente:

```bash
git init ../base-oficial
git -C ../base-oficial fetch --depth=1 https://github.com/italodsz/Gabaritei---PI-VI.git 7e720fa876beb7249adab2f05d3ecf33ae5a2c51
git -C ../base-oficial -c core.autocrlf=false checkout --detach FETCH_HEAD
python experiments/fase_01_auditoria.py ../base-oficial/Dataset/base_trabalho
python -m unittest discover -s tests -p test_auditoria.py -v
```

O script gera `results/fase_01.json` e imprime as distribuições e verificações. O notebook executado e o relatório estão em `docs/`. Para adotar outra revisão dos dados, revise os hashes e as expectativas da auditoria, execute-a novamente e registre os novos resultados antes de treinar modelos com a nova base.

## Fase 2 · Dificuldade supervisionada

`results/fase_02.json` preserva a evidência preliminar. `results/fase_02_reproducao.json` registra sua reprodução. A comparação completa está em `results/fase_02_final.json`, com configurações, métricas e erros por item.

Prepare a cópia do dataset conforme a Fase 1. Para a comparação completa, execute na pasta do módulo com Python 3.11+:

```bash
python -m pip install -r requirements-fase02-minilm.txt
python -m experiments.fase_02_treinamento ../base-oficial/Dataset/base_trabalho --minilm --output results/fase_02_final.json
python -m unittest discover -s tests -p test_fase_02.py -v
python -m src.inferencia models/fase_02.joblib "Um tanque contém 50 litros. Qual volume representa 20% do total?" --area MT
```

O primeiro uso do MiniLM precisa de acesso ao Hugging Face para baixar o checkpoint fixado. Para reproduzir somente os modelos TF-IDF, instale `requirements.txt`, omita `--minilm` e informe saídas separadas com `--output` e `--artifact`. Carregue somente arquivos joblib de origem confiável. A interface aceita área para validar o código, mas o modelo usa somente o texto. O campo `confidence` fica nulo porque a probabilidade de acerto não foi calibrada.

## Fase 2 reformulada · Seleção de arquitetura

Use as mesmas dependências da Fase 2, acrescidas de `psutil`. Os encoders requerem acesso de leitura ao Hugging Face na primeira execução. Execute na pasta do módulo:

```bash
python -m pip install -r requirements-fase02-minilm.txt psutil==7.2.2
python -B -m experiments.fase_02_encoders ../base-oficial/Dataset/base_trabalho minilm
python -B -m experiments.fase_02_diagnostico ../base-oficial/Dataset/base_trabalho
python -B -m unittest discover -s tests -p test_fase_02_revisada.py -v
```

Para codificar Qwen 0.6B e BGE-M3 em CUDA, use PyTorch 2.11.0+cu128 e um ambiente com CUDA ativo:

```bash
python -m pip install torch==2.11.0+cu128 --index-url https://download.pytorch.org/whl/cu128
python -B -m experiments.fase_02_encoders ../base-oficial/Dataset/base_trabalho qwen06 --device cuda --output results/fase02r_qwen06_cuda.npz
python -B -m experiments.fase_02_encoders ../base-oficial/Dataset/base_trabalho bge --device cuda --output results/fase02r_bge_cuda.npz
python -B -m experiments.fase_02_comparar ../base-oficial/Dataset/base_trabalho --qwen-cuda --bge-cuda
python -B -m experiments.fase_02_finalizar_candidata ../base-oficial/Dataset/base_trabalho
```

Os encoders também podem ser gerados em CPU, omitindo `--device`, `--output` e a flag CUDA correspondente na comparação. Essa configuração pode apresentar variação numérica e custo maior.

O protocolo fixado está em `experiments/protocolo_fase_02_revisada.json`. Os comandos de geração criam vetores locais `results/fase02r_*.npz` e metadados com seus hashes. A comparação usa somente os vetores presentes, exige a baseline e verifica hashes, revisão e ordem dos IDs. O JSON `results/fase02r_comparacao.json` registra os candidatos efetivamente avaliados. O pacote de revisão contém os metadados e resultados. Os vetores e checkpoints podem ser regenerados pelos comandos acima.

A finalização exige os três encoders. Ela só salva e avalia uma candidata em 2024 quando o protocolo a qualifica. Nesse caso, a inferência pode ser chamada com `python -m src.inferencia_revisada models/fase02r_candidata.joblib "Enunciado da questão" --area MT`.

Para medir a latência de codificação de um enunciado curto com o modelo já carregado, repita o comando do encoder com `--probe`.

## Fase 2 · Fine-tuning supervisionado

Use Python 3.14, CUDA e a cópia oficial em `../base-oficial`. O pacote preserva o experimento anterior. A rodada nova está em `results/ft_*`. A configuração está em `experiments/protocolo_finetune.json`. A primeira execução baixa apenas os modelos públicos fixados.

```bash
python -m pip install -r requirements-fase02-finetune.txt
python -m pip install torch==2.11.0+cu128 --index-url https://download.pytorch.org/whl/cu128
python -B -m experiments.fase_02_finetune ../base-oficial/Dataset/base_trabalho bert 94d69c95f98f7d5b2a8700c420230ae10def0baa --batch 4 --epochs 2
python -B -m experiments.fase_02_finetune ../base-oficial/Dataset/base_trabalho deberta a0484667b22365f84929a935b5e50a51f71f159d --batch 2 --epochs 2
python -B -m experiments.fase_02_finetune_avaliar ../base-oficial/Dataset/base_trabalho
python -B -m unittest discover -s tests -p test_finetune.py -v
python -B -m src.inferencia_finetune results/ft_bert_256_42 "Qual é o dobro de 5?" 1 2 5 10 20
```

Antes da avaliação, repita os treinos para ambos os modelos com `--batch 2 --limit 512 --seed 42` e com `--batch 2 --limit 256 --seed 7`. Repita também BERTimbau com `--batch 2 --limit 512 --seed 7`. Mantenha `--epochs 2` em todos. O avaliador precisa dos vetores da baseline MiniLM, gerados pelo comando `fase_02_encoders ... minilm` da seção anterior. O checkpoint `delta.pt` contém as duas camadas ajustadas e a cabeça de classificação. Para inferência, use a pasta com `delta.pt`, `metricas.json` e `tokenizer/`. O código recarrega os pesos-base pelo identificador e revisão registrados.

Para o diagnóstico temporal interno, execute o comando BERTimbau com `--limit 512 --batch 2 --epochs 2 --inner-2022`. Essa execução reajusta os cortes usando somente 2009–2021 e valida em 2022. O resultado é separado da comparação de 2023.
