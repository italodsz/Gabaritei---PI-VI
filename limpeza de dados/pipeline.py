import argparse
import ast
import csv
import hashlib
import json
import re
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
FONTES = {
    'maritaca': 'maritaca-ai/enem',
    'challenge': 'eduagarcia/enem_challenge',
    'audio_description': 'tardellirs/enem-audiodescricao',
    'ocr': 'candido-ai/enem-ocr',
    '2025_d1': 'rlimazzz/enem-2025-d1-multimodal',
    '2025_d2': 'rlimazzz/enem-2025-d2-multimodal',
    'sapiens_2025': 'sapiens-technology/enem_2025',
    'mm_eval': 'mm-eval/ENEM',
    'challenge_port': 'nicholasKluge/enem_challenge',
}
CABECALHOS = {'User-Agent': 'data-EEnem-research/1.0'}

def abrir_url(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=CABECALHOS), timeout=90)

def baixar_arquivo(url, caminho):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    if caminho.exists() and caminho.stat().st_size:
        return
    temporario = caminho.with_name(caminho.name + '.part')
    with abrir_url(url) as resposta, temporario.open('wb') as saida:
        while bloco := resposta.read(1024 * 1024):
            saida.write(bloco)
    temporario.replace(caminho)

def calcular_sha256(caminho):
    resumo = hashlib.sha256()
    with caminho.open('rb') as fluxo:
        while bloco := fluxo.read(1024 * 1024):
            resumo.update(bloco)
    return resumo.hexdigest()

def baixar_fontes():
    manifesto = {'retrieved_at_utc': datetime.now(timezone.utc).isoformat(), 'files': [], 'errors': []}
    for rotulo, repositorio in FONTES.items():
        try:
            informacoes = json.load(abrir_url('https://huggingface.co/api/datasets/' + repositorio))
            revisao = informacoes['sha']
            for entrada in informacoes.get('siblings', []):
                nome = entrada['rfilename']
                if not (nome.endswith(('.jsonl', '.parquet', '.csv')) and (nome.startswith('data/') or nome.startswith('corpus/') or '/' not in nome)):
                    continue
                if rotulo == 'audio_description' and nome.startswith('corpus/') and nome != 'corpus/registros.jsonl':
                    continue
                caminho = RAIZ / 'raw' / rotulo / nome
                url = f'https://huggingface.co/datasets/{repositorio}/resolve/{revisao}/{nome}'
                try:
                    baixar_arquivo(url, caminho)
                    manifesto['files'].append({'source': rotulo, 'repo': repositorio, 'revision': revisao, 'path': str(caminho.relative_to(RAIZ)), 'url': url, 'bytes': caminho.stat().st_size, 'sha256': calcular_sha256(caminho)})
                except Exception as exc:
                    manifesto['errors'].append({'source': rotulo, 'file': nome, 'error': str(exc)})
        except Exception as exc:
            manifesto['errors'].append({'source': rotulo, 'error': str(exc)})
    try:
        espelho = 'https://raw.githubusercontent.com/wineone/tcc-matheus-lisboa/main/02-dataset/data/cleaned/enem_questions.zip'
        arquivo_compactado = RAIZ / 'raw' / 'zenodo_8301716' / 'enem_questions.zip'
        baixar_arquivo(espelho, arquivo_compactado)
        md5_esperado = '0389950866be9f8466e2016dcad311be'
        if hashlib.md5(arquivo_compactado.read_bytes()).hexdigest() != md5_esperado:
            raise ValueError('O MD5 do arquivo Zenodo não corresponde ao registro publicado')
        with zipfile.ZipFile(arquivo_compactado) as pacote:
            dados = pacote.read('all_questions_df.csv')
        caminho = arquivo_compactado.parent / 'all_questions_df.csv'
        caminho.write_bytes(dados)
        manifesto['files'].append({'source': 'zenodo_questions', 'repo': 'zenodo:8301716', 'revision': '0.0.1', 'path': str(caminho.relative_to(RAIZ)), 'url': 'https://zenodo.org/records/8301716', 'download_mirror': espelho, 'archive_md5': md5_esperado, 'bytes': caminho.stat().st_size, 'sha256': calcular_sha256(caminho)})
    except Exception as exc:
        manifesto['errors'].append({'source': 'zenodo_questions', 'error': str(exc)})
    caminho = RAIZ / 'manifests' / 'acquisition.json'
    caminho.parent.mkdir(exist_ok=True)
    caminho.write_text(json.dumps(manifesto, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifesto

def ler_registros(caminho):
    if caminho.suffix == '.jsonl':
        with caminho.open(encoding='utf-8') as fluxo:
            for linha in fluxo:
                if linha.strip():
                    yield json.loads(linha)
    elif caminho.suffix == '.csv':
        with caminho.open(encoding='utf-8-sig', newline='') as fluxo:
            yield from csv.DictReader(fluxo)
    elif caminho.suffix == '.parquet':
        import pyarrow.parquet as pq
        leitor = pq.ParquetFile(caminho)
        for lote in leitor.iter_batches(batch_size=512):
            yield from lote.to_pylist()

def limpar_texto(valor):
    return re.sub(r'\s+', ' ', str(valor or '')).strip()

def extrair_alternativas(valor):
    if isinstance(valor, dict):
        if all(k in valor for k in 'ABCDE'):
            return [limpar_texto(valor[k]) for k in 'ABCDE']
        valor = valor.get('text') or valor.get('alternatives') or valor.get('choices') or valor
    if isinstance(valor, list):
        return [limpar_texto(v.get('text') if isinstance(v, dict) else v) for v in valor]
    return []

def normalizar_questao(linha, fonte, caminho, indice):
    pergunta = limpar_texto(linha.get('question') or linha.get('question_stem') or linha.get('enunciado') or linha.get('pergunta') or linha.get('statement') or (linha.get('description') if fonte == 'zenodo_questions' else ''))
    if fonte == 'ocr': pergunta = limpar_texto(linha.get('context')) + ' ' + pergunta
    alternativas = extrair_alternativas(linha.get('choices') or linha.get('alternatives') or linha.get('alternatives_text') or linha.get('options'))
    if fonte == 'zenodo_questions':
        try:
            alternativas = [re.sub(r'^[A-E][).:-]\s*', '', limpar_texto(x)) for x in ast.literal_eval(linha.get('alternatives') or '[]')]
        except (ValueError, SyntaxError, TypeError):
            alternativas = []
    if fonte == 'ocr': alternativas = [limpar_texto(linha.get('option_' + x)) for x in 'abcde']
    if fonte == 'mm_eval':
        try:
            mensagem = json.loads(linha['messages']) if isinstance(linha.get('messages'), str) else linha['messages']
            primeiro = mensagem[0]
            pergunta = limpar_texto(primeiro.get('question'))
            alternativas = extrair_alternativas(primeiro.get('alternatives') or primeiro.get('choices') or primeiro.get('options'))
        except (ValueError, KeyError, IndexError, TypeError): pass
    gabarito = limpar_texto(linha.get('answerKey') or linha.get('ground_truth') or linha.get('label') or linha.get('answer') or linha.get('correct_answer') or linha.get('gabarito')).upper()
    ano = limpar_texto(linha.get('exam_year') or linha.get('year') or linha.get('ano') or linha.get('exam') or linha.get('exam_edition') or (re.search(r'(?:19|20)\d{2}', str(caminho)) or [''])[0])
    correspondencia_ano = re.search(r'(?:19|20)\d{2}', ano)
    ano = correspondencia_ano.group() if correspondencia_ano else ''
    numero = limpar_texto(linha.get('question_number') or linha.get('questao') or linha.get('num') or linha.get('number') or linha.get('numero') or linha.get('index_question') or '')
    if not numero:
        correspondencia = re.search(r'(?:questao|q)[_ -]?(\d+)', limpar_texto(linha.get('id')), re.I)
        numero = correspondencia.group(1) if correspondencia else ''
    problemas = []
    if len(pergunta) < 40: problemas.append('short_or_missing_question')
    if len(alternativas) != 5 or any(not x for x in alternativas): problemas.append('incomplete_options')
    if gabarito not in 'ABCDE' or len(gabarito) != 1: problemas.append('invalid_answer')
    if not re.fullmatch(r'(?:19|20)\d{2}', ano): problemas.append('missing_year')
    if linha.get('nullified'): problemas.append('nullified')
    if '[[placeholder]]' in pergunta or (fonte in ('2025_d1', '2025_d2') and linha.get('statement_image') is not None):
        problemas.append('needs_visual_review')
    texto_normalizado = re.sub(r'\W+', '', pergunta.casefold())
    impressao_digital = hashlib.sha256(texto_normalizado.encode()).hexdigest() if texto_normalizado else ''
    return {'source': fonte, 'source_file': str(caminho.relative_to(RAIZ)), 'source_row': indice, 'source_id': limpar_texto(linha.get('id')), 'year': ano, 'question_number': numero, 'question': pergunta, 'options': alternativas, 'answer': gabarito, 'fingerprint': impressao_digital, 'quality_flags': problemas}

def processar_dados():
    manifesto = json.loads((RAIZ / 'manifests' / 'acquisition.json').read_text(encoding='utf-8'))
    saida = RAIZ / 'processed'; saida.mkdir(exist_ok=True)
    contagens = Counter(); aprovados = []; quarentena = []
    agrupados = defaultdict(list)
    for item in manifesto['files']:
        caminho = RAIZ / item['path']
        try:
            for indice, linha in enumerate(ler_registros(caminho), 1):
                if not isinstance(linha, dict): continue
                registro = normalizar_questao(linha, item['source'], caminho, indice)
                contagens[item['source']] += 1
                if registro['quality_flags']:
                    quarentena.append(registro)
                else:
                    agrupados[registro['fingerprint']].append(registro)
        except Exception as exc:
            quarentena.append({'source': item['source'], 'source_file': item['path'], 'quality_flags': ['read_error'], 'error': str(exc)})
    for grupo in agrupados.values():
        if len({r['answer'] for r in grupo}) > 1:
            for registro in grupo:
                registro['quality_flags'].append('answer_conflict')
                quarentena.append(registro)
            continue
        ano_grupo = max(int(r['year']) for r in grupo)
        divisao_grupo = 'test' if ano_grupo >= 2024 else ('validation' if ano_grupo == 2023 else 'train')
        for posicao, registro in enumerate(grupo):
            registro['duplicate_count'] = len(grupo)
            registro['primary'] = posicao == 0
            registro['split'] = divisao_grupo
            aprovados.append(registro)
    def gravar_jsonl(nome, linhas):
        with (saida / nome).open('w', encoding='utf-8') as fluxo:
            for linha in linhas:
                fluxo.write(json.dumps(linha, ensure_ascii=False, default=str) + '\n')
    gravar_jsonl('questions_all.jsonl', aprovados)
    gravar_jsonl('quarantine.jsonl', quarentena)
    gravar_jsonl('train.jsonl', [r for r in aprovados if r['primary'] and r['split'] == 'train'])
    gravar_jsonl('validation.jsonl', [r for r in aprovados if r['primary'] and r['split'] == 'validation'])
    gravar_jsonl('test.jsonl', [r for r in aprovados if r['primary'] and r['split'] == 'test'])
    relatorio = {'raw_rows_by_source': contagens, 'accepted_with_duplicates': len(aprovados), 'unique_questions': sum(r['primary'] for r in aprovados), 'quarantined': len(quarentena), 'split_counts': dict(Counter(r['split'] for r in aprovados if r['primary'])), 'quality_flags': dict(Counter(f for r in quarentena for f in r['quality_flags']))}
    (saida / 'quality_report.json').write_text(json.dumps(relatorio, ensure_ascii=False, indent=2), encoding='utf-8')
    return relatorio

if __name__ == '__main__':
    analisador = argparse.ArgumentParser(); analisador.add_argument('acao', choices=['baixar', 'processar', 'tudo']); argumentos = analisador.parse_args()
    if argumentos.acao in ('baixar', 'tudo'): print(json.dumps(baixar_fontes(), ensure_ascii=False, default=str)[:1000])
    if argumentos.acao in ('processar', 'tudo'): print(json.dumps(processar_dados(), ensure_ascii=False, default=str))
