import argparse
from io import BytesIO
from pathlib import Path
import struct
import subprocess
import zlib


def fetch(url, interval):
    result=subprocess.run(["curl.exe","-fsSL","--retry","1","--max-time","15",
                           "-r",interval,"-D","-",url],capture_output=True,check=True)
    head,body=result.stdout.split(b"\r\n\r\n",1)
    if b" 206 " not in head.splitlines()[0]:
        raise ValueError("Servidor não retornou intervalo parcial.")
    return body


def extract(year, destination):
    url=f"https://download.inep.gov.br/microdados/microdados_enem_{year}.zip"
    tail=fetch(url,"-65557")
    end=tail.rindex(b"PK\x05\x06")
    size,offset=struct.unpack_from("<II",tail,end+12)
    if size==0xffffffff or offset==0xffffffff:
        raise ValueError("ZIP64 não suportado.")
    directory=BytesIO(fetch(url,f"{offset}-{offset+size-1}"))
    while header:=directory.read(46):
        if header[:4]!=b"PK\x01\x02":
            raise ValueError("Diretório ZIP inválido.")
        compression=struct.unpack_from("<H",header,10)[0]
        crc,size=struct.unpack_from("<II",header,16)
        name_len,extra_len,comment_len=struct.unpack_from("<HHH",header,28)
        start=struct.unpack_from("<I",header,42)[0]
        name=directory.read(name_len).decode("cp437")
        directory.read(extra_len+comment_len)
        if Path(name).name.upper()!=f"ITENS_PROVA_{year}.CSV":
            continue
        local=fetch(url,f"{start}-{start+29}")
        if local[:4]!=b"PK\x03\x04":
            raise ValueError("Entrada ZIP inválida.")
        file_len,extra=struct.unpack_from("<HH",local,26)
        start+=30+file_len+extra
        compressed=fetch(url,f"{start}-{start+size-1}")
        data=zlib.decompress(compressed,-15) if compression==8 else compressed
        if zlib.crc32(data)!=crc:
            raise ValueError("CRC divergente na tabela.")
        destination.mkdir(parents=True,exist_ok=True)
        output=destination/f"ITENS_PROVA_{year}.csv"
        output.write_bytes(data)
        print(year, output, len(data))
        return
    raise ValueError(f"Tabela de {year} não localizada.")


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("year",type=int)
    parser.add_argument("destination",type=Path)
    args=parser.parse_args()
    extract(args.year,args.destination)
