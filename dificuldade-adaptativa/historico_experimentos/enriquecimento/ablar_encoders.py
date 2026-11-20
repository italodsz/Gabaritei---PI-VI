import hashlib
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import torch
from sklearn.preprocessing import OneHotEncoder
from sklearn.svm import LinearSVC
from transformers import AutoModel

from experiments.fase_02_finetune import load_data, question_text, run, MODELS
from experiments.fase_02_treinamento import LABELS, target, score
from experiments.fase_02_comparar import paired_interval
from src.inferencia_finetune import Predictor

OUT=Path("enriquecimento")
BASE=Path("../base-oficial/Dataset/base_trabalho")
MINI="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
REV="e8f8c211226b894fcb81acc59f3b34ba3efd5f42"


def encode(model, tokenizer, rows, limit, text_fn, pool, head=None):
    vectors, labels = [], []
    model.eval()
    with torch.inference_mode(), torch.autocast("cuda", dtype=torch.float16):
        for i in range(0,len(rows),4):
            batch=tokenizer([text_fn(r) for r in rows[i:i+4]],padding=True,
                            truncation=True,max_length=limit,return_tensors="pt").to("cuda")
            batch.pop("token_type_ids",None)
            hidden=model(**batch).last_hidden_state
            mask=batch["attention_mask"].unsqueeze(-1)
            vectors.append((((hidden*mask).sum(1)/mask.sum(1)) if pool=="mean" else hidden[:,0]).float().cpu().numpy())
            if head is not None:
                labels.extend(head(hidden[:,0]).argmax(1).tolist())
    return np.concatenate(vectors),labels


def main():
    audit,train,val=load_data(BASE)
    y,truth=[np.array([LABELS.index(target(r,audit["difficulty_cutoffs"])) for r in rows]) for rows in (train,val)]
    def metadata(rows):
        return np.asarray([[r["pedagogy"].get("topic_predicted") or "<missing>",
                            f'{r["area"]}:{r["skill"]}' if r["skill"] else "<missing>"] for r in rows])
    mt,mv=map(metadata,(train,val))
    report={}
    def ablate(name,x,v):
        baseline=None
        report[name]={}
        for k,n in (("A_texto",0),("B_assunto",1),("C_habilidade",2)):
            tx,vx=x,v
            if n:
                enc=OneHotEncoder(handle_unknown="ignore",sparse_output=False).fit(mt[:,:n])
                tx=np.column_stack((x,enc.transform(mt[:,:n])))
                vx=np.column_stack((v,enc.transform(mv[:,:n])))
            pred=LinearSVC(random_state=42).fit(tx,y).predict(vx)
            if baseline is None:
                baseline=pred
            mention=np.array([any(word in r["question"].lower() for word in ("figura","gráfico","imagem","tabela")) for r in val])
            report[name][k]={**score([LABELS[i] for i in truth],[LABELS[i] for i in pred]),
                             "paired_ci_vs_text":paired_interval(truth,pred,baseline,1000),
                             "visual_proxy":{"n":int(mention.sum()),"errors":int((pred[mention]!=truth[mention]).sum()),
                             "other_n":int((~mention).sum()),"other_errors":int((pred[~mention]!=truth[~mention]).sum())}}
    path=Path("results/fase02r_minilm.npz")
    expected=json.loads(path.with_suffix(".json").read_bytes())["embedding_sha256"]
    assert hashlib.sha256(path.read_bytes()).hexdigest()==expected
    with np.load(path) as arr:
        for name,rows in (("train",train),("validation",val)):
            assert arr[f"{name}_ids"].tolist()==[r["id"] for r in rows]
        ablate("minilm_congelado",arr["train"],arr["validation"])
    bert=Path("results/ft_bert_512_7")
    assert hashlib.sha256((bert/"delta.pt").read_bytes()).hexdigest()==json.loads((bert/"execucao.json").read_bytes())["checkpoint_sha256"]
    predictor=Predictor(bert)
    x,_=encode(predictor.model.encoder,predictor.tokenizer,train,512,question_text,"cls")
    v,pred=encode(predictor.model.encoder,predictor.tokenizer,val,512,question_text,"cls",predictor.model.head)
    report["bert_checkpoint"] = score([LABELS[i] for i in truth],[LABELS[i] for i in pred])
    ablate("bert_ajustado",x,v)
    original=AutoModel.from_pretrained(predictor.metadata["model"],revision=predictor.metadata["revision"]).to("cuda")
    x,_=encode(original,predictor.tokenizer,train,512,question_text,"cls")
    v,_=encode(original,predictor.tokenizer,val,512,question_text,"cls")
    ablate("bert_congelado",x,v)
    del original,predictor
    MODELS["minilm_ablation"]=MINI
    run(SimpleNamespace(dataset=BASE,model="minilm_ablation",revision=REV,limit=128,seed=42,
                        lr=3e-5,batch=4,epochs=2,audit_only=False,inner_2022=False,stem_only=True))
    predictor=Predictor(Path("results/ft_minilm_ablation_128_42"))
    x,_=encode(predictor.model.encoder,predictor.tokenizer,train,128,lambda r:r["question"],"mean")
    v,_=encode(predictor.model.encoder,predictor.tokenizer,val,128,lambda r:r["question"],"mean")
    ablate("minilm_ajustado",x,v)
    (OUT/"ablacao_encoders.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    print({k:{m:round(x["macro_f1"],4) for m,x in v.items()} if k!="bert_checkpoint" else v["macro_f1"] for k,v in report.items()})


if __name__=="__main__":
    main()
