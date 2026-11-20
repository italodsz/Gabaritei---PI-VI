# 03 · Revisão técnica da candidata

## Origem e atualização

Em `rodada.py`, o estimador usa um estado de domínio (m) por chave. Na simulação histórica, as chaves de habilidade são artificiais. Um adaptador Gabaritei ainda teria de separar a sessão do estudante e mapear a chave. A opção inicial defensável é área mais escala, de modo que respostas de provas sem equivalência não sejam combinadas. A unidade por assunto ou habilidade depende de validação posterior.

Os parâmetros congelados de `viabilidade/fechamento.json` são aproximadamente **0,72751** para domínio inicial, **0,05113** para transição de aprendizado, **0,30866** para acerto sem domínio e **0,20001** para erro com domínio. `fechamento.py` mostra o ajuste por minimização de Log Loss no treino externo do ASSISTments, a partir da semente de otimização manual `[.3,.1,.2,.1]`. O ajuste original usou replay BKT sem dificuldade específica. A camada sensível ao item reaproveita esses quatro valores e introduz dificuldade nas emissões. O teste externo posterior usou uma proxy obtida da taxa de acerto dos itens. Nenhum desses valores foi estimado em respostas de alunos do ENEM.

Para a dificuldade de entrada (d), as duas emissões de acerto são:

```text
p0 = sigmoid(logit(guess) - d)
p1 = sigmoid(logit(1 - slip) - d)
P(acerto) = (1 - m) * p0 + m * p1
```

Após observar uma resposta, o estimador aplica Bayes às duas verossimilhanças. Usa `p0,p1` no acerto e `1-p0,1-p1` no erro. O posterior de domínio (m') recebe a transição `m' + (1 - m') * learn`. Logo, com o mesmo estado inicial e os mesmos parâmetros, a dificuldade afeta a evidência de um erro ou de um acerto. Em particular, no modelo, errar um item difícil é menos desfavorável ao domínio do que errar um fácil. Essa propriedade algébrica deve ser testada no adaptador. Um erro pode ter efeito diferente dependendo do histórico. A transição fixa também pode compensar parte da queda. O estado não é certificação de aprendizagem individual.

`record` recusa ID ou família já registrada e respostas fora do domínio binário. Na integração, o estado deve receber somente a primeira tentativa elegível, com família, ordem e versão do catálogo confirmadas. A API histórica não valida por si a origem, a área, a escala ou o status operacional do item. O diagnóstico de dez questões é requisito do produto, sem implementação histórica demonstrada com catálogo e eventos Gabaritei. As dez respostas elegíveis devem atualizar o estado na ordem. Sem histórico, usar o prior apenas como ponto de partida experimental. Com menos de quatro famílias na chave, abster-se. Depois de quatro, a política histórica pode sugerir. Se o produto exigir silenciar a política até concluir o diagnóstico, isso é uma porta do fluxo a validar separadamente.

## Oferta e preferência

A candidata congelada usa quatro famílias mínimas na chave, intervalo de uma observação entre ofertas, salto máximo de dois níveis e margem de **0,09**. Calcula a distância entre cada probabilidade estimada e o alvo experimental de **0,70**. Sugere o nível alcançável de menor distância quando melhora sobre o nível escolhido pelo menos 0,09. Na simulação, nenhum nível muda sem aceite. A margem é redução da distância estimada ao alvo. Não representa uma probabilidade calibrada de que a mudança beneficie o estudante.

A simulação usa dificuldades manuais `[-1.6, -0.4, 0.8]`, registradas no protocolo. Os valores de `b` do ENEM não podem entrar diretamente nessa escala sem justificativa. Para um teste funcional em itens reais, usar o mapeamento explícito e provisório de baixa/média/alta da mesma prova para essas três âncoras e registrar que as probabilidades não são calibradas. Nenhum mapeamento foi executado nesta revisão. Em piloto real, validar ou calibrar a transformação antes de interpretar probabilidades. Sem dificuldade comparável, sem candidato válido na faixa sugerida ou com dados insuficientes, devolver abstenção e preservar a escolha. A política histórica não tem filtro de candidatos reais nem validação de aceite com versão ou oferta expirada.

## Granularidade

| Unidade | Evidência disponível | Parecer |
| --- | --- | --- |
| Matéria ou área, separada por escala | 41 itens em três escalas. Só dois recortes de CH comportam dez itens mistos | Candidata a prova de conceito restrita, com fallback de prática livre |
| Assunto | Um item com assunto tecnicamente sustentado e faixa. Os outros oito com rótulo sustentado carecem de faixa | Sem cobertura para adaptar por assunto. Não inferir que os demais 40 pertençam ao assunto preenchido |
| Habilidade ENEM | A interseção é um item, CH:H16 | Sem famílias suficientes para uma trilha por habilidade |

Uma hierarquia área → assunto → habilidade permanece hipótese. Exige cobertura por chave, rótulos revisados, eventos no domínio e critérios explícitos de promoção e retorno. A passagem para uma chave granular não deve copiar o estado de outra chave como se fosse evidência específica.

## Contrato mínimo ainda pendente

Ítalo envia IDs, ordem de relevância e revisão do catálogo. O adaptador consulta status, área, escala, faixa e família. O módulo de dificuldade devolve **uma faixa sugerida ou abstenção**, com motivo, escala, versão e identificador de oferta. O solicitante conserva a seleção semântica. A oferta só se torna preferência após aceite explícito válido, ou a preferência é atualizada por escolha manual do aluno. Deve haver invalidação da oferta após troca manual ou mudança de contexto. O [contrato histórico de eventos](../../catalogo_adaptativo_operacional/contrato_eventos_resposta.json) cobre a resposta. Seu transporte e o contrato de candidatos são lacunas de integração. Nenhum adaptador produtivo foi implementado.
