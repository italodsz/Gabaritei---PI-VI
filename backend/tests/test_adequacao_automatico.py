"""Regressoes de selecao: cenarios SINTETICOS isolados, sem alterar catalogo ou perfis reais."""
import copy
import math
from dataclasses import replace

import numpy as np
import pytest

from gabaritei_rec.catalogo import Catalogo
from gabaritei_rec.estrategia import HistoricoArea, decidir_estrategia
from gabaritei_rec.perfil import EstadoPerfil, estimar_perfil_area
from gabaritei_rec.psicometria import EstimativaTheta, Evidencia
from gabaritei_rec.recomendacao import Contexto, Pedido, recomendar


def scenario(cat, cfg, probabilities, area='MT', sufficient=True):
    template = next(it for it in cat.ofertaveis() if it.formato=='standard' and it.tipo_aplicacao=='regular')
    items = [replace(template, id=f'sint-{k}', versao_id=f'sint-{k}:v1', area=area, habilidade_chave=None,
                     grupo_conteudo=f'grupo-sint-{k}', faixa='facil', a=1., b=math.log(1/p-1), c=0.)
             for k,p in enumerate(probabilities)]
    catalog = Catalogo(items, cat.manifesto, cat.cortes)
    # Posterior pontual artificial: probabilidades exatas para verificar a politica isoladamente.
    est = EstimativaTheta(0., .3, 20, 20., np.array([0.]), np.array([1.]))
    state = EstadoPerfil(area, 0., .3 if sufficient else .7, 20,
                         'suficiente' if sufficient else 'insuficiente', 1.)
    hist = HistoricoArea(respostas_validas=[True,False]*5, probs_previstas=[.5]*10)
    ctx = Contexto(perfil={area:state}, estimativas={area:est}, historico={area:hist})
    config = copy.deepcopy(cfg)
    config['automatico']['jitter']=0
    config['automatico']['peso_informacao']=0
    return catalog, config, ctx


@pytest.mark.parametrize('area',['MT','CH','LC','CN'])
def test_automatico_para_quando_so_ha_itens_muito_distantes(cat,cfg,area):
    catalog,config,ctx=scenario(cat,cfg,[.05,.2,.34],area,sufficient=False)
    before=copy.deepcopy(ctx.perfil[area].como_dict())
    r=recomendar(catalog,Pedido('automatico',area,1,aceitar_experimental=True),ctx,config,7)
    assert r.status=='sem_candidatos' and not r.itens
    assert r.limitacao['tipo']=='catalogo_insuficiente_para_perfil'
    assert r.estrategia['adequacao_catalogo']['candidatos_adequados']==0
    assert ctx.perfil[area].como_dict()==before


def test_lote_parcial_nao_completa_com_itens_inadequados(cat,cfg):
    catalog,config,ctx=scenario(cat,cfg,[.2,.4,.7],sufficient=False)
    r=recomendar(catalog,Pedido('automatico','MT',3,aceitar_experimental=True),ctx,config,7)
    assert r.status=='parcial' and len(r.itens)==2
    assert all(s.prob_prevista>=.35 for s in r.itens)
    assert r.limitacao['tipo']=='catalogo_insuficiente_para_perfil'


def test_nivel_manual_e_diagnostico_explicito_preservados(cat,cfg):
    catalog,config,ctx=scenario(cat,cfg,[.2],sufficient=False)
    for pedido in (Pedido('nivel','MT',1,dificuldade='facil'),Pedido('diagnostico','MT',1)):
        r=recomendar(catalog,pedido,ctx,config,1)
        assert r.status=='ok' and len(r.itens)==1


def test_cobertura_inicial_ainda_explora_as_tres_faixas(cat,cfg):
    catalog,config,ctx=scenario(cat,cfg,[.5,.2,.1],sufficient=False)
    items=[replace(it,faixa=faixa) for it,faixa in zip(catalog.itens.values(),('facil','media','dificil'))]
    catalog=Catalogo(items,cat.manifesto,cat.cortes)
    ctx.perfil['MT']=EstadoPerfil('MT',0.,1.,0,'sem_historico',1.)
    ctx.historico['MT']=HistoricoArea()
    r=recomendar(catalog,Pedido('automatico','MT',3,aceitar_experimental=True),ctx,config,1)
    assert {s.item.faixa for s in r.itens}=={'facil','media','dificil'}


@pytest.mark.parametrize('correct,expected,direction',[(True,'sint-0','mais_desafiador'),(False,'sint-1','mais_acessivel')])
def test_ajuste_gradual_afeta_alternativa_fora_da_faixa(cat,cfg,correct,expected,direction):
    catalog,config,ctx=scenario(cat,cfg,[.58,.87])
    ctx.historico['MT']=HistoricoArea(respostas_validas=[correct]*10,probs_previstas=[.5]*10)
    r=recomendar(catalog,Pedido('automatico','MT',1,aceitar_experimental=True),ctx,config,1)
    assert r.itens[0].item.id==expected
    assert r.estrategia['alternativa']['direcao']==direction
    assert r.itens[0].razao['na_faixa_alvo'] is False
    assert f'alternativa_fora_da_faixa:{direction}' in r.itens[0].razao['criterios']


def test_alternativas_mistas_descrevem_itens_realmente_selecionados(cat,cfg):
    catalog,config,ctx=scenario(cat,cfg,[.58,.87])
    r=recomendar(catalog,Pedido('automatico','MT',2,aceitar_experimental=True),ctx,config,1)
    assert r.estrategia['alternativa']['direcao']=='mista'
    assert sorted(r.estrategia['alternativa']['prob_prevista_dos_itens_fora'])==pytest.approx([.58,.87])


def test_item_na_faixa_tem_prioridade_sobre_alternativa(cat,cfg):
    catalog,config,ctx=scenario(cat,cfg,[.58,.87,.66])
    ctx.historico['MT']=HistoricoArea(respostas_validas=[True]*10,probs_previstas=[.5]*10)
    r=recomendar(catalog,Pedido('automatico','MT',2,aceitar_experimental=True),ctx,config,1)
    assert r.itens[0].item.id=='sint-2'
    assert r.itens[0].razao['na_faixa_alvo'] is True


def test_erros_esperados_nao_rebaixam_nivel(cat,cfg):
    _,config,ctx=scenario(cat,cfg,[.7])
    hist=HistoricoArea(respostas_validas=[True]*7+[False]*3,probs_previstas=[.7]*10)
    decision=decidir_estrategia(ctx.perfil['MT'],hist,config)
    assert decision.estrategia=='adaptativo' and decision.ajuste_centro==0


def test_muitas_respostas_sem_informacao_nao_fingem_certeza(cfg):
    state,_=estimar_perfil_area('MT',[Evidencia(1.,10.,.2,False)]*100,cfg)
    assert state.status=='insuficiente'
    assert state.motivos_insuficiencia==('incerteza_acima_do_limite',)
    assert state.como_dict()['criterios_suficiencia']['dp_max_suficiente']==.6


def test_sondagem_util_proxima_do_limite_permite_continuar(cat,cfg,monkeypatch):
    catalog,config,ctx=scenario(cat,cfg,[.33],sufficient=False)
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    r=recomendar(catalog,Pedido('automatico','MT',1,aceitar_experimental=True),ctx,config,7)
    assert r.status=='ok' and r.itens[0].razao['sondagem_diagnostica'] is True
    assert r.estrategia['adequacao_catalogo']['candidatos_adequados']==0
    assert r.estrategia['adequacao_catalogo']['sondagem']['ativa'] is True


@pytest.mark.parametrize('probability,information,used',[(.29,.025,0),(.33,.001,0),(.33,.025,3)])
def test_sondagem_nao_libera_itens_distantes_sem_informacao_ou_sem_orcamento(cat,cfg,monkeypatch,probability,information,used):
    catalog,config,ctx=scenario(cat,cfg,[probability],sufficient=False)
    ctx.historico['MT'].sondagens_consecutivas=used
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:information)
    r=recomendar(catalog,Pedido('automatico','MT',1,aceitar_experimental=True),ctx,config,7)
    assert r.status=='sem_candidatos'


def test_sondagem_respeita_orcamento_no_lote(cat,cfg,monkeypatch):
    catalog,config,ctx=scenario(cat,cfg,[.33,.32,.31],sufficient=False)
    ctx.historico['MT'].sondagens_consecutivas=2
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    r=recomendar(catalog,Pedido('automatico','MT',3,aceitar_experimental=True),ctx,config,7)
    assert r.status=='parcial' and len(r.itens)==1


def test_orcamento_persistido_inclui_pendentes_e_outra_sessao(cat,cfg,monkeypatch):
    from gabaritei_rec.db import criar_engine,criar_fabrica
    from gabaritei_rec.servico import Servico
    catalog,config,ctx=scenario(cat,cfg,[.33]*5,sufficient=False)
    service=Servico(catalog,config,criar_fabrica(criar_engine('sqlite://')))
    monkeypatch.setattr(service,'_perfil_atual',lambda db,aid:(ctx.perfil,ctx.estimativas))
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    session=service.criar_sessao(None,'automatico')
    pedido=Pedido('automatico','MT',1,aceitar_experimental=True)
    for i in range(3):
        result=service.recomendar(session['sessao_id'],pedido,semente=7)
        assert result['itens'][0]['razao']['sondagem_diagnostica'] is True
    resumed=service.criar_sessao(session['aluno_id'],'automatico')
    result=service.recomendar(resumed['sessao_id'],pedido,semente=7)
    assert result['status']=='sem_candidatos' and not result['itens']


@pytest.mark.parametrize('area',['MT','LC','CH','CN'])
def test_reforco_com_perfil_incerto_tambem_permite_sondagem(cat,cfg,monkeypatch,area):
    catalog,config,ctx=scenario(cat,cfg,[.34],area=area,sufficient=False)
    ctx.historico[area]=HistoricoArea(respostas_validas=[False]*10,probs_previstas=[.6]*10)
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    r=recomendar(catalog,Pedido('automatico',area,1,aceitar_experimental=True),ctx,config,7)
    assert r.estrategia['nome']=='reforco' and r.status=='ok'
    assert r.itens[0].razao['sondagem_diagnostica'] is True


def test_reforco_com_perfil_suficiente_nao_finge_diagnostico_incerto(cat,cfg,monkeypatch):
    catalog,config,ctx=scenario(cat,cfg,[.34])
    ctx.historico['MT']=HistoricoArea(respostas_validas=[False]*10,probs_previstas=[.6]*10)
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    r=recomendar(catalog,Pedido('automatico','MT',1,aceitar_experimental=True),ctx,config,7)
    assert r.estrategia['nome']=='reforco' and r.status=='sem_candidatos'


def test_reservas_desatualizadas_nao_consumem_orcamento_do_novo_perfil(cat,cfg,monkeypatch):
    from gabaritei_rec.db import criar_engine,criar_fabrica
    from gabaritei_rec.servico import Servico
    catalog,config,ctx=scenario(cat,cfg,[.33]*6,sufficient=False)
    service=Servico(catalog,config,criar_fabrica(criar_engine('sqlite://')))
    monkeypatch.setattr(service,'_perfil_atual',lambda db,aid:(ctx.perfil,ctx.estimativas))
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    session=service.criar_sessao(None,'automatico')
    pedido=Pedido('automatico','MT',1,aceitar_experimental=True)
    reservations=[service.recomendar(session['sessao_id'],pedido,semente=7) for _ in range(3)]
    pending=service.pendencia_terminal(session['aluno_id'],pedido)
    assert pending is not None
    first=reservations[0]['itens'][0]
    ap=service.apresentar(first['recomendacao_item_id'])
    service.responder(ap['apresentacao_id'],catalog.itens[first['questao_id']].gabarito)
    assert service.pendencia_terminal(session['aluno_id'],pedido) is None
    r=service.recomendar(session['sessao_id'],pedido,semente=7)
    assert r['status']=='ok'
    state=r['estrategia']['adequacao_catalogo']['sondagem']
    assert state['respondidas_consecutivas']==1 and state['pendentes']==0


def test_limite_informado_nao_e_confundido_com_estoque_esgotado(cat,cfg,monkeypatch):
    catalog,config,ctx=scenario(cat,cfg,[.33],sufficient=False)
    ctx.historico['MT'].sondagens_consecutivas=3
    monkeypatch.setattr('gabaritei_rec.recomendacao.ganho_informacao_esperado',lambda *args:.025)
    r=recomendar(catalog,Pedido('automatico','MT',1,aceitar_experimental=True),ctx,config,7)
    assert r.limitacao['causa']=='limite_de_sondagens'
    assert r.limitacao['estoque_restante']==1
