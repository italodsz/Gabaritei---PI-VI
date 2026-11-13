"""Gera um catalogo versionado a partir da base de trabalho, sem alterar perfis de alunos."""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shutil
import unicodedata

from .config import ARTEFATOS_DIR, carregar_config, sha256_arquivo, sha256_obj, versao_politica
from .psicometria import calcular_cortes, faixa_de_b, triar_parametros


def ler_jsonl(path):
    return [json.loads(l) for l in Path(path).read_text(encoding='utf-8').splitlines() if l.strip()]


def descricoes_para_recomendador(row):
    """A marcacao explicita da base decide o uso; descricoes de IA antigas nao entram por omissao."""
    return list(dict.fromkeys(d['text'].strip() for d in row.get('descriptions', [])
                             if isinstance(d, dict) and d.get('use_for_recommender') is True
                             and isinstance(d.get('text'), str) and d['text'].strip()))


def normalizar(text):
    text=unicodedata.normalize('NFKD', text)
    text=''.join(c for c in text if not unicodedata.combining(c)).lower()
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+',' ',text)).strip()


def agrupar(rows, anteriores, cfg):
    parent={r['id']:r['id'] for r in rows}
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]];x=parent[x]
        return x
    def union(a,b):
        a,b=find(a),find(b)
        if a!=b:parent[max(a,b)]=min(a,b)
    keys={};shingles={};inverted=defaultdict(list)
    for r in rows:
        rid=r['id']
        text='\n'.join([r.get('question') or '',*descricoes_para_recomendador(r)])
        opts=' '.join(o.get('text','') for o in r.get('options',[]))
        for key in [('familia',r.get('family_id') or rid),('conteudo',r.get('content_family_id') or rid),
                    ('texto',sha256_obj(normalizar(text)+'|'+normalizar(opts))),
                    ('grupo_anterior',anteriores.get(rid,{}).get('grupo_conteudo') or rid)]:
            if key in keys:union(rid,keys[key])
            else:keys[key]=rid
        words=normalizar(text).split()
        shingles[rid]={' '.join(words[i:i+3]) for i in range(max(1,len(words)-2))} if words else set()
        for s in shingles[rid]:inverted[s].append(rid)
    pairs=set()
    for ids in inverted.values():
        if len(ids)>cfg['jaccard_df_max_shingle']:continue
        for i,x in enumerate(ids):
            for y in ids[i+1:]:pairs.add(tuple(sorted((x,y))))
    for x,y in sorted(pairs):
        if find(x)==find(y):continue
        u=shingles[x]|shingles[y]
        if u and len(shingles[x]&shingles[y])/len(u)>=cfg['jaccard_trigramas_limite']:union(x,y)
    components=defaultdict(list)
    for rid in parent:components[find(rid)].append(rid)
    groups={};aliases={}
    for root,ids in components.items():
        old=sorted({anteriores[i]['grupo_conteudo'] for i in ids if i in anteriores})
        group=old[0] if old else 'grp_'+root[3:15]
        for rid in ids:groups[rid]=group
        for prior in old:
            if prior!=group:aliases[prior]=group
    return groups,aliases


def validar(row):
    errors=[]
    if not isinstance(row.get('id'),str) or not re.fullmatch(r'gq_[0-9a-f]{24}',row['id']):errors.append('id_invalido')
    if row.get('area') not in ('MT','LC','CH','CN'):errors.append('area_invalida')
    if row.get('language') not in ('pt','en','es'):errors.append('lingua_invalida')
    if row.get('language')!='pt' and row.get('area')!='LC':errors.append('lingua_fora_LC')
    if not isinstance(row.get('question'),str) or not row['question'].strip():errors.append('enunciado_ausente')
    opts=row.get('options')
    if not isinstance(opts,list) or [o.get('label') for o in opts if isinstance(o,dict)]!=list('ABCDE'):
        errors.append('alternativas_invalidas')
    elif any(not isinstance(o.get('text'),str) or not o['text'].strip() for o in opts):errors.append('alternativa_vazia')
    elif len({re.sub(r'\s+',' ',o['text']).strip().casefold() for o in opts})!=5:errors.append('alternativas_duplicadas')
    if row.get('answer') not in list('ABCDE'):errors.append('gabarito_invalido')
    tri=row.get('tri') or {}
    import math
    if any(not isinstance(tri.get(k),(float,int)) or isinstance(tri.get(k),bool) or not math.isfinite(tri[k]) for k in ('a','b','c')):
        errors.append('TRI_invalida')
    if row.get('split') not in ('train','validation','test'):errors.append('split_invalido')
    if not isinstance(row.get('year'),int):errors.append('ano_invalido')
    return errors


def midias(row, base):
    refs=[a for a in row.get('assets',[]) if isinstance(a,dict) and a.get('path')]
    if row.get('display_image') and row['display_image'] not in {a['path'] for a in refs}:
        refs.append(dict(path=row['display_image']))
    found=[];errors=[]
    for ref in refs:
        path=Path(ref['path']);source=(base/path).resolve()
        if path.is_absolute() or not source.is_relative_to(base.resolve()) or source.suffix.lower() not in ('.png','.jpg','.jpeg','.gif','.webp','.bmp'):
            errors.append('midia_caminho_invalido');continue
        if not source.is_file():errors.append('midia_ausente');continue
        digest=hashlib.sha256(source.read_bytes()).hexdigest()
        if ref.get('sha256') and ref['sha256']!=digest:errors.append('midia_hash_invalido');continue
        found.append(dict(path='media/'+source.name,sha256=digest))
    return list({m['path']:m for m in found}.values()),sorted(set(errors))


def executar(ds_dir, saida=None, cfg=None, anterior=None, commit=None):
    cfg=cfg or carregar_config();base=Path(ds_dir).resolve();out=Path(saida or ARTEFATOS_DIR).resolve()
    source=base/'data/questions.jsonl';digest=sha256_arquivo(source)
    if digest!=cfg['dataset']['sha256_esperado']:raise ValueError('Dataset difere do SHA-256 esperado; confirme a versao antes de importar.')
    rows=ler_jsonl(source);ids=[r.get('id') for r in rows]
    if len(ids)!=len(set(ids)):raise ValueError('IDs duplicados no dataset.')
    by_id={r['id']:r for r in rows}
    eligible=json.loads((base/'ids_elegiveis.json').read_text(encoding='utf-8'))
    selected={i:s for s,lst in eligible.items() for i in lst}
    if len(selected)!=sum(map(len,eligible.values())):raise ValueError('IDs elegiveis duplicados entre splits.')
    if set(eligible)!={'train','validation','test'}:raise ValueError('Splits elegiveis invalidos.')
    parts=[]
    for split in ('train','validation','test'):
        subset=ler_jsonl(base/'splits'/f'{split}.jsonl')
        if any(r['id'] not in by_id or r!=by_id[r['id']] or r.get('split')!=split for r in subset):
            raise ValueError('Split inconsistente com questions.jsonl: '+split)
        parts.extend(r['id'] for r in subset)
    if Counter(parts)!=Counter(ids):raise ValueError('Splits nao cobrem cada ID exatamente uma vez.')
    for rid,split in selected.items():
        if rid not in by_id or by_id[rid].get('split')!=split:raise ValueError('Elegibilidade inconsistente: '+rid)
        if not by_id[rid].get('ready_text'):raise ValueError('Item elegivel sem ready_text: '+rid)
    notice=json.loads((base/'AVISO_INDICES.json').read_text(encoding='utf-8'))
    if notice.get('derivative_dataset_sha256')!=digest:raise ValueError('AVISO_INDICES nao corresponde ao corpus.')
    blocked={r['id'] for r in json.loads((base/'qualidade/bloqueios.json').read_text(encoding='utf-8'))}
    if blocked&selected.keys():raise ValueError('Item bloqueado consta nos elegiveis.')
    accepted=cfg['dataset'].get('releases_origem_aceitos',[cfg['dataset']['release_esperado']])
    if any(r.get('release') not in accepted for r in rows):raise ValueError('Release de origem inesperado.')
    prior=json.loads(Path(anterior).read_text(encoding='utf-8')) if anterior else {'itens':[]}
    old={r['id']:r for r in prior['itens']}
    groups,aliases=agrupar(rows,old,cfg['qualidade'])
    for key,value in prior.get('grupos_alias',{}).items():aliases[key]=aliases.get(value,value)
    errors={};media={}
    for r in rows:
        reasons=validar(r)
        if r['id'] not in selected:reasons.append('fora_da_lista_elegivel')
        if not r.get('ready_text'):reasons.append('ready_text_falso')
        if r.get('quality_review',{}).get('text_experiment_eligible') is False:reasons.append('qualidade_texto_reprovada')
        if r['id'] in blocked:reasons.append('bloqueado')
        media[r['id']],missing=midias(r,base)
        reasons.extend(missing)
        errors[r['id']]=sorted(set(reasons))
    trirows=[r for r in rows if r['id'] in selected and 'TRI_invalida' not in errors[r['id']]]
    triage=triar_parametros(trirows,cfg['triagem_tri'])
    approved=[r for r in rows if not errors[r['id']] and not triage[r['id']]['excluir'] and r['split']=='train']
    cuts=calcular_cortes(approved,cfg['dificuldade'],digest,cfg['triagem_tri']['versao'])
    items=[]
    for r in rows:
        rid=r['id'];t=triage.get(rid,dict(excluir=False,motivos=[],sinais=[]))
        band=faixa_de_b(r['tri']['b'],cuts['cortes'][r['area']]) if not errors[rid] and not t['excluir'] else None
        descriptions=descricoes_para_recomendador(r)
        qhash=sha256_obj(dict(question=r.get('question'),options=r.get('options'),midias=media[rid],descricoes_recomendador=descriptions))
        ghash=sha256_obj(dict(id=rid,answer=r.get('answer')))
        phash=sha256_obj(dict(tri=r.get('tri'),cortes=cuts['versao'],triagem=cfg['triagem_tri']['versao'],grupo=groups[rid]))
        pedagogy=r.get('pedagogy') or {}
        items.append(dict(id=rid,versao_id=f'{rid}:{qhash[:12]}:{ghash[:8]}:{phash[:10]}',
            questao_hash=qhash,gabarito_hash=ghash,parametros_hash=phash,area=r.get('area'),
            lingua=r.get('language'),formato=r.get('application_format'),tipo_aplicacao=r.get('application_type'),
            ano=r.get('year'),split=r.get('split'),co_item=r.get('co_item'),
            habilidade=None if r.get('skill') is None else str(r['skill']),
            habilidade_chave=None if r.get('skill') is None else f"{r['area']}:H{r['skill']}",
            topico_regra=pedagogy.get('topic_predicted'),topico_status=pedagogy.get('review_status'),
            tri=r.get('tri'),triagem=t,faixa=band,grupo_conteudo=groups[rid],
            family_id=r.get('family_id'),content_family_id=r.get('content_family_id'),disponivel=not errors[rid],
            motivos_indisponivel=errors[rid],enunciado=r.get('question'),alternativas=r.get('options'),
            descricoes_recomendador=descriptions,midias=media[rid],gabarito=r.get('answer'),
            release=r.get('release'),procedencia=dict(evidence_id=r.get('evidence_id'),referencia=r.get('official_reference'))))
    offered=[r for r in items if r['disponivel'] and not r['triagem']['excluir'] and r['faixa']]
    stamp=datetime.now(timezone.utc).isoformat()
    manifest=dict(dataset_sha256=digest,release=cfg['dataset']['release_esperado'],cortes_versao=cuts['versao'],
                  triagem_versao=cfg['triagem_tri']['versao'],politica_versao=versao_politica(cfg),
                  gerado_em=stamp,fonte=dict(repositorio='italodsz/Gabaritei---PI-VI',branch='dataset',commit=commit),
                  formato_catalogo=2,releases_origem=dict(Counter(r.get('release') for r in rows)))
    report=dict(dataset_sha256=digest,total=len(rows),elegiveis_origem=len(selected),ofertaveis=len(offered),
                por_area=dict(Counter(r['area'] for r in offered)),
                com_descricoes_para_recomendador=sum(bool(r['descricoes_recomendador']) for r in items),
                ofertaveis_com_imagens=sum(bool(r['midias']) for r in offered),
                elegiveis_sem_arquivos_de_imagem=sum('midia_ausente' in errors[i] for i in selected),
                indisponibilidades=dict(Counter(m for i in selected for m in errors[i])),
                grupos_alias=len(aliases),splits_ajuste_cortes=['train'])
    # Toda validacao ocorre antes da publicacao dos artefatos.
    out.mkdir(parents=True,exist_ok=True)
    for r in rows:
        for m in media[r['id']]:
            candidates=[base/a['path'] for a in r.get('assets',[]) if isinstance(a,dict) and a.get('path') and Path(a['path']).name==Path(m['path']).name]
            if r.get('display_image') and Path(r['display_image']).name==Path(m['path']).name:candidates.append(base/r['display_image'])
            dest=out/m['path'];dest.parent.mkdir(exist_ok=True)
            if candidates and candidates[0].resolve()!=dest.resolve():shutil.copyfile(candidates[0],dest)
    def dump(path,obj):path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    payload=dict(manifesto=manifest,itens=items,grupos_alias=aliases)
    # O hash do catalogo e externo; evita autorreferencia.
    (out/'catalogo.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    manifest['catalogo_sha256']=sha256_arquivo(out/'catalogo.json')
    dump(out/'manifesto.json',manifest);dump(out/'cortes.json',cuts)
    dump(out/'importacao.json',report)
    return report


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--dataset',type=Path,required=True)
    p.add_argument('--saida',type=Path,default=ARTEFATOS_DIR)
    p.add_argument('--anterior',type=Path,help='catalogo.json anterior para preservar grupos e exposicoes')
    p.add_argument('--sha256',help='hash confirmado de uma nova versao da base')
    p.add_argument('--commit',help='commit de origem da base importada')
    args=p.parse_args();cfg=carregar_config()
    if args.sha256:
        if not re.fullmatch('[0-9a-f]{64}',args.sha256):p.error('SHA-256 invalido')
        cfg['dataset']['sha256_esperado']=args.sha256
    print(json.dumps(executar(args.dataset,args.saida,cfg,args.anterior,args.commit),ensure_ascii=False,indent=2))


if __name__=='__main__':main()
