export const SESSION_KEY = 'gabaritei:dev:v1';

export function emptySession(now = new Date().toISOString()) {
  return { schemaVersion: 1, createdAt: now, answers: [], reviews: [] };
}

export function sessionStats(session, baseSha256) {
  const answers = session.answers.filter(a => a.baseSha256 === baseSha256);
  const reviews = session.reviews.filter(r => r.baseSha256 === baseSha256);
  const correct = answers.filter(a => a.correct).length;
  return { answered: answers.length, distinct: new Set(answers.map(a => a.questionId)).size, correct,
    accuracy: answers.length ? correct / answers.length : null,
    meanMs: answers.length ? answers.reduce((n,a)=>n+a.durationMs,0)/answers.length : null,
    reviews: reviews.length, ratings: Object.fromEntries(['boa','parcial','ruim','texto'].map(r => [r,reviews.filter(v=>v.rating===r).length])),
    otherVersions: session.answers.length + session.reviews.length - answers.length - reviews.length };
}

export function saveReview(session, review) {
  const index = session.reviews.findIndex(r => r.questionId === review.questionId && r.candidateId === review.candidateId
    && r.baseSha256 === review.baseSha256 && r.gallery === review.gallery);
  if (index < 0) session.reviews.push(review); else session.reviews[index] = review;
}

export function removeLatestRecord(session) {
  const answer = session.answers.at(-1), review = session.reviews.at(-1);
  if (!answer && !review) return null;
  const kind = !review || answer && answer.at > review.at ? 'answers' : 'reviews';
  const index = session[kind].length - 1;
  return { kind, index, record: session[kind].pop() };
}

export function restoreRecord(session, removed) {
  if (removed) session[removed.kind].splice(removed.index, 0, removed.record);
}

export function exportCSV(session) {
  const columns = ['tipo','data','base_sha256','questao','candidata','galeria','resposta','correta','avaliacao','escore','tfidf','qwen','minilm','observacao'];
  const rows = session.answers.map(a => ['resposta',a.at,a.baseSha256,a.questionId,'','',a.selected,a.correct,'','','','','','']);
  for (const r of session.reviews) rows.push(['avaliacao',r.at,r.baseSha256,r.questionId,r.candidateId,r.gallery,'','',r.rating,r.score,r.components?.tfidf?.value,r.components?.qwen?.value,r.components?.minilm?.value,r.note]);
  const cell = value => { let text=String(value ?? ''); if (typeof value==='string' && /^[=+@\-\t\r]/.test(text)) text="'"+text; return '"'+text.replaceAll('"','""')+'"'; };
  return '\uFEFF'+[columns,...rows].map(row=>row.map(cell).join(';')).join('\r\n');
}
