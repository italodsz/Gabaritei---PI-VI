"""Independent integration gate, stronger than historical A/B prediction categories."""
from .common import ROOT,load,save
from .inferencia import validate_parameters


def decisions():
    models=load(ROOT/"models/parametros_originais.json")["skills"]
    historical=load(ROOT/"references/avaliacao_final.json")["skills"]
    stability=load(ROOT/"references/estabilidade_parametros.json")
    result={}
    for skill,entry in models.items():
        p=entry["parameters"]
        reasons=[]
        try:
            validate_parameters(p)
        except ValueError:
            reasons.append("parametros_invalidos")
        if p["G"]>=.5:
            reasons.append("G_maior_ou_igual_0.5")
        if p["S"]>=.5:
            reasons.append("S_maior_ou_igual_0.5")
        boundary=entry["diagnostics"]["boundary_parameters"]
        if boundary:
            reasons.append("fronteira_numerica")
        if historical[skill]["classification"] not in ("A","B"):
            reasons.append("categoria_historica_restrita")
        if stability[skill]["parameter_wide"]:
            reasons.append("dominio_latente_com_intervalo_amplo")
        if stability[skill]["predictive_width_median"]>.1:
            reasons.append("incerteza_preditiva_maior_0.10")
        if historical[skill]["metrics"]["bkt"]["ece"]>.1:
            reasons.append("ece_habilidade_maior_0.10")
        result[skill]={"skill_id":skill,"namespace":"assistments_2009_2010",
                       "original_category":historical[skill]["classification"],"parameters":p,
                       "parameter_intervals":stability[skill]["bootstrap"]["parameters"],
                       "boundary":boundary,"plausibility_G":p["G"]<.5,"plausibility_S":p["S"]<.5,
                       "eligible_for_experimental_difficulty":not reasons,
                       "strategy":"bkt" if not reasons else "historico_suavizado",
                       "reasons":reasons}
    return result


def export():
    result=decisions()
    save(ROOT/"models/elegibilidade_integracao.json",{
        "policy_version":"m4_gate_1","skills":result,"enem_mapping_approved":False,
        "rules":{"G_lt":.5,"S_lt":.5,"boundary_forbidden":True,"parameter_wide_forbidden":True,
                 "predictive_width_max":.1,"ece_max":.1,"historical_categories":["A","B"]}})
    print("Elegíveis",sum(r["eligible_for_experimental_difficulty"] for r in result.values()),"/",len(result))
    return result


if __name__=="__main__":
    export()
