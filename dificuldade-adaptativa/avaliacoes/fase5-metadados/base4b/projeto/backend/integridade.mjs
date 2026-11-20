// Integridade de respostas: não altera o modelo TRI ou o recomendador semântico.
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import * as T from '../frontend/dificuldade.js';
import { lerCookie, erro } from './auth.mjs';
import { transacao } from './db.mjs';

export const POLITICA_INTEGRIDADE = Object.freeze({ versao: 'fase4a-v1', minimoMs: 8000, validadeMs: 6 * 3600_000 });
const hash = value => createHash('sha256').update(value).digest('hex');
const COOKIE = 'gabaritei_exercicio';
export function tempoValido(ms, minimo = 8000) { return typeof ms === 'number' && Number.isSafeInteger(ms) && ms >= minimo; }

export function criarIntegridade({ db, repo, acervo, cfg, relogio = Date.now, monotono = relogio === Date.now ? () => performance.now() : relogio }) {
  const instancia = randomUUID(), q = sql => db.prepare(sql);
  const versoes = { integridade: POLITICA_INTEGRIDADE.versao, dataset: acervo.info?.sha256, catalogo: acervo.info?.catalogSha256, config: hash(JSON.stringify(cfg)) };
  function sujeito(req, res, criar = false) {
    const u = repo.usuarioDaSessao(lerCookie(req));
    if (u) return `user:${u.id}`;
    const token = lerCookie(req, COOKIE);
    if (token && /^[a-f0-9]{64}$/.test(token) && q('SELECT 1 FROM sessao_exercicio WHERE token_hash=?').get(hash(token))) return `session:${hash(token)}`;
    if (!criar) return null;
    const novo = randomBytes(32).toString('hex');
    q('INSERT INTO sessao_exercicio VALUES (?,?)').run(hash(novo), relogio());
    res.setHeader('Set-Cookie', `${COOKIE}=${novo}; HttpOnly; SameSite=Lax; Path=/${process.env.GABARITEI_COOKIE_SEGURO === '1' ? '; Secure' : ''}`);
    return `session:${hash(novo)}`;
  }
  function perfis(s) {
    const ps = Object.fromEntries(T.AREAS.map(a => [a, T.perfilInicial(a, cfg)]));
    if (s) for (const row of q('SELECT * FROM perfil_verificado WHERE sujeito=?').all(s)) ps[row.area] = JSON.parse(row.perfil_json);
    return ps;
  }
  function visao(s) {
    const ps = perfis(s), resumos = T.AREAS.map(a => T.resumoNota(ps[a], cfg));
    const dias = new Map();
    if (s) for (const r of q('SELECT * FROM evento_integridade WHERE sujeito=? AND conta=1 ORDER BY seq').all(s)) {
      const p=JSON.parse(r.perfil_apos), resumo=T.resumoNota(p,JSON.parse(r.config_json)), dia=new Date(r.recebida_ms).toISOString().slice(0,10);
      if(resumo.status!=='calibrando')dias.set(r.area+dia,{area:r.area,dia,nota:resumo.nota,nota_min:resumo.min,nota_max:resumo.max,n:p.n});
    }
    const legado = s?.startsWith('user:') ? q('SELECT area,n FROM perfil_tri WHERE usuario_id=?').all(s.slice(5)) : [];
    return { versao: cfg.versao, integridade: POLITICA_INTEGRIDADE.versao, perfis: ps, resumos, agregados: T.agregados(resumos), historico:[...dias.values()],
      legadoNaoVerificado: legado.map(r => ({ area: r.area, nInformado: r.n, status: 'legado_nao_verificado' })) };
  }
  function emitir(s, id, { sessaoId, origem = 'pratica' } = {}) {
    const item = acervo.byId.get(id);
    if (!item) throw erro(422, 'Questão indisponível para prática.');
    if (!s || typeof sessaoId !== 'string' || !sessaoId.trim() || sessaoId.length > 128 || !['pratica', 'simulado'].includes(origem)) throw erro(400, 'Sessão de exercício ou origem inválida.');
    // Reabrir/Anterior/recarregar retoma a mesma apresentação, inclusive seu recibo.
    let t = q('SELECT * FROM tentativa_integridade WHERE sujeito=? AND sessao=? AND questao_id=? ORDER BY rowid DESC LIMIT 1').get(s, sessaoId, id);
    const now = relogio();
    if (!t || (!t.recibo && (now > t.expira_ms || t.instancia !== instancia))) {
      const row = acervo.rows.get(id), area = item.sourceArea;
      const snapshot = { tri: item.tri, area, familyId: item.familyId, answer: item.correct };
      const predicted = item.tri ? T.chance(perfis(s)[area], item.tri, cfg) : null;
      const attempt = randomUUID();
      q(`INSERT INTO tentativa_integridade (id,sujeito,questao_id,familia,sessao,origem,emitida_ms,emitida_mono,instancia,expira_ms,item_json,config_json,versoes_json,chance_previa)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(attempt,s,id,item.familyId || row.content_family_id,sessaoId,origem,now,monotono(),instancia,now+POLITICA_INTEGRIDADE.validadeMs,JSON.stringify(snapshot),JSON.stringify(cfg),JSON.stringify(versoes),predicted);
      t = q('SELECT * FROM tentativa_integridade WHERE id=?').get(attempt);
    }
    return { tentativaId: t.id, questaoId: id, minimoMs: POLITICA_INTEGRIDADE.minimoMs, restanteMs: t.recibo ? 0 : Math.max(0, POLITICA_INTEGRIDADE.minimoMs - (t.instancia === instancia ? monotono() - t.emitida_mono : 0)), expiraEm: t.expira_ms, apoio: !!t.apoio, respondida: !!t.recibo };
  }
  function tentativa(s,id) {
    const t = q('SELECT * FROM tentativa_integridade WHERE id=? AND sujeito=?').get(id,s);
    if (!t) throw erro(404, 'Tentativa não encontrada para esta sessão.');
    return t;
  }
  function apoio(s,id) {
    const t = tentativa(s,id);
    if (t.recibo) throw erro(409, 'Tentativa já respondida.');
    q('UPDATE tentativa_integridade SET apoio=1 WHERE id=?').run(id);
    return { tentativaId: id, apoio: true };
  }
  function responder(s,questionId,input,key) {
    if (!s) throw erro(401, 'Abra a questão para iniciar uma sessão verificável.');
    if (typeof input?.tentativaId !== 'string') throw erro(400, 'tentativaId emitida pelo servidor é obrigatória.');
    const t = tentativa(s,input.tentativaId);
    if (t.questao_id !== questionId) throw erro(409, 'Tentativa incompatível com a questão.');
    const selected = input.selected;
    if (!/^[A-E]$/.test(selected)) throw erro(400, 'Escolha uma alternativa de A a E.');
    key = key || input.tentativaId;
    if (typeof key !== 'string' || key.length > 128 || !key) throw erro(400, 'Chave de idempotência inválida.');
    const payload = hash(JSON.stringify({ tentativa: t.id, selected, tempoMs: input.tempoMs ?? null, apoio: input.apoio === true, desafio:input.desafio??null }));
    const previous = q('SELECT tentativa_id,payload_hash FROM evento_integridade WHERE sujeito=? AND chave=?').get(s,key);
    if (previous && (previous.tentativa_id !== t.id || previous.payload_hash !== payload)) throw erro(409, 'Chave já usada com outro conteúdo.');
    if (t.recibo) { if (t.payload_hash !== payload) throw erro(409, 'Tentativa já respondida com outro conteúdo.'); return JSON.parse(t.recibo); }
    const reject = (motivo,status,message) => {
      q('INSERT INTO rejeicao_integridade VALUES (?,?,?,?,?)').run(randomUUID(),s,t.id,motivo,relogio());
      throw Object.assign(erro(status,message),{ motivo, restanteMs: Math.max(0,Math.ceil(POLITICA_INTEGRIDADE.minimoMs-(monotono()-t.emitida_mono))) });
    };
    const elapsed = monotono() - t.emitida_mono;
    if (t.instancia !== instancia || relogio() < t.emitida_ms || elapsed < 0) reject('tempo_servidor_nao_verificavel',410,'Reabra a questão para obter uma tentativa verificável.');
    if (relogio() > t.expira_ms) reject('tentativa_expirada',410,'Tentativa expirada. Reabra a questão.');
    if (elapsed < POLITICA_INTEGRIDADE.minimoMs) reject('antes_do_minimo',425,'Aguarde os oito segundos mínimos.');
    if (!tempoValido(input.tempoMs)) reject('tempo_ausente_ou_invalido',422,'Informe tempo inteiro válido de pelo menos oito segundos.');
    if (input.tempoMs > elapsed + 250) reject('tempo_incompativel',422,'Tempo informado incompatível com a apresentação.');
    return transacao(db, () => {
      // A segunda checagem dentro da transação cobre chamadas concorrentes/conexões de banco.
      const current = tentativa(s,t.id);
      if (current.recibo) { if (current.payload_hash !== payload) throw erro(409,'Tentativa já respondida.'); return JSON.parse(current.recibo); }
      const it = JSON.parse(t.item_json), config = JSON.parse(t.config_json), now = relogio();
      const repeated = !!q('SELECT 1 FROM evento_integridade WHERE sujeito=? AND familia=? LIMIT 1').get(s,t.familia);
      const assisted = !!current.apoio || input.apoio === true;
      const conta = !repeated && !assisted && !!it.tri;
      const adapta = conta && t.origem === 'pratica';
      const motivo = repeated ? 'repeticao' : assisted ? 'com_apoio' : !it.tri ? 'parametros_fora_da_triagem' : null;
      let profile = perfis(s)[it.area];const correct = selected === it.answer;
      if (conta) profile = T.atualizar(profile,it.tri,correct,config,{agoraMs:now,peso:t.origem === 'simulado' ? config.peso.simulado : config.peso.pratica});
      const alvo=T.metaDe(input.desafio,config);
      if (adapta) profile = T.registrarAcerto(profile,correct,config,alvo);
      const eventId = randomUUID();
      q(`INSERT INTO evento_integridade (id,tentativa_id,sujeito,questao_id,familia,area,alternativa,correta,tempo_ms,recebida_ms,origem,apoio,conta,adapta,alvo,motivo,chance_previa,item_json,config_json,versoes_json,chave,payload_hash,perfil_apos)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(eventId,t.id,s,questionId,t.familia,it.area,selected,correct?1:0,input.tempoMs,now,t.origem,assisted?1:0,conta?1:0,adapta?1:0,alvo,motivo,t.chance_previa,t.item_json,t.config_json,t.versoes_json,key,payload,JSON.stringify(profile));
      if (conta) q(`INSERT INTO perfil_verificado VALUES (?,?,?,1) ON CONFLICT(sujeito,area) DO UPDATE SET perfil_json=excluded.perfil_json,revisao=revisao+1`).run(s,it.area,JSON.stringify(profile));
      const result = { questionId: questionId, selected, correct, answer: it.answer, explanation: acervo.byId.get(questionId).explanation, persisted: true,
        tri: { eventId, area: it.area, perfil: profile, conta, adapta, motivo, chancePrevista: t.chance_previa, resumo: T.resumoNota(profile,config), procedencia:'servidor_verificado' } };
      q('UPDATE tentativa_integridade SET recibo=?,payload_hash=? WHERE id=?').run(JSON.stringify(result),payload,t.id);
      return result;
    });
  }
  function importar(s,input) {
    if (!s) throw erro(401,'Sessão verificável necessária.');
    const text = JSON.stringify(input), fingerprint = hash(text);
    q('INSERT OR IGNORE INTO legado_importado VALUES (?,?,?,?)').run(s,fingerprint,text,relogio());
    return { ...visao(s), importacao: { status:'legado_nao_verificado', hash:fingerprint, promovido:false } };
  }
  function reconstruir(s) {
    const ps = Object.fromEntries(T.AREAS.map(a=>[a,T.perfilInicial(a,cfg)]));
    const iniciadas = new Set();
    for (const e of q('SELECT * FROM evento_integridade WHERE sujeito=? AND conta=1 ORDER BY seq').all(s)) {
      const config = JSON.parse(e.config_json), it = JSON.parse(e.item_json);
      if (!iniciadas.has(e.area)) { ps[e.area] = T.perfilInicial(e.area,config); iniciadas.add(e.area); }
      ps[e.area] = T.atualizar(ps[e.area],it.tri,!!e.correta,config,{agoraMs:e.recebida_ms,peso:e.origem==='simulado'?config.peso.simulado:config.peso.pratica});
      if (e.adapta) ps[e.area] = T.registrarAcerto(ps[e.area],!!e.correta,config,e.alvo);
    }
    return ps;
  }
  function painel() {
    const ev = q('SELECT * FROM evento_integridade').all();
    const valid = ev.filter(e=>e.conta===1 && Number.isFinite(e.chance_previa));
    const bins=Array.from({length:10},(_,i)=>({faixa:`${i*10}–${i*10+10}%`,n:0,prevista:0,observada:0}));
    for (const e of valid) {const b=bins[Math.min(9,Math.floor(e.chance_previa*10))];b.n++;b.prevista+=e.chance_previa;b.observada+=e.correta;}
    for(const b of bins){if(b.n){b.prevista/=b.n;b.observada/=b.n;}else{b.prevista=null;b.observada=null;}}
    const motives={};for(const e of ev)if(!e.conta)motives[e.motivo]=(motives[e.motivo]||0)+1;
    return {integridade:POLITICA_INTEGRIDADE.versao,eventos:ev.length,contamParaTheta:ev.filter(e=>e.conta).length,N:valid.length,usuarios:new Set(ev.map(e=>e.sujeito)).size,
      rejeicoes:q('SELECT COUNT(*) n FROM rejeicao_integridade').get().n,calibracao:bins.filter(b=>b.n),motivosNaoConta:Object.entries(motives).map(([motivo,n])=>({motivo,n})),
      definicao:'eventos únicos elegíveis, previsão anterior à resposta; rejeições e repetições fora do denominador',watermark:ev.at(-1)?.seq??0};
  }
  return { sujeito, perfis, visao, emitir, apoio, responder, importar, reconstruir, painel };
}
