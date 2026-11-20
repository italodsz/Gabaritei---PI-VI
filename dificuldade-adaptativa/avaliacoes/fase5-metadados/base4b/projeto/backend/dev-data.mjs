import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from './acervo.mjs';

const R = resolve(PROJECT_ROOT, 'recomendador/rrf-tfidf-minilm-J');
const read = async path => JSON.parse(await readFile(resolve(R, path), 'utf8'));
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const count = values => Object.entries(values.reduce((sum, key) => { sum[key ?? 'Não informado'] = (sum[key ?? 'Não informado'] || 0) + 1; return sum; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'));

export async function criarDadosDev(acervo) {
  const [manualText, recipe, audit, before, after, environment] = await Promise.all([
    readFile(resolve(R, 'classificador/dados/classificacao_manual.jsonl'), 'utf8'), read('busca_por_area_v1.json'),
    read('resultados/base_final/auditoria_entrega.json'), read('resultados/base_final/avaliacao_antes.json'),
    read('resultados/base_final/avaliacao_depois.json'), read('resultados/base_final/ambiente_indices.json'),
  ]);
  const labels = new Map(manualText.trim().split(/\r?\n/).map(line => { const row = JSON.parse(line); return [row.id, row]; }));
  const eligible = new Set(acervo.ids);
  const record = q => {
    const m = acervo.catalogo.questoes[q.id] || {};
    const status = !eligible.has(q.id) ? 'fora' : m.defeito ? 'defeito' : m.duplicata ? 'duplicata' : 'liberada';
    return { id: q.id, area: q.area, year: q.year, split: q.split, position: q.official_reference?.position ?? null,
      materia: m.materia || null, titulo: m.titulo || null, assunto: m.assunto || null, status,
      recommendations: acervo.catalogo.recomendacoes[q.id]?.length ?? null, preview: String(q.question || '').replace(/\\n/g, ' ').slice(0, 180) };
  };
  const records = [...acervo.rows.values()].map(record);
  const searchIndex = new Map([...acervo.rows.values()].map(q => [q.id, normalize([q.id,q.question,...(q.descriptions||[]).filter(d=>d.use_for_recommender===true).map(d=>d.text),acervo.catalogo.questoes[q.id]?.materia,acervo.catalogo.questoes[q.id]?.titulo,acervo.catalogo.questoes[q.id]?.assunto,q.official_reference?.position].join(' '))]));
  const sizes = Object.values(acervo.catalogo.recomendacoes).map(ids => ids.length).sort((a, b) => a - b);
  const lists = Object.entries(acervo.catalogo.recomendacoes);
  const baseAudit = await read('resultados/base_final/auditoria_base.json');
  const newLabels = new Set(baseAudit.sem_rotulo_ids);
  let topFive = 0, newLabelsTopFive = 0;
  for (const [, ids] of lists) for (const id of ids.slice(0, 5)) { topFive++; if (newLabels.has(id)) newLabelsTopFive++; }
  const summary = {
    info: acervo.info, recipe, workerRequiredForScores: true,
    catalog: { lists: sizes.length, empty: sizes.filter(n => !n).length, median: sizes[Math.floor(sizes.length / 2)],
      minNonEmpty: sizes.find(n => n > 0), max: sizes.at(-1), underFive: sizes.filter(n => n > 0 && n < 5).length,
      histogram: [{label:'Vazias',value:sizes.filter(n=>n===0).length},{label:'1–9',value:sizes.filter(n=>n>0&&n<10).length},{label:'10–24',value:sizes.filter(n=>n>=10&&n<25).length},{label:'25–49',value:sizes.filter(n=>n>=25&&n<50).length},{label:'50',value:sizes.filter(n=>n===50).length}],
      topFive, newLabelsTopFive, newLabelsDefinition: 'IDs das 681 questões que receberam classificação na migração (auditoria_base.sem_rotulo_ids).' },
    distributions: { area: count(records.map(q => q.area)), year: count(records.map(q => q.year)), status: count(records.map(q => q.status)),
      subject: count(records.filter(q => q.status === 'liberada').map(q => q.materia)), split: count(records.map(q => q.split)) },
    validation: Object.keys(after).map(method => ({ method, before: before[method], after: after[method] })),
    audit: { source: 'Auditoria registrada na migração; não é uma nova execução de avaliação.', tfidfTrainOnly: audit.tfidf_fit_so_treino_verificado, aligned: audit.ids_vetores_alinhados, vectorNorms: audit.normas_vetores },
    environment: { python: environment.python, packages: environment.pacotes, hashes: environment.sha256 },
    subjects: acervo.bootstrap.subjects.map(({ id, name, areaId }) => ({ id, name, areaId })),
    partitions: Object.entries(acervo.splits).map(([split,ids])=>({split,total:ids.length,years:count(ids.map(id=>acervo.rows.get(id).year))})),
    defaultQuestionId: 'gq_29ef25a472475b50d03207ab',
  };
  return {
    summary,
    list({ area = '', subject = '', year = '', status = 'liberada', split = '', search = '', offset = 0, limit = 20 } = {}) {
      const needle = normalize(search);
      const found = records.filter(q => (!area || q.area === area) && (!subject || q.materia === subject) && (!year || q.year === Number(year))
        && (!status || status === 'todas' || q.status === status) && (!split || q.split === split)
        && (!needle || searchIndex.get(q.id).includes(needle)));
      return { total: found.length, records: found.slice(offset, offset + limit) };
    },
    detail(id) {
      const q = acervo.rows.get(id); if (!q) return null;
      const meta = acervo.catalogo.questoes[id] || null, label = labels.get(id);
      const status = record(q).status;
      return { ...record(q), question: acervo.byId.get(id) || { id, prompt: String(q.question || '').replace(/\\n/g, '\n'),
        descriptions: (q.descriptions || []).filter(d => d.use_for_recommender === true).map(d => d.text),
        alternatives: [...q.options].sort((a,b)=>a.label.localeCompare(b.label)).map(o=>({letter:o.label,text:o.text})), correct: q.answer },
        meta, label: label || null, familyId: q.content_family_id, language: q.language,
        tri: q.tri || null, skill: q.skill || null, eligible: eligible.has(id),
        canAnalyze: status === 'liberada' && q.split !== 'test',
        analysisRestriction: q.split === 'test' ? 'Teste de 2024 reservado: consulta somente para leitura; sem diagnóstico ou avaliação de melhoria.' : status !== 'liberada' ? 'Questão fora da prática: confira o motivo antes de corrigir a base.' : null,
        descriptionCount: (q.descriptions || []).filter(d=>d.use_for_recommender===true).length,
        catalog: { method: 'titulo_area', gallery: 'todos os elegíveis', ids: acervo.catalogo.recomendacoes[id] || [] },
      };
    },
  };
}
