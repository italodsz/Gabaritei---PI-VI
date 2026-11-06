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
python -m unittest discover -s tests -v
```

O script gera `results/fase_01.json` e imprime as distribuições e verificações. O notebook executado e o relatório estão em `docs/`. Para adotar outra revisão dos dados, revise os hashes e as expectativas da auditoria, execute-a novamente e registre os novos resultados antes de treinar modelos com a nova base.

## Fase 2 · Experimento preliminar

Os arquivos `experiments/fase_02_treinamento.py`, `results/fase_02.json`, `docs/relatorio_fase_02.md` e `requirements.txt` pertencem ao experimento preliminar. Eles ficam fora do pacote de validação da Fase 1.

Para reproduzir a Fase 2 após autorização, use Python 3.11+ e execute na pasta do módulo:

```bash
python -m pip install -r requirements.txt
python experiments/fase_02_treinamento.py ../base-oficial/Dataset/base_trabalho
python -m unittest discover -s tests -v
```

O treino gera `results/fase_02.json` com métricas e matrizes de confusão gerais e por área.
