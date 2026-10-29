import ast
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from rapidfuzz.fuzz import ratio

from pipeline import RAIZ, limpar_texto, extrair_alternativas, ler_registros

COLUNAS = [
    'record_id', 'source', 'source_file', 'source_row', 'source_id', 'year',
    'question_number', 'question_text', 'context_text', 'image_description',
    'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'answer',
    'vector_text', 'question_hash', 'vector_group_id', 'duplicate_count', 'canonical',
    'answer_conflict', 'option_variant_count',
    'embed_eligible', 'training_eligible', 'split', 'record_type', 'quality_flags',
]

def interpretar_linha(linha, fonte, caminho, indice):
    pergunta = limpar_texto(linha.get('question') or linha.get('question_stem') or linha.get('enunciado') or linha.get('statement') or linha.get('input') or (linha.get('description') if fonte == 'zenodo_questions' else ''))
    contexto = limpar_texto(linha.get('context'))
    descricao = linha.get('description') or linha.get('descricao') or linha.get('image_descriptions') or ''
    if isinstance(descricao, list):
        descricao = ' | '.join(limpar_texto(v) for v in descricao)
    descricao = limpar_texto(descricao)
    alternativas = extrair_alternativas(linha.get('choices') or linha.get('alternatives') or linha.get('alternatives_text') or linha.get('options'))
    if fonte == 'zenodo_questions':
        try:
            alternativas = [re.sub(r'^[A-E][).:-]\s*', '', limpar_texto(x)) for x in ast.literal_eval(linha.get('alternatives') or '[]')]
        except (ValueError, SyntaxError, TypeError):
            alternativas = []
    if fonte == 'ocr':
        alternativas = [limpar_texto(linha.get('option_' + k)) for k in 'abcde']
    if fonte == 'mm_eval':
        try:
            mensagens = json.loads(linha['messages']) if isinstance(linha.get('messages'), str) else linha['messages']
            primeiro = mensagens[0]
            pergunta = limpar_texto(primeiro.get('question'))
            alternativas = extrair_alternativas(primeiro.get('options') or primeiro.get('choices'))
        except (ValueError, KeyError, IndexError, TypeError):
            pass
    if fonte == 'audio_description':
        alternativas = []
    gabarito = limpar_texto(linha.get('answerKey') or linha.get('ground_truth') or linha.get('label') or linha.get('answer') or linha.get('correct_answer') or linha.get('gabarito') or linha.get('output')).upper()
    if fonte == 'sapiens_2025':
        correspondencia = re.match(r'^([A-E])\s*[).:-]', gabarito)
        gabarito = correspondencia.group(1) if correspondencia else ''
    ano_bruto = limpar_texto(linha.get('exam_year') or linha.get('year') or linha.get('ano') or linha.get('exam') or linha.get('exam_edition') or caminho.name)
    correspondencia = re.search(r'(?:19|20)\d{2}', ano_bruto)
    ano = correspondencia.group() if correspondencia else ''
    numero = limpar_texto(linha.get('question_number') or linha.get('questao') or linha.get('num') or linha.get('index_question') or '')
    id_fonte = limpar_texto(linha.get('id'))
    if not numero:
        correspondencia = re.search(r'(?:questao|q)[_ -]?(\d+)', id_fonte, re.I)
        numero = correspondencia.group(1) if correspondencia else ''
    pergunta_completa = limpar_texto(contexto + ' ' + pergunta) if contexto else pergunta
    problemas = []
    if len(pergunta_completa) < 40: problemas.append('short_or_missing_question')
    if len(alternativas) != 5 or any(not x for x in alternativas): problemas.append('incomplete_options')
    if gabarito not in 'ABCDE' or len(gabarito) != 1: problemas.append('invalid_answer')
    if not ano: problemas.append('missing_year')
    if linha.get('nullified'): problemas.append('nullified')
    if '[[placeholder]]' in pergunta_completa: problemas.append('visual_placeholder')
    if fonte in ('2025_d1', '2025_d2') and (linha.get('statement_image') is not None or linha.get('alternatives_images')): problemas.append('visual_asset')
    if fonte == 'ocr' and linha.get('has_images') and not linha.get('image_descriptions'): problemas.append('visual_asset')
    if fonte == 'audio_description': problemas.append('auxiliary_description')
    if fonte == 'sapiens_2025': problemas.append('answer_only_format')
    texto_normalizado = re.sub(r'\W+', '', pergunta_completa.casefold())
    hash_pergunta = hashlib.sha256(texto_normalizado.encode('utf-8')).hexdigest() if texto_normalizado else ''
    apto_vetorizacao = len(pergunta_completa) >= 40 and '[[placeholder]]' not in pergunta_completa
    apto_treino = apto_vetorizacao and len(alternativas) == 5 and all(alternativas) and len(gabarito) == 1 and gabarito in 'ABCDE' and bool(ano) and not linha.get('nullified') and not any(f in problemas for f in ('visual_asset', 'auxiliary_description', 'answer_only_format'))
    tipo = 'description' if fonte == 'audio_description' else ('question_answer' if fonte == 'sapiens_2025' else 'multiple_choice')
    id_registro = hashlib.sha256(f'{fonte}|{caminho.relative_to(RAIZ)}|{indice}'.encode()).hexdigest()[:20]
    return {
        'record_id': id_registro, 'source': fonte, 'source_file': str(caminho.relative_to(RAIZ)),
        'source_row': indice, 'source_id': id_fonte, 'year': ano,
        'question_number': numero, 'question_text': pergunta, 'context_text': contexto,
        'image_description': descricao,
        **{f'option_{k}': alternativas[i] if i < len(alternativas) else '' for i, k in enumerate('abcde')},
        'answer': gabarito, 'vector_text': pergunta_completa if apto_vetorizacao else '',
        'question_hash': hash_pergunta, 'vector_group_id': '', 'duplicate_count': 0, 'canonical': False,
        'answer_conflict': False, 'option_variant_count': 0,
        'embed_eligible': apto_vetorizacao, 'training_eligible': apto_treino, 'split': '',
        'record_type': tipo, 'quality_flags': '|'.join(problemas),
    }

def principal():
    manifesto = json.loads((RAIZ / 'manifests' / 'acquisition.json').read_text(encoding='utf-8'))
    linhas = []
    erros = []
    for item in manifesto['files']:
        caminho = RAIZ / item['path']
        try:
            for i, bruto in enumerate(ler_registros(caminho), 1):
                if isinstance(bruto, dict): linhas.append(interpretar_linha(bruto, item['source'], caminho, i))
        except Exception as exc:
            erros.append({'path': str(caminho), 'error': str(exc)})
    grupos = defaultdict(list)
    for linha in linhas:
        if linha['question_hash'] and linha['embed_eligible']:
            grupos[linha['question_hash']].append(linha)

    hashes = list(grupos)
    pais = {hash_atual: hash_atual for hash_atual in hashes}
    def encontrar_grupo(hash_atual):
        while pais[hash_atual] != hash_atual:
            pais[hash_atual] = pais[pais[hash_atual]]
            hash_atual = pais[hash_atual]
        return hash_atual
    def unir_grupos(primeiro_hash, segundo_hash):
        primeiro_hash, segundo_hash = encontrar_grupo(primeiro_hash), encontrar_grupo(segundo_hash)
        if primeiro_hash != segundo_hash:
            pais[max(primeiro_hash, segundo_hash)] = min(primeiro_hash, segundo_hash)
    def normalizar_aproximacao(valor):
        valor = unicodedata.normalize('NFKD', valor.casefold())
        valor = ''.join(c for c in valor if not unicodedata.combining(c))
        return re.sub(r'[^a-z0-9]+', '', valor)
    por_final = defaultdict(list)
    for hash_atual, grupo in grupos.items():
        amostra = grupo[0]
        texto_normalizado = normalizar_aproximacao(amostra['vector_text'])
        if len(texto_normalizado) >= 40:
            por_final[texto_normalizado[-40:]].append((hash_atual, texto_normalizado))
    pares_similares = 0
    for itens in por_final.values():
        for i, (hash_a, pergunta_a) in enumerate(itens):
            for hash_b, pergunta_b in itens[i + 1:]:
                if min(len(pergunta_a), len(pergunta_b)) / max(len(pergunta_a), len(pergunta_b)) < .93: continue
                if ratio(pergunta_a, pergunta_b, score_cutoff=97) >= 97:
                    unir_grupos(hash_a, hash_b)
                    pares_similares += 1
    agrupados = defaultdict(list)
    for hash_atual, grupo in grupos.items():
        agrupados[encontrar_grupo(hash_atual)].extend(grupo)
    linhas_unicas = []
    for grupo in agrupados.values():
        anos = [int(r['year']) for r in grupo if r['year']]
        ano_divisao = max(anos) if anos else 0
        divisao = 'test' if ano_divisao >= 2024 else ('validation' if ano_divisao == 2023 else ('train' if ano_divisao else 'unassigned'))
        gabaritos_validos = {r['answer'] for r in grupo if len(r['answer']) == 1 and r['answer'] in 'ABCDE'}
        conflito_gabarito = len(gabaritos_validos) > 1
        variantes_alternativas = len({tuple(r[f'option_{k}'] for k in 'abcde') for r in grupo if r['option_a']})
        for linha in grupo:
            linha['answer_conflict'] = conflito_gabarito
            linha['option_variant_count'] = variantes_alternativas
            if conflito_gabarito:
                linha['training_eligible'] = False
                linha['quality_flags'] = (linha['quality_flags'] + '|' if linha['quality_flags'] else '') + 'answer_conflict'

        grupo.sort(key=lambda r: (not r['training_eligible'], r['source'] == 'challenge_port', r['source'] == 'mm_eval', r['source'] == 'audio_description', r['source_file'], r['source_row']))
        grupo[0]['canonical'] = True
        linhas_unicas.append(grupo[0])
        id_grupo_vetorial = grupo[0]['question_hash']
        for linha in grupo:
            linha['vector_group_id'] = id_grupo_vetorial
            linha['duplicate_count'] = len(grupo)
            linha['split'] = divisao
    saida = RAIZ / 'processed'; saida.mkdir(exist_ok=True)
    for nome_arquivo, dados in [('enem_unificado.csv', linhas_unicas), ('enem_todas_ocorrencias.csv', linhas)]:
        with (saida / nome_arquivo).open('w', encoding='utf-8-sig', newline='') as fluxo:
            gravador = csv.DictWriter(fluxo, fieldnames=COLUNAS)
            gravador.writeheader(); gravador.writerows(dados)
    relatorio = {
        'source_rows': dict(Counter(r['source'] for r in linhas)),
        'total_source_rows': len(linhas),
        'exact_question_groups': len(grupos),
        'near_duplicate_pairs': pares_similares,
        'unique_questions': len(linhas_unicas),
        'embed_eligible_rows': sum(r['embed_eligible'] for r in linhas),
        'canonical_embed_rows': len(linhas_unicas),
        'training_eligible_rows': sum(r['training_eligible'] for r in linhas),
        'unique_training_eligible': sum(r['training_eligible'] for r in linhas_unicas),
        'answer_conflict_groups': sum(any(r['answer_conflict'] for r in grupo) for grupo in agrupados.values()),
        'quality_flags': dict(Counter(f for r in linhas for f in r['quality_flags'].split('|') if f)),
        'errors': erros,
    }
    (saida / 'unified_report.json').write_text(json.dumps(relatorio, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(relatorio, ensure_ascii=False))

if __name__ == '__main__': principal()
