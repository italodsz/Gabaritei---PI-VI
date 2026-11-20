"""Quatro "peças" de sinal por questão, usadas como bônus de ordem DENTRO do título (modo titulo_area).

  comando  – o que a questão pede: última frase do enunciado + alternativas (TF-IDF próprio)
  nomes    – nomes-chave: autor/artista citado, nomes próprios, século/época, unidades, fórmulas
  formato  – formato das alternativas: número, %, dinheiro, expressão, resposta curta, frase
  genero   – gênero do texto-base: canção, poema, charge, propaganda, crônica, notícia...

Nada aqui lê gabarito, habilidade ou TRI. Tudo sai do texto da questão e das alternativas.
"""
import re, unicodedata
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import pipeline_baseline as bl

PECAS = ('comando', 'nomes', 'formato', 'genero', 'resposta', 'epoca', 'escala')
_SUB = str.maketrans('₀₁₂₃₄₅₆₇₈₉', '0123456789')


def _sa(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


def comando(q):
    t = bl.clean(q.get('question') or '')
    fr = [f for f in re.split(r'(?<=[.!?:”"\)])\s+(?=[A-ZÀ-Ú“"])', t) if f.strip()]
    cmd = fr[-1] if fr else ''
    if len(cmd) < 40 and len(fr) > 1:
        cmd = fr[-2] + ' ' + cmd
    ops = ' '.join(bl.clean(o.get('text') or '') for o in sorted(q.get('options') or [], key=lambda x: x['label']))
    return (cmd[-400:] + ' ' + ops).strip()


_PARADA = set('''Acesso Disponível Adaptado Brasil Texto Considerando Nesse Nessa Essa Esse Esses Essas Para Segundo Como Qual
Quais Uma Com Esta Este Estes Estas Sabe Suponha Considere Após Assim Além Ainda Apesar Entre Quando Sobre Desde Porém
Mas Isso Aquele Aquela Cada Muitos Muitas Outro Outra Todos Todas Também Paulo Janeiro Editora Revista Folha Jornal
Companhia Letras Universidade Edusp Fragmento Atual Moderna Scipione Saraiva Record Vozes Martins Fontes Cultrix Unesp
Unicamp Zahar Contexto Ática Globo Nova Fronteira Brasiliense Perspectiva Loyola Campus Hucitec Annablume Cortez
Instituto Ministério Nacional Federal Estado Governo País Figura Tabela Quadro Gráfico Gabarito Enem Inep'''.split())
_UNID = r'(km/h|m/s²|m/s2|m/s|kwh|kw|mw|hz|khz|mhz|°c|ºc|kelvin|cal|kcal|joule|kj|newton|volt|volts|ampere|ampères|ohm|ohms|ω|watt|watts|atm|pascal|mol/l|g/mol|g/l|mol|ppm|ph|nm|μm|mm|cm³|cm3|ml|litro|litros|kg|mg|db|lux|tesla|coulomb|ev|sv|bq|hectare|hectares|km²|km2|m²|m2|m³|m3|graus|grau|radiano|radianos|por cento|%)'
_ROM = {'i': 1, 'v': 5, 'x': 10}


def _romano(s):
    v = [_ROM[c] for c in s.lower()]
    return sum(-a if k + 1 < len(v) and a < v[k + 1] else a for k, a in enumerate(v))


def nomes(q):
    t = bl.clean(q.get('question') or '').translate(_SUB)
    ops = ' '.join(bl.clean(o.get('text') or '') for o in q.get('options') or []).translate(_SUB)
    tudo = t + ' . ' + ops
    out = []
    # autor/artista na fonte: "KANT, I." / "PORTINARI, C." / "BOB DYLAN." (maiúsculas)
    for m in re.finditer(r'\b([A-ZÀ-Ú][A-ZÀ-Ú\'’\-]{2,})(?:\s+[A-ZÀ-Ú][A-ZÀ-Ú\'’\-]{2,})?,\s*(?:[A-Z]\.|[A-ZÀ-Ú][a-zà-ú]+)', t):
        out += ['autor_' + _sa(m.group(1))] * 3
    # nomes próprios no meio da frase
    for m in re.finditer(r'(?<![.!?:”"\)\]]\s)(?<!^)\b([A-ZÀ-Ú][a-zà-ú]{3,})\b', tudo):
        w = m.group(1)
        if w not in _PARADA:
            out.append('nome_' + _sa(w))
    # sobrenome em maiúsculas vira também nome (Kant no texto <-> KANT na fonte)
    out += ['nome_' + a[6:] for a in set(out) if a.startswith('autor_')]
    # época: século e ano (anos de publicação recentes e datas de acesso ficam de fora)
    for m in re.finditer(r'[Ss]éculos?\s+([IVX]{1,5})(?:\s*(?:e|ao?|-)\s*([IVX]{1,5}))?', tudo):
        for g in m.groups():
            if g:
                out += ['sec_%d' % _romano(g)] * 2
    sem_acesso = re.sub(r'(Acesso em|Disponível em)[^.]*\.', ' ', tudo)
    for m in re.finditer(r'\b(1[0-9]{3})\b', sem_acesso):
        a = int(m.group(1))
        if a < 1990:
            out += ['sec_%d' % (a // 100 + 1), 'dec_%d' % (a // 10)]
    # unidades e fórmulas (Física e Química)
    for m in re.finditer(r'(?<![a-zà-ú])' + _UNID + r'(?![a-zà-ú])', tudo.lower()):
        out.append('un_' + m.group(1).replace(' ', ''))
    for m in re.finditer(r'\b((?:[A-Z][a-z]?\d*){2,}|[A-Z][a-z]?\d+)\b', tudo):
        f = m.group(1)
        if re.search(r'\d', f) or f in ('HCl', 'NaOH', 'NaCl', 'KOH', 'CO', 'NO', 'HF', 'KCl', 'CaO', 'NaF'):
            out.append('form_' + f)
    return ' '.join(out)


def formato(q):
    ops = [bl.clean(o.get('text') or '').translate(_SUB) for o in q.get('options') or []]
    ops = [o for o in ops if o]
    if len(ops) < 4:
        return 'sem_texto'
    j = ' '.join(ops)
    num = [bool(re.fullmatch(r'[\sR$\d.,\-+/×x%°ºeE]*\d[\sR$\d.,\-+/×x%°º]*\s*[a-zA-Zμ/²³°º%$ ]{0,12}', o)) for o in ops]
    if sum(num) >= 4:
        if 'R$' in j or re.search(r'\breais\b', j): return 'dinheiro'
        if '%' in j or 'por cento' in j: return 'porcentagem'
        return 'numero'
    if sum(bool(re.search(r'[=+^√]|\\frac|\bx\b|[a-z]\s*[²³]|\d\s*[a-z]\b', o)) for o in ops) >= 4 and np.mean([len(o) for o in ops]) < 45:
        return 'expressao'
    pal = np.mean([len(o.split()) for o in ops])
    return 'curta' if pal <= 3 else 'frase'


_GEN = [('cancao', r'can[cç][aã]o|letra d[ae] m[uú]sica|\bsong\b|lyrics|canci[oó]n|samba|\brap\b'),
        ('poema', r'poema|eu l[ií]rico|soneto|versos?\b|estrofe|\bpoem\b|po[eé]tic'),
        ('quadrinho', r'charge|cartum|tirinha|quadrinho|cartoon|vi[ñn]eta|hist[oó]rieta'),
        ('publicidade', r'propaganda|publicit|an[uú]ncio|campanha|cartaz|peça publicit|slogan'),
        ('cronica', r'cr[oô]nica'),
        ('noticia', r'not[ií]cia|reportagem|manchete|jornal[ií]stic'),
        ('opiniao', r'artigo de opini[aã]o|editorial|resenha|argumentativ|ponto de vista|tese'),
        ('narrativa', r'romance|conto\b|narrador|narrativ|personagem|fragmento'),
        ('carta', r'\bcarta\b|e-mail|depoimento|relato|biografi|di[aá]rio'),
        ('instrucional', r'verbete|manual|receita|bula|regulamento|lei\b|estatuto|infogr[aá]fico'),
        ('teatro', r'teatr|dramaturg|encena'),
        ('visual', r'pintura|tela\b|quadro\b|escultura|fotografia|gravura|instala[cç][aã]o|grafite|obra de arte'),
        ('corpo', r'dan[cç]a|esporte|gin[aá]stica|jogo|luta|futebol|ol[ií]mpi')]


def genero(q):
    t = bl.clean(q.get('question') or '').lower()
    return ' '.join(n for n, rx in _GEN if re.search(rx, t))


def resposta(q):
    """Texto da alternativa correta (usa o gabarito: diz o conceito cobrado, ex. 'imperativo categórico')."""
    for o in q.get('options') or []:
        if o.get('label') == q.get('answer'):
            return bl.clean(o.get('text') or '')
    return ''

# ---- época (História): período histórico a partir de séculos, anos e termos de período ----
_PER = [('antiguidade_grecia', r'gr[eé]ci|grego|atenas|esparta|p[oó]lis|helen'),
        ('antiguidade_roma', r'\broma\b|roman|imp[eé]rio romano|rep[uú]blica romana|c[eé]sar'),
        ('antiguidade_oriente', r'egit|mesopot[aâ]mi|fara[oó]|hebreu|fen[ií]ci|persa'),
        ('medieval', r'idade m[eé]dia|medieva|feudal|feudo|vassal|servo|cruzad|igreja cat[oó]lica medieval|carol[ií]ngio|burgos'),
        ('moderna', r'renascen|reforma protestante|lutero|absolutis|mercantilis|grandes navega|iluminis|ilustra[cç][aã]o'),
        ('america_conquista', r'conquista da am[eé]rica|astec|inca|maia|ind[ií]genas? da am[eé]rica|colonizadores espanh'),
        ('colonia', r'col[oô]nia|colonial|capitania|sesmaria|engenho|bandeirante|jesu[ií]ta|ciclo do ouro|minera[cç][aã]o colonial|inconfid'),
        ('imperio', r'imp[eé]rio do brasil|d\. pedro|dom pedro|regência|regencia|segundo reinado|primeiro reinado|independ[eê]ncia do brasil|aboli[cç]|escravid[aã]o|lei [aá]urea'),
        ('revolucoes_xviii_xix', r'revolu[cç][aã]o francesa|revolu[cç][aã]o industrial|napole[aã]o|liberalismo|socialismo|oper[aá]rio|imperialismo|neocolonial'),
        ('republica_velha', r'rep[uú]blica velha|primeira rep[uú]blica|coronelis|caf[eé] com leite|canudos|contestado|revolta da vacina|tenentis'),
        ('vargas', r'vargas|estado novo|era vargas|revolu[cç][aã]o de 1930|trabalhis|clt\b'),
        ('guerras_mundiais', r'primeira guerra|segunda guerra|guerra mundial|nazis|fascis|holocausto|totalitar'),
        ('guerra_fria', r'guerra fria|urss|sovi[eé]tic|socialismo real|muro de berlim|descoloniza'),
        ('ditadura', r'ditadura|regime militar|golpe de 1964|ai-5|anistia|diretas j[aá]|redemocratiza'),
        ('nova_republica', r'constitui[cç][aã]o de 1988|nova rep[uú]blica|impeachment|neoliberal')]

def epoca(q):
    t = bl.clean(q.get('question') or '') + ' . ' + ' '.join(bl.clean(o.get('text') or '') for o in q.get('options') or [])
    tl = t.lower(); out = [n for n, rx in _PER if re.search(rx, tl)]
    for m in re.finditer(r'[Ss]éculos?\s+([IVX]{1,5})', t):
        out += ['sec_%d' % _romano(m.group(1))] * 2
    sem = re.sub(r'(Acesso em|Disponível em)[^.]*\.', ' ', t)
    sem = re.sub(r'[A-ZÀ-Ú][A-Za-zÀ-ú\.,;: ]{0,80}\b(19[0-9]{2}|20[0-9]{2})\b\s*(\(adaptado\)|\(fragmento\))?\.?\s*$', ' ', sem)
    for m in re.finditer(r'\b(1[0-9]{3})\b', sem):
        a = int(m.group(1))
        if a < 1990: out += ['sec_%d' % (a // 100 + 1), 'dec_%d' % (a // 10)]
    return ' '.join(out)

# ---- escala (Geografia): Brasil x mundo, região e recorte ----
_ESC = [('brasil', r'\bbrasil|brasileir|nacional\b|ibge'),
        ('mundo', r'mundial|global|planeta|pa[ií]ses|internacional|continente'),
        ('amazonia', r'amaz[oô]n|norte do pa[ií]s|floresta tropical'),
        ('nordeste_semiarido', r'nordeste|semi[aá]rid|sert[aã]o|caatinga|seca\b'),
        ('centro_oeste_cerrado', r'centro-oeste|cerrado|mato grosso|goi[aá]s|pantanal'),
        ('sul_sudeste', r'sudeste|\bsul do|s[aã]o paulo|rio de janeiro|minas gerais|paran[aá]'),
        ('africa', r'[aá]frica|saara|sahel'), ('europa', r'europ|uni[aã]o europeia'),
        ('eua', r'estados unidos|norte-americ|eua\b'), ('asia', r'china|chin[eê]s|[aá]sia|jap[aã]o|[ií]ndia'),
        ('america_latina', r'am[eé]rica latina|mercosul|argentin|chile|bol[ií]via|venezuel'),
        ('oriente_medio', r'oriente m[eé]dio|[aá]rabe|s[ií]ria|israel|palestin|petr[oó]leo'),
        ('urbano', r'cidade|urban|metr[oó]pol|periferi|favela'), ('rural', r'campo\b|rural|agr[aá]ri|agroneg|latif[uú]ndi'),
        ('oceano_litoral', r'oceano|litor|costa\b|mar\b|marinh')]

def escala(q):
    t = (bl.clean(q.get('question') or '') + ' . ' + ' '.join(bl.clean(o.get('text') or '') for o in q.get('options') or [])).lower()
    return ' '.join(n for n, rx in _ESC if re.search(rx, t))


class Sinais:
    """Matrizes de cada peça para todos os documentos do índice (ajustadas só no treino)."""
    def __init__(self, ix):
        qs = [ix.rows[d['id']] for d in ix.docs]
        tr = [k for k, d in enumerate(ix.docs) if d['split'] == 'train']
        def mat(textos, **kw):
            v = TfidfVectorizer(norm='l2', dtype=np.float32, **kw).fit([textos[k] for k in tr])
            return v.transform(textos)
        self.M = {
            'comando': mat([comando(q) for q in qs], ngram_range=(1, 2), min_df=2, sublinear_tf=True, strip_accents='unicode'),
            'nomes': mat([nomes(q) for q in qs], min_df=2, max_df=0.05, sublinear_tf=True, token_pattern=r'\S+', lowercase=False),
            'genero': mat([genero(q) for q in qs], token_pattern=r'\S+'),
            'epoca': mat([epoca(q) for q in qs], token_pattern=r'\S+', sublinear_tf=True),
            'escala': mat([escala(q) for q in qs], token_pattern=r'\S+'),
        }
        self.fmt = np.array([formato(q) for q in qs])

    def escore(self, peca, qi, pool):
        if peca == 'resposta':
            raise ValueError('O recomendador não usa gabarito como sinal de busca.')
        if peca == 'formato':
            return (self.fmt[pool] == self.fmt[qi]).astype(float) if self.fmt[qi] != 'sem_texto' else np.zeros(len(pool))
        M = self.M[peca]
        return (M[pool] @ M[qi].T).toarray().ravel()
