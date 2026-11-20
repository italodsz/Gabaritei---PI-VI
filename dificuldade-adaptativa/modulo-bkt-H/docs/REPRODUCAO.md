# Reprodução e separação de execução

## Sem dados de alunos

Inferência e teste funcional usam Python 3.11+ e biblioteca padrão (inclui SQLite). Versão efetivamente testada consta em `evidence/entrega/ambiente.json`. O exemplo tem respostas sintéticas identificadas. Comandos na pasta do módulo:

```powershell
python -m venv .venv
./.venv/Scripts/python.exe -B testar.py --groups A,D,F --out local/testes_funcionais.json
./.venv/Scripts/python.exe -B exemplo_enem.py local/exemplo-1
./.venv/Scripts/python.exe -B demo.py local/externo-1
```

No Linux/macOS usar `.venv/bin/python`. Não é necessário instalar bibliotecas nem baixar modelos para executar o módulo. Não há suporte de serviço HTTP, autenticação ou frontend no ZIP.

## Conferir evidência científica com os dados preparados

Para os grupos B/C/E instalar `requirements-research.txt`. O lock completo `requirements-lock.txt` registra o ambiente científico original; compatibilidade em todas as versões de Python/OS não foi testada. O ambiente que reproduziu a pesquisa usa Python 3.14.

```powershell
./.venv/Scripts/python.exe -m pip install -r requirements-research.txt
$env:BKT04_SOURCE = 'CAMINHO_DO_CSV_OFICIAL'
$env:BKT04_WORK = 'CAMINHO_DA_REPRODUCAO_PREPARADA'
./.venv/Scripts/python.exe -B testar.py --out local/testes_completos.json
```

O CSV oficial não é privado do autor, mas não acompanha o ZIP por conter eventos individuais. Edição corrigida colapsada: https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010 . SHA-256 obrigatório: `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`; 64.412.812 bytes. `obter_dataset.py CAMINHO` faz download e valida; bloqueios de rede devem ser reportados, sem substituir por outra edição. Observar os termos de acesso e uso da fonte; este pacote não concede nova licença sobre os dados.

## Reconstrução científica desde o CSV (inclui ajuste de parâmetros)

O comando abaixo é o procedimento histórico reproduzível, disponibilizado para revisão. **Não foi acionado nesta entrega. Sua execução futura inclui treinamento e deve ser autorizada pelo responsável.**

```powershell
./.venv/Scripts/python.exe -B obter_dataset.py local/raw/assistments.csv
./.venv/Scripts/python.exe -B executar.py local/raw/assistments.csv local/reproducao
```

Execute em uma cópia de pesquisa, pois o pipeline atualiza relatórios e artefatos dessa cópia. A chave privada histórica não é exigida. O modo determinístico alternativo verifica oito representações canônicas dos históricos e seus agregados. Identificadores determinísticos são ligáveis à fonte e não garantem anonimização. Os arquivos individuais preparados ficam apenas em `local/reproducao`, que deve ter acesso restrito e não deve ser publicado.

Nesta entrega os testes completos releram a execução real anterior existente; não houve novo ajuste SLSQP nem bootstrap de parâmetros. O teste estatístico refaz o bootstrap pareado de estudantes sobre previsões congeladas. Isso recalcula um intervalo, sem treinar o BKT. Os comandos, códigos de saída e saída integral ficam em `evidence/entrega`.

Sem dados preparados: A/D/F executam; B/C/E ficam bloqueados, nunca aprovados por ausência. O runner retorna 0 para aprovação, 1 para falha/erro e 2 para bloqueio. Executar todos os grupos requer NumPy mesmo quando dados estão ausentes, por importações da suíte científica. Para ambiente sem dependências usar explicitamente A,D,F.
