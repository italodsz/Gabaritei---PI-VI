"""Registra revisão dos textos antigos e gera amostra estratificada para conferência."""
import collections
import csv
import json
import random
from pathlib import Path
import pipeline_baseline as bl
import recomendador as rc

R = Path(__file__).resolve().parent
OUT = R/'resultados/base_final'
REVISOES = {
 'gq_1bf495a5eda4568d0ea676d2': ('AR1.elementos-e-procedimentos-das-artes-visuais','Texto substituído: cerâmicas e função utilitária, não resenha literária.'),
 'gq_40a3d0617d5e602c7dbb75a4': ('LE1.finalidade-e-argumentacao','Texto substituído: carta em inglês sobre pesquisas de obesidade.'),
 'gq_7aa17072b2effe6d2d2d1592': (None,'Defeito: texto substituído por tratamento de esgoto, mas descrição não informa o conteúdo das etapas numeradas.'),
 'gq_8a3c1e72bdb151eebc5357a9': ('LE1.compreensao-e-inferencia','Texto substituído: crianças aprendem com o ambiente em que vivem.'),
 'gq_acf5d212cc9ae8ac21b8be08': ('LP1.leitura-de-textos-multimodais','Texto substituído: imagem e texto na campanha de adoção tardia.'),
 'gq_b8f4ee587c7f1fd71498cc48': ('AR2.hibridismo-e-dialogo-musical','Texto substituído: Águas de março combina referências de Bilac e ponto de macumba.'),
 'gq_e24b413ff8877d30366b9db2': ('LE1.finalidade-e-argumentacao','Texto substituído: crítica ao culto a celebridades e necessidade de reflexão dos fãs.'),
 'gq_eef535e19f0f621b88d2a9d8': ('LE1.compreensao-e-inferencia','Texto substituído: perda precoce de amigo na canção In this life.'),
 'gq_f2dca74d4e6e5a806bd38991': ('LE1.compreensao-e-inferencia','Texto substituído: controle de memórias e registros no romance 1984.'),
 'gq_f9dd1e4c518e111604164934': ('GE4.agricultura-familiar-trabalho-e-povos-do-campo','Texto substituído: calendário de culturas e pastoreio adaptado aos ciclos naturais. Descrição do gráfico é parcial; encaminhar à conferência.'),
 'gq_6a697545f71aa52dee715749': (None,'Defeito: faltam os valores das populações urbana e rural dos cinco municípios nos gráficos.'),
}

def main():
    rows, el = rc.carregar()
    nodes = {n['id']:n for n in json.loads((R/'classificador/dados/arvore_v1.2.json').read_text(encoding='utf-8'))['nos']}
    dest = R/'classificador/dados/classificacao_manual.jsonl'
    lines = dest.read_text(encoding='utf-8').splitlines(keepends=True)
    revised = {}
    for qid,(no,obs) in REVISOES.items():
        n = nodes.get(no); assert n is None or n['area'] == rows[qid]['area']
        revised[qid] = {'id':qid,'no':no,'grande_tema':n['grande_tema'] if n else None,'assunto':n['assunto'] if n else None,'obs':'Revisão base final 13/11/2026: '+obs}
    found = set()
    for k,line in enumerate(lines):
        qid = json.loads(line)['id']
        if qid in revised:
            lines[k] = json.dumps(revised[qid],ensure_ascii=False)+'\n'; found.add(qid)
    lines += [json.dumps(q,ensure_ascii=False)+'\n' for i,q in revised.items() if i not in found]
    dest.write_text(''.join(lines), encoding='utf-8',newline='')
    audit = json.loads((OUT/'revisao_antigas.json').read_text(encoding='utf-8'))
    for q in audit:
        q['revisao'] = 'texto de busca idêntico após normalizar marcação' if q['somente_marcacao'] else 'diferenças lidas; rótulo mantido'
        if q['id'] in revised: q['revisao'] = revised[q['id']]['obs']; q['no_depois'] = revised[q['id']]['no']
    (OUT/'revisao_antigas.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
    rot,_ = rc.carregar_rotulos(); rng = random.Random(20261113)
    groups = {a:json.loads((OUT/f'pendentes_{a}.json').read_text(encoding='utf-8')) for a in ('MT','CN','CH','LC')}
    exact = {a:100*len(q)/681 for a,q in groups.items()}; sizes={a:int(n) for a,n in exact.items()}
    for a in sorted(groups,key=lambda a:-(exact[a]-sizes[a]))[:100-sum(sizes.values())]: sizes[a]+=1
    sample=[]
    for a,qs in groups.items(): sample += rng.sample(qs,sizes[a])
    rng.shuffle(sample)
    with (R/'classificador/saida/amostra_conferencia_base_final.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f); w.writerow(['id','área','ano','trecho do enunciado','assunto atribuído','conferência'])
        for q in sample: w.writerow([q['id'],q['area'],q['year'],bl.clean(q['question'])[:240],rot[q['id']]['assunto'] or '(defeito de texto)',''])
    assert all(i in rot for i in sum(el.values(),[]))
    summary={'novas':{a:len(q) for a,q in groups.items()},'amostra_semente':20261113,'amostra_por_area':sizes,'defeitos_novos':{a:sum(rot[q['id']]['defeito'] for q in qs) for a,qs in groups.items()},'revisoes_antigas':len(audit),'rotulos_antigos_alterados':list(revised), 'sem_rotulo':0}
    (OUT/'auditoria_rotulos.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__ == '__main__': main()
