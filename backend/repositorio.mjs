// Acesso aos dados: usuários, sessões de login e o estado de estudo de cada usuário.
// O front-end envia e recebe os mesmos objetos que antes ficavam no localStorage; aqui eles são
// decompostos em tabelas (para consulta e integridade) e recompostos sem perda.
import { transacao } from './db.mjs';
import { agora, novoId, hashToken, erro, DURACAO_SESSAO_MS } from './auth.mjs';

const J = v => JSON.stringify(v ?? null);
const parse = s => { try { return JSON.parse(s); } catch { return null; } };
const bool = v => (v ? 1 : 0);
const sem = (obj, chaves) => Object.fromEntries(Object.entries(obj).filter(([k]) => !chaves.includes(k)));
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, max, nome) => { if (typeof v !== 'string' || v.length > max) throw erro(400, `Campo inválido: ${nome}.`); return v; };
const optStr = (v, max, nome) => (v === null || v === undefined ? null : str(v, max, nome));
const int = (v, nome, min = 0, max = 1e12) => { if (!Number.isFinite(v) || v < min || v > max) throw erro(400, `Campo inválido: ${nome}.`); return Math.trunc(v); };
const letra = (v, nome) => { if (v === null || v === undefined) return null; if (!/^[A-E]$/.test(v)) throw erro(400, `Alternativa inválida em ${nome}.`); return v; };
const lista = (v, max, nome) => { if (!Array.isArray(v) || v.length > max) throw erro(400, `Lista inválida: ${nome}.`); return v; };
const ids = (v, max, nome) => lista(v, max, nome).map(i => str(i, 80, nome));

export const LIMITE = { sessoes: 3000, simulados: 500, questoesPorLista: 3000, favoritas: 5000, atividades: 500, blocos: 1000, html: 100_000 };

/* ------------------------------ usuários ------------------------------ */
export function repositorio(db) {
  const q = sql => db.prepare(sql);
  const rev = (uid, chave) => q('SELECT revisao FROM estado_usuario WHERE usuario_id=? AND chave=?').get(uid, chave)?.revisao ?? 0;
  const conferirRevisao = (uid, chave, base) => {
    const atual = rev(uid, chave);
    if (base !== undefined && base !== null && base !== atual) throw Object.assign(erro(409, 'Seus dados foram alterados em outra aba ou dispositivo. Recarregue para continuar.'), { revisao: atual });
    return atual;
  };
  const gravarRevisao = (uid, chave, nova) => q('INSERT INTO estado_usuario (usuario_id, chave, revisao, atualizado_em) VALUES (?,?,?,?) ON CONFLICT(usuario_id, chave) DO UPDATE SET revisao=excluded.revisao, atualizado_em=excluded.atualizado_em').run(uid, chave, nova, agora());

  const publico = u => u && ({ id: u.id, nome: u.nome, apelido: u.apelido, email: u.email, escola: u.escola, cidade: u.cidade, bio: u.bio, criadoEm: u.criado_em });

  const api = {
    criarUsuario({ nome, email, senhaHash }) {
      const id = novoId(), t = agora();
      try { q('INSERT INTO usuario (id,email,nome,senha_hash,criado_em,atualizado_em) VALUES (?,?,?,?,?,?)').run(id, email, nome, senhaHash, t, t); }
      catch (e) { if (/UNIQUE/i.test(e.message)) throw erro(409, 'Já existe uma conta com esse e-mail.'); throw e; }
      return publico(q('SELECT * FROM usuario WHERE id=?').get(id));
    },
    usuarioPorEmail: email => q('SELECT * FROM usuario WHERE email=?').get(String(email).trim().toLowerCase()),
    usuarioPorId: id => publico(q('SELECT * FROM usuario WHERE id=?').get(id)),
    publico,
    trocarSenha(uid, senhaHash) { q('UPDATE usuario SET senha_hash=?, atualizado_em=? WHERE id=?').run(senhaHash, agora(), uid); q('DELETE FROM sessao_login WHERE usuario_id=?').run(uid); },
    excluirUsuario(uid) { return q('DELETE FROM usuario WHERE id=?').run(uid).changes > 0; },

    /* ----- sessões de login ----- */
    criarSessaoLogin(uid, token, agente = '') {
      const t = Date.now();
      q('DELETE FROM sessao_login WHERE expira_em < ?').run(new Date(t).toISOString());
      q('INSERT INTO sessao_login (token_hash,usuario_id,criada_em,expira_em,ultimo_uso,agente) VALUES (?,?,?,?,?,?)').run(hashToken(token), uid, new Date(t).toISOString(), new Date(t + DURACAO_SESSAO_MS).toISOString(), new Date(t).toISOString(), String(agente).slice(0, 200));
    },
    usuarioDaSessao(token) {
      if (!token) return null;
      const s = q('SELECT * FROM sessao_login WHERE token_hash=?').get(hashToken(token));
      if (!s || s.expira_em < agora()) return null;
      if (Date.now() - Date.parse(s.ultimo_uso) > 3600_000) q('UPDATE sessao_login SET ultimo_uso=? WHERE token_hash=?').run(agora(), s.token_hash);
      return api.usuarioPorId(s.usuario_id);
    },
    encerrarSessaoLogin: token => token && q('DELETE FROM sessao_login WHERE token_hash=?').run(hashToken(token)),

    /* ----- plano ----- */
    obterPlano(uid) {
      const linhas = q('SELECT dados FROM atividade_plano WHERE usuario_id=? ORDER BY ordem').all(uid);
      const r = rev(uid, 'plano');
      return { revisao: r, data: r === 0 && !linhas.length ? null : { activities: linhas.map(l => parse(l.dados)) } };
    },
    salvarPlano(uid, data, base) {
      if (!isObj(data)) throw erro(400, 'Plano inválido.');
      const atividades = lista(data.activities, LIMITE.atividades, 'activities').map(a => {
        if (!isObj(a)) throw erro(400, 'Atividade inválida.');
        const dados = JSON.stringify(a);
        if (dados.length > 50_000) throw erro(413, 'Atividade muito grande.');
        return { id: str(a.id, 80, 'id'), titulo: str(a.title, 300, 'title'), area: str(a.area, 40, 'area'), criada: optStr(a.createdAt, 40, 'createdAt'), atualizada: optStr(a.updatedAt, 40, 'updatedAt'), dados };
      });
      if (new Set(atividades.map(a => a.id)).size !== atividades.length) throw erro(400, 'Atividades com id repetido.');
      return transacao(db, () => {
        const nova = conferirRevisao(uid, 'plano', base) + 1;
        q('DELETE FROM atividade_plano WHERE usuario_id=?').run(uid);
        const ins = q('INSERT INTO atividade_plano (id,usuario_id,ordem,titulo,area,criada_em,atualizada_em,dados) VALUES (?,?,?,?,?,?,?,?)');
        atividades.forEach((a, i) => ins.run(a.id, uid, i, a.titulo, a.area, a.criada, a.atualizada, a.dados));
        gravarRevisao(uid, 'plano', nova);
        return { revisao: nova };
      });
    },

    /* ----- notas ----- */
    obterNotas(uid) {
      const linhas = q('SELECT * FROM nota_bloco WHERE usuario_id=? ORDER BY ordem').all(uid);
      const r = rev(uid, 'notas');
      const blocks = linhas.map(l => ({ ...parse(l.dados), id: l.id, type: l.tipo, ...(l.tipo === 'text' ? { html: l.html } : { ref: { kind: l.ref_tipo, id: l.ref_id } }) }));
      return { revisao: r, data: r === 0 && !blocks.length ? null : { blocks } };
    },
    salvarNotas(uid, data, base) {
      if (!isObj(data)) throw erro(400, 'Notas inválidas.');
      const blocos = lista(data.blocks, LIMITE.blocos, 'blocks').map(b => {
        if (!isObj(b)) throw erro(400, 'Bloco inválido.');
        const id = str(b.id, 80, 'id');
        if (b.type === 'text') return { id, tipo: 'text', html: limparHtml(str(b.html, LIMITE.html, 'html')), refTipo: null, refId: null, extra: sem(b, ['id', 'type', 'html']) };
        if (b.type === 'ref' && isObj(b.ref)) return { id, tipo: 'ref', html: null, refTipo: str(b.ref.kind, 40, 'ref.kind'), refId: b.ref.id === undefined || b.ref.id === null ? '' : str(String(b.ref.id), 120, 'ref.id'), extra: sem(b, ['id', 'type', 'ref']) };
        throw erro(400, 'Tipo de bloco desconhecido.');
      });
      if (new Set(blocos.map(b => b.id)).size !== blocos.length) throw erro(400, 'Blocos com id repetido.');
      return transacao(db, () => {
        const nova = conferirRevisao(uid, 'notas', base) + 1;
        q('DELETE FROM nota_bloco WHERE usuario_id=?').run(uid);
        const ins = q('INSERT INTO nota_bloco (id,usuario_id,ordem,tipo,html,ref_tipo,ref_id,dados) VALUES (?,?,?,?,?,?,?,?)');
        blocos.forEach((b, i) => ins.run(b.id, uid, i, b.tipo, b.html, b.refTipo, b.refId, J(b.extra)));
        gravarRevisao(uid, 'notas', nova);
        return { revisao: nova };
      });
    },

    /* ----- estudos (conta, práticas, simulados, favoritas, metas…) ----- */
    obterEstudos(uid) {
      const ce = q('SELECT * FROM conta_estudos WHERE usuario_id=?').get(uid);
      const r = rev(uid, 'estudos');
      if (!ce) return { revisao: r, data: null };
      const u = q('SELECT * FROM usuario WHERE id=?').get(uid);
      const respP = q('SELECT * FROM resposta_pratica WHERE sessao_id IN (SELECT id FROM sessao_pratica WHERE usuario_id=?) ORDER BY rowid').all(uid);
      const respS = q('SELECT * FROM resposta_simulado WHERE simulado_id IN (SELECT id FROM simulado WHERE usuario_id=?) ORDER BY rowid').all(uid);
      const agrupar = (rows, chave) => { const m = new Map(); for (const r2 of rows) { if (!m.has(r2[chave])) m.set(r2[chave], {}); m.get(r2[chave])[r2.questao_id] = r2; } return m; };
      const ap = agrupar(respP, 'sessao_id'), as = agrupar(respS, 'simulado_id');
      const practiceSessions = q('SELECT * FROM sessao_pratica WHERE usuario_id=? ORDER BY ordem').all(uid).map(s => ({
        ...parse(s.extra), id: s.id, kind: 'practice', mode: s.modo, title: s.titulo, createdAt: s.criada_em, updatedAt: s.atualizada_em, status: s.status, completedAt: s.concluida_em,
        filters: parse(s.filtros), questionIds: parse(s.questoes),
        answers: Object.fromEntries(Object.entries(ap.get(s.id) || {}).map(([k, a]) => [k, { ...parse(a.extra), questionId: k, selected: a.selecionada, confirmed: !!a.confirmada, correct: a.correta === null ? null : !!a.correta, answeredAt: a.respondida_em, timeSpentMs: a.tempo_ms }])),
        currentIndex: s.indice_atual, clock: parse(s.relogio), cursorElapsedMs: s.cursor_ms, timerVisible: !!s.cronometro_visivel,
      }));
      const simulations = q('SELECT * FROM simulado WHERE usuario_id=? ORDER BY ordem').all(uid).map(s => ({
        ...parse(s.extra), id: s.id, kind: 'simulation', title: s.titulo, createdAt: s.criado_em, updatedAt: s.atualizado_em, status: s.status, completedAt: s.concluido_em, finishReason: s.motivo_fim,
        config: parse(s.configuracao), questionIds: parse(s.questoes), sections: parse(s.secoes),
        answers: Object.fromEntries(Object.entries(as.get(s.id) || {}).map(([k, a]) => [k, { ...parse(a.extra), questionId: k, selected: a.selecionada, answeredAt: a.respondida_em, timeSpentMs: a.tempo_ms }])),
        marked: parse(s.marcadas), currentIndex: s.indice_atual, clock: parse(s.relogio), cursorElapsedMs: s.cursor_ms, timerHidden: !!s.cronometro_oculto,
      }));
      const col = (tabela, campo) => q(`SELECT ${campo} AS v FROM ${tabela} WHERE usuario_id=? ORDER BY ordem`).all(uid).map(x => x.v);
      return {
        revisao: r,
        data: {
          ...parse(ce.extra), schemaVersion: ce.schema_version,
          profile: { id: u.id, kind: 'registered', name: u.nome, nickname: u.apelido, email: u.email, school: u.escola, city: u.cidade, bio: u.bio, createdAt: u.criado_em },
          onboarding: parse(ce.onboarding), study: parse(ce.preferencias), practiceSessions, simulations,
          favorites: col('favorita', 'questao_id'), reviewMarks: col('marca_revisao', 'questao_id'),
          goals: q('SELECT tipo, alvo, ativa FROM meta WHERE usuario_id=? ORDER BY ordem').all(uid).map(g => ({ kind: g.tipo, target: g.alvo, enabled: !!g.ativa })),
          celebratedAchievements: col('conquista_celebrada', 'conquista_id'),
        },
      };
    },
    salvarEstudos(uid, data, base) {
      const v = validarEstudos(data);
      return transacao(db, () => {
        const nova = conferirRevisao(uid, 'estudos', base) + 1;
        const p = v.profile;
        // no primeiro envio (dados vindos do navegador) vale o nome informado no cadastro
        if (!q('SELECT 1 FROM conta_estudos WHERE usuario_id=?').get(uid)) p.name = q('SELECT nome FROM usuario WHERE id=?').get(uid).nome;
        q('UPDATE usuario SET nome=?, apelido=?, escola=?, cidade=?, bio=?, atualizado_em=? WHERE id=?').run(p.name, p.nickname, p.school, p.city, p.bio, agora(), uid);
        q('INSERT INTO conta_estudos (usuario_id,schema_version,onboarding,preferencias,extra) VALUES (?,?,?,?,?) ON CONFLICT(usuario_id) DO UPDATE SET schema_version=excluded.schema_version, onboarding=excluded.onboarding, preferencias=excluded.preferencias, extra=excluded.extra').run(uid, v.schemaVersion, J(v.onboarding), J(v.study), J(v.extra));
        for (const t of ['sessao_pratica', 'simulado', 'favorita', 'marca_revisao', 'meta', 'conquista_celebrada']) q(`DELETE FROM ${t} WHERE usuario_id=?`).run(uid);
        const usados = new Set();
        const unico = (id, nome) => { if (usados.has(id)) throw erro(400, `Identificador repetido em ${nome}.`); usados.add(id); };
        const insP = q('INSERT INTO sessao_pratica (id,usuario_id,ordem,modo,titulo,status,criada_em,atualizada_em,concluida_em,filtros,questoes,indice_atual,relogio,cursor_ms,cronometro_visivel,extra) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        const insRP = q('INSERT INTO resposta_pratica (sessao_id,questao_id,selecionada,confirmada,correta,respondida_em,tempo_ms,extra) VALUES (?,?,?,?,?,?,?,?)');
        // ids de sessões são globais na tabela: se já pertencerem a outro usuário, recusa em vez de sobrescrever
        const dono = q('SELECT usuario_id FROM sessao_pratica WHERE id=?'), donoS = q('SELECT usuario_id FROM simulado WHERE id=?');
        v.practice.forEach((s, i) => {
          unico(s.id, 'práticas'); if (dono.get(s.id)) throw erro(409, 'Identificador de prática já usado.');
          insP.run(s.id, uid, i, s.mode, s.title, s.status, s.createdAt, s.updatedAt, s.completedAt, J(s.filters), J(s.questionIds), s.currentIndex, J(s.clock), s.cursorElapsedMs, bool(s.timerVisible), J(s.extra));
          for (const a of s.answers) insRP.run(s.id, a.id, a.selected, bool(a.confirmed), a.correct === null ? null : bool(a.correct), a.answeredAt, a.timeSpentMs, J(a.extra));
        });
        const insS = q('INSERT INTO simulado (id,usuario_id,ordem,titulo,status,criado_em,atualizado_em,concluido_em,motivo_fim,configuracao,questoes,secoes,marcadas,indice_atual,relogio,cursor_ms,cronometro_oculto,extra) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        const insRS = q('INSERT INTO resposta_simulado (simulado_id,questao_id,selecionada,respondida_em,tempo_ms,extra) VALUES (?,?,?,?,?,?)');
        v.simulations.forEach((s, i) => {
          unico(s.id, 'simulados'); if (donoS.get(s.id)) throw erro(409, 'Identificador de simulado já usado.');
          insS.run(s.id, uid, i, s.title, s.status, s.createdAt, s.updatedAt, s.completedAt, s.finishReason, J(s.config), J(s.questionIds), J(s.sections), J(s.marked), s.currentIndex, J(s.clock), s.cursorElapsedMs, bool(s.timerHidden), J(s.extra));
          for (const a of s.answers) insRS.run(s.id, a.id, a.selected, a.answeredAt, a.timeSpentMs, J(a.extra));
        });
        const insL = (tabela, valores) => { const st = q(`INSERT INTO ${tabela} VALUES (?,?,?)`); valores.forEach((x, i) => st.run(uid, x, i)); };
        insL('favorita', v.favorites); insL('marca_revisao', v.reviewMarks); insL('conquista_celebrada', v.celebrated);
        const insM = q('INSERT INTO meta (usuario_id,tipo,alvo,ativa,ordem) VALUES (?,?,?,?,?)');
        v.goals.forEach((g, i) => insM.run(uid, g.kind, g.target, bool(g.enabled), i));
        gravarRevisao(uid, 'estudos', nova);
        return { revisao: nova };
      });
    },
  };
  return api;
}

/* ----------------------------- validação ----------------------------- */
function validarEstudos(d) {
  if (!isObj(d)) throw erro(400, 'Dados de estudo inválidos.');
  const p = d.profile; if (!isObj(p)) throw erro(400, 'Perfil ausente.');
  const profile = { name: str(p.name, 80, 'profile.name').trim() || 'Estudante', nickname: str(p.nickname ?? '', 40, 'profile.nickname'), school: str(p.school ?? '', 120, 'profile.school'), city: str(p.city ?? '', 80, 'profile.city'), bio: str(p.bio ?? '', 500, 'profile.bio') };
  if (!isObj(d.onboarding) || !isObj(d.study)) throw erro(400, 'Preferências ausentes.');
  const conhecidas = ['schemaVersion', 'profile', 'onboarding', 'study', 'practiceSessions', 'simulations', 'favorites', 'reviewMarks', 'goals', 'celebratedAchievements'];
  const respostas = (obj, nome, pratica) => {
    if (!isObj(obj) || Object.keys(obj).length > LIMITE.questoesPorLista) throw erro(400, `Respostas inválidas em ${nome}.`);
    return Object.entries(obj).map(([id, a]) => {
      if (!isObj(a)) throw erro(400, `Resposta inválida em ${nome}.`);
      str(id, 80, 'questionId'); if (a.questionId !== undefined && a.questionId !== id) throw erro(400, `Resposta com identificador divergente em ${nome}.`);
      const base = { id, selected: letra(a.selected, nome), answeredAt: optStr(a.answeredAt, 40, 'answeredAt'), timeSpentMs: int(a.timeSpentMs ?? 0, 'timeSpentMs') };
      return pratica
        ? { ...base, confirmed: !!a.confirmed, correct: a.correct === null || a.correct === undefined ? null : !!a.correct, extra: sem(a, ['questionId', 'selected', 'confirmed', 'correct', 'answeredAt', 'timeSpentMs']) }
        : { ...base, extra: sem(a, ['questionId', 'selected', 'answeredAt', 'timeSpentMs']) };
    });
  };
  const status = s => { if (!['in_progress', 'completed'].includes(s)) throw erro(400, 'Status inválido.'); return s; };
  const comum = (s, nome) => {
    if (!isObj(s)) throw erro(400, `Item inválido em ${nome}.`);
    if (!isObj(s.clock) || !isObj(s.filters ?? s.config)) throw erro(400, `Item incompleto em ${nome}.`);
    return { id: str(s.id, 80, 'id'), title: str(s.title, 300, 'title'), status: status(s.status), createdAt: str(s.createdAt, 40, 'createdAt'), updatedAt: str(s.updatedAt, 40, 'updatedAt'), completedAt: optStr(s.completedAt, 40, 'completedAt'), questionIds: ids(s.questionIds, LIMITE.questoesPorLista, 'questionIds'), currentIndex: int(s.currentIndex ?? 0, 'currentIndex'), clock: s.clock, cursorElapsedMs: int(s.cursorElapsedMs ?? 0, 'cursorElapsedMs') };
  };
  const practice = lista(d.practiceSessions, LIMITE.sessoes, 'practiceSessions').map(s => ({
    ...comum(s, 'practiceSessions'), mode: str(s.mode, 30, 'mode'), filters: s.filters, timerVisible: s.timerVisible !== false,
    answers: respostas(s.answers, 'práticas', true),
    extra: sem(s, ['id', 'kind', 'mode', 'title', 'createdAt', 'updatedAt', 'status', 'completedAt', 'filters', 'questionIds', 'answers', 'currentIndex', 'clock', 'cursorElapsedMs', 'timerVisible']),
  }));
  const simulations = lista(d.simulations, LIMITE.simulados, 'simulations').map(s => ({
    ...comum(s, 'simulations'), finishReason: optStr(s.finishReason, 20, 'finishReason'), config: s.config, sections: lista(s.sections ?? [], 20, 'sections'), marked: ids(s.marked ?? [], LIMITE.questoesPorLista, 'marked'), timerHidden: !!s.timerHidden,
    answers: respostas(s.answers, 'simulados', false),
    extra: sem(s, ['id', 'kind', 'title', 'createdAt', 'updatedAt', 'status', 'completedAt', 'finishReason', 'config', 'questionIds', 'sections', 'answers', 'marked', 'currentIndex', 'clock', 'cursorElapsedMs', 'timerHidden']),
  }));
  const goals = lista(d.goals, 20, 'goals').map(g => { if (!isObj(g)) throw erro(400, 'Meta inválida.'); return { kind: str(g.kind, 40, 'goal.kind'), target: Number.isFinite(g.target) ? g.target : 0, enabled: !!g.enabled }; });
  if (new Set(goals.map(g => g.kind)).size !== goals.length) throw erro(400, 'Metas repetidas.');
  const unicos = (arr, nome) => [...new Set(ids(arr, LIMITE.favoritas, nome))];
  return { schemaVersion: int(d.schemaVersion ?? 1, 'schemaVersion', 0, 10_000), profile, onboarding: d.onboarding, study: d.study, practice, simulations, goals,
    favorites: unicos(d.favorites, 'favorites'), reviewMarks: unicos(d.reviewMarks, 'reviewMarks'), celebrated: unicos(d.celebratedAchievements, 'celebratedAchievements'), extra: sem(d, conhecidas) };
}

/** Mantém só a formatação suportada pelas notas (mesma lista do front-end) e remove o resto. */
export function limparHtml(html) {
  const permitidas = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'p', 'ul', 'ol', 'li', 'span', 'font']);
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (todo, nome, attrs) => {
    const tag = nome.toLowerCase();
    if (!permitidas.has(tag)) return '';
    if (todo.startsWith('</')) return `</${tag}>`;
    let out = '';
    if (tag === 'span' || tag === 'font') {
      const estilo = /style\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] ?? /style\s*=\s*'([^']*)'/i.exec(attrs)?.[1];
      const cor = estilo && /(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\))\s*(?:;|$)/i.exec(estilo)?.[1];
      const corFont = tag === 'font' && /color\s*=\s*"?(#[0-9a-f]{3,8})"?/i.exec(attrs)?.[1];
      if (cor) out = ` style="color: ${cor}"`; else if (corFont) out = ` color="${corFont}"`;
    }
    return `<${tag}${out}${/\/\s*>$/.test(todo) ? ' /' : ''}>`;
  }).replace(/<(?!\/?(?:b|strong|i|em|u|br|div|p|ul|ol|li|span|font)\b)/gi, '&lt;');
}
