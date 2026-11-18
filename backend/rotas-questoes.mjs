// Rotas públicas do acervo: saúde, bootstrap, busca, questão, sugestões do titulo_area e conferência da resposta.
import { send, integer, body, listaExclusao } from './http.mjs';

export function criarRotasQuestoes({ acervo, dificuldade }) {
  return async function tratar({ req, res, url, pathname }) {
    const m = req.method;
    if (m === 'GET' && pathname === '/api/health') { send(res, 200, { status: 'ok', ...acervo.info, database: 'sqlite' }); return true; }
    if (m === 'GET' && pathname === '/api/bootstrap') { send(res, 200, acervo.bootstrap); return true; }
    if (m === 'GET' && pathname === '/api/questoes') {
      const p = url.searchParams, area = p.get('area'), subject = p.get('materia'), term = p.get('busca')?.toLocaleLowerCase('pt-BR');
      const year = p.has('ano') ? integer(p.get('ano'), null, 2100) : null;
      const limit = integer(p.get('limite'), 30, 100), offset = integer(p.get('inicio'), 0, acervo.questions.length);
      const found = acervo.questions.filter(q => (!area || q.areaId === area || q.sourceArea === area) && (!subject || q.subjectId === subject) && (!year || q.year === year)
        && (!term || `${q.prompt} ${q.descriptions.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term)));
      send(res, 200, { total: found.length, questions: found.slice(offset, offset + limit) }); return true;
    }
    const match = pathname.match(/^\/api\/questoes\/(gq_[a-f0-9]+)(?:\/(recomendacoes|responder))?$/);
    if (!match) return false;
    const [, id, action] = match;
    if (!acervo.catalogo.questoes[id]) { send(res, 404, { error: 'Questão não encontrada.' }); return true; }
    const question = acervo.byId.get(id);
    if (m === 'GET' && !action) { send(res, question ? 200 : 422, question ? { question } : { error: 'Questão bloqueada para prática.' }); return true; }
    if (action === 'recomendacoes' && (m === 'GET' || m === 'POST')) {
      // Sugestões do titulo_area na ordem do catálogo, sem as excluídas e sem as da mesma família.
      const input = m === 'POST' ? await body(req) : {};
      const exclude = listaExclusao(input?.exclude);
      const limit = integer(input?.limit ?? url.searchParams.get('limite'), 5, 50);
      const ids = acervo.recommendations(id, exclude, limit);
      send(res, 200, { method: 'titulo_area', questionId: id, ids, questions: ids.map(i => acervo.byId.get(i)), reason: ids.length ? null : 'Não há sugestões compatíveis disponíveis para esta questão.' });
      return true;
    }
    if (m === 'POST' && action === 'responder') {
      // Confere a resposta no gabarito oficial; com login, registra no perfil TRI (recomendador de dificuldade).
      const input = await body(req);
      if (!question) { send(res, 422, { error: 'Questão bloqueada para prática.' }); return true; }
      if (!/^[A-E]$/.test(input?.selected)) { send(res, 400, { error: 'Escolha uma alternativa de A a E.' }); return true; }
      const correct = input.selected === question.correct;
      const u = dificuldade.usuario(req);
      const tri = u ? dificuldade.registrar(u.id, question, { alternativa: input.selected, correta: correct, tempoMs: Number(input.tempoMs), apoio: input.apoio === true, origem: 'pratica', primeiraCliente: input.primeira !== false, desafio: input.desafio }) : null;
      send(res, 200, { questionId: id, selected: input.selected, correct, answer: question.correct, explanation: question.explanation, persisted: !!tri, tri });
      return true;
    }
    return false;
  };
}
