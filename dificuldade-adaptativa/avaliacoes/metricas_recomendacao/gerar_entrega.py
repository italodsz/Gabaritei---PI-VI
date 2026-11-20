from pathlib import Path
import json, html, subprocess, sys, platform, zipfile, hashlib
ROOT=Path(__file__).resolve().parent
OUT=Path.home()/'Downloads'
def execute(args,name):
    result=subprocess.run([sys.executable,*args],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
    (ROOT/'logs').mkdir(exist_ok=True)
    (ROOT/'logs'/name).write_text('Python: '+sys.version+'\nPlataforma: '+platform.platform()+'\nComando: python '+' '.join(args)+'\n'+result.stdout+result.stderr+'\nExit code: '+str(result.returncode),encoding='utf-8')
    if result.returncode:raise RuntimeError(name)
execute(['calcular_metricas.py'],'execucao_completa.txt')
execute(['-m','unittest','-v','test_metricas.py'],'testes_completos.txt')
summary=json.loads((ROOT/'resultados/resumo.json').read_text(encoding='utf-8'))
current=json.loads((ROOT/'resultados/avaliacao7_cobertura.json').read_text(encoding='utf-8'))
def pct(x):return f'{100*x:.2f}%'.replace('.',',') if x is not None else 'Indefinido'
rows=[r for r in summary if r['coorte']=='humana_7_catalogos_11_comuns' and r['k']==3 and r['limiar']==7]
table='| Lista publicada | Consultas | Precision@3 | Recall@3 no pool | nDCG@3 no pool (linear) |\n|---|---:|---:|---:|---:|\n'+''.join(f"| {r['metodo']} | {r['consultas']} | {pct(r['precision'])} | {pct(r['recall_pool'])} | {r['ndcg_pool_linear']:.4f} |\n" for r in rows)
ci='\n'.join(f"- {r['metodo']}: IC95% exploratório de Precision@3 {pct(r['precision_ic95_bootstrap'][0])} a {pct(r['precision_ic95_bootstrap'][1])}." for r in rows)
report=f'''# Gabaritei — métricas de recomendação
Data: 13/11/2026. Avaliação offline exploratória; Fase 2 continua em revisão.

## O que conseguimos avaliar
Relevância das questões sugeridas pelo módulo do Ítalo. Reutilizamos julgamentos humanos existentes, sem produzir novas notas por IA e sem treinar modelos. Não medimos aprendizagem dos estudantes, qualidade pedagógica certificada, dificuldade adequada ao usuário ou eficácia integrada do BKT.

Uma consulta é uma questão de referência. K=3 são as três primeiras questões sugeridas, na ordem real do catálogo, não três respostas do aluno. Nos registros humanos de 0 a 10, relevância binária significa nota >=7, corte inspirado no protocolo anterior; também entregamos sensibilidade para 8 e 9. Nos registros antigos de 0 a 2, usamos >=2 e, separadamente, >=1. Notas de coortes distintas não são diretamente comparáveis.

## Resultado principal — subconjunto comum julgado
{table}

Precision@3 de 75,76% corresponde a 25 sugestões relevantes entre 33 posições. No comparador, 20 entre 33. Aumento observado: 15,15 pontos percentuais; IC95% bootstrap pareado de -9,09 a +42,42 pp. A melhora de precisão não está demonstrada de forma conclusiva.

{ci}

O nDCG linear favorece titulo_area neste recorte: diferença média de 0,1350, IC95% pareado exploratório de 0,0527 a 0,2315. Isso descreve as notas e a ordem destes candidatos conhecidos; não demonstra superioridade geral, impacto educacional nem aprovação de fase. A escala linear é deliberada: 8 pontos têm ganho 8, não 255. Não misturar com nDCG exponencial de outros estudos. Notas altas e pouco dispersas podem resultar em nDCG alto.

## Como interpretar
- Precision@K: relevantes nas K primeiras / K. Exemplo didático, não resultado: 2 sugestões relevantes entre 3 dão 66,67%.
- Recall@K: relevantes recuperados / total de relevantes conhecidos. Aqui o denominador é o pool histórico de candidatos julgados para cada referência, não todas as questões do dataset. O valor 73,94% é a média por consulta; não é cobertura de 73,94% do catálogo inteiro.
- DCG@K = soma de nota_i / log2(i+1), com posições iniciando em 1. nDCG@K = DCG@K / DCG da melhor ordenação possível das notas do pool no mesmo K. Favorece melhores sugestões nas primeiras posições. 0,9508 não significa 95,08% de acerto do aluno ou do BKT.

As definições seguem a avaliação de recuperação ranqueada; a implementação usa ganho linear, como a referência do [scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html). Fontes conceituais adicionais: [Stanford, ranked retrieval](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html) e [julgamentos e pooling](https://nlp.stanford.edu/IR-book/html/htmledition/assessing-relevance-1.html).

## Por que somente 11 consultas
A avaliação cega 7 contém 62 notas humanas para 12 referências, conforme CSV e relatório de concordância; isso é a procedência registrada, não uma nova certificação de autoria. A seleção original inclui casos em que os métodos discordavam e não representa uma amostra aleatória de todo uso. Os avaliadores são integrantes do projeto; não há dupla revisão independente certificada.

Juntamos os IDs do conteúdo exibido e do CSV, respeitando a ordem sorteada apenas para identificar a nota, e recuperamos as posições nas listas publicadas. A cobertura é 35/36 posições de titulo_area e 36/36 de rrf_qwen. Uma consulta tem uma sugestão atual sem nota e foi excluída de ambos os métodos, por critério de cobertura, antes de comparar métricas. Não convertê-la em nota zero. As 11 referências comuns têm todas as seis posições necessárias julgadas, com sobreposição possível. A exclusão limita representatividade.

As listas publicadas têm hashes de base diferentes: titulo_area usa a64f75300b2e7f42bf7ea9c61748c54086b1b53a558a4d5e2f171f8da8005760; rrf_qwen usa 22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5. Logo, comparamos dois artefatos publicados com notas históricas reutilizadas, não um ensaio controlado que isole apenas o algoritmo. Não assumimos que a chave da avaliação histórica represente o catálogo atualizado. Nenhuma chave denominada NAO_ABRIR foi aberta.

## Outras evidências preservadas
As tabelas JSON/CSV incluem avaliações humanas históricas 1, 4 e 6 e a avaliação de 50 referências por IA, separadas por coorte, método, limiar e K=1/3. A avaliação 4 permite comparar três métodos no mesmo pool. Na avaliação 6, todas as notas humanas >=7: Precision@3=100% é resultado daquele recorte de oito referências e não deve ser generalizado. Na avaliação 1 só o top3 foi julgado: Recall@3=100% é consequência do pool limitado ao próprio top3, não evidência de recuperação completa. Os resultados da avaliação IA_50 são diagnósticos automáticos históricos, não nova avaliação humana; não houve nova execução desses modelos.

Não calculamos @5 ou @10: faltam julgamentos completos nessas posições. O pool favorece sistemas que contribuíram candidatos e não garante localizar todos os relevantes fora dele. Não preenchemos ausências com irrelevância. A média é macro por referência; recall indefinido quando não existe relevante no pool é excluído, com n explícito. nDCG é indefinido em pool com todas as notas zero, também excluído com n explícito. Intervalos são percentis de 4.000 reamostragens por consulta, semente 20261113; não tratamos cada sugestão como observação independente. Com 11 consultas selecionadas e avaliações reutilizadas, intervalos são exploratórios e não corrigem vieses, dependência entre referências, versões de base ou múltiplas análises. Não foram usados para escolher ou aprovar novo modelo.

## Onde aplicar ao BKT e ao sistema integrado
O BKT atualiza uma estimativa de domínio e a política sugere uma faixa; eles não são, isoladamente, uma lista de K questões semanticamente ranqueadas. Não é adequado chamar cada acerto do aluno de item relevante nem deduzir a relevância pedagógica apenas da própria faixa prevista pelo BKT: isso seria avaliar a política pelo seu próprio critério.

Para avaliar a integração, registrar a cada instante: contexto e histórico disponíveis até aquele ponto, matéria, faixa escolhida pelo aluno, sugestão de faixa pelo BKT, estoque elegível, lista ordenada do Ítalo antes e depois do filtro, versão do catálogo, itens exibidos e aceite explícito. Obter avaliações humanas de relevância e adequação ao nível do aluno, separando esses dois eixos; questões novas para transferência, repetição identificada e avaliação ao longo da sessão. Para Recall, julgar um pool comum com os candidatos de todos os métodos e registrar seu limite. Para inferir aprendizagem, acompanhar resultados posteriores em itens novos; acerto imediato pode refletir chute ou repetição.

Comparar sistema integrado e regra simples em mesmos contextos e pools, sem usar respostas futuras na decisão. Acompanhar adicionalmente calibração das probabilidades, Log Loss, falsas mudanças, abstenção por evidência insuficiente, estoque, repetição e alterações sem consentimento (esperado zero). Nenhum parâmetro treinado no ASSISTments foi validado para ENEM por este trabalho. Não existem respostas reais dos estudantes do Gabaritei para calcular agora essas métricas de personalização. Os antigos ensaios sintéticos continuam identificados como sintéticos e não foram transformados em validação real.

## O sistema está bom?
Há sinal favorável à relevância semântica do catálogo titulo_area no recorte humano disponível. Precision@3 é informativa, mas a amostra pequena, as versões diferentes e a incerteza impedem aprovação geral. Não existe um valor universal de aprovação. O professor deve avaliar o objetivo, o comparador, os critérios de relevância e as limitações. Ainda não podemos afirmar que o recomendador adaptativo escolhe o nível certo para estudantes reais.

## Reprodução e evidências
Python >=3.10. Nenhuma dependência externa para recalcular; não precisa instalar modelos, fazer download de dataset nem executar preparar_fontes.py. O ZIP contém as fontes congeladas e seu manifesto de hashes. A partir da pasta extraída:

```text
python calcular_metricas.py
python -m unittest -v test_metricas.py
```

O teste cruzado com scikit-learn é opcional e fica skipped se a biblioteca não estiver instalada; os demais testes e o cálculo não dependem dela. Nesta execução a biblioteca estava disponível. Logs completos em logs/. Resultados por consulta, inclusive limiares e denominadores, em resultados/. preparar_fontes.py documenta a cópia inicial do workspace e não é necessário para reprodução portátil. gerar_entrega.py refaz resultados, testes e documentação.

Foram executados 10 testes, todos aprovados, incluindo exemplo calculado à mão, tratamento de ranking incompleto, duplicatas, nota ausente, pool sem relevante e conferência com scikit-learn. Nenhum teste falhou. Impedidos por falta de evidência: Recall do catálogo completo, @5/@10 e qualidade personalizada do BKT em estudantes reais. Esses impedimentos não contam como testes aprovados.

Fontes do repositório: branch recomendador, commit a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef, URLs por arquivo em manifesto_fontes.json. Nenhuma branch do João foi lida. Nenhum commit, push, merge, treinamento, modificação dos dados originais ou avanço de fase foi realizado.
'''
(ROOT/'RELATORIO.md').write_text(report,encoding='utf-8')
README='''# Gabaritei — avaliação de recomendação\n\nAbra Gabaritei_Metricas_Recomendacao.html para ler o relatório sem instalar nada.\n\nPara reproduzir, use Python >=3.10 e execute `python calcular_metricas.py` e `python -m unittest -v test_metricas.py`. Não execute preparar_fontes.py; ele documenta apenas a coleta inicial local. Os arquivos necessários já estão em fontes/. Não há treinamento nem conexão com serviços para calcular as métricas.\n\nresultados/resumo.csv e por_consulta.csv: métricas, limiares, denominadores e intervalos. manifesto_fontes.json: SHA-256 e URLs. logs/: execução e testes. RELATORIO.md: metodologia e limitações.\n\nOs resultados principais se referem à relevância semântica em 11 referências com notas humanas históricas, não à personalização BKT. Recall e nDCG são restritos ao pool conhecido.\n'''
(ROOT/'README.md').write_text(README,encoding='utf-8')
# Página independente, legível offline. Usa apenas conteúdo local escapado.
body=''
for paragraph in report.split('\n\n'):
    if paragraph.startswith('# '):body+='<h1>'+html.escape(paragraph[2:])+'</h1>'
    elif paragraph.startswith('## '):body+='<h2>'+html.escape(paragraph[3:])+'</h2>'
    elif paragraph.startswith('| '):
        lines=paragraph.splitlines();body+='<div class="scroll"><table>'
        for i,line in enumerate(lines):
            if i==1:continue
            tag='th' if i==0 else 'td'
            body+='<tr>'+''.join('<'+tag+'>'+html.escape(c.strip())+'</'+tag+'>' for c in line.strip('|').split('|'))+'</tr>'
        body+='</table></div>'
    else:body+='<p>'+html.escape(paragraph).replace('\n','<br>')+'</p>'
page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gabaritei — métricas de recomendação</title><style>body{font:17px/1.65 system-ui;color:#172d3f;background:#eef3f8;margin:0}main{max-width:1000px;margin:30px auto;padding:35px;background:white;border-radius:16px}h1{color:#124b72}h2{margin-top:2em;color:#155d78}table{border-collapse:collapse;width:100%;font-size:15px}td,th{padding:12px;border-bottom:1px solid #d3dee6;text-align:left}th{background:#e4f1f5}.scroll{overflow:auto}p{overflow-wrap:anywhere}@media(max-width:600px){main{margin:0;padding:20px}body{font-size:16px}}@media print{body{background:white}main{margin:0;padding:0}h2{break-after:avoid}}</style><main>'+body+'</main></html>'
(ROOT/'Gabaritei_Metricas_Recomendacao.html').write_text(page,encoding='utf-8')
OUT.mkdir(exist_ok=True)
(OUT/'Gabaritei_Metricas_Recomendacao.html').write_text(page,encoding='utf-8')
zip_path=OUT/'Gabaritei_Metricas_Recomendacao_2026-11-13.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in ROOT.rglob('*'):
        if p.is_file() and '__pycache__' not in p.parts:z.write(p,p.relative_to(ROOT))
with zipfile.ZipFile(zip_path) as z:
    assert z.testzip() is None
    print('ZIP íntegro:',zip_path,'arquivos:',len(z.namelist()))
print('HTML:',OUT/'Gabaritei_Metricas_Recomendacao.html')
