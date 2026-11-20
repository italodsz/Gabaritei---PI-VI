// Recomendador de dificuldade no servidor: perfil TRI por área, registro de cada resposta e a rota
// /api/recomendar com modos. O cálculo é o mesmo do navegador (frontend/dificuldade.js).
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import * as T from '../frontend/dificuldade.js';
import { lerCookie, erro } from './auth.mjs';
import { criarIntegridade } from './integridade.mjs';

const texto = readFileSync(new URL('./config/dificuldade_v1.json', import.meta.url), 'utf8');
export const CONFIG = JSON.parse(texto);
export const CONFIG_SHA256 = createHash('sha256').update(texto).digest('hex');
const INEP = { matematica: 'MT', natureza: 'CN', humanas: 'CH', linguagens: 'LC' };
const areaDe = q => q?.sourceArea || INEP[q?.areaId];
const MODOS = ['semelhante', 'conjunto', 'aleatorio'];

export function criarDificuldade({ db, repo, acervo, cfg = CONFIG, relogio, monotono }) {
  const integridade=criarIntegridade({db,repo,acervo,cfg,...(relogio?{relogio}:{}),...(monotono?{monotono}:{})});
  const q = sql => db.prepare(sql);
  db.prepare('INSERT OR IGNORE INTO config_dificuldade (versao, sha256, conteudo, registrada_em) VALUES (?,?,?,?)').run(cfg.versao, CONFIG_SHA256, JSON.stringify(cfg), new Date().toISOString());
  const usuario = req => repo.usuarioDaSessao(lerCookie(req));
  const itemDe = id => acervo.byId.get(id)?.tri ?? null;

  const perfis = s => integridade.perfis(s);
  const perfilDoCorpo = area => T.perfilInicial(area,cfg); // perfis do cliente nunca são fonte confiável.

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
    const emission=pathname.match(/^\/api\/questoes\/(gq_[a-f0-9]+)\/tentativas$/);
    if(m==='POST'&&emission){const input=await body(req);send(res,201,integridade.emitir(integridade.sujeito(req,res,true),emission[1],input));return true;}
    const support=pathname.match(/^\/api\/tentativas\/([a-f0-9-]+)\/apoio$/);
    if(m==='POST'&&support){send(res,200,integridade.apoio(integridade.sujeito(req,res),support[1]));return true;}
    if(pathname==='/api/eu/perfil-tri'){
      const s=integridade.sujeito(req,res);
      if(m==='GET'){send(res,200,s?integridade.visao(s):{usuario:null});return true;}
      if(m==='PUT'){send(res,200,integridade.importar(s,await body(req)));return true;}
    }
    if(m==='POST'&&pathname==='/api/eu/perfil-tri/respostas'){
      const s=integridade.sujeito(req,res);if(!s)throw erro(401,'Sessão verificável necessária.');
      const input=await body(req);if(!Array.isArray(input?.respostas)||input.respostas.length>200)throw erro(400,'Envie até 200 respostas.');
      const resultados=[];
      for(const r of input.respostas){
        try {const result=integridade.responder(s,r.questaoId,{selected:r.alternativa,tempoMs:r.tempoMs,tentativaId:r.tentativaId},r.chaveIdempotencia);resultados.push({questaoId:r.questaoId,registrada:true,...result});}
        catch(e){resultados.push({questaoId:r.questaoId,registrada:false,status:e.status||500,motivo:e.motivo||e.message});}
      }
      send(res,200,{registradas:resultados.filter(r=>r.registrada).length,resultados,...integridade.visao(s)});return true;
    }
    if (m === 'POST' && pathname === '/api/recomendar') { const s = integridade.sujeito(req,res); send(res, 200, recomendar(s, await body(req, 600_000))); return true; }
    if (m === 'GET' && pathname === '/api/dev/dificuldade') { send(res, 200, painelDev()); return true; }
    return false;
  }

  /** Para o laboratório: calibração previsto × observado e contagens. */
  function painelDev(){return {versao:cfg.versao,sha256:CONFIG_SHA256,...integridade.painel()};}

  return { tratar, usuario, visao:integridade.visao, recomendar, integridade };
}
