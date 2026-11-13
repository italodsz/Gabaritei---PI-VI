"""Consolida números verificados da entrega na documentação corrente."""
import json
from pathlib import Path

R=Path(__file__).resolve().parent
O=R/'resultados/base_final'

def main():
    a=json.loads((O/'auditoria_entrega.json').read_text(encoding='utf-8'))
    before=json.loads((O/'avaliacao_antes.json').read_text(encoding='utf-8'))
    after=json.loads((O/'avaliacao_depois.json').read_text(encoding='utf-8'))
    p=R/'RELATORIO_BASE_FINAL.md'; s=p.read_text(encoding='utf-8')
    marker='Números finais, hashes, comparação de validação e estado da publicação serão\nregistrados após concluir a geração e a auditoria.'
    motivos='; '.join(f'{n}: {motivo}' for motivo,n in a['motivos_vazias'].items())
    details=f'''### Resultado verificado

- Catálogo: {a['questoes']} questões, até 50 sugestões por lista.
- Listas vazias: {a['listas_vazias']}: {motivos}.
- Mediana do tamanho: {a['mediana_tamanho']:g}; menor lista não vazia: {a['minimo_nao_vazio']}.
- Nenhuma sugestão é a própria questão, da própria família, de família já sugerida,
  marcada com defeito ou duplicata, de outra matéria/título ou de língua incompatível.
- Alinhamento exato de IDs nos documentos, MiniLM, TF-IDF e Qwen; vetores finitos,
  com dimensões esperadas e normas próximas de 1. Novo ajuste independente do TF-IDF com
  somente o treino reproduziu o vocabulário e os valores IDF exatamente.
- Qwen SHA-256: `{a['qwen_sha256']}`.
- Ambiente e hashes de todos os índices: resultados/base_final/ambiente_indices.json.
- Auditoria completa: resultados/base_final/auditoria_entrega.json.

A lista vazia sem defeito é gq_1a3a6d4a138f7ba1fba29cef (2009, questão 69):
o texto de Lúcio Cardoso e o rótulo herdado são de Literatura/Modernismo, mas a base
informa área CH. O filtro de área não encontra outra questão desse título em CH.
Essa divergência foi preservada para revisão no dataset; não se forçou um assunto
de Humanas em um texto literário nem se retirou o filtro do método.

O encode de Qwen normaliza em baixa precisão e grava float32. Suas normas ficaram
entre {a['normas_vetores']['qwen']['minimo']:.7f} e {a['normas_vetores']['qwen']['maximo']:.7f};
os vetores anteriores variavam de 0,9964104 a 1,0038823. Todas as coordenadas novas
são representáveis em bfloat16. Foi usada tolerância absoluta de 0,005 na auditoria
do Qwen e 0,00002 no MiniLM. Nenhum vetor foi renormalizado depois da geração,
preservando o comportamento de produto escalar do método anterior.

### Validação de desenvolvimento

| Método | Antes | Depois |
|---|---:|---:|
'''
    for method in before:
        b=before[method]; d=after[method]
        details+=f"| {method} | {b['certos']}/{b['comparacoes']} | {d['certos']}/{d['comparacoes']} |\n"
    details+=f'''
O README histórico registra RRF 34/44, TF-IDF 30/44, MiniLM 24/44 e rrf_qwen 39/44.
A reprodução no código de a7b5b8c deu RRF 33/44, TF-IDF 30/44, MiniLM 24/44 e
rrf_qwen 39/44. Essa diferença do RRF foi registrada, sem alterar a evidência antiga.
O README não publicava resultado nesses pares para titulo_area; foi medida a origem
com o mesmo método: 8/10. O filtro de título elimina candidatos de muitos pares,
por isso 10 não é diretamente comparável a 44. Mudanças de denominador também
impedem interpretar a tabela como ganho isolado de ordenação.

Pares de desenvolvimento afetados: {a['pares_afetados']} linhas, listadas em
resultados/base_final/pares_desenvolvimento_afetados.json. São listados separadamente
IDs fora das elegíveis e textos alterados; nenhuma nota foi modificada.

Comparação sem notas: resultados/base_final/comparacao_20_validacao.md apresenta
20 questões de 2023 sorteadas com semente 20261113 e os cinco primeiros IDs antes
e depois, lado a lado, indicando mudanças e sugestões vindas dos resgates.
Questões que não eram elegíveis antes aparecem como sem consulta anterior.
O teste de 2024 não foi usado para selecionar filtros, pesos ou configuração;
seus registros apenas foram classificados, codificados e incluídos no catálogo
conforme o escopo solicitado.

### Entrega e pendências

Branch exclusiva: recomendador-base-final, originada de a7b5b8c. Commits por etapa,
todos com autoria de Ítalo de Souza <italopropriedades@gmail.com>.
Trabalho feito em cópia separada para preservar as alterações locais do clone
original. As branches recomendador, dataset e main não receberam commits nem push.

Pendências do grupo: conferir as 100 linhas da amostra, revisar os defeitos e as
ressalvas no dataset de origem e confirmar casos de fronteira dos rótulos. Essas
pendências não foram preenchidas como se fossem validação humana já realizada.
Nenhuma etapa de índice ou catálogo ficou sem execução.

Para reproduzir a comparação anterior, a partir da raiz do repositório:
`git worktree add --detach ../Gabaritei-base-final-antes a7b5b8c`.
Depois execute `python -X utf8 avaliar_base_final.py antes` na pasta do recomendador.
As demais verificações podem ser repetidas com verificar_texto_base_final.py,
verificar_sinais_sem_gabarito.py e auditar_entrega_base_final.py.
'''
    assert marker in s
    p.write_text(s.replace(marker,details).rstrip()+'\n',encoding='utf-8',newline='\n')
    p=R/'catalogo/LEIA.md'; s=p.read_text(encoding='utf-8')
    s=s.replace('Situação em 11/11/2026','Situação em 13/11/2026')
    s=s.replace('2.063','2.731').replace('mediana 34',f"mediana {a['mediana_tamanho']:g}")
    s=s.replace('23 questões',f"{a['listas_vazias']} questões")
    s=s.replace('Para as 23\nquestões',f"Para as {a['listas_vazias']}\nquestões")
    s=s.replace('sem rótulo por defeito de texto','bloqueadas por defeito de texto')
    s=s.replace('Nenhuma lista\n  tem entre 1 e 4;',f"A menor lista não vazia tem {a['minimo_nao_vazio']} sugestões;")
    s=s.replace('(bloqueadas por defeito de texto)', '(67 bloqueadas por defeito de texto e uma sem candidato compatível após os filtros)')
    s=s.replace('os 181 defeitos de texto conhecidos (131 só de `##`), vindos de uma busca\n  automática, das avaliações cegas 1 e 2 e da avaliação em escala. É a lista de partida para corrigir a base.',
                '67 bloqueios por defeito e duas ressalvas da prova original. Os alertas antigos\n  corrigidos foram removidos; histórico em `../resultados/base_final/auditoria_alertas.json`.')
    s+='\nBase final do dataset: e6712a8. SHA-256 `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.\nConferências, limitações e validação em [RELATORIO_BASE_FINAL.md](../RELATORIO_BASE_FINAL.md).\n'
    p.write_text(s,encoding='utf-8',newline='\n')
    print('Relatório e documentação do catálogo atualizados com os números auditados.')

if __name__=='__main__':main()
