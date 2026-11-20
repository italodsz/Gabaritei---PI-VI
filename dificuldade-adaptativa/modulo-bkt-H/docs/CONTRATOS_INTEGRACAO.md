# Contratos para Ítalo e backend

## Separação de responsabilidades

Este módulo produz estado e eventual oferta de faixa, nunca IDs de questões recomendadas. Ítalo mantém a lista de relevância e seus filtros. O backend futuro autentica, corrige, ordena e persiste os eventos; calcula estoque real após excluir família repetida, questões inválidas, idioma e conteúdo indisponível; chama o motor; apresenta uma oferta; só aplica a faixa aceita. Caso faltem itens no nível escolhido, devolver estado de estoque insuficiente e oferecer opções explícitas; nunca mudar a preferência ou completar com outra faixa silenciosamente.

O snapshot do GitHub aponta método oficial `titulo_area`, catálogo `recomendacoes_titulo_area.json`, branch recomendador em bd74deaa2d5a1e87acded278df4e1a8d393e725b. Há 23 questões sem sugestões descritas no LEIA remoto. `DECISAO_FINAL.json` tem campos históricos contraditórios: considerar a seção `oficial` e o LEIA atual para planejar integração e confirmar com Ítalo antes de ativá-la. Nada do módulo dele foi copiado ou alterado aqui.

## Interface Python local

```python
from pathlib import Path
from bkt04.motor import Motor
from bkt04.enem import register_area_response

Path('local').mkdir(exist_ok=True)
motor = Motor(Path('local/estado.sqlite'))
resultado = register_area_response(
    motor, student_id='aluno-pseudonimo', area='MT',
    attempt_id='tentativa-canonica-servidor', correct=1,
    event_order=1, inventory={'facil': 12, 'media': 8, 'dificil': 4})
```

`area` deve ser MT, LC, CH ou CN. O estado agregado usa namespace `enem:<area>` e skill `area`; não há mistura com habilidades ASSISTments. `correct` é inteiro 0/1 autorizado pelo servidor; nunca confiar no acerto informado pelo cliente. `event_order` inteiro positivo estritamente crescente por estudante/escopo/versão; horário sozinho não ordena eventos simultâneos. Estoque exige três inteiros não negativos. IDs devem usar letras ASCII, dígitos, `_ . : -`, até 128 caracteres. Não enviar nome, CPF ou e-mail.

Saída: `student_id`, `skill_namespace`, `skill_id`, `attempt_id`, `event_order`, `model_version`, `strategy`, `eligibility`, `eligibility_reasons`, `predicted_correct` (antes da resposta), `mastery_before/posterior/updated`, `evidence_count`, `recommendation` e `recorded_utc`. No ENEM, strategy=`historico_suavizado`, mastery=null e motivo `mapeamento_ENEM_nao_validado`. O score histórico não é domínio certificado nem proficiência TRI. Contagem mínima é 5, não confundir com o diagnóstico pretendido de 10.

Uma oferta traz `suggested`, `reason`, `choice` e `offer_id`. Responder `motor.resolve_offer(student_id, offer_id, True/False)`. A primeira aceitação válida pode mudar a preferência; recusa preserva. Oferta de outro aluno, outra versão ou revisão defasada é recusada. Após aceitar/recusar, repetir a mesma decisão é idempotente; uma decisão conflitante é erro. Escolha manual: `motor.choose_level(student, namespace, skill, choice, event_id)`. Leitura: `motor.inspect(...)`. Escolha manual não apaga acertos, erros ou domínio.

O mesmo attempt_id com o mesmo payload retorna a resposta armazenada; conteúdo diferente ou outro aluno geram ValueError. **Inventory faz parte do payload:** numa repetição técnica, reenviar o inventário original; o backend deve persistir o contexto da tentativa ou responder a repetição antes de recalcular estoque. A escolha manual e a resposta usam a mesma tabela global de recibos; IDs de operação devem ser distintos.

`bkt04.adaptador.register_correction` preserva o contrato histórico do frontend da branch dificuldade-adaptativa: `EnvioResposta` contém questaoId, letra, modo, sessaoId, recomendacaoId, chaveIdempotencia; `Correcao` traz tentativaId e correta (bool). O ID canônico é o da correção, podendo diferir da chave do cliente. A questão deve fornecer id, skill_namespace e skill_id. O adaptador não autentica nem confere por si só o gabarito; seu chamador deve fazê-lo. Para uso por área preencher namespace=`enem:MT`, skill_id=`area`. Este contrato não foi conectado ao frontend novo de main/front-end, que divergem; será necessária conciliação antes da implantação.

## TRI e catálogo

`bkt04.enem.item_level` usa apenas b para classificar o item, com cortes, área, versão e escala obrigatórios. Operadores desta interface: b<=corte1 fácil; corte1<b<=corte2 média; b>corte2 difícil. O arquivo config/tri_versions.json documenta a versão histórica global (.80054/1.56301), a simplificação .8/1.5 e a versão do catálogo do Ítalo. Não há versão ativa escolhida implicitamente.

O catálogo atual de Ítalo usa **<** nos dois limites e tercis por área. Para integrar seu catálogo, preservar seu campo nivel e cortes/versão em vez de chamar item_level com operadores diferentes. Não reclassificar o catálogo automaticamente. A compatibilidade de escalas entre anos/cadernos permanece pendente; scale_id e expected_scale_id verificam identidade declarada, não comprovam equivalência psicométrica. O BKT clássico distribuído não recebe b: errar item difícil ainda conta como erro binário, limitação fundamental para a futura arquitetura sensível à dificuldade.

## Persistência e implantação futura

SQLite persiste estado por aluno+namespace+skill+versão, recibos e ofertas. Transações BEGIN IMMEDIATE, timeout de 10s, teste de concorrência e migração de last_offer_count disponíveis. É implementação local, não Supabase/Postgres. A autenticação, RLS, retenção e exclusão de dados, rotas FastAPI, migração transacional no backend e ligação com frontend ainda precisam ser implementadas e testadas.

O recibo atual não guarda questaoId, b, sessionId, timestamp original ou família. O backend deve manter um log de tentativas com esses campos, versão da questão/cortes/modelo, consentimento e ID da oferta, e controlar exposições repetidas. Idempotência técnica não impede responder novamente o mesmo conteúdo com outro ID. Sem esse log não se pode separar repetição de aprendizagem. Não expor um `predicted_correct` externo como probabilidade calibrada para ENEM.
