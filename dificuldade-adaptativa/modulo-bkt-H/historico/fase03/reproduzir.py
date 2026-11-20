import argparse
from pathlib import Path
from src.reproducao import reproduce

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    p.add_argument("python",type=Path)
    a=p.parse_args()
    reproduce(a.private.resolve(),a.python.resolve())
