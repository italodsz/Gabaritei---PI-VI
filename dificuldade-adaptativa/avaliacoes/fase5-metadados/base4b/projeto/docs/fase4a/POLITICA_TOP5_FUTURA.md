# Política Top 5 futura — contrato e testes propostos, sem implementação

## Divisão de responsabilidade

O módulo do Ítalo fornece candidatas semanticamente relevantes pelo catálogo
`titulo_area`. O módulo TRI estima proficiência por área e adequação da dificuldade.
Dificuldade de item (`b`) não é domínio do estudante (`theta`). A escolha expressa
do aluno não pode ser alterada automaticamente. O BKT histórico não é reestimado aqui.

O projeto já possui catálogo, API de semelhantes, recomendação de listas e funções
para ordenar por chance estimada. A Fase 4A preservou essas funções; não se deve
apresentar uma chamada existente com `limit=5` como implementação deste contrato.

## Entradas futuras

- Identidade resolvida no backend; área e preferência de dificuldade consentida.
- Referência semântica e candidatos com IDs canônicos, posição/escore do catálogo,
  disponibilidade e metadados com procedência. Não preencher campos ausentes por suposição.
- Perfil TRI oficial por área: evidências elegíveis, incerteza e versão do estimador.
- Exposições emitidas pelo servidor e eventos: inédito, apresentado sem resposta,
  respondido pela primeira vez, revisão. Visualização não equivale a resposta.
- Parâmetros TRI com aprovação da triagem e versão. Itens sem TRI podem servir ao
  estudo quando permitidos, mas não a uma classificação de adequação comprovada.

## Ordem de decisão proposta

1. Respeitar área, disponibilidade, restrições da sessão e consentimento como condições duras.
2. Usar o conjunto semântico do Ítalo, preservando sua proveniência e posição original.
3. Priorizar inéditas, comparar chance de acerto prevista com alvo consentido e considerar
   incerteza. Pouca evidência produz diagnóstico/calibrando, sem certeza artificial.
4. Produzir até cinco candidatas. Retornar para cada uma posição semântica, adequação
   TRI, situação de exposição e motivo legível, sem substituir o valor original do catálogo.
5. Se faltar estoque, flexibilizar gradualmente critérios suaves, de forma registrada:
   ampliar margem de adequação e depois relevância dentro de um piso aprovado.
6. Não flexibilizar identidade, área autorizada, elegibilidade de resposta, condição
   de exclusão do item ou aceite. Revisões só em modo explícito, sem contar novamente.
7. Se faltar material, retornar menos de cinco e explicar esgotamento. Não repetir
   silenciosamente para completar a lista nem recomendar faixa sem inventário.

Pisos de relevância, margens, pesos e número mínimo de evidências **não foram aprovados**.
Devem ser fixados com dados e auditoria, por área. Não converter porcentagem de domínio
em `b` por regra sem validação de escala.

## Saída proposta

```json
{
  "status": "calibrando_ou_recomendacao_ou_estoque_insuficiente",
  "versaoPolitica": "a_definir",
  "requerAceite": true,
  "itens": [{"id":"gq_...","posicaoSemantica":1,"chancePrevista":0.65,
    "exposicao":"inedita","justificativa":"exemplo de contrato"}],
  "flexibilizacoes": [],
  "incerteza": "descricao_a_definir"
}
```

O JSON é especificação ilustrativa, não resultado executado e não endpoint novo.

## Testes que uma futura integração deverá passar

- Todos os IDs existem e pertencem ao conjunto semanticamente permitido.
- Nenhuma sugestão muda preferência sem aceite explícito.
- Área e isolamento de usuário nunca relaxados.
- Pouco histórico => incerteza informada; sem promoção de n recebido do navegador.
- Repetição não gera nova evidência; Anterior só retoma apresentação.
- Ordenação semântica original auditável, mesmo se houver reordenação consentida.
- Estoque curto, nenhum candidato, sem TRI e metadados ausentes: saída honesta.
- Sessões completas: medir falsas mudanças, cobertura do horizonte, esgotamento e
  estabilidade, além de acerto em oportunidades isoladas.
- Precision@K, Recall@K e NDCG@K somente com relevância/gabarito independentes definidos;
  não usar o próprio ranqueador como verdade. Separar recomendação semântica de adequação.
- Comparar com regra simples usando os mesmos cenários/sementes e evidências reais
  quando disponíveis. Simulação deve ser identificada e não comprova efeito educacional.

Nenhum desses novos experimentos ou treinamento foi executado na Fase 4A.
