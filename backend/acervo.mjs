import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DATASET_SHA256 = '6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f';
export const CATALOGO_SHA256 = 'c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb';
const directory = new URL('../', import.meta.url);
const rec = 'recomendador/rrf-tfidf-minilm-J/';
const areaIds = { LC: 'linguagens', CH: 'humanas', CN: 'natureza', MT: 'matematica' };
const subjects = {
  'Língua Portuguesa': ['portugues', 'linguagens'], 'Literatura': ['literatura', 'linguagens'],
  'Língua estrangeira (inglês ou espanhol)': ['ingles', 'linguagens'],
  'Artes': ['artes', 'linguagens'], 'Educação Física': ['educacao-fisica', 'linguagens'],
  'Tecnologias da informação e comunicação': ['tecnologias', 'linguagens'],
  'História': ['historia', 'humanas'], 'Geografia': ['geografia', 'humanas'],
  'Filosofia': ['filosofia', 'humanas'], 'Sociologia': ['sociologia', 'humanas'],
  'Física': ['fisica', 'natureza'], 'Química': ['quimica', 'natureza'],
  'Biologia': ['biologia', 'natureza'], 'Matemática': ['matematica', 'matematica'],
};
const slug = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const text = value => String(value ?? '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
const json = async path => JSON.parse(await readFile(new URL(path, directory), 'utf8'));

export async function carregarAcervo() {
  const bytes = await readFile(new URL('Dataset/base_trabalho/data/questions.jsonl', directory));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== DATASET_SHA256) throw new Error('Dataset diferente do registrado: atualize e confira o catálogo antes de iniciar.');
  const [catalogBytes, splits, config] = await Promise.all([
    readFile(new URL(rec + 'catalogo/recomendacoes_titulo_area.json', directory)), json('Dataset/base_trabalho/ids_elegiveis.json'), json(rec + 'indice/config.json'),
  ]);
  const catalogSha256 = createHash('sha256').update(catalogBytes).digest('hex');
  if (catalogSha256 !== CATALOGO_SHA256) throw new Error('Catálogo diferente do resultado conferido. Confira e registre a nova versão antes de iniciar.');
  const catalogo = JSON.parse(catalogBytes.toString('utf8'));
  if (config.base_sha256 !== sha256) throw new Error('Índices e dataset não correspondem.');
  const rows = new Map(bytes.toString('utf8').trim().split(/\r?\n/).map(line => { const q = JSON.parse(line); return [q.id, q]; }));
  const ids = Object.values(splits).flat();
  if (new Set(ids).size !== ids.length || ids.length !== Object.keys(catalogo.questoes).length || ids.some(id => !rows.has(id) || !catalogo.questoes[id] || !Array.isArray(catalogo.recomendacoes[id]))) {
    throw new Error('Os IDs do catálogo não correspondem aos elegíveis do dataset.');
  }
  const taxonomy = new Map();
  const questions = [];
  const excluded = [];
  for (const id of ids) {
    const q = rows.get(id), m = catalogo.questoes[id];
    if (m.defeito || m.duplicata || !m.materia || !m.titulo) { excluded.push(id); continue; }
    let mapping = subjects[m.materia];
    const foreign = m.materia === 'Língua estrangeira (inglês ou espanhol)';
    if (foreign) mapping = q.language === 'es' ? ['espanhol', 'linguagens'] : ['ingles', 'linguagens'];
    if (!mapping) throw new Error(`Matéria sem correspondência no app: ${m.materia}`);
    if (!/^[A-E]$/.test(q.answer) || q.options.length !== 5) throw new Error(`Gabarito ou alternativas inválidos: ${id}`);
    const [subjectId, subjectArea] = mapping;
    const name = foreign ? (subjectId === 'ingles' ? 'Inglês' : 'Espanhol') : m.materia;
    if (!taxonomy.has(subjectId)) taxonomy.set(subjectId, { id: subjectId, name, areaId: subjectArea, topics: [] });
    const subject = taxonomy.get(subjectId);
    const topicId = `${subjectId}-${slug(m.titulo)}`;
    let topic = subject.topics.find(t => t.id === topicId);
    if (!topic) { topic = { id: topicId, subjectId, name: m.titulo, subtopics: [] }; subject.topics.push(topic); }
    const subtopicId = `${topicId}.${slug(m.assunto || m.grande_tema || 'geral')}`;
    if (!topic.subtopics.some(t => t.id === subtopicId)) topic.subtopics.push({ id: subtopicId, name: m.assunto || m.titulo });
    questions.push({
      id, areaId: areaIds[q.area], subjectId, topicId, subtopicId, year: q.year, origin: 'oficial',
      difficulty: m.nivel || 'media', difficultyKnown: !!m.nivel, skill: q.skill ? `Habilidade ${q.skill} do INEP` : m.assunto,
      prompt: text(q.question), descriptions: (q.descriptions || []).filter(d => d.use_for_recommender === true).map(d => text(d.text)).filter(Boolean),
      alternatives: [...q.options].sort((a, b) => a.label.localeCompare(b.label)).map(a => ({ letter: a.label, text: text(a.text) })),
      correct: q.answer, explanation: `Gabarito oficial: alternativa ${q.answer}. Resolução comentada ainda não disponível.`,
      ...(q.language === 'en' || q.language === 'es' ? { foreignLanguage: q.language === 'en' ? 'ingles' : 'espanhol' } : {}),
      familyId: q.content_family_id, sourcePosition: q.official_reference?.position ?? null,
      sourceArea: q.area, warning: m.alerta_texto || null,
    });
  }
  const byId = new Map(questions.map(q => [q.id, q]));
  // Valida o resultado congelado; não reordena, não completa com sorteio e não recalcula vetores.
  for (const id of ids) {
    const q = rows.get(id), meta = catalogo.questoes[id], seen = new Set();
    for (const candidateId of catalogo.recomendacoes[id]) {
      const candidate = rows.get(candidateId), cm = catalogo.questoes[candidateId];
      if (!byId.has(candidateId) || candidateId === id || seen.has(candidate.content_family_id)
          || candidate.content_family_id === q.content_family_id || candidate.area !== q.area
          || cm.materia !== meta.materia || cm.titulo !== meta.titulo
          || (['en', 'es'].includes(q.language) || ['en', 'es'].includes(candidate.language)) && candidate.language !== q.language) {
        throw new Error(`Sugestão incompatível no catálogo: ${id} -> ${candidateId}`);
      }
      seen.add(candidate.content_family_id);
    }
  }
  const subjectList = [...taxonomy.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  for (const s of subjectList) s.topics.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const info = { datasetCommit: 'e6712a8', recommenderCommit: 'd10f5a3', sha256, catalogSha256, method: 'titulo_area', total: rows.size,
    eligible: ids.length, available: questions.length, blocked: excluded.length, emptyRecommendationLists: ids.filter(id => !catalogo.recomendacoes[id].length).length,
    splits: Object.fromEntries(Object.entries(splits).map(([key, value]) => [key, value.length])), database: false };
  return {
    info, questions, byId, catalogo,
    bootstrap: { info, subjects: subjectList, years: [...new Set(questions.map(q => q.year))].sort((a, b) => b - a), questions },
    recommendations(id, exclude = [], limit = 5) {
      if (!catalogo.questoes[id]) return null;
      const excludedIds = new Set(exclude), families = new Set(exclude.map(i => byId.get(i)?.familyId).filter(Boolean));
      return catalogo.recomendacoes[id].filter(i => byId.has(i) && !excludedIds.has(i) && !families.has(byId.get(i).familyId)).slice(0, limit);
    },
  };
}
