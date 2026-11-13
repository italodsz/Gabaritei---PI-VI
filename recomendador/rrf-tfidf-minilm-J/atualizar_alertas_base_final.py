"""Atualiza o mapa de alertas do catálogo após a revisão, sem modificar questões."""
import json
from pathlib import Path
import recomendador as rc

R=Path(__file__).resolve().parent

def main():
    rows,el=rc.carregar(); rot,_=rc.carregar_rotulos(); ids=set(sum(el.values(),[]))
    p=R/'catalogo/alertas_texto.json'; old=json.loads(p.read_text(encoding='utf-8'))
    # Os alertas antigos de forma/ortografia foram conferidos no diff da revisão;
    # os demais casos foram lidos diretamente. Preservar o histórico no Git.
    new={}
    manual={q['id']:q for q in map(json.loads,(R/'classificador/dados/classificacao_manual.jsonl').read_text(encoding='utf-8').splitlines())}
    for i in ids:
        if rot[i]['defeito']:
            new[i]=[manual.get(i,{}).get('obs') or 'Defeito registrado na classificação anterior; permanece bloqueado.']
    # Dois erros do texto oficial permanecem como observações; não impedem identificar
    # a tarefa, mas devem ser conhecidos por quem integrar o catálogo.
    new['gq_7a77e4dcf68c4e8d3587c082']=['Grafia garantido-lhes preservada no dataset e na prova oficial; não corrigida nesta migração.']
    new['gq_9308afee4b782f3b8f4eeafe']=['A prova e o dataset usam kW por hora/kW para consumo; unidade inadequada preservada, conforme decisão da revisão do dataset.']
    audit={'removidos':{i:v for i,v in old.items() if i not in new},'atuais':new,'observacao':'Alertas antigos não são evidência de defeito atual depois das correções do dataset. Defeitos da classificação são os bloqueios usados pelo método oficial.'}
    p.write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    (R/'resultados/base_final/auditoria_alertas.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Alertas antigos:',len(old),'atuais:',len(new),'bloqueios:',sum(rot[i]['defeito'] for i in ids))

if __name__=='__main__':main()
