# Gabaritei PI VI · Missão Dataset 4

O pacote encerra a rodada de recuperação documental do catálogo experimental. Foram reprocessadas 2.971 questões de 2009 a 2024, com 227 confirmações documentais adicionais. A situação de cada questão é rastreável pelo identificador.

| Indicador | Missão 3 | Missão 4 |
| --- | ---: | ---: |
| Questões processadas | 2.971 | 2.971 |
| Confirmação documental | 538 | 765 |
| A · Apta tecnicamente ao BKT | 460 | 677 |
| B · Somente prática experimental | 75 | 85 |
| C · Condicional | 2.401 | 2.174 |
| D · Bloqueada | 35 | 35 |

A confirmação documental é uma dimensão separada. Três questões com confirmação documental continuam bloqueadas por outros critérios. Direitos de exibição pública continuam pendentes. O estoque máximo dentro de uma mesma habilidade e escala TRI é de três famílias independentes.

## Arquivos para conferência

| Arquivo | Conteúdo |
| --- | --- |
| RELATORIO_CAUSA_RAIZ.md | Método, antes e depois, causas técnicas, priorização e limites |
| catalogo_final.jsonl | Catálogo derivado completo |
| matriz_evidencias.jsonl | Estado anterior e atual, fonte, gabarito, geometria, diagnóstico e dimensões por ID |
| correcoes.jsonl | 227 mudanças de estado com correção, evidência e controles aplicados |
| pendencias.jsonl | 2.209 casos condicionais ou bloqueados, com motivos e localização quando disponível |
| validacao_por_id.jsonl | Resultado dos controles automatizados por ID |
| metricas.json e fragmentacao_estoque.json | Distribuições por ano, área, dificuldade e habilidade, famílias e estoque por escala |
| amostra_visual.json e revisoes_missao4.json | Amostra inspecionada e decisões manuais técnicas com referência aos recortes |
| inventario_fontes.json, inventario_zips.json e integridade_originais.json | Fontes, referências, versões e hashes |
| SHA256SUMS.txt | Integridade dos membros do ZIP |

O pacote guarda coordenadas e hashes. Consulte os cadernos pelos endereços registrados ou pelas rotinas de reprodução. O ZIP contém metadados e evidências derivadas, sem incorporar PDFs ou imagens dos cadernos.

## Reproduzir no PowerShell

Extraia o ZIP. Use Python 3.14 e uma cópia íntegra da raiz original do projeto. A raiz deve conter as pastas base-oficial, dificuldade-adaptativa e inep_tabelas e os demais insumos listados em integridade_originais.json. Use o caminho real da sua cópia. O comando de conferência valida os originais e verifica os 30 PDFs do cache pelo SHA-256. Quando algum deles estiver ausente, o comando tenta baixar somente esse PDF do INEP.

    python -m pip install -r requirements.txt
    $env:PYTHONUTF8 = '1'
    $env:GABARITEI_ROOT = 'C:\Users\Darkz\Documents\ChatGPT\pi6'
    $env:GABARITEI_CACHE = "$env:LOCALAPPDATA\Temp\GabariteiM2Fontes"
    python -B conferir_fontes.py $env:GABARITEI_ROOT $env:GABARITEI_CACHE
    python -B reproduzir.py $env:GABARITEI_ROOT $env:GABARITEI_CACHE
    python -B test_m4.py
    $env:GABARITEI_M3 = (Get-Location).Path
    python -B test_regressoes_antes.py

O comando reproduzir.py executa o processamento integral em pasta temporária e compara os seis arquivos gerados com os do pacote. Para a reprodução histórica, extraia separadamente o ZIP da Missão 3, execute seu reproduzir.py com a mesma raiz e o mesmo cache e aponte GABARITEI_M3 para a pasta extraída ao executar test_regressoes_antes.py. Nessa versão, os seis testes de reprodução de falha devem falhar. No código da Missão 4, devem passar.

### Conferir uma questão ou a amostra

    python -B renderizar.py $env:GABARITEI_ROOT $env:GABARITEI_CACHE gq_5c15d3e3361eb0f75fb79d4f "$env:TEMP\gabaritei-questao.png"
    python -B conferir_pendencia.py $env:GABARITEI_ROOT $env:GABARITEI_CACHE gq_02ebc8bc8c546bae47864b19 "$env:TEMP\gabaritei-pendente.png" --alternativo
    python -B rever_amostra.py $env:GABARITEI_ROOT $env:GABARITEI_CACHE "$env:TEMP\gabaritei-amostra"

renderizar.py aceita --segmento ou --alternativa quando a evidência do item inclui esse recurso. mostrar_diff.py exibe as diferenças disponíveis a partir dos originais. rever_amostra.py reproduz a seleção congelada sem reescrever as anotações. analise_estoque.py e validar_catalogo.py regeneram seus respectivos arquivos de resultados. Mantenha uma cópia extraída intacta para conferir os hashes.

