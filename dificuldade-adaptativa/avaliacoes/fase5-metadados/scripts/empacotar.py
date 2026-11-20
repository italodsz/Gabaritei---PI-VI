from pathlib import Path
import json,csv,hashlib,zipfile,sys,platform,importlib.metadata,subprocess
R=Path(__file__).resolve().parents[1]
def write(p,s):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
j=json.loads((R/'resultados/comparacao_agregada_metadados.json').read_text())
total=[x for x in j['aggregates'] if x['area']=='TOTAL']
table='| Estratégia | Precision@5 | Recall@5 | NDCG@5 |\n|---|---:|---:|---:|\n'+''.join(f"| {x['kind']} | {x['precision5']:.4f} | {x['recall5']:.4f} | {x['ndcg5']:.4f} |\n" for x in total)
write(Path('LEIA_PRIMEIRO.md'),'''# Cálculos de ranking — Gabaritei, Fase 5

Avaliação exploratória por metadados da Matriz ENEM. Não é avaliação humana,
medida de aprendizagem ou taxa de acerto do estudante. Não altera o modelo.

## Resultados executados

'''+table+'''
20 consultas, cinco por área. Média por consulta; para seleção aleatória, média
de 20 sementes por consulta antes da média geral. Precision tem 20 consultas
válidas; Recall, 16; NDCG, 19. Denominadores sem positivos ficam nulos, não zero.

O resultado é condicionado aos itens com metadados confirmados e ao conjunto
de candidatas descrito em PROPOSTA_METODOLOGICA.md. Não é Recall de todo o ENEM
nem o Top 5 integral servido em produção com itens de referência desconhecida.

## Como ler as pastas

- `scripts/`: fórmulas, auditoria dos metadados, comparação e testes.
- `resultados/comparacao_agregada_metadados.json`: médias, intervalos de confiança
  e diferenças pareadas; arquivo principal desta entrega.
- `resultados/comparacao_por_execucao.json`: 460 execuções e seus Top 5, IDs,
  métricas, distância de dificuldade e leitura do ranking sem remover desconhecidos.
- `resultados/comparacao_por_consulta.json`: 80 combinações consulta/estratégia.
- `resultados/rotulos_metadados.json`: 746 pares, referência automática e campo
  humanGrade nulo. Não são julgamentos humanos.
- `resultados/auditoria_metadados.json` e `referencias_por_questao.json`:
  verificações individuais e cobertura das fontes.
- `resultados/tabela_humana_pendente.json`: métricas humanas ainda nulas.
- `resultados/resumo_metricas.csv`: tabela de médias e intervalos para planilha.
- `fontes/`: cópias locais das tabelas de itens e matrizes, com manifesto de origem
  e hashes. Não se afirma nova aquisição online dessas tabelas nesta execução.
- `protocolo_humano/`: formulários e universo congelado, sem nomes ou notas inventados.
- `evidencias/`: logs reais de execução e testes.
- `base4b/projeto/`: cópia congelada do código, dataset e escores necessários
  para reprodução independente. É referência da avaliação, não atualização de produção.
- `resultados/baselines.json`, `metricas_consolidadas.json` e `protocolo_humano.json`:
  contexto herdado da avaliação anterior; não substituir os resultados novos por eles.

## Reproduzir o cálculo principal sem Python nem baixar modelos

Instale Node.js >=22.13; esta execução usou Node 24.11.1. Abra um terminal nesta pasta:

```powershell
node --test scripts/metricas.test.mjs
node scripts/comparar_metadados.mjs
```

O cálculo usa os escores já existentes, referências e cópia congelada incluídos.
Não há treinamento, geração de embeddings ou ajuste de pesos nesses comandos.
Para executar a regressão da base congelada:

```powershell
cd base4b/projeto
node --test backend/*.test.mjs frontend/learning-checks.mjs
```

## Reproduzir também a conferência das fontes e independência técnica

Python 3.11 ou posterior, ambiente virtual recomendado. As versões efetivamente
instaladas estão em evidencias/ambiente.json; as dependências são separadas por uso.

```powershell
python -m pip install -r requirements-auditoria.txt
python scripts/auditar_metadados.py
python -m pip install -r requirements-sonda.txt
python scripts/testar_independencia_skill.py
node scripts/comparar_metadados.mjs
```

A auditoria encontra todas as fontes dentro de `fontes/`. Não remova os PDFs e
tabelas antes de reproduzir. A sonda usa índices e vetores congelados incluídos,
sem carregar ou treinar o modelo neural original. Não executar comandos de
construção de índice ou treinamento citados na documentação histórica da base.

## Testes executados nesta entrega

98/98 testes de regressão e 4/4 testes das métricas aprovados, zero falhas.
Comparação reexecutada com sucesso. Conferência skill: rankings e texto do
encoder permaneceram iguais nas 20 consultas após alteração somente em memória.
Os logs completos estão em evidencias/. Isso não valida pedagogia ou calibração real.
O cálculo também foi repetido a partir de uma extração limpa do ZIP em outra
pasta: o SHA-256 do resultado agregado permaneceu idêntico. Evidência em
evidencias/reproducao_zip_limpo.log.

## Conclusão

Semântica tem os maiores valores pontuais; não há diferença demonstrada entre
unificado e semântica. Unificado supera TRI no NDCG deste recorte: diferença
0,04225, IC95% [0,01190; 0,07456], e IC98,33% [0,00525; 0,08113] para três
comparações principais. Não extrapolar esse resultado para eficácia educacional.

Faltam avaliadores humanos, julgamentos de relevância e calibração com respostas
reais suficientes. A homologação integral permanece pendente. Nenhum commit,
push, merge, deploy, treinamento ou mudança de pesos foi feito nesta entrega.
''')
write(Path('COMO_FOI_CALCULADO.md'),'''# O que foi levado em conta

## Fonte e versão

Base congelada 4B, commit de origem f7ce6aca633f2543e0d8be18ae1a5a898a4ac929.
Esse hash identifica a origem, não um commit desta entrega. Dataset local:
base4b/projeto/Dataset/base_trabalho/data/questions.jsonl, SHA-256
6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f.
3.086 registros nessa versão; não misturar com o catálogo histórico de 2.971.

Conferência de habilidade: ano, CO_PROVA, CO_ITEM, área, posição e gabarito nas
cópias locais ITENS_PROVA 2009–2024. 2.891 registros com habilidade confirmada
na cópia tabular; 195 ausentes. Ausência não significa habilidade incorreta.
O mapa área/habilidade/competência foi extraído de dois PDFs locais da matriz,
com 120 associações numéricas coincidentes. Fontes e hashes em fontes/manifesto_fontes.json.
Isso confirma consistência documental e estrutural, não certificação humana do
vínculo entre o conteúdo de cada questão e seu identificador oficial.

## Referência de relevância usada neste ensaio

Grau 2: mesma área e habilidade confirmada da questão de referência da consulta.
Grau 1: mesma área e competência, com outra habilidade.
Grau 0: outra competência; códigos iguais em áreas diferentes não são equivalentes.
Sem habilidade confirmada: desconhecido, nunca convertido em erro ou grau zero.
Competência é derivada da habilidade, não uma segunda avaliação independente.

Área, matéria e título já são filtros do recomendador; não foram usados como
gabarito principal para evitar avaliação circular. Assuntos inferidos por regras
não foram tratados como rótulos humanos confiáveis. A sonda mostrou que skill
não altera a inferência nas 20 consultas atuais; isso não prova independência de
todas as decisões históricas tomadas no desenvolvimento.

Essa referência mede alinhamento de objetivo da Matriz. Questões tematicamente
parecidas podem ter habilidades diferentes e vice-versa. Não mede, sozinha,
se a recomendação ensina o assunto solicitado ou é adequada ao estudante.

## Comparação controlada

20 consultas congeladas, cinco por área, 746 pares, 700 com referência conhecida.
Mesmo perfil artificial para todas: theta=0, desvio-padrão alvo=0,25, n=80,
sem histórico. São condições controladas, não alunos reais. Perfil representado
na grade TRI do motor; suas estatísticas efetivas são calculadas pelo próprio motor.

L: lista original de até 50 candidatas por consulta. K: itens de L com referência
conhecida. E: itens de K que passam pelos filtros comuns de elegibilidade, TRI,
piso semântico e margem de dificuldade. Cada estratégia ordena as mesmas
candidatas elegíveis. Aleatória usa 20 sementes fixas; semântica mantém posição
original; TRI ordena por adequação; unificada usa os pesos congelados da 4B.
Portanto, 'somente TRI' aqui ainda respeita o pool semântico comum: não é busca
TRI livre em todo o catálogo.

Preservamos a ordenação antes de remover desconhecidos. Para inspecionar a ordem
completa da unificada, somente o limite de retorno foi ampliado em uma configuração
local de avaliação; o script verifica que o prefixo coincide com o Top 5 original.
Não houve mudança do modelo nem renormalização dos escores depois da filtragem.

## Fórmulas

Precision@5 = número de itens de grau 2 no Top 5 / 5.
Listas curtas mantêm denominador cinco.

Recall@5 = número de itens de grau 2 no Top 5 / total de itens de grau 2 em K.
Há também Recall@5Eligible, cujo denominador usa somente E.
Se não há positivos, o resultado é nulo e a consulta não entra naquela média.
Esse Recall é condicional ao pool conhecido, não ao catálogo inteiro.

DCG@5 = soma, para i de 1 a 5, de (2^grau_i - 1) / log2(i+1).
IDCG@5 usa os melhores graus de K ordenados de forma ideal.
NDCG@5 = DCG@5 / IDCG@5. IDCG zero implica resultado nulo.
NDCG@5Eligible usa E como universo ideal.

Cada consulta tem o mesmo peso. A média aleatória primeiro agrega suas 20
sementes. Intervalos: 2.000 reamostragens de consultas estratificadas por área,
incluindo sorteio de semente aleatória. Diferenças são pareadas nas mesmas
consultas. NDCG principal inclui IC98,33% com correção para três comparações.
Sementes e parâmetros completos em resultados/plano_metadados_congelado.json.

## Limitações e resultados humanos pendentes

Nenhum nome, formação ou julgamento humano foi inventado. Há 746 pares por
avaliador planejado e zero notas recebidas. As métricas humanas ficam nulas.
185 das 721 questões únicas do universo de revisão têm recursos visuais
declarados cujos arquivos não estão na base congelada. A avaliação documental
não substitui uma revisão completa de enunciado, alternativas e imagens.
As 20 consultas são poucas e foram herdadas do protocolo anterior; não constituem
um teste final novo nem uma amostra aleatória representativa de todo o ENEM.
Não ajustar pesos e depois apresentar este mesmo conjunto como validação independente.

Plano posterior: dois revisores qualificados, avaliações cegas, registro de
inconclusivos, análise de concordância e adjudicação. Recall humano só será
calculado para um universo de referência explicitamente e suficientemente julgado.
Não ocorreu treinamento ou alteração de produção. Nenhuma aprovação pedagógica
ou homologação integral decorre destes números.
''')
write(Path('requirements-auditoria.txt'),'pypdf>=5,<7\n')
write(Path('requirements-sonda.txt'),'numpy\nscipy\nscikit-learn\njoblib\nthreadpoolctl\n')
env={'python':sys.version,'node':subprocess.check_output(['node','--version'],text=True).strip(),'platform':platform.platform(),'packages':{}}
for name in ['pypdf','numpy','scipy','scikit-learn','joblib','threadpoolctl']:
 try:env['packages'][name]=importlib.metadata.version(name)
 except importlib.metadata.PackageNotFoundError:env['packages'][name]='não encontrado neste interpretador'
write(Path('evidencias/ambiente.json'),json.dumps(env,ensure_ascii=False,indent=2))
with (R/'resultados/resumo_metricas.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['area','estrategia','metrica','media','consultas_validas','IC95_inferior','IC95_superior'])
 for a in j['aggregates']:
  for m in a['validMetricQueries']:w.writerow([a['area'],a['kind'],m,a[m],a['validMetricQueries'][m],*a['ci95'][m]])
files=[p for p in R.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ['.pyc','.zip'] and '.git' not in p.parts and p.name!='SHA256SUMS.txt']
write(Path('SHA256SUMS.txt'),'\n'.join(f'{sha(p)}  {p.relative_to(R).as_posix()}' for p in sorted(files))+'\n')
files.append(R/'SHA256SUMS.txt')
out=R.parent/'Gabaritei_Fase_5_Calculos_e_Metodologia.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,'Gabaritei_Fase_5_Calculos_e_Metodologia/'+p.relative_to(R).as_posix())
original=Path(r'C:\Users\Darkz\Downloads\Gabaritei_Dificuldade_Adaptativa.zip')
github=R.parent/'Gabaritei_Dificuldade_Adaptativa_GitHub_Com_Metricas.zip'
prefix='dificuldade-adaptativa/avaliacoes/fase5-metadados/'
with zipfile.ZipFile(original) as src,zipfile.ZipFile(github,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for info in src.infolist():
  if info.filename.startswith('/') or '..' in Path(info.filename).parts:raise ValueError('Caminho inseguro')
  z.writestr(info,src.read(info.filename))
 for p in files:z.write(p,prefix+p.relative_to(R).as_posix())
 z.writestr('LEIA_ANTES_DE_PUBLICAR.md','''# Pacote para publicação manual

Branch de destino: dificuldade-adaptativa. Nada foi publicado automaticamente.
O diretório dificuldade-adaptativa/ do ZIP enviado pelo usuário foi preservado
arquivo por arquivo. Esta preservação não significa nova aprovação de todo o
código histórico. O acréscimo fica em dificuldade-adaptativa/avaliacoes/fase5-metadados/.

Não substitua o backend/frontend de produção pelo snapshot dentro de base4b/.
Ele é referência congelada para reprodução da avaliação. Esta entrega acrescenta
evidências de métricas, não migra o módulo histórico BKT para o recomendador TRI.
Leia LEIA_PRIMEIRO.md e COMO_FOI_CALCULADO.md no diretório da avaliação.

O ZIP não conhece mudanças remotas posteriores. Antes de copiar para uma branch
existente, compare arquivos de mesmo nome com a versão atual. Os manifestos da
raiz histórica se referem ao pacote original; os acréscimos têm manifesto próprio
em avaliacoes/fase5-metadados/SHA256SUMS.txt.
Nenhum segredo, chave local de acesso, sessão de usuário ou banco de produção
é necessário para reproduzir as métricas. Não execute treinamento histórico.
''')
for archive in [out,github]:
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  assert len(z.namelist())==len(set(z.namelist()))
 archive.with_suffix('.zip.sha256').write_text(sha(archive)+'  '+archive.name+'\n')
 print(json.dumps({'path':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive)},ensure_ascii=False))
with zipfile.ZipFile(original) as a,zipfile.ZipFile(github) as b:
 assert all(a.read(n)==b.read(n) for n in a.namelist())
 print('Conteúdo original preservado: '+str(len(a.namelist()))+' entradas idênticas.')
