import { installQuestions, installTaxonomy } from './assets/learning-engine.js';

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', ...options.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível acessar o acervo.');
  return result;
}

export async function carregarAcervo() {
  const data = await request('/api/bootstrap');
  if (!data.questions?.length || !data.subjects?.length || data.info?.method !== 'titulo_area') throw new Error('Acervo indisponível.');
  installTaxonomy(data.subjects, data.years);
  installQuestions(data.questions);
  return data.info;
}

export const recomendarQuestao = (id, exclude = [], limit = 5) => request(`/api/questoes/${encodeURIComponent(id)}/recomendacoes`, { method: 'POST', body: JSON.stringify({ exclude, limit }) });
export const conferirResposta = (id, selected) => request(`/api/questoes/${encodeURIComponent(id)}/responder`, { method: 'POST', body: JSON.stringify({ selected }) });
