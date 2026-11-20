# Relatório executivo · entrega consolidada

Data: 11/11/2026. Responsável pela orientação e decisões do módulo: Gabriel. Este relatório confronta decisões com arquivos e testes; não é transcrição integral de conversas nem certificação pedagógica.

## O que foi construído

Foi recuperado um motor Python que acompanha respostas, guarda o estado entre sessões e pode **sugerir** fácil, média ou difícil. O aluno mantém sua escolha até aceitar. O módulo não seleciona questões: essa responsabilidade permanece com Ítalo. A entrega é uma pasta nova preparada para revisão na branch dificuldade-adaptativa, sem modificar o GitHub.

```text
Correção autorizada pelo futuro backend
        ↓
Histórico individual → BKT externo elegível / fallback ENEM
        ↓
Política: evidência mínima + margem + intervalo + estoque
        ↓
Oferta de faixa → aluno aceita ou recusa
        ↓
Ítalo seleciona questões mantendo seus critérios de relevância
```

Há duas capacidades diferentes. O BKT foi treinado com respostas reais externas do ASSISTments e atualiza o estado de cada aluno. Ainda não existe treinamento comprovado nas áreas do ENEM nem retreino contínuo do sistema em produção. Por segurança, a execução ENEM oferecida aqui usa histórico suavizado e o identifica como tal.

## Decisões preservadas

| Decisão de Gabriel | Situação concreta |
|---|---|
| Dificuldade do item pelo b da TRI | Classificador explícito, com área/escala/versão; os cortes históricos e os do catálogo atual diferem |
| Trabalhar por MT/LC/CH/CN para reduzir falta de estoque | Interface isola áreas; estimativa ENEM ainda é fallback agregado |
| Estimar domínio com BKT | 56 modelos externos treinados, 20 permitidos pelo gate conservador |
| Não impor mudança ao aluno | Oferta, aceite, recusa e escolha manual persistentes e testados |
| Acumular evidência e evitar oscilações | Mínimo 5, margem .05, intervalo 5 respostas; eficácia pedagógica ainda inconclusiva |
| Diagnóstico de 10 questões | Decisão mantida, orquestração do diagnóstico pendente |
| Aprendizado contínuo | Estado individual se atualiza; ciclo global produtivo pendente |
| Preservar outros integrantes e histórico | ZIP acrescenta apenas modulo-bkt-H; nenhum arquivo remoto sobrescrito |

## Evidência recuperada

No conjunto externo final, 29.948 respostas de 585 estudantes: log-loss BKT **0,5656**, histórico suavizado **0,5826**. A diferença BKT−histórico foi **−0,01697**, IC95% **[−0,02185; −0,01146]**, análise pareada posterior por estudante. Isso favorece a previsão de acerto global nessa base; nos grupos extremos, o histórico foi melhor. Não é taxa de acerto do recomendador ENEM.

No replay de validação da Missão 04, houve 2.515 ofertas BKT e 132 reversões, contra 868 ofertas e zero reversões da referência. Não houve alteração sem aceite. Como as respostas observadas não foram dadas às faixas sugeridas, o ensaio não mede melhoria de aprendizagem ou recomendação real.

Os ensaios antigos com respostas simuladas chegaram a 57,88% em oportunidades avaliadas, mas apenas 22,19% no horizonte completo nesse cenário. Todas as 2.304 trajetórias BKT encerraram por falta de itens na faixa. São alertas de projeto, não resultados de estudantes reais. Os testes dos classificadores textuais também são tarefa distinta: BERTimbau 0,5223 Macro-F1 em 2023 não representa personalização.

## O que o Ítalo recebe

Código executável sem GPU nem pacotes externos no runtime; modelos, gate e política congelados; exemplo ENEM de dez respostas sintéticas e exemplo BKT externo; testes; instalação passo a passo; contratos; evidências e relatórios anteriores com hashes. A equipe pode extrair, executar e planejar integração. Os logs atuais de verificação estão em `evidence/entrega` e seu resumo em `docs/RESULTADOS_ENTREGA.md`.

## Decisão de encerramento desta entrega

Entrega de engenharia para revisão, com viabilidade funcional do módulo independente. **Não equivale à aprovação pedagógica da Fase 2, à homologação da Missão 05 ou a um produto integrado.** Faltam conciliação de cortes e contratos, dados reais do Gabaritei, avaliação temporal da política, controle de repetição e ciclo global de retreinamento. Não houve novo treinamento, publicação ou avanço de fase nesta preparação.
