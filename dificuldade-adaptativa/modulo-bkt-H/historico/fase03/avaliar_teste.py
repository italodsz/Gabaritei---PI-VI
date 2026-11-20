import argparse
from pathlib import Path
from src.avaliacao import final_evaluation

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    p.add_argument("local",type=Path)
    a=p.parse_args()
    final_evaluation(a.private.resolve(),a.local.resolve())
