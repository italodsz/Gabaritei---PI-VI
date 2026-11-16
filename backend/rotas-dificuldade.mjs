// Recomendador de dificuldade no servidor: perfil TRI por área, registro de cada resposta e a rota
// /api/recomendar com modos. O cálculo é o mesmo do navegador (frontend/dificuldade.js).
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import * as T from '../frontend/dificuldade.js';
import { lerCookie, erro } from './auth.mjs';
import { transacao } from './db.mjs';

const texto = readFileSync(new URL('./config/dificuldade_v1.json', import.meta.url), 'utf8');
export const CONFIG = JSON.parse(texto);
export const CONFIG_SHA256 = createHash('sha256').update(texto).digest('hex');
const INEP = { matematica: 'MT', natureza: 'CN', humanas: 'CH', linguagens: 'LC' };
const areaDe = q => q?.sourceArea || INEP[q?.areaId];
const MODOS = ['semelhante', 'conjunto', 'aleatorio'];

export function criarDificuldade({ db, repo, acervo, cfg = CONFIG }) {
  const q = sql => db.prepare(sql);
  db.prepare('INSERT OR IGNORE INTO config_dificuldade (versao, sha256, conteudo, registrada_em) VALUES (?,?,?,?)').run(cfg.versao, CONFIG_SHA256, JSON.stringify(cfg), new Date().toISOString());
  const usuario = req => repo.usuarioDaSessao(lerCookie(req));
  const itemDe = id => acervo.byId.get(id)?.tri ?? null;

  /* ----------------------------- perfis ----------------------------- */
  function perfis(uid) {
    const out = Object.fromEntries(T.AREAS.map(a => [a, T.perfilInicial(a, cfg)]));
    for (const r of q('SELECT * FROM perfil_tri WHERE usuario_id=?').all(uid)) {
      out[r.area] = { area: r.area, lw: JSON.parse(r.lw), n: r.n, atualizadoEm: r.atualizado_em, pstar: r.pstar, respostas: JSON.parse(r.respostas) };
    }
    return out;
  }
  function salvarPerfil(uid, p) {
    q(`INSERT INTO perfil_tri (usuario_id, area, lw, n, atualizado_em, pstar, respostas, versao_config) VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(usuario_id, area) DO UPDATE SET lw=excluded.lw, n=excluded.n, atualizado_em=excluded.atualizado_em, pstar=excluded.pstar, respostas=excluded.respostas, versao_config=excluded.versao_config`)
      .run(uid, p.area, JSON.stringify(p.lw), p.n, p.atualizadoEm, p.pstar, JSON.stringify(p.respostas || []), cfg.versao);
    const r = T.resumoNota(p, cfg);
    if (r.status !== 'calibrando') {
      q('INSERT INTO perfil_tri_historico (usuario_id, area, dia, nota, nota_min, nota_max, n) VALUES (?,?,?,?,?,?,?) ON CONFLICT(usuario_id, area, dia) DO UPDATE SET nota=excluded.nota, nota_min=excluded.nota_min, nota_max=excluded.nota_max, n=excluded.n')
        .run(uid, p.area, new Date(p.atualizadoEm || Date.now()).toISOString().slice(0, 10), r.nota, r.min, r.max, p.n);
    }
  }
  function visao(uid) {
    const ps = perfis(uid), resumos = T.AREAS.map(a => T.resumoNota(ps[a], cfg));
    const historico = q('SELECT area, dia, nota, nota_min, nota_max, n FROM perfil_tri_historico WHERE usuario_id=? ORDER BY dia').all(uid);
    return { versao: cfg.versao, perfis: ps, resumos, agregados: T.agregados(resumos), historico };
  }
  /** Perfil enviado pelo navegador (aluno sem login): validado, senão o inicial. */
  function perfilDoCorpo(area, bruto) {
    const n = T.grade(cfg).length;
    if (bruto && Array.isArray(bruto.lw) && bruto.lw.length === n && bruto.lw.every(Number.isFinite)) {
      return { area, lw: bruto.lw, n: Number.isInteger(bruto.n) ? bruto.n : 0, atualizadoEm: Number.isFinite(bruto.atualizadoEm) ? bruto.atualizadoEm : null, pstar: Number.isFinite(bruto.pstar) ? bruto.pstar : null, respostas: [] };
    }
    return T.perfilInicial(area, cfg);
  }

  /* ----------------------------- respostas ----------------------------- */
  /** Registra uma resposta conferida pelo servidor e atualiza o θ. Devolve o perfil da área ou null sem login. */
  function registrar(uid, question, { alternativa, correta, tempoMs, apoio, origem = 'pratica', primeiraCliente = true, desafio }) {
    const area = areaDe(question);
    if (!uid || !T.AREAS.includes(area)) return null;
    return transacao(db, () => {
      const atual = perfis(uid)[area], it = itemDe(question.id);
      const jaRespondeu = q('SELECT 1 FROM resposta_evento WHERE usuario_id=? AND questao_id=? LIMIT 1').get(uid, question.id);
      const primeira = !jaRespondeu && primeiraCliente !== false;
      const regra = T.contaParaTheta({ it, primeira, apoio: !!apoio, tempoMs, origem }, cfg);
      const { media, dp } = T.momentos(atual, cfg);
      const prevista = it ? T.chance(T.alargar(atual, Date.now(), cfg), it, cfg) : null;
      let novo = regra.conta ? T.atualizar(atual, it, correta, cfg, { agoraMs: Date.now(), peso: regra.peso }) : atual;
      if (origem === 'pratica' && !apoio) novo = T.registrarAcerto(novo, correta, cfg, T.metaDe(desafio, cfg));
      q(`INSERT INTO resposta_evento (id, usuario_id, questao_id, area, alternativa, correta, tempo_ms, primeira, apoio, origem, chance_prevista, theta_media, theta_dp, pstar, conta, motivo, versao_config, criada_em)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(randomUUID(), uid, question.id, area, alternativa ?? null, correta ? 1 : 0, Number.isFinite(tempoMs) ? Math.round(tempoMs) : null,
        primeira ? 1 : 0, apoio ? 1 : 0, origem, prevista, media, dp, atual.pstar, regra.conta ? 1 : 0, regra.motivo ?? null, cfg.versao, new Date().toISOString());
      if (novo !== atual) salvarPerfil(uid, novo);
      return { area, perfil: novo, conta: regra.conta, motivo: regra.motivo ?? null, chancePrevista: prevista, resumo: T.resumoNota(novo, cfg) };
    });
  }

  /* ----------------------------- recomendar ----------------------------- */
  function recomendar(uid, input) {
    const modo = input?.modo;
    if (!MODOS.includes(modo)) throw erro(400, `modo deve ser um de: ${MODOS.join(', ')}.`);
    const limite = Math.min(50, Math.max(1, Number.isInteger(input.limite) ? input.limite : 10));
    const usar = input.usarDificuldade !== false;
    const exclude = Array.isArray(input.exclude) ? input.exclude.filter(i => typeof i === 'string').slice(0, 5000) : [];
    const meta = T.metaDe(input.desafio, cfg);
    const meus = uid ? perfis(uid) : null;
    const perfilDe = area => (meus ? meus[area] : perfilDoCorpo(area, input.perfis?.[area]));
    const chanceDe = id => { const qq = acervo.byId.get(id), it = qq?.tri; return it ? T.chance(perfilDe(areaDe(qq)), it, cfg) : null; };
    const historico = new Map((Array.isArray(input.historico) ? input.historico : []).filter(h => h && typeof h.id === 'string').map(h => [h.id, h]));
    const estado = id => { const h = historico.get(id); if (!h) return 'inedita'; if (h.correta) return 'acertou'; return Date.now() - Date.parse(h.em || 0) >= cfg.lista.revisao_dias * 864e5 ? 'revisao' : 'errou'; };
    let ids;
    if (modo === 'semelhante') {
      if (!acervo.catalogo.questoes[input.questaoRef]) throw erro(404, 'Questão de referência não encontrada.');
      const base = acervo.recommendations(input.questaoRef, exclude, 50);
      ids = usar ? T.ordenarSemelhantes(base, chanceDe, meta, cfg) : base;
    } else {
      let pool;
      if (modo === 'conjunto') {
        if (!Array.isArray(input.ids) || input.ids.length > 3000) throw erro(400, 'Envie ids (até 3000).');
        pool = [...new Set(input.ids)].filter(id => acervo.byId.has(id));
      } else {
        pool = acervo.questions.filter(qq => (!input.area || areaDe(qq) === input.area || qq.areaId === input.area) && (!input.materia || qq.subjectId === input.materia)).map(qq => qq.id);
      }
      const fora = new Set(exclude);
      pool = pool.filter(id => !fora.has(id));
      if (usar) ids = T.montarLista(pool.map(id => ({ id, p: chanceDe(id), estado: estado(id), alerta: !!acervo.byId.get(id).warning })), limite, meta, cfg);
      else { ids = [...pool]; for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } }
    }
    ids = ids.slice(0, limite);
    return {
      modo, usarDificuldade: usar, meta, versao: cfg.versao,
      itens: ids.map(id => { const p = chanceDe(id); return { id, chance: p, apoioDisponivel: T.apoioDisponivel(p, cfg) }; }),
      ids,
    };
  }

  /* ----------------------------- rotas ----------------------------- */
  async function tratar({ req, res, pathname, send, body }) {
    const m = req.method;
    if (m === 'GET' && pathname === '/api/dificuldade/config') { send(res, 200, { ...cfg, sha256: CONFIG_SHA256 }); return true; }
    if (pathname === '/api/eu/perfil-tri') {
      const u = usuario(req);
      if (m === 'GET') { send(res, 200, u ? visao(u.id) : { usuario: null }); return true; }
      if (m === 'PUT') {
        // ao entrar pela primeira vez: o perfil feito no navegador sobe só para áreas ainda vazias no servidor
        if (!u) throw erro(401, 'Entre na sua conta para continuar.');
        const input = await body(req);
        const vazias = new Set(T.AREAS.filter(a => !q('SELECT 1 FROM perfil_tri WHERE usuario_id=? AND area=?').get(u.id, a)));
        for (const a of vazias) { const p = input?.perfis?.[a]; if (p && Number.isInteger(p.n) && p.n > 0) salvarPerfil(u.id, { ...perfilDoCorpo(a, p), n: p.n }); }
        send(res, 200, visao(u.id)); return true;
      }
    }
    if (m === 'POST' && pathname === '/api/eu/perfil-tri/respostas') {
      // respostas de simulado, conferidas aqui contra o gabarito oficial
      const u = usuario(req);
      if (!u) throw erro(401, 'Entre na sua conta para continuar.');
      const input = await body(req);
      const lista = Array.isArray(input?.respostas) ? input.respostas.slice(0, 200) : null;
      if (!lista) throw erro(400, 'Envie { respostas: [...] }.');
      let registradas = 0;
      for (const r of lista) {
        const question = acervo.byId.get(r?.questaoId);
        if (!question || !/^[A-E]$/.test(r.alternativa)) continue;
        registrar(u.id, question, { alternativa: r.alternativa, correta: r.alternativa === question.correct, tempoMs: r.tempoMs, origem: 'simulado' });
        registradas++;
      }
      send(res, 200, { registradas, ...visao(u.id) }); return true;
    }
    if (m === 'POST' && pathname === '/api/recomendar') { const u = usuario(req); send(res, 200, recomendar(u?.id, await body(req, 600_000))); return true; }
    if (m === 'GET' && pathname === '/api/dev/dificuldade') { send(res, 200, painelDev()); return true; }
    return false;
  }

  /** Para o laboratório: calibração previsto × observado e contagens. */
  function painelDev() {
    const ev = q('SELECT chance_prevista p, correta y, conta, apoio, origem, area FROM resposta_evento WHERE chance_prevista IS NOT NULL').all();
    const faixas = Array.from({ length: 10 }, (_, i) => ({ faixa: `${i * 10}–${i * 10 + 10}%`, n: 0, prevista: 0, observada: 0 }));
    for (const e of ev) { if (e.apoio) continue; const f = faixas[Math.min(9, Math.floor(e.p * 10))]; f.n++; f.prevista += e.p; f.observada += e.y; }
    for (const f of faixas) if (f.n) { f.prevista = +(f.prevista / f.n).toFixed(3); f.observada = +(f.observada / f.n).toFixed(3); }
    const total = q('SELECT COUNT(*) n, SUM(conta) contam, COUNT(DISTINCT usuario_id) usuarios FROM resposta_evento').get();
    const motivos = q('SELECT motivo, COUNT(*) n FROM resposta_evento WHERE conta=0 GROUP BY motivo').all();
    return { versao: cfg.versao, sha256: CONFIG_SHA256, eventos: total.n, contamParaTheta: total.contam ?? 0, usuarios: total.usuarios, motivosNaoConta: motivos, calibracao: faixas.filter(f => f.n) };
  }

  return { tratar, registrar, usuario, visao, recomendar };
}
