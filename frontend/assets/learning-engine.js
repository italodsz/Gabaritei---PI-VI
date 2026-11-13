// legacy/src/data/fixtures/taxonomy.ts
var AREAS = [
  {
    id: "linguagens",
    name: "Linguagens, C\xF3digos e suas Tecnologias",
    shortName: "Linguagens",
    description: "L\xEDngua portuguesa, literatura, l\xEDngua estrangeira e artes.",
    day: 1,
    officialRange: [1, 45]
  },
  {
    id: "humanas",
    name: "Ci\xEAncias Humanas e suas Tecnologias",
    shortName: "Ci\xEAncias Humanas",
    description: "Hist\xF3ria, geografia, filosofia e sociologia.",
    day: 1,
    officialRange: [46, 90]
  },
  {
    id: "natureza",
    name: "Ci\xEAncias da Natureza e suas Tecnologias",
    shortName: "Ci\xEAncias da Natureza",
    description: "F\xEDsica, qu\xEDmica e biologia.",
    day: 2,
    officialRange: [91, 135]
  },
  {
    id: "matematica",
    name: "Matem\xE1tica e suas Tecnologias",
    shortName: "Matem\xE1tica",
    description: "Racioc\xEDnio quantitativo, geometria, fun\xE7\xF5es e estat\xEDstica.",
    day: 2,
    officialRange: [136, 180]
  }
];
var t = (subjectId, id, name, subtopics) => ({
  id,
  subjectId,
  name,
  subtopics: subtopics.map(([sid, sname]) => ({ id: `${id}.${sid}`, name: sname }))
});
var SUBJECTS = [
  {
    id: "portugues",
    areaId: "linguagens",
    name: "L\xEDngua Portuguesa",
    topics: [
      t("portugues", "por-interpretacao", "Interpreta\xE7\xE3o de texto", [
        ["inferencia", "Infer\xEAncia e sentido global"],
        ["argumentacao", "Estrat\xE9gias argumentativas"]
      ]),
      t("portugues", "por-figuras", "Figuras de linguagem", [
        ["semantica", "Figuras de palavra"],
        ["construcao", "Figuras de constru\xE7\xE3o e pensamento"]
      ]),
      t("portugues", "por-funcoes", "Fun\xE7\xF5es da linguagem", [["funcoes", "Fun\xE7\xF5es e intencionalidade"]]),
      t("portugues", "por-variacao", "Varia\xE7\xE3o lingu\xEDstica", [
        ["regional", "Varia\xE7\xE3o regional e social"],
        ["registro", "Formalidade e registro"]
      ]),
      t("portugues", "por-generos", "G\xEAneros textuais", [["generos", "Reconhecimento de g\xEAneros"]])
    ]
  },
  {
    id: "literatura",
    areaId: "linguagens",
    name: "Literatura",
    topics: [
      t("literatura", "lit-escolas", "Escolas liter\xE1rias", [
        ["classicas", "Do Quinhentismo ao Arcadismo"],
        ["xix", "Romantismo, Realismo e Simbolismo"],
        ["modernismo", "Modernismo e contempor\xE2neos"]
      ])
    ]
  },
  {
    id: "artes",
    areaId: "linguagens",
    name: "Artes",
    topics: [t("artes", "art-movimentos", "Movimentos art\xEDsticos", [["vanguardas", "Vanguardas e arte brasileira"]])]
  },
  {
    id: "ingles",
    areaId: "linguagens",
    name: "Ingl\xEAs",
    topics: [t("ingles", "ing-interpretacao", "Leitura em ingl\xEAs", [["compreensao", "Compreens\xE3o global"]])]
  },
  {
    id: "espanhol",
    areaId: "linguagens",
    name: "Espanhol",
    topics: [t("espanhol", "esp-interpretacao", "Leitura em espanhol", [["comprension", "Compreens\xE3o global"]])]
  },
  {
    id: "historia",
    areaId: "humanas",
    name: "Hist\xF3ria",
    topics: [
      t("historia", "his-brasil-colonia", "Brasil Col\xF4nia", [["economia", "Economia e sociedade colonial"]]),
      t("historia", "his-brasil-imperio", "Brasil Imp\xE9rio", [["politica", "Pol\xEDtica imperial e aboli\xE7\xE3o"]]),
      t("historia", "his-brasil-republica", "Brasil Rep\xFAblica", [
        ["primeira", "Primeira Rep\xFAblica e Era Vargas"],
        ["ditadura", "Ditadura e redemocratiza\xE7\xE3o"]
      ]),
      t("historia", "his-geral", "Hist\xF3ria Geral", [
        ["antiga", "Antiguidade e Idade M\xE9dia"],
        ["contemporanea", "Idade Contempor\xE2nea"]
      ])
    ]
  },
  {
    id: "geografia",
    areaId: "humanas",
    name: "Geografia",
    topics: [
      t("geografia", "geo-cartografia", "Cartografia", [
        ["escala", "Escalas"],
        ["fusos", "Fusos hor\xE1rios"]
      ]),
      t("geografia", "geo-natureza", "Clima, relevo e biomas", [
        ["biomas", "Biomas brasileiros"],
        ["clima", "Clima e din\xE2mica atmosf\xE9rica"]
      ]),
      t("geografia", "geo-urbana", "Geografia urbana e popula\xE7\xE3o", [["urbanizacao", "Urbaniza\xE7\xE3o"]]),
      t("geografia", "geo-ambiental", "Quest\xF5es ambientais", [["impactos", "Impactos ambientais"]])
    ]
  },
  {
    id: "filosofia",
    areaId: "humanas",
    name: "Filosofia",
    topics: [
      t("filosofia", "fil-pensadores", "Pensadores e conceitos", [
        ["antiga", "Filosofia antiga"],
        ["moderna", "Filosofia moderna e contempor\xE2nea"]
      ]),
      t("filosofia", "fil-etica", "\xC9tica e pol\xEDtica", [["etica", "\xC9tica e cidadania"]])
    ]
  },
  {
    id: "sociologia",
    areaId: "humanas",
    name: "Sociologia",
    topics: [
      t("sociologia", "soc-conceitos", "Teoria sociol\xF3gica", [["classicos", "Autores cl\xE1ssicos"]]),
      t("sociologia", "soc-sociedade", "Cultura, trabalho e cidadania", [["cultura", "Cultura e identidade"]])
    ]
  },
  {
    id: "fisica",
    areaId: "natureza",
    name: "F\xEDsica",
    topics: [
      t("fisica", "fis-cinematica", "Cinem\xE1tica", [
        ["velocidade", "Velocidade m\xE9dia"],
        ["mruv", "Movimento uniformemente variado"]
      ]),
      t("fisica", "fis-energia", "Energia e pot\xEAncia", [
        ["mecanica", "Energia mec\xE2nica"],
        ["potencia", "Trabalho e pot\xEAncia"]
      ]),
      t("fisica", "fis-eletricidade", "Eletricidade", [
        ["ohm", "Lei de Ohm"],
        ["consumo", "Consumo de energia el\xE9trica"]
      ]),
      t("fisica", "fis-termologia", "Termologia", [["calorimetria", "Calorimetria"]]),
      t("fisica", "fis-ondas", "Ondulat\xF3ria", [["ondas", "Velocidade de ondas"]]),
      t("fisica", "fis-hidrostatica", "Hidrost\xE1tica", [
        ["densidade", "Densidade"],
        ["pressao", "Press\xE3o hidrost\xE1tica"]
      ])
    ]
  },
  {
    id: "quimica",
    areaId: "natureza",
    name: "Qu\xEDmica",
    topics: [
      t("quimica", "qui-solucoes", "Solu\xE7\xF5es", [
        ["concentracao", "Concentra\xE7\xE3o comum"],
        ["diluicao", "Dilui\xE7\xE3o"]
      ]),
      t("quimica", "qui-estequiometria", "Estequiometria", [
        ["mol", "Quantidade de mat\xE9ria"],
        ["massa-molar", "Massa molar"]
      ]),
      t("quimica", "qui-acido-base", "\xC1cidos, bases e pH", [["ph", "Escala de pH"]]),
      t("quimica", "qui-ambiental", "Qu\xEDmica ambiental", [["poluicao", "Polui\xE7\xE3o e impactos"]])
    ]
  },
  {
    id: "biologia",
    areaId: "natureza",
    name: "Biologia",
    topics: [
      t("biologia", "bio-citologia", "Citologia", [["organelas", "Organelas celulares"]]),
      t("biologia", "bio-genetica", "Gen\xE9tica", [["mendel", "Primeira lei de Mendel"]]),
      t("biologia", "bio-ecologia", "Ecologia", [
        ["relacoes", "Rela\xE7\xF5es ecol\xF3gicas"],
        ["cadeias", "Cadeias e teias alimentares"]
      ]),
      t("biologia", "bio-fisiologia", "Fisiologia humana", [["sistemas", "Sistemas do corpo humano"]])
    ]
  },
  {
    id: "matematica",
    areaId: "matematica",
    name: "Matem\xE1tica",
    topics: [
      t("matematica", "mat-porcentagem", "Porcentagem e juros", [
        ["variacao", "Aumentos e descontos"],
        ["juros", "Juros simples e compostos"]
      ]),
      t("matematica", "mat-proporcao", "Raz\xE3o, propor\xE7\xE3o e escala", [
        ["regra-de-tres", "Regra de tr\xEAs"],
        ["escala", "Escala"]
      ]),
      t("matematica", "mat-estatistica", "Estat\xEDstica", [
        ["medidas", "M\xE9dia, mediana e moda"],
        ["graficos", "Leitura de gr\xE1ficos"]
      ]),
      t("matematica", "mat-funcoes", "Fun\xE7\xF5es", [
        ["afim", "Fun\xE7\xE3o afim"],
        ["quadratica", "Fun\xE7\xE3o quadr\xE1tica"],
        ["exponencial", "Crescimento exponencial"]
      ]),
      t("matematica", "mat-geometria-plana", "Geometria plana", [
        ["areas", "\xC1reas"],
        ["pitagoras", "Teorema de Pit\xE1goras"],
        ["trigonometria", "Trigonometria no tri\xE2ngulo"]
      ]),
      t("matematica", "mat-geometria-espacial", "Geometria espacial", [["volumes", "Volumes"]]),
      t("matematica", "mat-probabilidade", "Probabilidade e contagem", [
        ["probabilidade", "Probabilidade"],
        ["contagem", "Princ\xEDpio fundamental da contagem"]
      ]),
      t("matematica", "mat-progressoes", "Progress\xF5es", [["pa", "Progress\xE3o aritm\xE9tica"]])
    ]
  }
];
var SUBJECT_BY_ID = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
);
var AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a]));
var TOPICS = SUBJECTS.flatMap((s) => s.topics);
var TOPIC_BY_ID = Object.fromEntries(TOPICS.map((tp) => [tp.id, tp]));
var SUBTOPIC_NAME = Object.fromEntries(
  TOPICS.flatMap((tp) => tp.subtopics.map((s) => [s.id, s.name]))
);
function subjectsOfArea(areaId) {
  return SUBJECTS.filter((s) => s.areaId === areaId);
}
var ENEM_EDITIONS = Array.from({ length: 2025 - 2009 + 1 }, (_, i) => 2025 - i);
var REFERENCE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
function installTaxonomy(subjects, years) {
  SUBJECTS.splice(0, SUBJECTS.length, ...subjects);
  TOPICS.splice(0, TOPICS.length, ...subjects.flatMap((s) => s.topics));
  for (const target of [SUBJECT_BY_ID, TOPIC_BY_ID, SUBTOPIC_NAME]) {
    for (const key of Object.keys(target)) delete target[key];
  }
  Object.assign(SUBJECT_BY_ID, Object.fromEntries(SUBJECTS.map((s) => [s.id, s])));
  Object.assign(TOPIC_BY_ID, Object.fromEntries(TOPICS.map((t2) => [t2.id, t2])));
  Object.assign(SUBTOPIC_NAME, Object.fromEntries(TOPICS.flatMap((t2) => t2.subtopics.map((s) => [s.id, s.name]))));
  REFERENCE_YEARS.splice(0, REFERENCE_YEARS.length, ...years);
}

// legacy/src/lib/format.ts
var dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
var dateLongFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });
var timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
var weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function dayKey(date) {
  const d = new Date(date);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function normalizeText(value) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// legacy/src/lib/repositories/questionRepository.ts
var QUESTION_BANK = [];
var QUESTION_BY_ID = {};
function installQuestions(questions) {
  QUESTION_BANK.splice(0, QUESTION_BANK.length, ...questions);
  for (const key of Object.keys(QUESTION_BY_ID)) delete QUESTION_BY_ID[key];
  Object.assign(QUESTION_BY_ID, Object.fromEntries(questions.map((q) => [q.id, q])));
}
function matches(q, query) {
  if (query.areaIds?.length && !query.areaIds.includes(q.areaId)) return false;
  if (query.subjectId && q.subjectId !== query.subjectId) return false;
  if (query.subtopicIds?.length) {
    const selectedTopicsWithSub = new Set(query.subtopicIds.map((s) => s.split(".")[0]));
    if (query.topicIds?.length && !query.topicIds.includes(q.topicId)) return false;
    if (selectedTopicsWithSub.has(q.topicId) && !query.subtopicIds.includes(q.subtopicId ?? "")) return false;
  } else if (query.topicIds?.length && !query.topicIds.includes(q.topicId)) return false;
  if (query.years?.length && !query.years.includes(q.year)) return false;
  if (query.foreignLanguage === "none" && q.foreignLanguage) return false;
  if ((query.foreignLanguage === "ingles" || query.foreignLanguage === "espanhol") && q.foreignLanguage && q.foreignLanguage !== query.foreignLanguage)
    return false;
  return true;
}
var localQuestionRepository = {
  all: () => QUESTION_BANK,
  getById: (id) => QUESTION_BY_ID[id],
  getMany: (ids) => ids.map((id) => QUESTION_BY_ID[id]).filter((q) => !!q),
  query: (query) => QUESTION_BANK.filter((q) => matches(q, query)),
  search: (text, limit = 8) => {
    const needle = normalizeText(text.trim());
    if (needle.length < 2) return [];
    const out = [];
    for (const q of QUESTION_BANK) {
      const hay = normalizeText(
        [q.prompt, ...q.descriptions ?? [], ...q.support?.paragraphs ?? [], q.skill, TOPIC_BY_ID[q.topicId]?.name, SUBJECT_BY_ID[q.subjectId].name].join(" ")
      );
      if (hay.includes(needle)) out.push(q);
      if (out.length >= limit) break;
    }
    return out;
  }
};
var questionRepository = localQuestionRepository;

// legacy/src/lib/sessions/clock.ts
var createClock = (running, now) => ({
  elapsedMs: 0,
  runningSince: running ? now : null
});
function clockElapsed(clock, now) {
  return clock.elapsedMs + (clock.runningSince !== null ? Math.max(0, now - clock.runningSince) : 0);
}
function pauseClock(clock, now) {
  if (clock.runningSince === null) return clock;
  return { elapsedMs: clockElapsed(clock, now), runningSince: null };
}
function resumeClock(clock, now) {
  if (clock.runningSince !== null) return clock;
  return { ...clock, runningSince: now };
}
function clockRemaining(clock, durationMs, now) {
  return Math.max(0, durationMs - clockElapsed(clock, now));
}

// legacy/src/lib/calculations/stats.ts
var DAY = 864e5;
function summarize(records) {
  const answered = records.length;
  const correct = records.reduce((n, r) => n + (r.correct ? 1 : 0), 0);
  const timeMs = records.reduce((n, r) => n + r.timeSpentMs, 0);
  return {
    answered,
    correct,
    wrong: answered - correct,
    accuracy: answered ? correct / answered : 0,
    timeMs,
    avgTimeMs: answered ? timeMs / answered : 0
  };
}
function groupSummary(records, key) {
  const buckets = /* @__PURE__ */ new Map();
  for (const r of records) {
    const k = key(r);
    const list = buckets.get(k);
    if (list) list.push(r);
    else buckets.set(k, [r]);
  }
  const out = /* @__PURE__ */ new Map();
  for (const [k, list] of buckets) out.set(k, summarize(list));
  return out;
}
function subjectStats(records) {
  const map = groupSummary(records, (r) => r.subjectId);
  return SUBJECTS.map((s) => ({
    subjectId: s.id,
    name: s.name,
    areaId: s.areaId,
    ...map.get(s.id) ?? summarize([])
  }));
}
function areaStats(records) {
  const map = groupSummary(records, (r) => r.areaId);
  return AREAS.map((a) => ({ areaId: a.id, name: a.shortName, ...map.get(a.id) ?? summarize([]) }));
}
function topicStats(records) {
  const map = /* @__PURE__ */ new Map();
  for (const r of records) {
    const list = map.get(r.topicId);
    if (list) list.push(r);
    else map.set(r.topicId, [r]);
  }
  const out = [];
  for (const [topicId, list] of map) {
    const topic = TOPIC_BY_ID[topicId];
    if (!topic) continue;
    const s = summarize(list);
    out.push({
      ...s,
      topicId,
      name: topic.name,
      subjectId: topic.subjectId,
      lastAnsweredAt: Math.max(...list.map((r) => r.answeredAt)),
      smoothed: (s.correct + 1) / (s.answered + 2)
    });
  }
  return out;
}
function rankTopics(records, minAnswered = 4) {
  const eligible = topicStats(records).filter((t2) => t2.answered >= minAnswered);
  const weakest = eligible.slice().sort((a, b) => a.smoothed - b.smoothed);
  const strongest = eligible.slice().sort((a, b) => b.smoothed - a.smoothed);
  return { weakest, strongest };
}
var GRANULARITY_CONFIG = {
  day: { buckets: 14, label: "Di\xE1rio", compareLabel: "14 dias anteriores" },
  week: { buckets: 8, label: "Semanal", compareLabel: "8 semanas anteriores" },
  month: { buckets: 6, label: "Mensal", compareLabel: "6 meses anteriores" }
};
function startOfWeek(date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}
function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}
var monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short" });
var dayShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
function bucketRanges(granularity, now, count, offset = 0) {
  const ranges = [];
  const ref = new Date(now);
  for (let i = count - 1 + offset; i >= offset; i--) {
    let start;
    let end;
    let label;
    if (granularity === "day") {
      start = startOfDay(ref);
      start.setDate(start.getDate() - i);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      label = dayShort.format(start);
    } else if (granularity === "week") {
      start = startOfWeek(ref);
      start.setDate(start.getDate() - i * 7);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      label = dayShort.format(start);
    } else {
      start = startOfMonth(ref);
      start.setMonth(start.getMonth() - i);
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      label = monthShort.format(start).replace(".", "");
    }
    ranges.push({ start: start.getTime(), end: end.getTime(), label, key: `${granularity}-${dayKey(start)}` });
  }
  return ranges;
}
function buildSeries(records, granularity, now, offset = 0) {
  const count = GRANULARITY_CONFIG[granularity].buckets;
  return bucketRanges(granularity, now, count, offset).map((r) => {
    const inRange = records.filter((rec) => rec.answeredAt >= r.start && rec.answeredAt < r.end);
    const s = summarize(inRange);
    return {
      ...r,
      answered: s.answered,
      correct: s.correct,
      accuracy: s.answered ? s.accuracy : null,
      timeMs: s.timeMs
    };
  });
}
function comparePeriods(records, granularity, now) {
  const cur = buildSeries(records, granularity, now, 0);
  const prev = buildSeries(records, granularity, now, GRANULARITY_CONFIG[granularity].buckets);
  const within = (start, end) => records.filter((r) => r.answeredAt >= start && r.answeredAt < end);
  const current = summarize(within(cur[0].start, cur[cur.length - 1].end));
  const previous = summarize(within(prev[0].start, prev[prev.length - 1].end));
  return {
    current,
    previous,
    accuracyDelta: previous.answered && current.answered ? current.accuracy - previous.accuracy : null,
    answeredDelta: previous.answered ? (current.answered - previous.answered) / previous.answered : null
  };
}
function activityDays(records) {
  return new Set(records.map((r) => dayKey(r.answeredAt)));
}
function computeStreak(records, now) {
  const days = activityDays(records);
  const today = startOfDay(new Date(now));
  const activeToday = days.has(dayKey(today));
  let current = 0;
  const cursor = new Date(today);
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const sorted = Array.from(days).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of sorted) {
    const [y, m, d] = key.split("-").map(Number);
    const t2 = new Date(y, m - 1, d).getTime();
    run = prev !== null && Math.round((t2 - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t2;
  }
  return { current, best: Math.max(best, current), activeToday };
}
function activityCalendar(records, now, weeks = 18) {
  const counts = /* @__PURE__ */ new Map();
  for (const r of records) {
    const k = dayKey(r.answeredAt);
    const c = counts.get(k) ?? { count: 0, correct: 0 };
    c.count++;
    if (r.correct) c.correct++;
    counts.set(k, c);
  }
  const firstWeek = startOfWeek(new Date(now));
  firstWeek.setDate(firstWeek.getDate() - (weeks - 1) * 7);
  const todayEnd = startOfDay(new Date(now)).getTime() + DAY;
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstWeek);
      date.setDate(date.getDate() + w * 7 + d);
      const k = dayKey(date);
      const c = counts.get(k);
      col.push({ key: k, date: date.getTime(), count: c?.count ?? 0, correct: c?.correct ?? 0, future: date.getTime() >= todayEnd });
    }
    cols.push(col);
  }
  return cols;
}
function totalStudyTime(account, now) {
  const sessions = [...account.practiceSessions, ...account.simulations];
  return sessions.reduce((sum, s) => sum + clockElapsed(s.clock, now), 0);
}
function recordsThisWeek(records, now) {
  const start = startOfWeek(new Date(now)).getTime();
  return records.filter((r) => r.answeredAt >= start);
}
function recordsThisMonth(records, now) {
  const start = startOfMonth(new Date(now)).getTime();
  return records.filter((r) => r.answeredAt >= start);
}
function frequentSubjects(records, limit = 4) {
  return subjectStats(records).filter((s) => s.answered > 0).sort((a, b) => b.answered - a.answered).slice(0, limit);
}

// legacy/src/lib/calculations/goals.ts
var GOAL_META = {
  weekly_questions: {
    title: "Quest\xF5es na semana",
    unit: "quest\xF5es",
    description: "Quantidade de quest\xF5es corrigidas de segunda a domingo.",
    min: 10,
    max: 400,
    step: 10,
    format: (n) => `${n}`
  },
  weekly_accuracy: {
    title: "Acerto na semana",
    unit: "%",
    description: "Percentual de acerto nas quest\xF5es da semana (m\xEDnimo de 10 respostas).",
    min: 40,
    max: 95,
    step: 5,
    format: (n) => `${Math.round(n)}%`
  },
  weekly_study_days: {
    title: "Dias de estudo",
    unit: "dias",
    description: "Dias com pelo menos uma quest\xE3o corrigida na semana.",
    min: 1,
    max: 7,
    step: 1,
    format: (n) => `${n}`
  },
  monthly_simulations: {
    title: "Simulados no m\xEAs",
    unit: "simulados",
    description: "Simulados conclu\xEDdos no m\xEAs corrente.",
    min: 1,
    max: 12,
    step: 1,
    format: (n) => `${n}`
  }
};
var DEFAULT_GOALS = [
  { kind: "weekly_questions", target: 60, enabled: true },
  { kind: "weekly_accuracy", target: 70, enabled: true },
  { kind: "weekly_study_days", target: 5, enabled: true },
  { kind: "monthly_simulations", target: 2, enabled: true }
];
function goalProgress(goal, records, account, now) {
  let current = 0;
  let pendingReason = null;
  const week = recordsThisWeek(records, now);
  switch (goal.kind) {
    case "weekly_questions":
      current = week.length;
      break;
    case "weekly_accuracy": {
      const s = summarize(week);
      current = Math.round(s.accuracy * 100);
      if (s.answered < 10) pendingReason = `Responda mais ${10 - s.answered} para medir`;
      break;
    }
    case "weekly_study_days":
      current = activityDays(week).size;
      break;
    case "monthly_simulations": {
      const ref = new Date(now);
      const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1).getTime();
      current = account.simulations.filter(
        (s) => s.status === "completed" && s.completedAt && new Date(s.completedAt).getTime() >= monthStart
      ).length;
      break;
    }
  }
  const progress = pendingReason ? 0 : Math.min(1, current / goal.target);
  return { goal, current, progress, done: !pendingReason && current >= goal.target, pendingReason };
}

// legacy/src/lib/calculations/records.ts
function collectAnswerRecords(account, bank = QUESTION_BY_ID) {
  const out = [];
  for (const s of account.practiceSessions) {
    for (const qid of s.questionIds) {
      const a = s.answers[qid];
      const q = bank[qid];
      if (!a || !q || !a.confirmed || a.correct === null || !a.answeredAt) continue;
      out.push({
        questionId: qid,
        sessionId: s.id,
        source: "practice",
        correct: a.correct,
        answeredAt: new Date(a.answeredAt).getTime(),
        timeSpentMs: a.timeSpentMs,
        areaId: q.areaId,
        subjectId: q.subjectId,
        topicId: q.topicId
      });
    }
  }
  for (const s of account.simulations) {
    if (s.status !== "completed" || !s.completedAt) continue;
    const at = new Date(s.completedAt).getTime();
    for (const qid of s.questionIds) {
      const a = s.answers[qid];
      const q = bank[qid];
      if (!q || !a || !a.selected) continue;
      out.push({
        questionId: qid,
        sessionId: s.id,
        source: "simulation",
        correct: a.selected === q.correct,
        answeredAt: at,
        timeSpentMs: a.timeSpentMs,
        areaId: q.areaId,
        subjectId: q.subjectId,
        topicId: q.topicId
      });
    }
  }
  return out.sort((a, b) => a.answeredAt - b.answeredAt);
}
function latestByQuestion(records) {
  const map = /* @__PURE__ */ new Map();
  for (const r of records) {
    const prev = map.get(r.questionId);
    if (!prev || prev.answeredAt <= r.answeredAt) map.set(r.questionId, r);
  }
  return map;
}

// legacy/src/lib/calculations/achievements.ts
function countMilestone(records, target) {
  return {
    current: Math.min(records.length, target),
    target,
    unlockedAt: records.length >= target ? records[target - 1].answeredAt : null
  };
}
function streakMilestone(records, target, now) {
  const firstOfDay = /* @__PURE__ */ new Map();
  for (const r of records) {
    const k = dayKey(r.answeredAt);
    if (!firstOfDay.has(k)) firstOfDay.set(k, r.answeredAt);
  }
  const days = Array.from(firstOfDay.entries()).sort((a, b) => a[1] - b[1]);
  let run = 0;
  let prev = null;
  let reachedAt = null;
  for (const [, ts] of days) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    if (prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      run = next.getTime() === d.getTime() ? run + 1 : 1;
    } else run = 1;
    prev = d;
    if (run >= target && reachedAt === null) reachedAt = ts;
  }
  const best = computeStreak(records, now).best;
  return { current: Math.min(best, target), target, unlockedAt: reachedAt };
}
var DEFINITIONS = [
  {
    id: "primeiro-passo",
    title: "Primeiro passo",
    description: "Voc\xEA corrigiu sua primeira quest\xE3o.",
    rule: "Responder e confirmar 1 quest\xE3o",
    icon: "footprints",
    tier: "bronze",
    evaluate: ({ records }) => countMilestone(records, 1)
  },
  {
    id: "embalo",
    title: "Embalo",
    description: "50 quest\xF5es corrigidas. O ritmo est\xE1 criado.",
    rule: "Corrigir 50 quest\xF5es",
    icon: "zap",
    tier: "bronze",
    evaluate: ({ records }) => countMilestone(records, 50)
  },
  {
    id: "centena",
    title: "Centena",
    description: "100 quest\xF5es resolvidas com dedica\xE7\xE3o.",
    rule: "Corrigir 100 quest\xF5es",
    icon: "target",
    tier: "prata",
    evaluate: ({ records }) => countMilestone(records, 100)
  },
  {
    id: "maratonista",
    title: "Maratonista",
    description: "1.500 quest\xF5es! Persist\xEAncia de quem vai longe.",
    rule: "Corrigir 1.500 quest\xF5es",
    icon: "mountain",
    tier: "ouro",
    evaluate: ({ records }) => countMilestone(records, 1500)
  },
  {
    id: "constancia",
    title: "Const\xE2ncia",
    description: "Tr\xEAs dias seguidos de estudo.",
    rule: "Estudar 3 dias consecutivos",
    icon: "flame",
    tier: "bronze",
    evaluate: ({ records, now }) => streakMilestone(records, 3, now)
  },
  {
    id: "semana-completa",
    title: "Semana completa",
    description: "Sete dias seguidos de pr\xE1tica.",
    rule: "Estudar 7 dias consecutivos",
    icon: "calendar",
    tier: "prata",
    evaluate: ({ records, now }) => streakMilestone(records, 7, now)
  },
  {
    id: "habito",
    title: "H\xE1bito formado",
    description: "Trinta dias seguidos. Estudar j\xE1 faz parte da rotina.",
    rule: "Estudar 30 dias consecutivos",
    icon: "sparkles",
    tier: "ouro",
    evaluate: ({ records, now }) => streakMilestone(records, 30, now)
  },
  {
    id: "estreia",
    title: "Estreia",
    description: "Primeiro simulado conclu\xEDdo.",
    rule: "Concluir 1 simulado",
    icon: "medal",
    tier: "bronze",
    evaluate: ({ account }) => {
      const done = account.simulations.filter((s) => s.status === "completed" && s.completedAt).map((s) => new Date(s.completedAt).getTime()).sort((a, b) => a - b);
      return { current: Math.min(done.length, 1), target: 1, unlockedAt: done[0] ?? null };
    }
  },
  {
    id: "prova-de-fogo",
    title: "Prova de fogo",
    description: "Um simulado completo de 90 quest\xF5es at\xE9 o fim.",
    rule: "Concluir um simulado de 90 quest\xF5es",
    icon: "trophy",
    tier: "ouro",
    evaluate: ({ account }) => {
      const full = account.simulations.filter((s) => s.status === "completed" && s.questionIds.length >= 90 && s.completedAt).map((s) => new Date(s.completedAt).getTime()).sort((a, b) => a - b);
      const biggest = Math.max(0, ...account.simulations.filter((s) => s.status === "completed").map((s) => s.questionIds.length));
      return { current: Math.min(biggest, 90), target: 90, unlockedAt: full[0] ?? null };
    }
  },
  {
    id: "alta-performance",
    title: "Alta performance",
    description: "70% de acerto em um simulado com pelo menos 20 quest\xF5es.",
    rule: "Acertar 70% em um simulado (20+ quest\xF5es)",
    icon: "crosshair",
    tier: "prata",
    evaluate: ({ account }) => {
      let best = 0;
      let at = null;
      for (const s of account.simulations) {
        if (s.status !== "completed" || s.questionIds.length < 20 || !s.completedAt) continue;
        const correct = s.questionIds.filter((id) => s.answers[id]?.selected === QUESTION_BY_ID[id]?.correct).length;
        const acc = correct / s.questionIds.length;
        best = Math.max(best, acc);
        const t2 = new Date(s.completedAt).getTime();
        if (acc >= 0.7 && (at === null || t2 < at)) at = t2;
      }
      return { current: Math.round(best * 100), target: 70, unlockedAt: at };
    }
  },
  {
    id: "gabaritou",
    title: "Gabaritou!",
    description: "Uma lista inteira sem nenhum erro.",
    rule: "Acertar 100% de uma lista com 5+ quest\xF5es",
    icon: "sparkles",
    tier: "prata",
    evaluate: ({ account }) => {
      let at = null;
      for (const s of account.practiceSessions) {
        if (s.status !== "completed" || s.questionIds.length < 5 || !s.completedAt) continue;
        const allRight = s.questionIds.every((id) => s.answers[id]?.correct === true);
        const t2 = new Date(s.completedAt).getTime();
        if (allRight && (at === null || t2 < at)) at = t2;
      }
      return { current: at ? 1 : 0, target: 1, unlockedAt: at };
    }
  },
  {
    id: "explorador",
    title: "Explorador",
    description: "Quest\xF5es nas quatro \xE1reas do ENEM.",
    rule: "Responder quest\xF5es das 4 \xE1reas",
    icon: "compass",
    tier: "bronze",
    evaluate: ({ records }) => {
      const seen = /* @__PURE__ */ new Set();
      let at = null;
      for (const r of records) {
        seen.add(r.areaId);
        if (seen.size === 4 && at === null) at = r.answeredAt;
      }
      return { current: seen.size, target: 4, unlockedAt: at };
    }
  },
  {
    id: "revisor",
    title: "Revisor",
    description: "Dez quest\xF5es erradas refeitas \u2014 \xE9 assim que se aprende.",
    rule: "Refazer 10 quest\xF5es erradas",
    icon: "rotate",
    tier: "bronze",
    evaluate: ({ account }) => {
      const times = [];
      for (const s of account.practiceSessions) {
        if (s.mode !== "retry") continue;
        for (const id of s.questionIds) {
          const a = s.answers[id];
          if (a?.confirmed && a.answeredAt) times.push(new Date(a.answeredAt).getTime());
        }
      }
      times.sort((a, b) => a - b);
      return { current: Math.min(times.length, 10), target: 10, unlockedAt: times.length >= 10 ? times[9] : null };
    }
  }
];
var ACHIEVEMENT_DEFINITIONS = DEFINITIONS.map((d) => ({
  id: d.id,
  title: d.title,
  description: d.description,
  rule: d.rule,
  icon: d.icon,
  tier: d.tier
}));
function evaluateAchievements(ctx) {
  return DEFINITIONS.map(({ evaluate, ...def }) => {
    const e = evaluate(ctx);
    const unlocked = e.unlockedAt !== null;
    return {
      ...def,
      current: e.current,
      target: e.target,
      progress: unlocked ? 1 : Math.min(1, e.current / e.target),
      unlocked,
      unlockedAt: e.unlockedAt
    };
  });
}

// legacy/src/lib/random.ts
function hashString(input) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function createRng(seed) {
  let a = typeof seed === "string" ? hashString(seed) : seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t2 = a;
    t2 = Math.imul(t2 ^ t2 >>> 15, t2 | 1);
    t2 ^= t2 + Math.imul(t2 ^ t2 >>> 7, t2 | 61);
    return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
  };
}
function shuffle(items, rng) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function createId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
function freshSeed() {
  return Date.now();
}

// legacy/src/lib/recommendations/engine.ts
var DAY2 = 864e5;
var RECOMMENDATION_LABEL = {
  desempenho: "Ponto de aten\xE7\xE3o",
  dificuldade: "Sua dificuldade",
  revisao: "Hora de revisar",
  novo: "Para explorar",
  manter: "Manter o ritmo"
};
function recommendTopics({ records, difficultSubjects, now, limit = 6, maxPerSubject = 2 }) {
  const stats = new Map(topicStats(records).map((t2) => [t2.topicId, t2]));
  const all = [];
  for (const topic of TOPICS) {
    const subject = SUBJECT_BY_ID[topic.subjectId];
    const available = questionRepository.query({ topicIds: [topic.id] }).length;
    if (!available) continue;
    const s = stats.get(topic.id);
    const difficult = difficultSubjects.includes(topic.subjectId);
    let score;
    let kind;
    let reason;
    if (!s || s.answered < 4) {
      score = 0.32 + (difficult ? 0.38 : 0) + (s ? 0 : 0.04);
      kind = difficult ? "dificuldade" : "novo";
      reason = difficult ? `Voc\xEA indicou ${subject.name} como uma dificuldade \u2014 comece por aqui com quest\xF5es graduais.` : s ? `Apenas ${s.answered} ${s.answered === 1 ? "quest\xE3o respondida" : "quest\xF5es respondidas"} at\xE9 agora.` : "Assunto ainda n\xE3o explorado por voc\xEA.";
    } else {
      const weakness = 1 - s.smoothed;
      const daysSince = (now - s.lastAnsweredAt) / DAY2;
      score = weakness + (difficult ? 0.1 : 0) + (daysSince > 10 ? 0.15 : 0);
      const pct = Math.round(s.accuracy * 100);
      if (s.smoothed < 0.6) {
        kind = "desempenho";
        reason = `Acerto de ${pct}% em ${s.answered} quest\xF5es deste assunto.`;
      } else if (daysSince > 10) {
        kind = "revisao";
        reason = `\xDAltimo contato h\xE1 ${Math.floor(daysSince)} dias \u2014 uma revis\xE3o ajuda a fixar.`;
      } else {
        kind = "manter";
        reason = `Bom desempenho (${pct}%) \u2014 vale manter o ritmo com quest\xF5es mais dif\xEDceis.`;
      }
    }
    all.push({
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subjectId,
      subjectName: subject.name,
      areaId: subject.areaId,
      kind,
      reason,
      score,
      accuracy: s && s.answered ? s.accuracy : null,
      answered: s?.answered ?? 0,
      available
    });
  }
  all.sort((a, b) => b.score - a.score || a.topicName.localeCompare(b.topicName));
  const perSubject = /* @__PURE__ */ new Map();
  const out = [];
  for (const rec of all) {
    const n = perSubject.get(rec.subjectId) ?? 0;
    if (n >= maxPerSubject) continue;
    perSubject.set(rec.subjectId, n + 1);
    out.push(rec);
    if (out.length >= limit) break;
  }
  return out;
}
var LEVEL_PREFERENCE = {
  iniciante: ["facil", "media", "dificil"],
  treineiro: ["facil", "media", "dificil"],
  intermediario: ["media", "facil", "dificil"],
  avancado: ["dificil", "media", "facil"]
};
function prioritizeQuestions(pool, records, rng, level = null) {
  const latest = latestByQuestion(records);
  const pref = level ? LEVEL_PREFERENCE[level] : null;
  const rank = (q) => {
    const last = latest.get(q.id);
    const seen = !last ? 0 : last.correct ? 2 : 1;
    const diff = pref ? pref.indexOf(q.difficulty) * 0.3 : 0;
    return seen + diff + rng() * 0.25;
  };
  return pool.map((q) => ({ q, r: rank(q) })).sort((a, b) => a.r - b.r).map((x) => x.q);
}
function pickQuestions(pool, count, records, rng, level = null) {
  return shuffle(prioritizeQuestions(pool, records, rng, level).slice(0, count), rng);
}
function buildAutoSelection(account, records, count, now, seed = now) {
  const rng = createRng(seed);
  const topics = recommendTopics({ records, difficultSubjects: account.onboarding.difficultSubjects, now, limit: 5 });
  const totalScore = topics.reduce((n, t2) => n + t2.score, 0) || 1;
  const chosen = /* @__PURE__ */ new Set();
  const ids = [];
  topics.forEach((t2, i) => {
    const want = i === topics.length - 1 ? count - ids.length : Math.max(1, Math.round(t2.score / totalScore * count));
    const quota = Math.min(want, count - ids.length);
    const pool = questionRepository.query({ topicIds: [t2.topicId] }).filter((q) => !chosen.has(q.id));
    for (const q of pickQuestions(pool, quota, records, rng, account.onboarding.level)) {
      if (ids.length >= count) break;
      chosen.add(q.id);
      ids.push(q.id);
    }
  });
  if (ids.length < count) {
    const rest = questionRepository.all().filter((q) => !chosen.has(q.id) && !q.foreignLanguage);
    for (const q of pickQuestions(rest, count - ids.length, records, rng, account.onboarding.level)) {
      ids.push(q.id);
    }
  }
  const names = topics.slice(0, 3).map((t2) => t2.topicName.toLowerCase());
  return {
    questionIds: shuffle(ids, rng),
    topics,
    summary: names.length ? `Foco em ${names.join(", ")} e assuntos relacionados.` : "Sele\xE7\xE3o equilibrada entre as \xE1reas."
  };
}

// legacy/src/lib/sessions/factory.ts
var PRACTICE_COUNTS = [5, 10, 15, 20, 30];
var EMPTY_FILTERS = {
  subjectId: null,
  topicIds: [],
  subtopicIds: [],
  years: [],
  count: 10
};
function filtersToQuery(filters) {
  return {
    subjectId: filters.subjectId,
    topicIds: filters.topicIds,
    subtopicIds: filters.subtopicIds,
    years: filters.years
  };
}
function availableForFilters(filters) {
  return questionRepository.query(filtersToQuery(filters));
}
function createPracticeSession(input) {
  const iso2 = new Date(input.now).toISOString();
  return {
    id: input.id ?? createId("lista"),
    kind: "practice",
    mode: input.mode,
    title: input.title,
    createdAt: iso2,
    updatedAt: iso2,
    status: "in_progress",
    completedAt: null,
    filters: { ...input.filters, count: input.questionIds.length },
    questionIds: input.questionIds,
    answers: Object.fromEntries(
      input.questionIds.map((qid) => [
        qid,
        { questionId: qid, selected: null, confirmed: false, correct: null, answeredAt: null, timeSpentMs: 0 }
      ])
    ),
    currentIndex: 0,
    clock: createClock(true, input.now),
    cursorElapsedMs: 0,
    timerVisible: input.timerVisible
  };
}
function selectPracticeQuestions(filters, records, seed, level) {
  const pool = availableForFilters(filters);
  return pickQuestions(pool, filters.count, records, createRng(seed), level).map((q) => q.id);
}
var FULL_DAY_DURATION = {
  1: 5.5 * 36e5,
  // 5h30
  2: 5 * 36e5
  // 5h
};
var SIMULATION_SIZES = [10, 20, 30, 45, 60, 90];
var MINUTES_PER_QUESTION = 3;
function simulationDuration(config) {
  if (config.mode === "official" && config.day) {
    return Math.round(FULL_DAY_DURATION[config.day] * config.size / 90);
  }
  return config.size * MINUTES_PER_QUESTION * 6e4;
}
function subjectOrder(q) {
  return SUBJECTS.findIndex((s) => s.id === q.subjectId);
}
function pickFromArea(areaId, n, config, records, rng, excluded, weakTopicIds) {
  if (n <= 0) return [];
  const foreign = config.foreignLanguage;
  let pool = questionRepository.query({ areaIds: [areaId], foreignLanguage: areaId === "linguagens" ? "none" : void 0 }).filter((q) => !excluded.has(q.id));
  let selected = [];
  if (areaId === "linguagens") {
    const foreignCount = n >= 90 / 2 ? 5 : Math.max(1, Math.round(n / 9));
    const foreignPool = questionRepository.query({ subjectId: foreign }).filter((q) => q.foreignLanguage === foreign && !excluded.has(q.id));
    selected = shuffle(foreignPool, rng).slice(0, Math.min(foreignCount, n));
  }
  const remaining = n - selected.length;
  if (config.criteria === "weak" && weakTopicIds.length) {
    const weakPool = pool.filter((q) => weakTopicIds.includes(q.topicId));
    const weakPick = pickQuestions(weakPool, Math.ceil(remaining * 0.6), records, rng);
    selected.push(...weakPick);
    const picked = new Set(weakPick.map((q) => q.id));
    pool = pool.filter((q) => !picked.has(q.id));
  }
  const rest = n - selected.length;
  const restPick = config.criteria === "random" ? shuffle(pool, rng).slice(0, rest) : pickQuestions(pool, rest, records, rng);
  selected.push(...restPick);
  const foreignFirst = selected.filter((q) => q.foreignLanguage);
  const others = selected.filter((q) => !q.foreignLanguage).sort((a, b) => subjectOrder(a) - subjectOrder(b));
  return [...foreignFirst, ...others];
}
function distributeAcrossAreas(size, areaIds) {
  const ordered = AREAS.filter((a) => areaIds.includes(a.id)).map((a) => a.id);
  const base = Math.floor(size / ordered.length);
  let rem = size - base * ordered.length;
  const out = {};
  for (const id of ordered) {
    out[id] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
  }
  return out;
}
function areasForConfig(config) {
  if (config.mode === "official") {
    return AREAS.filter((a) => a.day === (config.day ?? 1)).map((a) => a.id);
  }
  return AREAS.filter((a) => config.areaIds.includes(a.id)).map((a) => a.id);
}
function simulationTitle(config) {
  if (config.mode === "official") {
    const full = config.size === 90;
    return `ENEM ${config.edition ?? ""} \xB7 Dia ${config.day}${full ? "" : ` \xB7 ${config.size} quest\xF5es`}`.replace("  ", " ");
  }
  const names = areasForConfig(config).map((id) => AREA_BY_ID[id].shortName);
  return names.length === 4 ? `Simulado geral \xB7 ${config.size} quest\xF5es` : `Simulado \xB7 ${names.join(" + ")}`;
}
function createSimulationSession(input) {
  const areaIds = areasForConfig(input.config);
  const config = {
    ...input.config,
    areaIds,
    durationMs: input.config.durationMs ?? simulationDuration(input.config),
    includesEssay: input.config.mode === "official" && input.config.day === 1
  };
  const rng = createRng(input.seed ?? input.now);
  const perArea = distributeAcrossAreas(config.size, areaIds);
  const weakTopicIds = recommendTopics({
    records: input.records,
    difficultSubjects: input.difficultSubjects,
    now: input.now,
    limit: 10,
    maxPerSubject: 3
  }).map((t2) => t2.topicId);
  const excluded = /* @__PURE__ */ new Set();
  const sections = [];
  const questionIds = [];
  const baseNumber = config.mode === "official" && config.day === 2 ? 91 : 1;
  for (const areaId of areaIds) {
    const qs = pickFromArea(areaId, perArea[areaId], config, input.records, rng, excluded, weakTopicIds);
    qs.forEach((q) => excluded.add(q.id));
    if (!qs.length) continue;
    sections.push({
      areaId,
      label: AREA_BY_ID[areaId].shortName,
      start: questionIds.length,
      end: questionIds.length + qs.length,
      firstNumber: baseNumber + questionIds.length
    });
    questionIds.push(...qs.map((q) => q.id));
  }
  const iso2 = new Date(input.now).toISOString();
  return {
    id: input.id ?? createId("simulado"),
    kind: "simulation",
    title: simulationTitle(config),
    createdAt: iso2,
    updatedAt: iso2,
    status: "in_progress",
    completedAt: null,
    finishReason: null,
    config: { ...config, size: questionIds.length },
    questionIds,
    sections,
    answers: Object.fromEntries(
      questionIds.map((qid) => [qid, { questionId: qid, selected: null, answeredAt: null, timeSpentMs: 0 }])
    ),
    marked: [],
    currentIndex: 0,
    clock: createClock(false, input.now),
    cursorElapsedMs: 0,
    timerHidden: input.timerHidden
  };
}
function questionNumber(session, index) {
  const sec = session.sections.find((s) => index >= s.start && index < s.end);
  return sec ? sec.firstNumber + (index - sec.start) : index + 1;
}

// legacy/src/data/seeds/accounts.ts
var ACCOUNT_SCHEMA_VERSION = 1;
function createEmptyAccount({ id, kind, name, email, now }) {
  return {
    schemaVersion: ACCOUNT_SCHEMA_VERSION,
    profile: {
      id,
      kind,
      name,
      nickname: name.trim().split(/\s+/)[0] ?? name,
      email,
      school: "",
      city: "",
      bio: "",
      createdAt: new Date(now).toISOString()
    },
    onboarding: { status: "pending", goal: null, edition: null, difficultSubjects: [], level: null, finishedAt: null },
    study: { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 },
    practiceSessions: [],
    simulations: [],
    favorites: [],
    reviewMarks: [],
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
    celebratedAchievements: []
  };
}

// legacy/src/lib/sessions/reducers.ts
var iso = (now) => new Date(now).toISOString();
function settlePractice(s, now) {
  const elapsed = clockElapsed(s.clock, now);
  const delta = Math.max(0, elapsed - s.cursorElapsedMs);
  const qid = s.questionIds[s.currentIndex];
  const a = qid ? s.answers[qid] : void 0;
  if (!a || a.confirmed || delta === 0) return { ...s, cursorElapsedMs: elapsed };
  return {
    ...s,
    cursorElapsedMs: elapsed,
    answers: { ...s.answers, [qid]: { ...a, timeSpentMs: a.timeSpentMs + delta } }
  };
}
var practice = {
  select(s, letter, now) {
    const qid = s.questionIds[s.currentIndex];
    const a = s.answers[qid];
    if (!a || a.confirmed || s.status === "completed") return s;
    return { ...s, updatedAt: iso(now), answers: { ...s.answers, [qid]: { ...a, selected: a.selected === letter ? null : letter } } };
  },
  confirm(s, now) {
    const settled = settlePractice(s, now);
    const qid = settled.questionIds[settled.currentIndex];
    const a = settled.answers[qid];
    const q = QUESTION_BY_ID[qid];
    if (!a || !q || a.confirmed || !a.selected) return s;
    return {
      ...settled,
      updatedAt: iso(now),
      answers: {
        ...settled.answers,
        [qid]: { ...a, confirmed: true, correct: a.selected === q.correct, answeredAt: iso(now) }
      }
    };
  },
  goTo(s, index, now) {
    if (index < 0 || index >= s.questionIds.length || index === s.currentIndex) return s;
    return { ...settlePractice(s, now), currentIndex: index, updatedAt: iso(now) };
  },
  pause(s, now) {
    if (s.clock.runningSince === null) return s;
    const settled = settlePractice(s, now);
    return { ...settled, clock: pauseClock(settled.clock, now), updatedAt: iso(now) };
  },
  resume(s, now) {
    if (s.clock.runningSince !== null || s.status === "completed") return s;
    return { ...s, clock: resumeClock(s.clock, now), cursorElapsedMs: s.clock.elapsedMs, updatedAt: iso(now) };
  },
  finish(s, now) {
    const settled = settlePractice(s, now);
    return { ...settled, clock: pauseClock(settled.clock, now), status: "completed", completedAt: iso(now), updatedAt: iso(now) };
  },
  /** Acrescenta uma questão (semelhante ou aleatória) logo após a atual. */
  insertNext(s, questionId, now) {
    if (s.questionIds.includes(questionId)) return s;
    const ids = s.questionIds.slice();
    ids.splice(s.currentIndex + 1, 0, questionId);
    return {
      ...settlePractice(s, now),
      questionIds: ids,
      currentIndex: s.currentIndex + 1,
      filters: { ...s.filters, count: ids.length },
      answers: {
        ...s.answers,
        [questionId]: { questionId, selected: null, confirmed: false, correct: null, answeredAt: null, timeSpentMs: 0 }
      },
      updatedAt: iso(now)
    };
  },
  setTimerVisible(s, visible) {
    return { ...s, timerVisible: visible };
  },
  heartbeat(s, now) {
    return { ...s, updatedAt: iso(now) };
  },
  /** Recupera uma sessão cujo cronômetro ficou ativo (ex.: aba fechada sem pausa). */
  recover(s, now) {
    if (s.clock.runningSince === null) return s;
    if (now - new Date(s.updatedAt).getTime() < 2e4) return s;
    const lastSeen = Math.min(now, new Date(s.updatedAt).getTime() + 2e4);
    return practice.pause(s, Math.max(lastSeen, s.clock.runningSince));
  }
};
function settleSimulation(s, now) {
  const elapsed = Math.min(clockElapsed(s.clock, now), s.config.durationMs);
  const delta = Math.max(0, elapsed - s.cursorElapsedMs);
  const qid = s.questionIds[s.currentIndex];
  const a = qid ? s.answers[qid] : void 0;
  if (!a || delta === 0) return { ...s, cursorElapsedMs: elapsed };
  return {
    ...s,
    cursorElapsedMs: elapsed,
    answers: { ...s.answers, [qid]: { ...a, timeSpentMs: a.timeSpentMs + delta } }
  };
}
var simulation = {
  select(s, letter, now) {
    if (s.status === "completed") return s;
    const qid = s.questionIds[s.currentIndex];
    const a = s.answers[qid];
    if (!a) return s;
    return {
      ...s,
      updatedAt: iso(now),
      answers: { ...s.answers, [qid]: { ...a, selected: letter, answeredAt: letter ? iso(now) : null } }
    };
  },
  goTo(s, index, now) {
    if (index < 0 || index >= s.questionIds.length || index === s.currentIndex) return s;
    return { ...settleSimulation(s, now), currentIndex: index, updatedAt: iso(now) };
  },
  toggleMark(s, questionId, now) {
    const marked = s.marked.includes(questionId) ? s.marked.filter((m) => m !== questionId) : [...s.marked, questionId];
    return { ...s, marked, updatedAt: iso(now) };
  },
  pause(s, now) {
    if (s.clock.runningSince === null) return s;
    const settled = settleSimulation(s, now);
    const clock = pauseClock(settled.clock, now);
    return { ...settled, clock: { ...clock, elapsedMs: Math.min(clock.elapsedMs, s.config.durationMs) }, updatedAt: iso(now) };
  },
  resume(s, now) {
    if (s.clock.runningSince !== null || s.status === "completed") return s;
    return { ...s, clock: resumeClock(s.clock, now), cursorElapsedMs: s.clock.elapsedMs, updatedAt: iso(now) };
  },
  finish(s, reason, now) {
    if (s.status === "completed") return s;
    const settled = settleSimulation(s, now);
    const clock = pauseClock(settled.clock, now);
    return {
      ...settled,
      clock: { ...clock, elapsedMs: Math.min(clock.elapsedMs, s.config.durationMs) },
      status: "completed",
      finishReason: reason,
      completedAt: iso(now),
      updatedAt: iso(now),
      currentIndex: 0
    };
  },
  setTimerHidden(s, hidden) {
    return { ...s, timerHidden: hidden };
  },
  heartbeat(s, now) {
    return { ...s, updatedAt: iso(now) };
  },
  recover(s, now) {
    if (s.clock.runningSince === null) return s;
    if (now - new Date(s.updatedAt).getTime() < 2e4) return s;
    const lastSeen = Math.min(now, new Date(s.updatedAt).getTime() + 2e4);
    return simulation.pause(s, Math.max(lastSeen, s.clock.runningSince));
  },
  remaining(s, now) {
    return clockRemaining(s.clock, s.config.durationMs, now);
  }
};

// legacy/src/lib/calculations/results.ts
function topicBreakdown(entries) {
  const map = /* @__PURE__ */ new Map();
  for (const { q, correct } of entries) {
    const v = map.get(q.topicId) ?? { total: 0, correct: 0 };
    v.total++;
    if (correct) v.correct++;
    map.set(q.topicId, v);
  }
  return Array.from(map.entries()).map(([topicId, v]) => ({
    topicId,
    name: TOPIC_BY_ID[topicId]?.name ?? topicId,
    total: v.total,
    correct: v.correct,
    accuracy: v.total ? v.correct / v.total : 0
  })).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}
function practiceResult(session, now) {
  const entries = session.questionIds.map((id) => {
    const q = QUESTION_BY_ID[id];
    const a = session.answers[id];
    return q ? { q, answered: !!a?.confirmed, correct: !!a?.correct } : null;
  }).filter((e) => e !== null);
  const answered = entries.filter((e) => e.answered);
  const correct = answered.filter((e) => e.correct).length;
  const timeMs = clockElapsed(session.clock, now);
  return {
    total: entries.length,
    answered: answered.length,
    correct,
    wrong: answered.length - correct,
    unanswered: entries.length - answered.length,
    accuracy: entries.length ? correct / entries.length : 0,
    accuracyAnswered: answered.length ? correct / answered.length : 0,
    timeMs,
    avgTimeMs: answered.length ? answered.reduce((n, e) => n + (session.answers[e.q.id]?.timeSpentMs ?? 0), 0) / answered.length : 0,
    byTopic: topicBreakdown(answered),
    wrongIds: answered.filter((e) => !e.correct).map((e) => e.q.id)
  };
}
function estimateDemoScore(accuracy) {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return Math.round(320 + 530 * Math.pow(clamped, 1.15));
}
function simulationResult(session, now) {
  const entries = session.questionIds.map((id) => ({ q: QUESTION_BY_ID[id], a: session.answers[id] })).filter((e) => !!e.q);
  const rows = entries.map(({ q, a }) => ({
    q,
    answered: !!a?.selected,
    correct: !!a?.selected && a.selected === q.correct
  }));
  const answered = rows.filter((r) => r.answered);
  const correct = rows.filter((r) => r.correct).length;
  const byArea = session.sections.map((sec) => {
    const slice = rows.filter((r) => r.q.areaId === sec.areaId);
    const c = slice.filter((r) => r.correct).length;
    const acc2 = slice.length ? c / slice.length : 0;
    return {
      areaId: sec.areaId,
      name: AREA_BY_ID[sec.areaId].shortName,
      total: slice.length,
      correct: c,
      blank: slice.filter((r) => !r.answered).length,
      accuracy: acc2,
      estimatedScore: estimateDemoScore(acc2)
    };
  });
  const timeMs = Math.min(clockElapsed(session.clock, now), session.config.durationMs);
  const acc = rows.length ? correct / rows.length : 0;
  return {
    total: rows.length,
    answered: answered.length,
    correct,
    wrong: answered.length - correct,
    blank: rows.length - answered.length,
    accuracy: acc,
    timeMs,
    avgTimeMs: answered.length ? timeMs / answered.length : 0,
    byArea,
    byTopic: topicBreakdown(rows),
    estimatedScore: byArea.length ? Math.round(byArea.reduce((n, a) => n + a.estimatedScore, 0) / byArea.length) : estimateDemoScore(acc)
  };
}

// learning-engine.ts
function createSimulationFromQuestions(input) {
  const qs = questionRepository.getMany(input.questionIds);
  const order = AREAS.map((a) => a.id);
  const sorted = [...qs].sort((a, b) => order.indexOf(a.areaId) - order.indexOf(b.areaId));
  const sections = [];
  const questionIds = [];
  for (const areaId of order) {
    const group = sorted.filter((q) => q.areaId === areaId);
    if (!group.length) continue;
    sections.push({ areaId, label: AREA_BY_ID[areaId].shortName, start: questionIds.length, end: questionIds.length + group.length, firstNumber: questionIds.length + 1 });
    questionIds.push(...group.map((q) => q.id));
  }
  const iso2 = new Date(input.now).toISOString();
  const config = {
    mode: "custom",
    edition: null,
    day: null,
    foreignLanguage: "ingles",
    criteria: "balanced",
    includesEssay: false,
    ...input.config,
    areaIds: sections.map((s) => s.areaId),
    size: questionIds.length
  };
  return {
    id: createId("simulado"),
    kind: "simulation",
    title: input.title,
    createdAt: iso2,
    updatedAt: iso2,
    status: "in_progress",
    completedAt: null,
    finishReason: null,
    config,
    questionIds,
    sections,
    answers: Object.fromEntries(questionIds.map((qid) => [qid, { questionId: qid, selected: null, answeredAt: null, timeSpentMs: 0 }])),
    marked: [],
    currentIndex: 0,
    clock: createClock(true, input.now),
    cursorElapsedMs: 0,
    timerHidden: !!input.timerHidden
  };
}
export {
  ACHIEVEMENT_DEFINITIONS,
  AREAS,
  AREA_BY_ID,
  EMPTY_FILTERS,
  GOAL_META,
  GRANULARITY_CONFIG,
  MINUTES_PER_QUESTION,
  PRACTICE_COUNTS,
  RECOMMENDATION_LABEL,
  REFERENCE_YEARS,
  SIMULATION_SIZES,
  SUBJECTS,
  SUBJECT_BY_ID,
  TOPICS,
  TOPIC_BY_ID,
  activityCalendar,
  activityDays,
  areaStats,
  availableForFilters,
  buildAutoSelection,
  buildSeries,
  clockElapsed,
  collectAnswerRecords,
  comparePeriods,
  computeStreak,
  createEmptyAccount,
  createPracticeSession,
  createRng,
  createSimulationFromQuestions,
  createSimulationSession,
  distributeAcrossAreas,
  estimateDemoScore,
  evaluateAchievements,
  frequentSubjects,
  freshSeed,
  goalProgress,
  groupSummary,
  installQuestions,
  installTaxonomy,
  pickQuestions,
  practice,
  practiceResult,
  prioritizeQuestions,
  questionNumber,
  questionRepository,
  rankTopics,
  recommendTopics,
  recordsThisMonth,
  recordsThisWeek,
  selectPracticeQuestions,
  shuffle,
  simulation,
  simulationDuration,
  simulationResult,
  startOfWeek,
  subjectStats,
  subjectsOfArea,
  summarize,
  topicStats,
  totalStudyTime
};
