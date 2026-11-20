# Decisões versus implementação

| Requisito | Estado | Evidência e limite |
|---|---|---|
| Sem LLM no módulo | Implementado e verificado | bkt04 e exemplos; biblioteca padrão |
| Modelo realmente treinado | Implementado e verificado | 56 modelos externos; tests C com fit histórico |
| BKT validado no ENEM | Não implementado | namespace ENEM força fallback; nenhum mapeamento aprovado |
| Atualização de domínio individual | Implementado e verificado | BKT externo; testes A/D |
| Dificuldade do item separada do aluno | Parcialmente implementado | item_level separado; núcleo clássico ainda sem b |
| BKT sensível à dificuldade | Parcialmente implementado | bancada histórica com âncoras; sem calibração real ENEM |
| Área MT/LC/CH/CN | Implementado e verificado | fachada por área/fallback; testes F |
| Domínio de cada assunto por área agregada | Não implementado | agregação não equivale a domínio de subassuntos |
| Classificação TRI b | Implementado e verificado | item_level, cortes/versão/escala explícitos, testes F |
| Cortes finais únicos no produto | Sem evidência suficiente | global histórico x arredondado x catálogo por área |
| Diagnóstico10questões | Parcialmente implementado | bancada antiga; motor persistente não orquestra diagnóstico |
| Mínimo5/margem.05/cooldown5 | Implementado e verificado | models/politica_selecionada.json; testes A/D |
| Aceite e recusa | Implementado e verificado | resolve_offer, owner/revisão/versão e idempotência |
| Escolha manual preserva histórico | Implementado e verificado | choose_level e testes D |
| Persistência entre sessões | Implementado e verificado | SQLite local; não backend implantado |
| Log completo questão/TRI/sessão | Parcialmente implementado | recibos operacionais não guardam contexto completo |
| Repetição versus aprendizagem | Parcialmente implementado | IDs/famílias na bancada; runtime só idempotência de tentativa |
| Estoque antes de oferta | Implementado e verificado | inventário fornecido pelo chamador; tests A/D |
| Resolver esgotamento sem violar escolha | Parcialmente implementado | abstém; fluxo de produto pendente |
| Integração com Ítalo | Parcialmente implementado | contrato e responsabilidades; sem conexão real |
| Backend/autenticação/RLS | Não implementado | árvores inspecionadas; motor local não servidor |
| Frontend atual ligado ao módulo | Não implementado | contratos divergentes, sem requisições reais ao BKT |
| Retreino periódico produtivo | Não implementado | ajustes offline existentes não são ciclo global |
| Ganho estatístico sobre histórico | Implementado e verificado | posthoc externo global; extremos desfavoráveis |
| Qualidade pedagógica da política | Sem evidência suficiente | replay não mede respostas às faixas recomendadas |
| Revisão pedagógica humana qualificada | Sem evidência suficiente | auditoria automatizada não certifica pedagogia |
| Prova externa do protocolo histórico | Sem evidência suficiente | carimbo externo não recuperado |
| Não publicar/não avançar | Implementado e verificado | apenas pasta de entrega; consulta remota GET |
| Missão05homologada | Sem evidência suficiente | não executada nesta entrega |
