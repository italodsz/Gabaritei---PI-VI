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

// legacy/src/types/content.ts
var LETTERS = ["A", "B", "C", "D", "E"];

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
function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}
function sample(items, n, rng) {
  return shuffle(items, rng).slice(0, Math.max(0, n));
}
function createId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
function freshSeed() {
  return Date.now();
}

// legacy/src/data/fixtures/questions/builder.ts
var AREA_OF_SUBJECT = {
  portugues: "linguagens",
  literatura: "linguagens",
  ingles: "linguagens",
  espanhol: "linguagens",
  artes: "linguagens",
  historia: "humanas",
  geografia: "humanas",
  filosofia: "humanas",
  sociologia: "humanas",
  fisica: "natureza",
  quimica: "natureza",
  biologia: "natureza",
  matematica: "matematica"
};
function parseLeadingNumber(text) {
  const match = text.replace(/\./g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}
function buildQuestion(draft) {
  const topic = TOPIC_BY_ID[draft.topicId];
  if (!topic) throw new Error(`Assunto inexistente: ${draft.topicId}`);
  const rng = createRng(draft.id);
  const options = [draft.correct];
  for (const d of draft.distractors) {
    if (options.length === 5) break;
    if (!options.includes(d)) options.push(d);
  }
  if (options.length < 5) {
    throw new Error(`Quest\xE3o ${draft.id} precisa de 5 alternativas distintas (tem ${options.length}).`);
  }
  let ordered = shuffle(options, rng);
  if (draft.numeric) {
    const nums = options.map(parseLeadingNumber);
    if (nums.every((n) => !Number.isNaN(n))) {
      ordered = options.slice().sort((a, b) => parseLeadingNumber(a) - parseLeadingNumber(b));
    }
  }
  const alternatives = ordered.map((text, i) => ({ letter: LETTERS[i], text }));
  const correct = alternatives.find((a) => a.text === draft.correct).letter;
  const subtopicId = draft.subtopic ? `${draft.topicId}.${draft.subtopic}` : topic.subtopics[0]?.id;
  return {
    id: draft.id,
    areaId: AREA_OF_SUBJECT[topic.subjectId],
    subjectId: topic.subjectId,
    topicId: draft.topicId,
    subtopicId,
    year: draft.year ?? REFERENCE_YEARS[Math.floor(rng() * REFERENCE_YEARS.length)],
    origin: "demonstrativa",
    difficulty: draft.difficulty,
    skill: draft.skill,
    support: draft.support,
    image: draft.image,
    prompt: draft.prompt,
    alternatives,
    correct,
    explanation: draft.explanation,
    foreignLanguage: draft.foreignLanguage
  };
}
function conceptQuestions(opts) {
  const pool = Array.from(/* @__PURE__ */ new Set([...opts.items.map((i) => i.answer), ...opts.extraDistractors ?? []]));
  return opts.items.map((item) => {
    const rng = createRng(`${opts.prefix}-${item.key}-distractors`);
    const others = shuffle(
      pool.filter((p) => p !== item.answer && !(item.near ?? []).includes(p)),
      rng
    );
    return buildQuestion({
      id: `${opts.prefix}-${item.key}`,
      topicId: opts.topicId,
      subtopic: item.subtopic,
      difficulty: item.difficulty ?? "media",
      skill: opts.skill,
      support: opts.support ? opts.support(item.clue) : { paragraphs: [item.clue] },
      prompt: opts.prompt,
      correct: item.answer,
      distractors: [...item.near ?? [], ...others],
      explanation: item.why
    });
  });
}
function numericOptions(correct, candidates, format) {
  const c = format(correct);
  const seen = /* @__PURE__ */ new Set([c]);
  const out = [];
  const push = (n) => {
    if (!Number.isFinite(n) || n < 0) return;
    const f = format(n);
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  };
  candidates.forEach(push);
  const factors = [1.25, 0.8, 1.5, 0.5, 2, 1.1, 0.9, 3];
  for (const k of factors) {
    if (out.length >= 4) break;
    push(correct * k);
  }
  return { correct: c, distractors: out };
}

// legacy/src/lib/format.ts
function formatNumber(value, decimals = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
function formatDecimal(value, max = 2) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: max });
}
function formatMoney(value) {
  return `R$ ${formatNumber(value, 2)}`;
}
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

// legacy/src/data/fixtures/questions/matematica.ts
var money = (n) => formatMoney(Math.round(n * 100) / 100);
var num = (n, max = 2) => formatDecimal(n, max);
var variacao = [
  ["um fone de ouvido", 250, 20, 20],
  ["uma bicicleta", 1500, 10, 10],
  ["uma mochila", 160, 25, 20],
  ["um par de t\xEAnis", 400, 30, 30],
  ["uma cafeteira", 360, 15, 20],
  ["um celular", 2e3, 40, 25]
];
var variacaoQs = variacao.map(([item, p, a, d], i) => {
  const final = p * (1 + a / 100) * (1 - d / 100);
  const opts = numericOptions(final, [p * (1 + (a - d) / 100), p, p * (1 + a / 100), p * (1 - d / 100)], money);
  return buildQuestion({
    id: `mat-variacao-${i + 1}`,
    topicId: "mat-porcentagem",
    subtopic: "variacao",
    difficulty: a === d ? "media" : "facil",
    skill: "Resolver situa\xE7\xF5es que envolvem aumentos e descontos percentuais sucessivos",
    support: {
      paragraphs: [
        `Uma loja reajustou em ${a}% o pre\xE7o de ${item} que custava ${money(p)}. Semanas depois, anunciou uma promo\xE7\xE3o com ${d}% de desconto sobre o novo pre\xE7o.`
      ]
    },
    prompt: "Durante a promo\xE7\xE3o, o pre\xE7o desse produto passou a ser",
    ...opts,
    numeric: true,
    explanation: `Um aumento de ${a}% multiplica o pre\xE7o por ${num(1 + a / 100)}, e um desconto de ${d}% multiplica por ${num(1 - d / 100)}. Assim, ${money(p)} \xD7 ${num(1 + a / 100)} \xD7 ${num(1 - d / 100)} = ${money(final)}. Percentuais sucessivos n\xE3o se somam: o desconto incide sobre um valor j\xE1 reajustado.`
  });
});
var juros = [
  [1e3, 10, 2, "ano"],
  [2e3, 5, 2, "m\xEAs"],
  [5e3, 2, 3, "m\xEAs"],
  [800, 10, 3, "ano"]
];
var jurosQs = juros.map(([c, i, n, per], k) => {
  const m = c * Math.pow(1 + i / 100, n);
  const simples = c * (1 + i / 100 * n);
  const opts = numericOptions(m, [simples, m - c, c * (i / 100) * n, c * (1 + i / 100)], money);
  return buildQuestion({
    id: `mat-juros-${k + 1}`,
    topicId: "mat-porcentagem",
    subtopic: "juros",
    difficulty: n === 3 ? "dificil" : "media",
    skill: "Calcular montantes em aplica\xE7\xF5es a juros compostos",
    support: {
      paragraphs: [
        `Uma estudante aplicou ${money(c)} em um investimento que rende juros compostos de ${i}% ao ${per}. Ela n\xE3o fez novos dep\xF3sitos nem retiradas durante ${n} ${per === "m\xEAs" ? "meses" : "anos"}.`
      ]
    },
    prompt: "Ao final desse per\xEDodo, o montante dispon\xEDvel ser\xE1 de",
    ...opts,
    numeric: true,
    explanation: `No regime composto, M = C\xB7(1 + i)\u207F. Logo, M = ${money(c)} \xD7 ${num(1 + i / 100)}^${n} = ${money(m)}. O valor ${money(simples)} corresponderia a juros simples, em que o rendimento n\xE3o \xE9 incorporado ao capital a cada per\xEDodo.`
  });
});
var diretas = [
  {
    id: "1",
    text: "Uma impressora de uma escola imprime 48 p\xE1ginas em 3 minutos, funcionando em ritmo constante.",
    ask: "Para imprimir as 400 p\xE1ginas de uma apostila, essa impressora levar\xE1",
    a: 48,
    b: 3,
    c: 400,
    unit: "minutos"
  },
  {
    id: "2",
    text: "Em uma receita de p\xE3o de queijo, s\xE3o usados 500 g de polvilho para produzir 40 unidades.",
    ask: "Para produzir 140 unidades, mantendo a propor\xE7\xE3o, ser\xE3o necess\xE1rios",
    a: 40,
    b: 500,
    c: 140,
    unit: "gramas de polvilho"
  },
  {
    id: "3",
    text: "Um carro consome 6 litros de combust\xEDvel a cada 75 km percorridos em rodovia.",
    ask: "Em uma viagem de 450 km nas mesmas condi\xE7\xF5es, o consumo ser\xE1 de",
    a: 75,
    b: 6,
    c: 450,
    unit: "litros"
  }
];
var diretasQs = diretas.map((q) => {
  const ans = q.c * q.b / q.a;
  const fmt = (n) => `${num(n, 1)} ${q.unit}`;
  const opts = numericOptions(ans, [q.a * q.b / q.c, q.c * q.a / q.b / 10, ans + q.b, ans / 2], fmt);
  return buildQuestion({
    id: `mat-regra3-direta-${q.id}`,
    topicId: "mat-proporcao",
    subtopic: "regra-de-tres",
    difficulty: "facil",
    skill: "Resolver problemas com grandezas diretamente proporcionais",
    support: { paragraphs: [q.text] },
    prompt: q.ask,
    ...opts,
    numeric: true,
    explanation: `As grandezas s\xE3o diretamente proporcionais: dobrando uma, a outra tamb\xE9m dobra. Assim, ${num(q.b)}/${num(q.a)} = x/${num(q.c)}, o que d\xE1 x = ${num(ans, 1)}.`
  });
});
var inversas = [
  [6, 20, 8],
  [4, 30, 6],
  [10, 12, 15]
];
var inversasQs = inversas.map(([w1, d1, w2], i) => {
  const ans = w1 * d1 / w2;
  const fmt = (n) => `${num(n, 1)} dias`;
  const opts = numericOptions(ans, [d1 * w2 / w1, d1 - (w2 - w1), d1 + (w2 - w1), d1 / 2], fmt);
  return buildQuestion({
    id: `mat-regra3-inversa-${i + 1}`,
    topicId: "mat-proporcao",
    subtopic: "regra-de-tres",
    difficulty: "media",
    skill: "Resolver problemas com grandezas inversamente proporcionais",
    support: {
      paragraphs: [
        `Em um mutir\xE3o comunit\xE1rio, ${w1} volunt\xE1rios pintam todas as salas de uma escola em ${d1} dias, trabalhando no mesmo ritmo. Para a pr\xF3xima reforma, ${w2} volunt\xE1rios com o mesmo rendimento participar\xE3o.`
      ]
    },
    prompt: "O tempo necess\xE1rio para pintar todas as salas ser\xE1 de",
    ...opts,
    numeric: true,
    explanation: `Mais volunt\xE1rios terminam em menos tempo: as grandezas s\xE3o inversamente proporcionais. O total de trabalho \xE9 ${w1} \xD7 ${d1} = ${w1 * d1} volunt\xE1rio-dias; dividindo por ${w2}, obtemos ${num(ans, 1)} dias.`
  });
});
var escalas = [
  [5e5, 4],
  [25e4, 6],
  [2e6, 3.5],
  [15e5, 8]
];
var escalaQs = escalas.map(([n, cm], i) => {
  const km = cm * n / 1e5;
  const fmt = (v) => `${num(v, 1)} km`;
  const opts = numericOptions(km, [km * 10, km / 10, cm * n / 1e6, km * 100], fmt);
  return buildQuestion({
    id: `mat-escala-${i + 1}`,
    topicId: "mat-proporcao",
    subtopic: "escala",
    difficulty: "facil",
    skill: "Utilizar escalas para calcular dist\xE2ncias reais",
    support: {
      paragraphs: [
        `Em um mapa rodovi\xE1rio com escala 1 : ${formatNumber(n)}, a dist\xE2ncia em linha reta entre duas cidades \xE9 de ${num(cm)} cm.`
      ]
    },
    prompt: "A dist\xE2ncia real, em linha reta, entre essas cidades \xE9 de",
    ...opts,
    numeric: true,
    explanation: `Na escala 1 : ${formatNumber(n)}, cada 1 cm do mapa equivale a ${formatNumber(n)} cm reais, ou seja, ${num(n / 1e5)} km. Logo, ${num(cm)} cm correspondem a ${num(cm)} \xD7 ${num(n / 1e5)} = ${num(km, 1)} km.`
  });
});
var medidas = [
  { id: "1", ctx: "As notas de um estudante em sete simulados foram", values: [620, 580, 710, 650, 600, 690, 640], ask: "mediana", unit: "pontos" },
  { id: "2", ctx: "As temperaturas m\xE1ximas registradas em uma cidade durante uma semana foram", values: [28, 31, 27, 30, 33, 29, 32], ask: "media", unit: "\xB0C" },
  { id: "3", ctx: "O n\xFAmero de livros emprestados por dia em uma biblioteca escolar, ao longo de uma semana, foi", values: [12, 18, 9, 15, 21, 18, 12], ask: "media", unit: "livros" },
  { id: "4", ctx: "Os tempos, em minutos, que oito estudantes levaram para resolver uma lista foram", values: [42, 35, 50, 38, 47, 40, 55, 44], ask: "mediana", unit: "minutos" },
  { id: "5", ctx: "As idades dos integrantes de um grupo de estudos s\xE3o", values: [16, 17, 19, 18, 17, 21, 16, 20, 18], ask: "mediana", unit: "anos" }
];
var medidasQs = medidas.map((m) => {
  const sorted = m.values.slice().sort((a, b) => a - b);
  const mean = m.values.reduce((a, b) => a + b, 0) / m.values.length;
  const mid = sorted.length / 2;
  const median = sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
  const unsortedMiddle = m.values[Math.floor(m.values.length / 2)];
  const ans = m.ask === "media" ? mean : median;
  const other = m.ask === "media" ? median : mean;
  const fmt = (v) => `${num(v, 1)} ${m.unit}`;
  const opts = numericOptions(ans, [other, unsortedMiddle, sorted[sorted.length - 1] - sorted[0], (sorted[0] + sorted[sorted.length - 1]) / 2], fmt);
  return buildQuestion({
    id: `mat-medidas-${m.id}`,
    topicId: "mat-estatistica",
    subtopic: "medidas",
    difficulty: m.ask === "mediana" ? "media" : "facil",
    skill: "Calcular medidas de tend\xEAncia central em conjuntos de dados",
    support: { paragraphs: [`${m.ctx}: ${m.values.join("; ")}.`] },
    prompt: `A ${m.ask === "media" ? "m\xE9dia aritm\xE9tica" : "mediana"} desses valores \xE9`,
    ...opts,
    numeric: true,
    explanation: m.ask === "media" ? `A m\xE9dia \xE9 a soma dos valores dividida pela quantidade: ${m.values.reduce((a, b) => a + b, 0)} \xF7 ${m.values.length} = ${num(mean, 1)}. A mediana (${num(median, 1)}) \xE9 outra medida, obtida ap\xF3s ordenar os dados.` : `Para a mediana, ordenamos os dados: ${sorted.join("; ")}. ${sorted.length % 2 ? `Com ${sorted.length} valores, o termo central \xE9 o ${Math.ceil(mid)}\xBA` : `Com ${sorted.length} valores, fazemos a m\xE9dia dos dois termos centrais`}, resultando em ${num(median, 1)}. Usar o valor central sem ordenar \xE9 um erro comum.`
  });
});
var chuvaImage = {
  src: "/questoes/chuvas-semestre.svg",
  alt: "Gr\xE1fico de barras com a precipita\xE7\xE3o mensal de janeiro a junho: janeiro 180 mm, fevereiro 210 mm, mar\xE7o 150 mm, abril 80 mm, maio 60 mm e junho 40 mm.",
  caption: "Precipita\xE7\xE3o acumulada por m\xEAs em um munic\xEDpio (dados fict\xEDcios).",
  width: 640,
  height: 380
};
var graficoQs = [
  buildQuestion({
    id: "mat-grafico-1",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "facil",
    skill: "Interpretar informa\xE7\xF5es apresentadas em gr\xE1ficos de barras",
    support: { paragraphs: ["A Defesa Civil de um munic\xEDpio divulgou o gr\xE1fico a seguir, com a precipita\xE7\xE3o acumulada em cada m\xEAs do primeiro semestre."] },
    image: chuvaImage,
    prompt: "A maior redu\xE7\xE3o de precipita\xE7\xE3o em rela\xE7\xE3o ao m\xEAs anterior ocorreu na passagem de",
    correct: "mar\xE7o para abril.",
    distractors: ["janeiro para fevereiro.", "fevereiro para mar\xE7o.", "abril para maio.", "maio para junho."],
    explanation: "As varia\xE7\xF5es foram: jan\u2192fev +30 mm; fev\u2192mar \u221260 mm; mar\u2192abr \u221270 mm; abr\u2192mai \u221220 mm; mai\u2192jun \u221220 mm. A maior redu\xE7\xE3o, de 70 mm, aconteceu de mar\xE7o para abril."
  }),
  buildQuestion({
    id: "mat-grafico-2",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "media",
    skill: "Calcular a m\xE9dia a partir de dados de um gr\xE1fico",
    support: { paragraphs: ["O gr\xE1fico apresenta a precipita\xE7\xE3o mensal registrada em um munic\xEDpio ao longo do primeiro semestre."] },
    image: chuvaImage,
    prompt: "A quantidade de meses em que a precipita\xE7\xE3o ficou acima da m\xE9dia mensal do semestre foi",
    correct: "3",
    distractors: ["1", "2", "4", "5"],
    numeric: true,
    explanation: "A soma \xE9 180 + 210 + 150 + 80 + 60 + 40 = 720 mm, e a m\xE9dia mensal \xE9 720 \xF7 6 = 120 mm. Ficaram acima desse valor janeiro, fevereiro e mar\xE7o: 3 meses."
  }),
  buildQuestion({
    id: "mat-grafico-3",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "media",
    skill: "Relacionar dados de gr\xE1ficos a porcentagens",
    support: { paragraphs: ["Observe o gr\xE1fico com a precipita\xE7\xE3o mensal de um munic\xEDpio no primeiro semestre."] },
    image: chuvaImage,
    prompt: "A precipita\xE7\xE3o de junho corresponde a que porcentagem da precipita\xE7\xE3o de fevereiro, aproximadamente?",
    correct: "19%",
    distractors: ["4%", "17%", "25%", "81%"],
    numeric: true,
    explanation: "Basta dividir 40 por 210: 40 \xF7 210 \u2248 0,19, ou seja, cerca de 19%. O valor 81% seria a redu\xE7\xE3o percentual, n\xE3o a raz\xE3o pedida."
  })
];
var taxi = [
  [5, 2.5, 12],
  [6.5, 3, 8],
  [4.8, 2.2, 15]
];
var taxiQs = taxi.map(([fixo, km, dist], i) => {
  const total = fixo + km * dist;
  const opts = numericOptions(total, [km * dist, (fixo + km) * dist, fixo * dist + km, total + km], money);
  return buildQuestion({
    id: `mat-afim-taxi-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "afim",
    difficulty: "facil",
    skill: "Modelar situa\xE7\xF5es com fun\xE7\xF5es afins",
    support: {
      paragraphs: [
        `Em uma cidade, a tarifa de t\xE1xi \xE9 composta por uma bandeirada fixa de ${money(fixo)} mais ${money(km)} por quil\xF4metro rodado.`
      ]
    },
    prompt: `O valor a ser pago por uma corrida de ${dist} km \xE9`,
    ...opts,
    numeric: true,
    explanation: `A tarifa \xE9 uma fun\xE7\xE3o afim: P(x) = ${num(fixo)} + ${num(km)}x. Para x = ${dist}, P = ${num(fixo)} + ${num(km)} \xD7 ${dist} = ${money(total)}.`
  });
});
var planos = [
  [49.9, 12, 109.9],
  [39, 8, 87]
];
var planoQs = planos.map(([fixo, gb, pago], i) => {
  const extra = (pago - fixo) / gb;
  const fmt = (n) => `${num(n, 1)} GB`;
  const opts = numericOptions(extra, [pago / gb, extra + 1, extra - 1, (pago + fixo) / gb], fmt);
  return buildQuestion({
    id: `mat-afim-plano-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "afim",
    difficulty: "media",
    skill: "Resolver equa\xE7\xF5es do 1\xBA grau em contextos de consumo",
    support: {
      paragraphs: [
        `Um plano de internet m\xF3vel custa ${money(fixo)} por m\xEAs, com franquia inclusa. Cada gigabyte adicional consumido \xE9 cobrado a ${money(gb)}. Em determinado m\xEAs, a fatura de um cliente foi de ${money(pago)}.`
      ]
    },
    prompt: "A quantidade de gigabytes adicionais consumidos por esse cliente no m\xEAs foi",
    ...opts,
    numeric: true,
    explanation: `A fatura segue F(x) = ${num(fixo)} + ${num(gb)}x. Igualando a ${num(pago)}: ${num(gb)}x = ${num(pago - fixo)}, logo x = ${num(extra, 1)} GB.`
  });
});
var projeteis = [20, 30, 10, 40];
var projetilQs = projeteis.map((v, i) => {
  const hmax = v * v / 20;
  const fmt = (n) => `${num(n, 1)} m`;
  const opts = numericOptions(hmax, [v / 10, v * v / 10, v / 2, v * 2], fmt);
  return buildQuestion({
    id: `mat-quadratica-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "quadratica",
    difficulty: "dificil",
    skill: "Determinar o valor m\xE1ximo de uma fun\xE7\xE3o quadr\xE1tica",
    support: {
      paragraphs: [
        `Durante uma feira de ci\xEAncias, um foguete de \xE1gua foi lan\xE7ado verticalmente. Sua altura h, em metros, t segundos ap\xF3s o lan\xE7amento, \xE9 descrita por h(t) = \u22125t\xB2 + ${v}t.`
      ]
    },
    prompt: "A altura m\xE1xima atingida pelo foguete foi de",
    ...opts,
    numeric: true,
    explanation: `O m\xE1ximo ocorre no v\xE9rtice: t = \u2212b/(2a) = \u2212${v}/(2\xB7(\u22125)) = ${num(v / 10)} s. Substituindo, h = \u22125\xB7(${num(v / 10)})\xB2 + ${v}\xB7${num(v / 10)} = ${num(hmax, 1)} m.`
  });
});
var bacterias = [
  [500, 3, 12],
  [200, 2, 10],
  [1e3, 4, 16],
  [50, 5, 30]
];
var expQs = bacterias.map(([n0, h, total], i) => {
  const n = n0 * Math.pow(2, total / h);
  const fmt = (v) => `${formatNumber(v)} bact\xE9rias`;
  const opts = numericOptions(n, [n0 * 2 * (total / h), n0 * (total / h), n / 2, n * 2], fmt);
  return buildQuestion({
    id: `mat-exponencial-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "exponencial",
    difficulty: "media",
    skill: "Reconhecer e calcular crescimentos exponenciais",
    support: {
      paragraphs: [
        `Em um experimento, uma cultura com ${formatNumber(n0)} bact\xE9rias dobra de tamanho a cada ${h} horas, mantidas as condi\xE7\xF5es do laborat\xF3rio.`
      ]
    },
    prompt: `Ap\xF3s ${total} horas, a popula\xE7\xE3o dessa cultura ser\xE1 de`,
    ...opts,
    numeric: true,
    explanation: `Em ${total} horas ocorrem ${total / h} duplica\xE7\xF5es. A popula\xE7\xE3o \xE9 ${formatNumber(n0)} \xD7 2^${total / h} = ${formatNumber(n)}. Crescimentos que dobram em intervalos fixos s\xE3o exponenciais, n\xE3o lineares.`
  });
});
var terrenos = [
  [20, 15, 3],
  [30, 12, 4],
  [25, 18, 5],
  [16, 10, 2]
];
var areaQs = terrenos.map(([a, b, r], i) => {
  const ans = a * b - 3 * r * r;
  const fmt = (n) => `${formatNumber(n)} m\xB2`;
  const opts = numericOptions(ans, [a * b - 3 * 2 * r, a * b - r * r, a * b, a * b - 3 * r], fmt);
  return buildQuestion({
    id: `mat-areas-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "areas",
    difficulty: "media",
    skill: "Calcular \xE1reas de figuras planas compostas",
    support: {
      paragraphs: [
        `Um terreno retangular mede ${a} m por ${b} m. No centro dele ser\xE1 constru\xEDdo um canteiro circular com ${r} m de raio, e o restante do terreno receber\xE1 grama. Utilize \u03C0 = 3.`
      ]
    },
    prompt: "A \xE1rea a ser coberta por grama \xE9 de",
    ...opts,
    numeric: true,
    explanation: `A \xE1rea do ret\xE2ngulo \xE9 ${a} \xD7 ${b} = ${a * b} m\xB2, e a do c\xEDrculo \xE9 \u03C0\xB7r\xB2 = 3 \xD7 ${r}\xB2 = ${3 * r * r} m\xB2. A \xE1rea gramada \xE9 ${a * b} \u2212 ${3 * r * r} = ${formatNumber(ans)} m\xB2.`
  });
});
var escadas = [
  [5, 3, 4],
  [10, 6, 8],
  [13, 5, 12],
  [17, 8, 15]
];
var pitagorasQs = escadas.map(([l, d, h], i) => {
  const fmt = (n) => `${num(n, 1)} m`;
  const opts = numericOptions(h, [l - d, l + d, (l + d) / 2, Math.sqrt(l * l + d * d)], fmt);
  return buildQuestion({
    id: `mat-pitagoras-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "pitagoras",
    difficulty: "facil",
    skill: "Aplicar o teorema de Pit\xE1goras em situa\xE7\xF5es reais",
    support: {
      paragraphs: [
        `Para limpar uma calha, um pintor apoiou uma escada de ${l} m em uma parede vertical. O p\xE9 da escada ficou a ${d} m da base da parede, em um piso horizontal.`
      ]
    },
    prompt: "A altura, na parede, em que o topo da escada ficou apoiado \xE9 de",
    ...opts,
    numeric: true,
    explanation: `A escada, a parede e o ch\xE3o formam um tri\xE2ngulo ret\xE2ngulo com hipotenusa ${l} m. Assim, h\xB2 + ${d}\xB2 = ${l}\xB2, h\xB2 = ${l * l - d * d} e h = ${h} m.`
  });
});
var rampaImage = {
  src: "/questoes/rampa.svg",
  alt: "Tri\xE2ngulo ret\xE2ngulo representando uma rampa: a hipotenusa \xE9 a rampa, o \xE2ngulo com o solo \xE9 de 30 graus e a altura \xE9 desconhecida.",
  caption: "Esquema da rampa de acesso (fora de escala).",
  width: 640,
  height: 300
};
var rampas = [8, 12, 20];
var trigQs = rampas.map(
  (l, i) => buildQuestion({
    id: `mat-trigonometria-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "trigonometria",
    difficulty: "media",
    skill: "Utilizar raz\xF5es trigonom\xE9tricas no tri\xE2ngulo ret\xE2ngulo",
    support: {
      paragraphs: [
        `Uma escola construir\xE1 uma rampa de acesso com ${l} m de comprimento, formando um \xE2ngulo de 30\xB0 com o solo, como no esquema. Considere sen 30\xB0 = 0,5 e cos 30\xB0 \u2248 0,87.`
      ]
    },
    image: rampaImage,
    prompt: "A altura vencida pela rampa \xE9 de",
    ...numericOptions(l / 2, [l * 0.87, l, l / 3, l * 2], (n) => `${num(n, 2)} m`),
    numeric: true,
    explanation: `A altura \xE9 o cateto oposto ao \xE2ngulo de 30\xB0. Como sen 30\xB0 = altura \xF7 comprimento, altura = ${l} \xD7 0,5 = ${num(l / 2)} m. Usar o cosseno daria o afastamento horizontal, n\xE3o a altura.`
  })
);
var cilindros = [
  [1, 2],
  [2, 1.5],
  [0.5, 1.2]
];
var cilindroQs = cilindros.map(([r, h], i) => {
  const litros = 3 * r * r * h * 1e3;
  const fmt = (n) => `${formatNumber(n)} L`;
  const opts = numericOptions(litros, [3 * r * h * 1e3, 3 * 2 * r * h * 1e3, litros / 10, 3 * r * r * h * 100], fmt);
  return buildQuestion({
    id: `mat-volume-cilindro-${i + 1}`,
    topicId: "mat-geometria-espacial",
    subtopic: "volumes",
    difficulty: "media",
    skill: "Calcular o volume de cilindros e converter unidades",
    support: {
      paragraphs: [
        `Uma cisterna tem formato de cilindro reto, com raio interno de ${num(r)} m e altura de ${num(h)} m. Use \u03C0 = 3 e lembre que 1 m\xB3 = 1 000 L.`
      ]
    },
    prompt: "A capacidade m\xE1xima dessa cisterna \xE9 de",
    ...opts,
    numeric: true,
    explanation: `V = \u03C0\xB7r\xB2\xB7h = 3 \xD7 ${num(r)}\xB2 \xD7 ${num(h)} = ${num(3 * r * r * h, 3)} m\xB3. Convertendo, ${num(3 * r * r * h, 3)} \xD7 1 000 = ${formatNumber(litros)} L.`
  });
});
var aquarios = [
  [60, 30, 40],
  [80, 40, 50]
];
var aquarioQs = aquarios.map(([c, l, a], i) => {
  const litros = c * l * a / 1e3;
  const fmt = (n) => `${num(n, 1)} L`;
  const opts = numericOptions(litros, [litros * 10, litros / 10, (c + l + a) / 10, c * l / 100], fmt);
  return buildQuestion({
    id: `mat-volume-aquario-${i + 1}`,
    topicId: "mat-geometria-espacial",
    subtopic: "volumes",
    difficulty: "facil",
    skill: "Calcular o volume de paralelep\xEDpedos",
    support: {
      paragraphs: [`Um aqu\xE1rio com formato de paralelep\xEDpedo tem dimens\xF5es internas de ${c} cm \xD7 ${l} cm \xD7 ${a} cm. Considere 1 L = 1 000 cm\xB3.`]
    },
    prompt: "Totalmente cheio, esse aqu\xE1rio comporta",
    ...opts,
    numeric: true,
    explanation: `O volume \xE9 ${c} \xD7 ${l} \xD7 ${a} = ${formatNumber(c * l * a)} cm\xB3. Dividindo por 1 000, obtemos ${num(litros, 1)} L.`
  });
});
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
var frac = (n, d) => {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
};
var PLURAL = { vermelha: "vermelhas", azul: "azuis", verde: "verdes" };
var urnas = [
  [3, 5, 2, "vermelha"],
  [4, 6, 8, "verde"],
  [6, 2, 4, "azul"],
  [5, 7, 3, "vermelha"]
];
var probQs = urnas.map(([v, a, g, alvo], i) => {
  const total = v + a + g;
  const fav = alvo === "vermelha" ? v : alvo === "azul" ? a : g;
  const correct = frac(fav, total);
  const cands = [frac(fav, total - fav), frac(total - fav, total), `1/${total}`, frac(1, 3), frac(fav + 1, total), frac(fav, total + 1)];
  return buildQuestion({
    id: `mat-probabilidade-${i + 1}`,
    topicId: "mat-probabilidade",
    subtopic: "probabilidade",
    difficulty: "facil",
    skill: "Calcular probabilidades em experimentos aleat\xF3rios simples",
    support: {
      paragraphs: [
        `Em uma gincana, uma urna cont\xE9m ${v} bolas vermelhas, ${a} azuis e ${g} verdes, todas do mesmo tamanho e material. Uma bola ser\xE1 retirada ao acaso.`
      ]
    },
    prompt: `A probabilidade de a bola retirada ser ${alvo} \xE9`,
    correct,
    distractors: cands.filter((c) => c !== correct),
    explanation: `H\xE1 ${total} bolas no total e ${fav} s\xE3o ${PLURAL[alvo]}. A probabilidade \xE9 casos favor\xE1veis \xF7 casos poss\xEDveis = ${fav}/${total} = ${correct}.`
  });
});
var dadosQ = buildQuestion({
  id: "mat-probabilidade-dados",
  topicId: "mat-probabilidade",
  subtopic: "probabilidade",
  difficulty: "media",
  skill: "Calcular probabilidades com dois eventos",
  support: { paragraphs: ["Dois dados comuns, com faces numeradas de 1 a 6, s\xE3o lan\xE7ados simultaneamente em um jogo de tabuleiro."] },
  prompt: "A probabilidade de a soma dos resultados ser igual a 7 \xE9",
  correct: "1/6",
  distractors: ["1/12", "1/36", "7/36", "1/3"],
  explanation: "H\xE1 36 resultados poss\xEDveis. Somam 7 os pares (1,6), (2,5), (3,4), (4,3), (5,2) e (6,1): 6 casos. Logo, 6/36 = 1/6."
});
var combos = [
  [3, 5, 4],
  [4, 6, 3],
  [2, 7, 5]
];
var contagemQs = combos.map(([p, r, b], i) => {
  const ans = p * r * b;
  const fmt = (n) => `${formatNumber(n)}`;
  const opts = numericOptions(ans, [p + r + b, p * r + b, p * (r + b), ans * 2], fmt);
  return buildQuestion({
    id: `mat-contagem-${i + 1}`,
    topicId: "mat-probabilidade",
    subtopic: "contagem",
    difficulty: "facil",
    skill: "Aplicar o princ\xEDpio fundamental da contagem",
    support: {
      paragraphs: [`Uma lanchonete monta combos com 1 tipo de p\xE3o (${p} op\xE7\xF5es), 1 recheio (${r} op\xE7\xF5es) e 1 bebida (${b} op\xE7\xF5es).`]
    },
    prompt: "A quantidade de combos diferentes que podem ser montados \xE9",
    ...opts,
    numeric: true,
    explanation: `Pelo princ\xEDpio multiplicativo, as escolhas s\xE3o independentes: ${p} \xD7 ${r} \xD7 ${b} = ${ans} combos. Somar as op\xE7\xF5es (${p + r + b}) n\xE3o conta as combina\xE7\xF5es.`
  });
});
var senha = buildQuestion({
  id: "mat-contagem-senha",
  topicId: "mat-probabilidade",
  subtopic: "contagem",
  difficulty: "media",
  skill: "Contar agrupamentos sem repeti\xE7\xE3o",
  support: { paragraphs: ["O arm\xE1rio de uma escola \xE9 aberto com uma senha de 4 algarismos distintos, escolhidos entre 0 e 9."] },
  prompt: "A quantidade de senhas poss\xEDveis \xE9",
  correct: "5.040",
  distractors: ["210", "10.000", "6.561", "40"],
  numeric: true,
  explanation: "H\xE1 10 op\xE7\xF5es para o 1\xBA algarismo, 9 para o 2\xBA, 8 para o 3\xBA e 7 para o 4\xBA, pois n\xE3o pode haver repeti\xE7\xE3o: 10 \xD7 9 \xD7 8 \xD7 7 = 5.040. O valor 10.000 permitiria repeti\xE7\xF5es."
});
var pas = [
  [50, 10, 12],
  [20, 5, 10],
  [100, 15, 8]
];
var paQs = pas.map(([a1, r, n], i) => {
  const an = a1 + (n - 1) * r;
  const opts = numericOptions(an, [a1 + n * r, a1 * n, a1 + (n - 2) * r, (a1 + an) * n / 2], money);
  return buildQuestion({
    id: `mat-pa-${i + 1}`,
    topicId: "mat-progressoes",
    subtopic: "pa",
    difficulty: "facil",
    skill: "Utilizar o termo geral de uma progress\xE3o aritm\xE9tica",
    support: {
      paragraphs: [
        `Para juntar dinheiro para a formatura, um estudante depositou ${money(a1)} no primeiro m\xEAs e decidiu aumentar o dep\xF3sito em ${money(r)} a cada m\xEAs seguinte.`
      ]
    },
    prompt: `O valor depositado no ${n}\xBA m\xEAs ser\xE1 de`,
    ...opts,
    numeric: true,
    explanation: `Os dep\xF3sitos formam uma PA de raz\xE3o ${num(r)}. Pelo termo geral, a\u2099 = a\u2081 + (n \u2212 1)\xB7r = ${num(a1)} + ${n - 1} \xD7 ${num(r)} = ${money(an)}.`
  });
});
var somaPa = buildQuestion({
  id: "mat-pa-soma",
  topicId: "mat-progressoes",
  subtopic: "pa",
  difficulty: "dificil",
  skill: "Calcular a soma dos termos de uma progress\xE3o aritm\xE9tica",
  support: { paragraphs: ["Um atleta iniciou um treino correndo 2 km no primeiro dia e, a cada dia seguinte, correu 0,5 km a mais que no dia anterior, durante 20 dias."] },
  prompt: "A dist\xE2ncia total percorrida pelo atleta nesses 20 dias foi de",
  correct: "135 km",
  distractors: ["11,5 km", "40 km", "115 km", "230 km"],
  numeric: true,
  explanation: "O 20\xBA termo \xE9 a\u2082\u2080 = 2 + 19 \xD7 0,5 = 11,5 km. A soma \xE9 S = (a\u2081 + a\u2082\u2080)\xB7n/2 = (2 + 11,5) \xD7 20 / 2 = 135 km."
});
var MATEMATICA_QUESTIONS = [
  ...variacaoQs,
  ...jurosQs,
  ...diretasQs,
  ...inversasQs,
  ...escalaQs,
  ...medidasQs,
  ...graficoQs,
  ...taxiQs,
  ...planoQs,
  ...projetilQs,
  ...expQs,
  ...areaQs,
  ...pitagorasQs,
  ...trigQs,
  ...cilindroQs,
  ...aquarioQs,
  ...probQs,
  dadosQ,
  ...contagemQs,
  senha,
  ...paQs,
  somaPa
];

// legacy/src/data/fixtures/questions/natureza.ts
var num2 = (n, max = 2) => formatDecimal(n, max);
var viagens = [
  ["Um \xF4nibus intermunicipal", 180, 2, 30],
  ["Uma fam\xEDlia, de carro,", 240, 3, 0],
  ["Um ciclista profissional", 90, 2, 30],
  ["Um caminh\xE3o de entregas", 330, 5, 30]
];
var velocidadeQs = viagens.map(([who, d, h, m], i) => {
  const t2 = h + m / 60;
  const v = d / t2;
  const fmt = (n) => `${num2(n, 1)} km/h`;
  const opts = numericOptions(v, [d / (h + m / 100), v / 3.6, d * t2 / 10, v + 10], fmt);
  return buildQuestion({
    id: `fis-velocidade-${i + 1}`,
    topicId: "fis-cinematica",
    subtopic: "velocidade",
    difficulty: m ? "media" : "facil",
    skill: "Calcular velocidade m\xE9dia e converter unidades de tempo",
    support: { paragraphs: [`${who} percorreu ${d} km em ${h} h${m ? ` e ${m} min` : ""}, incluindo as paradas previstas no trajeto.`] },
    prompt: "A velocidade m\xE9dia desenvolvida nesse percurso foi de",
    ...opts,
    numeric: true,
    explanation: `A velocidade m\xE9dia \xE9 a dist\xE2ncia total dividida pelo tempo total. ${m ? `Primeiro, convertemos ${h} h e ${m} min em ${num2(t2)} h (pois ${m} min = ${num2(m / 60)} h). ` : ""}Assim, v\u2098 = ${d} \xF7 ${num2(t2)} = ${num2(v, 1)} km/h.`
  });
});
var frenagens = [
  [72, 5],
  [108, 6],
  [54, 3]
];
var frenagemQs = frenagens.map(([kmh, a], i) => {
  const v = kmh / 3.6;
  const dist = v * v / (2 * a);
  const fmt = (n) => `${num2(n, 1)} m`;
  const opts = numericOptions(dist, [kmh * kmh / (2 * a), v / a, dist * 2, v * (v / a)], fmt);
  return buildQuestion({
    id: `fis-mruv-${i + 1}`,
    topicId: "fis-cinematica",
    subtopic: "mruv",
    difficulty: "dificil",
    skill: "Aplicar a equa\xE7\xE3o de Torricelli em situa\xE7\xF5es de frenagem",
    support: {
      paragraphs: [`Um carro trafega a ${kmh} km/h quando o motorista aciona os freios, imprimindo uma desacelera\xE7\xE3o constante de ${a} m/s\xB2 at\xE9 a parada completa.`]
    },
    prompt: "A dist\xE2ncia percorrida durante a frenagem \xE9 de",
    ...opts,
    numeric: true,
    explanation: `Convertendo, ${kmh} km/h = ${num2(v)} m/s. Pela equa\xE7\xE3o de Torricelli, 0 = v\u2080\xB2 \u2212 2\xB7a\xB7d, logo d = ${num2(v)}\xB2 \xF7 (2 \xD7 ${a}) = ${num2(dist, 1)} m. Esquecer a convers\xE3o de km/h para m/s \xE9 o erro mais comum.`
  });
});
var cinetica = [
  ["um skatista de 60 kg", 60, 5],
  ["uma bola de boliche de 6 kg", 6, 4],
  ["um carro de 1 000 kg", 1e3, 20]
];
var cineticaQs = cinetica.map(([who, m, v], i) => {
  const ec = m * v * v / 2;
  const fmt = (n) => `${formatNumber(n)} J`;
  const opts = numericOptions(ec, [m * v, m * v * v, m * v / 2, ec * 2], fmt);
  return buildQuestion({
    id: `fis-energia-cinetica-${i + 1}`,
    topicId: "fis-energia",
    subtopic: "mecanica",
    difficulty: "facil",
    skill: "Calcular a energia cin\xE9tica de um corpo",
    support: { paragraphs: [`Em determinado instante, ${who} se desloca a ${v} m/s.`] },
    prompt: "A energia cin\xE9tica associada a esse movimento \xE9 de",
    ...opts,
    numeric: true,
    explanation: `A energia cin\xE9tica \xE9 Ec = m\xB7v\xB2/2 = ${formatNumber(m)} \xD7 ${v}\xB2 \xF7 2 = ${formatNumber(ec)} J. O valor m\xB7v (${formatNumber(m * v)}) corresponde \xE0 quantidade de movimento, outra grandeza.`
  });
});
var potencial = [
  [50, 12],
  [2, 45]
];
var potencialQs = potencial.map(([m, h], i) => {
  const ep = m * 10 * h;
  const fmt = (n) => `${formatNumber(n)} J`;
  const opts = numericOptions(ep, [m * h, m * 9.8 * h * 10, ep / 2, ep * 10], fmt);
  return buildQuestion({
    id: `fis-energia-potencial-${i + 1}`,
    topicId: "fis-energia",
    subtopic: "mecanica",
    difficulty: "facil",
    skill: "Calcular energia potencial gravitacional",
    support: { paragraphs: [`Um objeto de ${m} kg \xE9 elevado por um guindaste at\xE9 uma altura de ${h} m em rela\xE7\xE3o ao solo. Considere g = 10 m/s\xB2.`] },
    prompt: "A energia potencial gravitacional do objeto nessa posi\xE7\xE3o, em rela\xE7\xE3o ao solo, \xE9 de",
    ...opts,
    numeric: true,
    explanation: `E\u209A = m\xB7g\xB7h = ${m} \xD7 10 \xD7 ${h} = ${formatNumber(ep)} J.`
  });
});
var chuveiros = [
  [5500, 20, 30, 0.8],
  [4400, 15, 30, 0.9],
  [6e3, 10, 30, 0.75],
  [2e3, 30, 30, 0.8]
];
var consumoQs = chuveiros.map(([w, min, dias, tarifa], i) => {
  const kwh = w / 1e3 * (min / 60) * dias;
  const custo = kwh * tarifa;
  const opts = numericOptions(custo, [w / 1e3 * min * dias * tarifa / 10, kwh, w / 1e3 * (min / 60) * tarifa, custo * 2], formatMoney);
  return buildQuestion({
    id: `fis-consumo-${i + 1}`,
    topicId: "fis-eletricidade",
    subtopic: "consumo",
    difficulty: "media",
    skill: "Calcular consumo de energia el\xE9trica e seu custo",
    support: {
      paragraphs: [
        `Em uma resid\xEAncia, um aparelho de ${formatNumber(w)} W fica ligado ${min} minutos por dia, durante ${dias} dias. A distribuidora cobra ${formatMoney(tarifa)} por kWh consumido.`
      ]
    },
    prompt: "O custo mensal da energia consumida por esse aparelho \xE9 de",
    ...opts,
    numeric: true,
    explanation: `Energia = pot\xEAncia \xD7 tempo. Em kW e horas: ${num2(w / 1e3)} kW \xD7 ${num2(min / 60, 3)} h \xD7 ${dias} dias = ${num2(kwh, 2)} kWh. O custo \xE9 ${num2(kwh, 2)} \xD7 ${formatMoney(tarifa)} = ${formatMoney(custo)}.`
  });
});
var resistores = [
  [220, 10],
  [12, 4],
  [127, 50]
];
var ohmQs = resistores.map(([u, i2], i) => {
  const r = u / i2;
  const fmt = (n) => `${num2(n, 1)} \u03A9`;
  const opts = numericOptions(r, [u * i2, i2 / u, u - i2, u + i2], fmt);
  return buildQuestion({
    id: `fis-ohm-${i + 1}`,
    topicId: "fis-eletricidade",
    subtopic: "ohm",
    difficulty: "facil",
    skill: "Aplicar a primeira lei de Ohm",
    support: { paragraphs: [`Um resistor \xF4hmico \xE9 ligado a uma tens\xE3o de ${u} V e passa a ser percorrido por uma corrente de ${num2(i2)} A.`] },
    image: i === 0 ? { src: "/questoes/circuito.svg", alt: "Circuito simples com uma fonte de tens\xE3o ligada a um resistor e um amper\xEDmetro em s\xE9rie.", caption: "Circuito utilizado no experimento.", width: 560, height: 300 } : void 0,
    prompt: "A resist\xEAncia el\xE9trica desse resistor \xE9 de",
    ...opts,
    numeric: true,
    explanation: `Pela lei de Ohm, U = R\xB7i, ent\xE3o R = U \xF7 i = ${u} \xF7 ${num2(i2)} = ${num2(r, 1)} \u03A9. O produto U\xB7i (${formatNumber(u * i2)}) corresponde \xE0 pot\xEAncia, em watts.`
  });
});
var aquecimentos = [
  [500, 20, 80],
  [200, 25, 100],
  [1e3, 15, 45]
];
var calorQs = aquecimentos.map(([m, t0, t1], i) => {
  const q = m * (t1 - t0);
  const fmt = (n) => `${formatNumber(n)} cal`;
  const opts = numericOptions(q, [m * t1, m * t0, m + (t1 - t0), q / 10], fmt);
  return buildQuestion({
    id: `fis-calorimetria-${i + 1}`,
    topicId: "fis-termologia",
    subtopic: "calorimetria",
    difficulty: "facil",
    skill: "Calcular quantidade de calor sens\xEDvel",
    support: { paragraphs: [`Para preparar um ch\xE1, ${m} g de \xE1gua s\xE3o aquecidos de ${t0} \xB0C at\xE9 ${t1} \xB0C. O calor espec\xEDfico da \xE1gua \xE9 1 cal/(g\xB7\xB0C) e n\xE3o h\xE1 perdas para o ambiente.`] },
    prompt: "A quantidade de calor absorvida pela \xE1gua foi de",
    ...opts,
    numeric: true,
    explanation: `Q = m\xB7c\xB7\u0394T = ${m} \xD7 1 \xD7 (${t1} \u2212 ${t0}) = ${formatNumber(q)} cal. A varia\xE7\xE3o de temperatura, e n\xE3o a temperatura final, entra no c\xE1lculo.`
  });
});
var ondasQs = [
  buildQuestion({
    id: "fis-ondas-1",
    topicId: "fis-ondas",
    difficulty: "media",
    skill: "Relacionar velocidade, frequ\xEAncia e comprimento de onda",
    support: { paragraphs: ["Uma emissora de r\xE1dio FM transmite na frequ\xEAncia de 100 MHz. As ondas de r\xE1dio se propagam no ar com velocidade aproximada de 3 \xD7 10\u2078 m/s."] },
    prompt: "O comprimento de onda dessas ondas \xE9 de aproximadamente",
    correct: "3 m",
    distractors: ["0,3 m", "30 m", "300 m", "3.000 m"],
    numeric: true,
    explanation: "Pela equa\xE7\xE3o fundamental da ondulat\xF3ria, v = \u03BB\xB7f. Assim, \u03BB = 3 \xD7 10\u2078 \xF7 (100 \xD7 10\u2076) = 3 m."
  }),
  buildQuestion({
    id: "fis-ondas-2",
    topicId: "fis-ondas",
    difficulty: "facil",
    skill: "Relacionar velocidade, frequ\xEAncia e comprimento de onda",
    support: { paragraphs: ["Um diapas\xE3o emite um som de 680 Hz. Considere que o som se propaga no ar a 340 m/s."] },
    prompt: "O comprimento de onda desse som no ar \xE9 de",
    correct: "0,5 m",
    distractors: ["2 m", "0,2 m", "5 m", "1,5 m"],
    numeric: true,
    explanation: "\u03BB = v \xF7 f = 340 \xF7 680 = 0,5 m. Inverter a raz\xE3o (680 \xF7 340 = 2) \xE9 um erro frequente."
  }),
  buildQuestion({
    id: "fis-ondas-3",
    topicId: "fis-ondas",
    difficulty: "media",
    skill: "Reconhecer propriedades das ondas sonoras",
    support: { paragraphs: ["Ao ouvir uma mesma nota musical tocada por um viol\xE3o e por uma flauta, com mesma intensidade e mesma altura, uma pessoa consegue distinguir os dois instrumentos."] },
    prompt: "A caracter\xEDstica do som que permite essa distin\xE7\xE3o \xE9 o(a)",
    correct: "timbre.",
    distractors: ["frequ\xEAncia.", "intensidade.", "velocidade de propaga\xE7\xE3o.", "comprimento de onda."],
    explanation: "O timbre depende da composi\xE7\xE3o de harm\xF4nicos produzida por cada fonte. Como a nota (frequ\xEAncia) e a intensidade s\xE3o iguais, \xE9 o timbre que diferencia os instrumentos."
  })
];
var densidadeQs = [
  buildQuestion({
    id: "fis-densidade-1",
    topicId: "fis-hidrostatica",
    subtopic: "densidade",
    difficulty: "facil",
    skill: "Calcular densidade e prever flutua\xE7\xE3o",
    support: { paragraphs: ["Um bloco maci\xE7o de 400 g ocupa um volume de 500 cm\xB3. A densidade da \xE1gua \xE9 1 g/cm\xB3."] },
    prompt: "Com base na densidade do bloco, ao ser colocado em \xE1gua ele",
    correct: "flutuar\xE1, pois sua densidade \xE9 0,8 g/cm\xB3.",
    distractors: [
      "afundar\xE1, pois sua densidade \xE9 1,25 g/cm\xB3.",
      "afundar\xE1, pois sua massa \xE9 maior que 1 g.",
      "flutuar\xE1, pois sua densidade \xE9 1,25 g/cm\xB3.",
      "ficar\xE1 em equil\xEDbrio no fundo, pois sua densidade \xE9 1 g/cm\xB3."
    ],
    explanation: "d = m \xF7 V = 400 \xF7 500 = 0,8 g/cm\xB3. Como \xE9 menor que a densidade da \xE1gua, o bloco flutua, com parte do volume submersa."
  }),
  buildQuestion({
    id: "fis-densidade-2",
    topicId: "fis-hidrostatica",
    subtopic: "densidade",
    difficulty: "media",
    skill: "Calcular massa a partir da densidade",
    support: { paragraphs: ["O etanol tem densidade aproximada de 0,8 kg/L. Um tanque de combust\xEDvel foi abastecido com 50 L de etanol."] },
    prompt: "A massa de etanol colocada no tanque \xE9 de aproximadamente",
    correct: "40 kg",
    distractors: ["62,5 kg", "50 kg", "4 kg", "400 kg"],
    numeric: true,
    explanation: "m = d\xB7V = 0,8 \xD7 50 = 40 kg. Dividir o volume pela densidade (62,5) resultaria em unidade incorreta."
  }),
  buildQuestion({
    id: "fis-pressao-1",
    topicId: "fis-hidrostatica",
    subtopic: "pressao",
    difficulty: "media",
    skill: "Calcular press\xE3o hidrost\xE1tica",
    support: { paragraphs: ["Um mergulhador est\xE1 a 20 m de profundidade no mar. Considere a densidade da \xE1gua 1 000 kg/m\xB3 e g = 10 m/s\xB2."] },
    prompt: "A press\xE3o exercida apenas pela coluna de \xE1gua sobre o mergulhador \xE9 de",
    correct: "2 \xD7 10\u2075 Pa",
    distractors: ["2 \xD7 10\xB3 Pa", "2 \xD7 10\u2074 Pa", "2 \xD7 10\u2076 Pa", "1 \xD7 10\u2075 Pa"],
    explanation: "p = \u03C1\xB7g\xB7h = 1 000 \xD7 10 \xD7 20 = 200 000 Pa = 2 \xD7 10\u2075 Pa, o equivalente a cerca de 2 atm al\xE9m da press\xE3o atmosf\xE9rica."
  })
];
var solucoes = [
  ["sal de cozinha", 18, 0.5],
  ["a\xE7\xFAcar", 120, 2],
  ["hidr\xF3xido de s\xF3dio", 8, 0.25]
];
var concQs = solucoes.map(([soluto, m, v], i) => {
  const c = m / v;
  const fmt = (n) => `${num2(n, 1)} g/L`;
  const opts = numericOptions(c, [m * v, v / m, m / (v * 1e3), c / 2], fmt);
  return buildQuestion({
    id: `qui-concentracao-${i + 1}`,
    topicId: "qui-solucoes",
    subtopic: "concentracao",
    difficulty: "facil",
    skill: "Calcular a concentra\xE7\xE3o comum de solu\xE7\xF5es",
    support: { paragraphs: [`Em uma aula pr\xE1tica, ${m} g de ${soluto} foram dissolvidos em \xE1gua at\xE9 completar ${num2(v)} L de solu\xE7\xE3o.`] },
    prompt: "A concentra\xE7\xE3o comum da solu\xE7\xE3o obtida \xE9 de",
    ...opts,
    numeric: true,
    explanation: `C = m \xF7 V = ${m} g \xF7 ${num2(v)} L = ${num2(c, 1)} g/L.`
  });
});
var diluicoes = [
  [10, 200, 1e3],
  [40, 50, 400],
  [6, 300, 900]
];
var diluicaoQs = diluicoes.map(([c1, v1, v2], i) => {
  const c2 = c1 * v1 / v2;
  const fmt = (n) => `${num2(n, 2)} g/L`;
  const opts = numericOptions(c2, [c1 * v2 / v1, c1 * (v2 - v1) / v2, c1 / 2, c2 * 10], fmt);
  return buildQuestion({
    id: `qui-diluicao-${i + 1}`,
    topicId: "qui-solucoes",
    subtopic: "diluicao",
    difficulty: "media",
    skill: "Aplicar a rela\xE7\xE3o de dilui\xE7\xE3o C\u2081V\u2081 = C\u2082V\u2082",
    support: { paragraphs: [`Um t\xE9cnico diluiu ${v1} mL de uma solu\xE7\xE3o de concentra\xE7\xE3o ${c1} g/L, adicionando \xE1gua at\xE9 atingir ${v2} mL.`] },
    prompt: "A concentra\xE7\xE3o da nova solu\xE7\xE3o \xE9 de",
    ...opts,
    numeric: true,
    explanation: `Na dilui\xE7\xE3o a massa de soluto se conserva: C\u2081\xB7V\u2081 = C\u2082\xB7V\u2082. Logo, C\u2082 = ${c1} \xD7 ${v1} \xF7 ${v2} = ${num2(c2, 2)} g/L.`
  });
});
var moleculas = [
  ["\xE1gua (H\u2082O)", "H = 1; O = 16", 18, 3],
  ["g\xE1s carb\xF4nico (CO\u2082)", "C = 12; O = 16", 44, 2],
  ["glicose (C\u2086H\u2081\u2082O\u2086)", "C = 12; H = 1; O = 16", 180, 0.5],
  ["cloreto de s\xF3dio (NaCl)", "Na = 23; Cl = 35,5", 58.5, 4]
];
var molQs = moleculas.map(([sub, massas, mm, n], i) => {
  const m = mm * n;
  const fmt = (v) => `${num2(v, 1)} g`;
  const opts = numericOptions(m, [mm / n, mm, n * 6, mm + n], fmt);
  return buildQuestion({
    id: `qui-mol-${i + 1}`,
    topicId: "qui-estequiometria",
    subtopic: "mol",
    difficulty: i === 2 ? "media" : "facil",
    skill: "Relacionar quantidade de mat\xE9ria e massa",
    support: { paragraphs: [`Considere as massas at\xF4micas: ${massas}.`] },
    prompt: `A massa correspondente a ${num2(n)} mol de ${sub} \xE9 de`,
    ...opts,
    numeric: true,
    explanation: `A massa molar de ${sub} \xE9 ${num2(mm, 1)} g/mol. Portanto, m = n\xB7M = ${num2(n)} \xD7 ${num2(mm, 1)} = ${num2(m, 1)} g.`
  });
});
var estequio = buildQuestion({
  id: "qui-estequiometria-combustao",
  topicId: "qui-estequiometria",
  subtopic: "massa-molar",
  difficulty: "dificil",
  skill: "Realizar c\xE1lculos estequiom\xE9tricos em rea\xE7\xF5es de combust\xE3o",
  support: {
    paragraphs: [
      "A combust\xE3o completa do metano \xE9 representada por CH\u2084 + 2 O\u2082 \u2192 CO\u2082 + 2 H\u2082O. Considere as massas molares: CH\u2084 = 16 g/mol e CO\u2082 = 44 g/mol."
    ]
  },
  prompt: "A queima completa de 32 g de metano libera uma massa de g\xE1s carb\xF4nico igual a",
  correct: "88 g",
  distractors: ["44 g", "22 g", "64 g", "176 g"],
  numeric: true,
  explanation: "32 g de CH\u2084 correspondem a 32 \xF7 16 = 2 mol. A propor\xE7\xE3o CH\u2084 : CO\u2082 \xE9 1 : 1, ent\xE3o formam-se 2 mol de CO\u2082, ou 2 \xD7 44 = 88 g."
});
var phQs = [
  buildQuestion({
    id: "qui-ph-1",
    topicId: "qui-acido-base",
    difficulty: "facil",
    skill: "Classificar solu\xE7\xF5es pela escala de pH",
    support: { paragraphs: ["Uma estudante mediu o pH, a 25 \xB0C, de alguns materiais: suco de lim\xE3o (pH 2), caf\xE9 (pH 5), \xE1gua pura (pH 7), \xE1gua do mar (pH 8) e \xE1gua sanit\xE1ria (pH 12)."] },
    prompt: "Entre os materiais analisados, o mais b\xE1sico \xE9 o(a)",
    correct: "\xE1gua sanit\xE1ria.",
    distractors: ["suco de lim\xE3o.", "caf\xE9.", "\xE1gua pura.", "\xE1gua do mar."],
    explanation: "A 25 \xB0C, pH acima de 7 indica meio b\xE1sico; quanto maior o pH, mais b\xE1sico. A \xE1gua sanit\xE1ria, com pH 12, \xE9 a mais b\xE1sica da lista."
  }),
  buildQuestion({
    id: "qui-ph-2",
    topicId: "qui-acido-base",
    difficulty: "dificil",
    skill: "Relacionar pH e concentra\xE7\xE3o de \xEDons H\u207A",
    support: { paragraphs: ["A \xE1gua de um lago passou de pH 6 para pH 4 ap\xF3s um per\xEDodo de chuvas \xE1cidas."] },
    prompt: "Em rela\xE7\xE3o \xE0 situa\xE7\xE3o inicial, a concentra\xE7\xE3o de \xEDons H\u207A na \xE1gua do lago ficou",
    correct: "100 vezes maior.",
    distractors: ["2 vezes maior.", "10 vezes maior.", "100 vezes menor.", "2 vezes menor."],
    explanation: "A escala de pH \xE9 logar\xEDtmica: pH = \u2212log[H\u207A]. Diminuir o pH em 2 unidades significa multiplicar [H\u207A] por 10\xB2 = 100."
  }),
  buildQuestion({
    id: "qui-ph-3",
    topicId: "qui-acido-base",
    difficulty: "media",
    skill: "Compreender rea\xE7\xF5es de neutraliza\xE7\xE3o no cotidiano",
    support: { paragraphs: ["Para aliviar a azia, causada pelo excesso de \xE1cido clor\xEDdrico no est\xF4mago, algumas pessoas utilizam anti\xE1cidos \xE0 base de hidr\xF3xido de magn\xE9sio."] },
    prompt: "O al\xEDvio ocorre porque o anti\xE1cido",
    correct: "reage com o \xE1cido em uma rea\xE7\xE3o de neutraliza\xE7\xE3o.",
    distractors: [
      "aumenta a produ\xE7\xE3o de \xE1cido clor\xEDdrico.",
      "\xE9 um \xE1cido mais forte que o clor\xEDdrico.",
      "dissolve as paredes do est\xF4mago.",
      "transforma o \xE1cido em g\xE1s oxig\xEAnio."
    ],
    explanation: "O hidr\xF3xido de magn\xE9sio \xE9 uma base: reage com o HCl formando sal e \xE1gua, o que eleva o pH do suco g\xE1strico e reduz a sensa\xE7\xE3o de queima\xE7\xE3o."
  })
];
var ambientalQs = conceptQuestions({
  prefix: "qui-ambiental",
  topicId: "qui-ambiental",
  skill: "Relacionar fen\xF4menos ambientais \xE0s subst\xE2ncias envolvidas",
  prompt: "O fen\xF4meno ambiental descrito \xE9 conhecido como",
  items: [
    {
      key: "chuva-acida",
      answer: "chuva \xE1cida.",
      clue: "\xD3xidos de enxofre e de nitrog\xEAnio liberados por ind\xFAstrias e ve\xEDculos reagem com a \xE1gua da atmosfera, formando \xE1cidos que corroem monumentos e afetam lagos e florestas.",
      why: "SO\u2082 e NO\u2093 reagem com a \xE1gua atmosf\xE9rica formando \xE1cidos sulf\xFArico e n\xEDtrico, que tornam a precipita\xE7\xE3o mais \xE1cida: \xE9 a chuva \xE1cida."
    },
    {
      key: "efeito-estufa",
      answer: "intensifica\xE7\xE3o do efeito estufa.",
      clue: "O aumento da concentra\xE7\xE3o de gases como CO\u2082 e metano na atmosfera ret\xE9m mais radia\xE7\xE3o infravermelha, elevando a temperatura m\xE9dia do planeta.",
      why: "CO\u2082 e CH\u2084 absorvem radia\xE7\xE3o infravermelha; o aumento de sua concentra\xE7\xE3o intensifica o efeito estufa natural e contribui para o aquecimento global."
    },
    {
      key: "eutrofizacao",
      answer: "eutrofiza\xE7\xE3o.",
      clue: "O despejo de esgoto rico em fosfatos e nitratos em um lago provoca a prolifera\xE7\xE3o de algas, reduzindo o oxig\xEAnio dissolvido e causando a morte de peixes.",
      why: "O excesso de nutrientes favorece o crescimento de algas; sua decomposi\xE7\xE3o consome oxig\xEAnio dissolvido. Esse processo \xE9 a eutrofiza\xE7\xE3o."
    },
    {
      key: "ozonio",
      answer: "destrui\xE7\xE3o da camada de oz\xF4nio.",
      clue: "Compostos clorofluorcarbonetos (CFCs), antes usados em aeross\xF3is e refrigeradores, liberam radicais de cloro na estratosfera, reduzindo a prote\xE7\xE3o contra a radia\xE7\xE3o ultravioleta.",
      why: "Os radicais de cloro dos CFCs catalisam a decomposi\xE7\xE3o do O\u2083 estratosf\xE9rico, diminuindo a filtragem da radia\xE7\xE3o UV."
    },
    {
      key: "inversao",
      answer: "invers\xE3o t\xE9rmica.",
      clue: "Em manh\xE3s frias de inverno, uma camada de ar mais quente se forma acima do ar frio pr\xF3ximo ao solo, dificultando a dispers\xE3o de poluentes nas grandes cidades.",
      why: "Na invers\xE3o t\xE9rmica o ar frio, mais denso, fica preso sob uma camada quente, impedindo a circula\xE7\xE3o vertical e concentrando poluentes."
    }
  ],
  extraDistractors: ["lixivia\xE7\xE3o.", "assoreamento."]
});
var organelaQs = conceptQuestions({
  prefix: "bio-organela",
  topicId: "bio-citologia",
  skill: "Associar organelas celulares \xE0s suas fun\xE7\xF5es",
  prompt: "A estrutura celular respons\xE1vel pela fun\xE7\xE3o descrita \xE9 o(a)",
  items: [
    {
      key: "mitocondria",
      answer: "mitoc\xF4ndria.",
      clue: "C\xE9lulas musculares de atletas apresentam grande quantidade de uma organela respons\xE1vel pela respira\xE7\xE3o celular aer\xF3bia, que produz ATP a partir da glicose.",
      why: "A mitoc\xF4ndria realiza as etapas aer\xF3bias da respira\xE7\xE3o celular, produzindo a maior parte do ATP. C\xE9lulas com alta demanda energ\xE9tica t\xEAm muitas mitoc\xF4ndrias.",
      difficulty: "facil"
    },
    {
      key: "cloroplasto",
      answer: "cloroplasto.",
      clue: "Nas c\xE9lulas das folhas, uma organela que cont\xE9m clorofila converte energia luminosa em energia qu\xEDmica, produzindo glicose e liberando oxig\xEAnio.",
      why: "O cloroplasto cont\xE9m clorofila e realiza a fotoss\xEDntese, produzindo glicose e O\u2082 a partir de CO\u2082, \xE1gua e luz.",
      difficulty: "facil"
    },
    {
      key: "ribossomo",
      answer: "ribossomo.",
      clue: "C\xE9lulas do p\xE2ncreas que produzem grandes quantidades de enzimas digestivas precisam de muitas estruturas que traduzem o RNA mensageiro em cadeias de amino\xE1cidos.",
      why: "Os ribossomos realizam a tradu\xE7\xE3o: leem o RNA mensageiro e unem amino\xE1cidos, sintetizando prote\xEDnas."
    },
    {
      key: "lisossomo",
      answer: "lisossomo.",
      clue: "Gl\xF3bulos brancos englobam bact\xE9rias e as digerem com o aux\xEDlio de ves\xEDculas repletas de enzimas hidrol\xEDticas.",
      why: "Lisossomos cont\xEAm enzimas digestivas e realizam a digest\xE3o intracelular, essencial na defesa feita por fag\xF3citos."
    },
    {
      key: "golgi",
      answer: "complexo golgiense.",
      clue: "Prote\xEDnas produzidas pela c\xE9lula s\xE3o modificadas, empacotadas em ves\xEDculas e encaminhadas para secre\xE7\xE3o.",
      why: "O complexo golgiense modifica, armazena e empacota subst\xE2ncias em ves\xEDculas de secre\xE7\xE3o.",
      difficulty: "dificil"
    }
  ],
  extraDistractors: ["n\xFAcleo.", "centr\xEDolo.", "vac\xFAolo."]
});
var mendelQs = [
  buildQuestion({
    id: "bio-mendel-1",
    topicId: "bio-genetica",
    difficulty: "media",
    skill: "Calcular probabilidades em cruzamentos mono\xEDbridos",
    support: { paragraphs: ["Em ervilhas, a cor amarela da semente (V) \xE9 dominante sobre a verde (v). Duas plantas heterozigotas foram cruzadas."] },
    prompt: "A probabilidade de uma semente descendente ser verde \xE9",
    correct: "1/4",
    distractors: ["1/2", "3/4", "1/3", "0"],
    explanation: "Vv \xD7 Vv gera VV, Vv, Vv e vv. Apenas vv (1 em 4) apresenta semente verde, o fen\xF3tipo recessivo."
  }),
  buildQuestion({
    id: "bio-mendel-2",
    topicId: "bio-genetica",
    difficulty: "media",
    skill: "Analisar cruzamentos-teste",
    support: { paragraphs: ["Um criador cruzou um c\xE3o de pelagem escura heterozigoto (Ee) com uma cadela de pelagem clara (ee), caracter\xEDstica recessiva."] },
    prompt: "A propor\xE7\xE3o esperada de filhotes de pelagem clara \xE9 de",
    correct: "50%",
    distractors: ["25%", "75%", "100%", "0%"],
    numeric: true,
    explanation: "Ee \xD7 ee produz metade Ee (escuros) e metade ee (claros). Logo, 50% dos filhotes devem ter pelagem clara."
  }),
  buildQuestion({
    id: "bio-mendel-3",
    topicId: "bio-genetica",
    difficulty: "dificil",
    skill: "Calcular probabilidades condicionais em gen\xE9tica",
    support: { paragraphs: ["Um casal com pigmenta\xE7\xE3o normal teve um filho albino. O albinismo \xE9 uma condi\xE7\xE3o autoss\xF4mica recessiva. Eles t\xEAm outra filha, com pigmenta\xE7\xE3o normal."] },
    prompt: "A probabilidade de essa filha ser portadora do alelo para albinismo \xE9",
    correct: "2/3",
    distractors: ["1/4", "1/2", "3/4", "1/3"],
    explanation: "Os pais s\xE3o Aa. Entre os descendentes normais (AA, Aa, Aa), dois em tr\xEAs s\xE3o heterozigotos. Como j\xE1 se sabe que a filha \xE9 normal, a probabilidade \xE9 2/3."
  })
];
var relacoesQs = conceptQuestions({
  prefix: "bio-relacao",
  topicId: "bio-ecologia",
  skill: "Identificar rela\xE7\xF5es ecol\xF3gicas entre seres vivos",
  prompt: "A rela\xE7\xE3o ecol\xF3gica descrita \xE9 classificada como",
  items: [
    {
      key: "liquen",
      answer: "mutualismo.",
      clue: "Nos liquens, algas produzem mat\xE9ria org\xE2nica pela fotoss\xEDntese, enquanto fungos fornecem umidade e sais minerais; nenhum dos dois sobrevive bem isoladamente.",
      why: "Ambas as esp\xE9cies se beneficiam e a associa\xE7\xE3o \xE9 obrigat\xF3ria: trata-se de mutualismo.",
      subtopic: "relacoes"
    },
    {
      key: "carrapato",
      answer: "parasitismo.",
      clue: "Carrapatos fixam-se \xE0 pele de bois e se alimentam de seu sangue, podendo transmitir doen\xE7as ao hospedeiro.",
      why: "O carrapato se beneficia e o boi \xE9 prejudicado sem ser morto imediatamente: parasitismo.",
      subtopic: "relacoes"
    },
    {
      key: "remora",
      answer: "comensalismo.",
      clue: "R\xEAmoras se prendem ao corpo de tubar\xF5es e se alimentam dos restos das presas deles, sem prejudic\xE1-los.",
      why: "A r\xEAmora aproveita restos de alimento e o tubar\xE3o n\xE3o \xE9 prejudicado nem beneficiado: comensalismo.",
      subtopic: "relacoes"
    },
    {
      key: "onca",
      answer: "preda\xE7\xE3o.",
      clue: "No Pantanal, on\xE7as-pintadas ca\xE7am capivaras e jacar\xE9s, que servem como fonte de alimento.",
      why: "Um organismo mata e consome o outro: preda\xE7\xE3o (predatismo).",
      subtopic: "relacoes",
      difficulty: "facil"
    },
    {
      key: "luz",
      answer: "competi\xE7\xE3o.",
      clue: "Em uma floresta densa, \xE1rvores de esp\xE9cies diferentes crescem em altura disputando a luz solar dispon\xEDvel.",
      why: "Esp\xE9cies diferentes disputam um mesmo recurso limitado, a luz: competi\xE7\xE3o interespec\xEDfica.",
      subtopic: "relacoes"
    }
  ],
  extraDistractors: ["inquilinismo.", "amensalismo."]
});
var cadeiaImage = {
  src: "/questoes/cadeia-alimentar.svg",
  alt: "Cadeia alimentar: capim, gafanhoto, sapo, cobra e gavi\xE3o, ligados por setas no sentido do fluxo de energia.",
  caption: "Representa\xE7\xE3o simplificada de uma cadeia alimentar.",
  width: 680,
  height: 220
};
var cadeiaQs = [
  buildQuestion({
    id: "bio-cadeia-1",
    topicId: "bio-ecologia",
    subtopic: "cadeias",
    difficulty: "media",
    skill: "Analisar o fluxo de energia nas cadeias alimentares",
    image: cadeiaImage,
    support: { paragraphs: ["Considere que, em m\xE9dia, apenas 10% da energia de um n\xEDvel tr\xF3fico \xE9 transferida para o n\xEDvel seguinte, e que o capim fixou 100 000 kcal."] },
    prompt: "A energia dispon\xEDvel para o sapo \xE9 de aproximadamente",
    correct: "1.000 kcal",
    distractors: ["10.000 kcal", "100 kcal", "10 kcal", "30.000 kcal"],
    numeric: true,
    explanation: "Do capim (100 000 kcal) ao gafanhoto chegam 10% (10 000 kcal); do gafanhoto ao sapo, novamente 10%: 1 000 kcal."
  }),
  buildQuestion({
    id: "bio-cadeia-2",
    topicId: "bio-ecologia",
    subtopic: "cadeias",
    difficulty: "facil",
    skill: "Identificar n\xEDveis tr\xF3ficos",
    image: cadeiaImage,
    support: { paragraphs: ["Observe a cadeia alimentar representada."] },
    prompt: "Nessa cadeia, a cobra ocupa o n\xEDvel de",
    correct: "consumidor terci\xE1rio.",
    distractors: ["produtor.", "consumidor prim\xE1rio.", "consumidor secund\xE1rio.", "decompositor."],
    explanation: "Capim \xE9 produtor; gafanhoto, consumidor prim\xE1rio; sapo, secund\xE1rio; cobra, terci\xE1rio; e o gavi\xE3o, quatern\xE1rio."
  })
];
var fisiologiaQs = conceptQuestions({
  prefix: "bio-fisiologia",
  topicId: "bio-fisiologia",
  skill: "Relacionar \xF3rg\xE3os e estruturas \xE0s suas fun\xE7\xF5es no organismo",
  prompt: "A estrutura que desempenha a fun\xE7\xE3o descrita \xE9 o(a)",
  items: [
    {
      key: "pancreas",
      answer: "p\xE2ncreas, por meio da insulina.",
      clue: "Ap\xF3s uma refei\xE7\xE3o rica em carboidratos, a glicemia aumenta e um horm\xF4nio facilita a entrada de glicose nas c\xE9lulas, reduzindo o n\xEDvel de a\xE7\xFAcar no sangue.",
      why: "A insulina, produzida pelas c\xE9lulas beta do p\xE2ncreas, promove a capta\xE7\xE3o de glicose pelas c\xE9lulas, reduzindo a glicemia."
    },
    {
      key: "hemacias",
      answer: "hem\xE1cia, por meio da hemoglobina.",
      clue: "Em altitudes elevadas, o organismo passa a produzir mais c\xE9lulas sangu\xEDneas respons\xE1veis pelo transporte de oxig\xEAnio.",
      why: "As hem\xE1cias cont\xEAm hemoglobina, prote\xEDna que transporta O\u2082. Em altitudes elevadas, sua produ\xE7\xE3o aumenta."
    },
    {
      key: "nefron",
      answer: "n\xE9fron, nos rins.",
      clue: "Unidades microsc\xF3picas filtram o sangue, reabsorvem subst\xE2ncias \xFAteis e formam a urina.",
      why: "Os n\xE9frons s\xE3o as unidades funcionais dos rins, respons\xE1veis pela filtra\xE7\xE3o do sangue e forma\xE7\xE3o da urina."
    },
    {
      key: "alveolos",
      answer: "alv\xE9olo pulmonar.",
      clue: "Pequenas bolsas de parede fina, envolvidas por capilares, permitem que o oxig\xEAnio passe para o sangue e o g\xE1s carb\xF4nico seja eliminado.",
      why: "Nos alv\xE9olos ocorre a hematose: trocas gasosas entre o ar e o sangue dos capilares.",
      difficulty: "facil"
    }
  ],
  extraDistractors: ["f\xEDgado, por meio da bile.", "tireoide, por meio da calcitonina."]
});
var NATUREZA_QUESTIONS = [
  ...velocidadeQs,
  ...frenagemQs,
  ...cineticaQs,
  ...potencialQs,
  ...consumoQs,
  ...ohmQs,
  ...calorQs,
  ...ondasQs,
  ...densidadeQs,
  ...concQs,
  ...diluicaoQs,
  ...molQs,
  estequio,
  ...phQs,
  ...ambientalQs,
  ...organelaQs,
  ...mendelQs,
  ...relacoesQs,
  ...cadeiaQs,
  ...fisiologiaQs
];

// legacy/src/data/fixtures/questions/humanas.ts
var historiaBrasil = [
  {
    topic: "his-brasil-colonia",
    key: "acucar",
    answer: "economia a\xE7ucareira colonial.",
    clue: "Atividade econ\xF4mica que, entre os s\xE9culos XVI e XVII, concentrou-se no litoral nordestino, baseada em grandes propriedades, monocultura voltada \xE0 exporta\xE7\xE3o e trabalho de africanos escravizados.",
    why: "O modelo descrito \u2014 latif\xFAndio, monocultura exportadora e m\xE3o de obra escravizada no litoral nordestino \u2014 caracteriza a economia a\xE7ucareira, base da coloniza\xE7\xE3o portuguesa nos s\xE9culos XVI e XVII.",
    difficulty: "facil"
  },
  {
    topic: "his-brasil-colonia",
    key: "inconfidencia",
    answer: "Inconfid\xEAncia Mineira.",
    clue: "Conspira\xE7\xE3o ocorrida em 1789 em Vila Rica, motivada pela amea\xE7a de cobran\xE7a da derrama e influenciada por ideias iluministas, que terminou com a execu\xE7\xE3o de Tiradentes.",
    why: "A Inconfid\xEAncia Mineira (1789) reuniu membros da elite de Minas Gerais contra a cobran\xE7a da derrama e foi influenciada pelo Iluminismo e pela independ\xEAncia dos EUA."
  },
  {
    topic: "his-brasil-colonia",
    key: "conjuracao-baiana",
    answer: "Conjura\xE7\xE3o Baiana.",
    clue: "Movimento de 1798, em Salvador, com ampla participa\xE7\xE3o de alfaiates, soldados e escravizados, que defendia a rep\xFAblica, a igualdade e o fim da escravid\xE3o.",
    why: "A Conjura\xE7\xE3o Baiana (ou Revolta dos Alfaiates) teve car\xE1ter popular e defendeu, al\xE9m da rep\xFAblica, o fim da escravid\xE3o.",
    difficulty: "dificil",
    near: ["Inconfid\xEAncia Mineira."]
  },
  {
    topic: "his-brasil-imperio",
    key: "eusebio",
    answer: "Lei Eus\xE9bio de Queir\xF3s.",
    clue: "Lei de 1850 que proibiu o tr\xE1fico internacional de africanos escravizados para o Brasil, em meio a forte press\xE3o brit\xE2nica.",
    why: "A Lei Eus\xE9bio de Queir\xF3s (1850) proibiu o tr\xE1fico negreiro, em parte pela press\xE3o da Inglaterra, como a Bill Aberdeen.",
    subtopic: "politica"
  },
  {
    topic: "his-brasil-imperio",
    key: "ventre-livre",
    answer: "Lei do Ventre Livre.",
    clue: "Lei de 1871 que declarou livres os filhos de mulheres escravizadas nascidos a partir de sua promulga\xE7\xE3o, embora pudessem permanecer sob tutela dos senhores at\xE9 os 21 anos.",
    why: "A Lei do Ventre Livre (1871) libertava os nascidos de m\xE3es escravizadas, mas permitia que os senhores os mantivessem sob sua tutela.",
    subtopic: "politica",
    near: ["Lei dos Sexagen\xE1rios."]
  },
  {
    topic: "his-brasil-imperio",
    key: "aurea",
    answer: "Lei \xC1urea.",
    clue: "Lei assinada em 13 de maio de 1888 que extinguiu juridicamente a escravid\xE3o no Brasil, sem prever pol\xEDticas de integra\xE7\xE3o para a popula\xE7\xE3o liberta.",
    why: "A Lei \xC1urea (1888) aboliu a escravid\xE3o, mas n\xE3o garantiu terra, educa\xE7\xE3o ou trabalho aos libertos.",
    subtopic: "politica",
    difficulty: "facil"
  },
  {
    topic: "his-brasil-republica",
    key: "cafe-com-leite",
    answer: "pol\xEDtica do caf\xE9 com leite.",
    clue: "Pr\xE1tica da Primeira Rep\xFAblica em que as oligarquias de S\xE3o Paulo e Minas Gerais se alternavam na indica\xE7\xE3o de candidatos \xE0 Presid\xEAncia.",
    why: "O revezamento entre paulistas (caf\xE9) e mineiros (leite) na Presid\xEAncia ficou conhecido como pol\xEDtica do caf\xE9 com leite.",
    subtopic: "primeira",
    near: ["pol\xEDtica dos governadores."]
  },
  {
    topic: "his-brasil-republica",
    key: "governadores",
    answer: "pol\xEDtica dos governadores.",
    clue: "Acordo da Primeira Rep\xFAblica em que o governo federal apoiava as oligarquias estaduais e, em troca, recebia apoio de suas bancadas no Congresso.",
    why: "A pol\xEDtica dos governadores, consolidada por Campos Sales, trocava apoio federal \xE0s oligarquias estaduais por sustenta\xE7\xE3o no Legislativo.",
    subtopic: "primeira",
    difficulty: "dificil",
    near: ["pol\xEDtica do caf\xE9 com leite."]
  },
  {
    topic: "his-brasil-republica",
    key: "canudos",
    answer: "Guerra de Canudos.",
    clue: "Conflito ocorrido entre 1896 e 1897 no sert\xE3o da Bahia, envolvendo uma comunidade liderada por Ant\xF4nio Conselheiro e tropas do governo republicano.",
    why: "Canudos, liderada por Ant\xF4nio Conselheiro, foi destru\xEDda pelo Ex\xE9rcito ap\xF3s quatro expedi\xE7\xF5es militares.",
    subtopic: "primeira",
    near: ["Revolta da Vacina."]
  },
  {
    topic: "his-brasil-republica",
    key: "vacina",
    answer: "Revolta da Vacina.",
    clue: "Levante popular ocorrido em 1904 no Rio de Janeiro contra a vacina\xE7\xE3o obrigat\xF3ria e as reformas urbanas autorit\xE1rias.",
    why: "A Revolta da Vacina (1904) expressou a insatisfa\xE7\xE3o popular com a vacina\xE7\xE3o compuls\xF3ria e com as demoli\xE7\xF5es de corti\xE7os no centro do Rio.",
    subtopic: "primeira"
  },
  {
    topic: "his-brasil-republica",
    key: "estado-novo",
    answer: "Estado Novo.",
    clue: "Per\xEDodo entre 1937 e 1945 marcado pela centraliza\xE7\xE3o autorit\xE1ria do poder, censura \xE0 imprensa e fechamento do Congresso sob o governo de Get\xFAlio Vargas.",
    why: "O Estado Novo (1937\u20131945) foi a fase ditatorial da Era Vargas, com nova Constitui\xE7\xE3o outorgada e forte centraliza\xE7\xE3o.",
    subtopic: "primeira",
    difficulty: "facil"
  },
  {
    topic: "his-brasil-republica",
    key: "ai5",
    answer: "Ato Institucional n\xBA 5.",
    clue: "Medida de dezembro de 1968 que permitiu fechar o Congresso, cassar mandatos e suspender o habeas corpus em casos de crimes pol\xEDticos.",
    why: "O AI-5 (1968) marcou o endurecimento da ditadura civil-militar, ampliando a repress\xE3o e suspendendo garantias.",
    subtopic: "ditadura"
  },
  {
    topic: "his-brasil-republica",
    key: "diretas",
    answer: "movimento Diretas J\xE1.",
    clue: "Mobiliza\xE7\xE3o popular de 1983 e 1984, com grandes com\xEDcios em v\xE1rias cidades, que reivindicava elei\xE7\xF5es diretas para a Presid\xEAncia da Rep\xFAblica.",
    why: "As Diretas J\xE1 mobilizaram milh\xF5es de pessoas em apoio \xE0 emenda Dante de Oliveira, que n\xE3o foi aprovada, mas fortaleceu a redemocratiza\xE7\xE3o.",
    subtopic: "ditadura",
    difficulty: "facil"
  }
];
var historiaBrasilQs = historiaBrasil.map(
  ({ topic, ...item }) => conceptQuestions({
    prefix: "his",
    topicId: topic,
    skill: "Identificar processos hist\xF3ricos do Brasil e seus contextos",
    prompt: "O texto descreve o(a)",
    items: [item],
    extraDistractors: historiaBrasil.map((h) => h.answer).concat(["Lei dos Sexagen\xE1rios.", "Revolta da Chibata."])
  })[0]
);
var historiaGeralQs = conceptQuestions({
  prefix: "his-geral",
  topicId: "his-geral",
  skill: "Reconhecer processos hist\xF3ricos da hist\xF3ria geral",
  prompt: "O processo hist\xF3rico descrito \xE9 o(a)",
  items: [
    {
      key: "feudalismo",
      answer: "feudalismo.",
      clue: "Organiza\xE7\xE3o social da Europa medieval baseada na posse da terra, em rela\xE7\xF5es de suserania e vassalagem e no trabalho servil.",
      why: "As rela\xE7\xF5es de suserania e vassalagem e a servid\xE3o caracterizam o feudalismo na Europa ocidental medieval.",
      subtopic: "antiga",
      difficulty: "facil"
    },
    {
      key: "renascimento",
      answer: "Renascimento.",
      clue: "Movimento cultural dos s\xE9culos XIV a XVI que valorizou o antropocentrismo, o racionalismo e a retomada de refer\xEAncias da Antiguidade greco-romana.",
      why: "O Renascimento retomou a cultura cl\xE1ssica e colocou o ser humano no centro das reflex\xF5es (antropocentrismo).",
      subtopic: "antiga"
    },
    {
      key: "reforma",
      answer: "Reforma Protestante.",
      clue: "Movimento iniciado em 1517 com a publica\xE7\xE3o de 95 teses que criticavam, entre outras pr\xE1ticas, a venda de indulg\xEAncias pela Igreja Cat\xF3lica.",
      why: "Martinho Lutero publicou as 95 teses em 1517, dando in\xEDcio \xE0 Reforma Protestante.",
      subtopic: "antiga"
    },
    {
      key: "industrial",
      answer: "Revolu\xE7\xE3o Industrial.",
      clue: "Processo iniciado na Inglaterra no s\xE9culo XVIII, marcado pela mecaniza\xE7\xE3o da produ\xE7\xE3o, pelo uso da m\xE1quina a vapor e pela forma\xE7\xE3o do operariado urbano.",
      why: "A mecaniza\xE7\xE3o com m\xE1quinas a vapor e a forma\xE7\xE3o do proletariado caracterizam a Revolu\xE7\xE3o Industrial inglesa.",
      subtopic: "contemporanea",
      difficulty: "facil"
    },
    {
      key: "francesa",
      answer: "Revolu\xE7\xE3o Francesa.",
      clue: "Processo iniciado em 1789 que derrubou o Antigo Regime na Fran\xE7a e difundiu o lema \u201Cliberdade, igualdade e fraternidade\u201D.",
      why: "A Revolu\xE7\xE3o Francesa (1789) derrubou o absolutismo e difundiu ideais iluministas por meio da Declara\xE7\xE3o dos Direitos do Homem e do Cidad\xE3o.",
      subtopic: "contemporanea",
      difficulty: "facil"
    },
    {
      key: "crise-1929",
      answer: "Grande Depress\xE3o.",
      clue: "Crise econ\xF4mica mundial desencadeada pela quebra da Bolsa de Valores de Nova York em 1929, com fal\xEAncias em massa e desemprego elevado.",
      why: "A quebra da Bolsa de Nova York, em 1929, iniciou a Grande Depress\xE3o, que atingiu economias de todo o mundo.",
      subtopic: "contemporanea"
    },
    {
      key: "guerra-fria",
      answer: "Guerra Fria.",
      clue: "Per\xEDodo de disputa ideol\xF3gica, pol\xEDtica e militar entre Estados Unidos e Uni\xE3o Sovi\xE9tica, sem confronto direto entre eles, encerrado com o fim da URSS em 1991.",
      why: "A Guerra Fria op\xF4s os blocos capitalista e socialista entre 1947 e 1991, marcada por corrida armamentista e conflitos indiretos.",
      subtopic: "contemporanea"
    },
    {
      key: "apartheid",
      answer: "apartheid.",
      clue: "Regime de segrega\xE7\xE3o racial institucionalizado na \xC1frica do Sul entre 1948 e 1994, combatido por movimentos liderados por figuras como Nelson Mandela.",
      why: "O apartheid foi a pol\xEDtica oficial de segrega\xE7\xE3o racial sul-africana, encerrada com as elei\xE7\xF5es multirraciais de 1994.",
      subtopic: "contemporanea"
    }
  ],
  extraDistractors: ["Iluminismo.", "mercantilismo."]
});
var historiaContexto = [
  buildQuestion({
    id: "his-contexto-quilombos",
    topicId: "his-brasil-colonia",
    difficulty: "media",
    skill: "Analisar formas de resist\xEAncia \xE0 escravid\xE3o",
    support: {
      paragraphs: [
        "Os quilombos foram comunidades formadas por pessoas que fugiam da escravid\xE3o. O de Palmares, na serra da Barriga, resistiu por quase um s\xE9culo e chegou a reunir milhares de habitantes, com organiza\xE7\xE3o pol\xEDtica e produ\xE7\xE3o agr\xEDcola pr\xF3prias."
      ]
    },
    prompt: "A experi\xEAncia de Palmares evidencia que a popula\xE7\xE3o escravizada",
    correct: "construiu formas organizadas de resist\xEAncia ao sistema escravista.",
    distractors: [
      "aceitou passivamente as condi\xE7\xF5es impostas pelos senhores.",
      "resistiu apenas por meio de revoltas isoladas e de curta dura\xE7\xE3o.",
      "foi integrada \xE0 sociedade colonial com direitos garantidos.",
      "dependeu do apoio da Coroa portuguesa para obter a liberdade."
    ],
    explanation: "Palmares mostra que a resist\xEAncia \xE0 escravid\xE3o foi ativa, duradoura e organizada, com estruturas pol\xEDticas e econ\xF4micas pr\xF3prias \u2014 contrariando a ideia de passividade."
  }),
  buildQuestion({
    id: "his-contexto-constituicao",
    topicId: "his-brasil-republica",
    subtopic: "ditadura",
    difficulty: "media",
    skill: "Relacionar marcos legais \xE0 amplia\xE7\xE3o da cidadania",
    support: {
      paragraphs: [
        "Promulgada em 1988, ap\xF3s mais de duas d\xE9cadas de regime autorit\xE1rio, a atual Constitui\xE7\xE3o brasileira ficou conhecida como \u201CConstitui\xE7\xE3o Cidad\xE3\u201D."
      ]
    },
    prompt: "Essa denomina\xE7\xE3o se relaciona ao fato de o texto constitucional",
    correct: "ampliar direitos sociais e garantias individuais ap\xF3s a ditadura.",
    distractors: [
      "restabelecer o voto censit\xE1rio, vinculado \xE0 renda.",
      "manter os atos institucionais do per\xEDodo militar.",
      "restringir o voto aos cidad\xE3os alfabetizados.",
      "concentrar os poderes no Executivo federal."
    ],
    explanation: "A Constitui\xE7\xE3o de 1988 ampliou direitos sociais (sa\xFAde, educa\xE7\xE3o, previd\xEAncia), garantiu liberdades individuais e estendeu o voto facultativo a analfabetos e jovens de 16 e 17 anos."
  }),
  buildQuestion({
    id: "his-contexto-grecia",
    topicId: "his-geral",
    subtopic: "antiga",
    difficulty: "dificil",
    skill: "Comparar formas de participa\xE7\xE3o pol\xEDtica na Antiguidade e na atualidade",
    support: {
      paragraphs: [
        "Na Atenas do s\xE9culo V a.C., os cidad\xE3os participavam diretamente das decis\xF5es na Ecl\xE9sia, a assembleia popular. Contudo, mulheres, estrangeiros e escravizados n\xE3o eram considerados cidad\xE3os."
      ]
    },
    prompt: "Com base no texto, a democracia ateniense caracterizava-se por ser",
    correct: "direta, por\xE9m restrita a uma parcela da popula\xE7\xE3o.",
    distractors: [
      "representativa e universal.",
      "direta e estendida a todos os habitantes.",
      "representativa, mas restrita aos aristocratas.",
      "mon\xE1rquica, com participa\xE7\xE3o popular consultiva."
    ],
    explanation: "Os cidad\xE3os votavam diretamente na assembleia, mas a cidadania exclu\xEDa a maioria da popula\xE7\xE3o \u2014 mulheres, estrangeiros (metecos) e escravizados."
  })
];
var fusos = [
  ["T\xF3quio (UTC+9)", 9, 20, "8h"],
  ["Lisboa (UTC+0)", 0, 15, "12h"],
  ["Moscou (UTC+3)", 3, 18, "12h"]
];
var fusoQs = fusos.map(([cidade, utc, hora, resposta], i) => {
  const diff = utc + 3;
  const wrongs = [`${(hora + diff) % 24}h`, `${(hora - utc + 24) % 24}h`, `${(hora - diff + 1 + 24) % 24}h`, `${(hora - diff - 1 + 24) % 24}h`, `${hora}h`];
  return buildQuestion({
    id: `geo-fuso-${i + 1}`,
    topicId: "geo-cartografia",
    subtopic: "fusos",
    difficulty: "media",
    skill: "Calcular diferen\xE7as de hor\xE1rio entre fusos",
    support: {
      paragraphs: [`Uma final de campeonato ser\xE1 disputada em ${cidade} \xE0s ${hora}h, hor\xE1rio local. Torcedores em Bras\xEDlia (UTC\u22123) acompanhar\xE3o a transmiss\xE3o ao vivo.`]
    },
    prompt: "Em Bras\xEDlia, a transmiss\xE3o come\xE7ar\xE1 \xE0s",
    correct: resposta,
    distractors: wrongs.filter((w) => w !== resposta),
    explanation: `A diferen\xE7a entre UTC${utc >= 0 ? "+" : ""}${utc} e UTC\u22123 \xE9 de ${diff} horas. Como Bras\xEDlia est\xE1 a oeste, o hor\xE1rio \xE9 atrasado: ${hora}h \u2212 ${diff}h = ${resposta}.`
  });
});
var biomasQs = conceptQuestions({
  prefix: "geo-bioma",
  topicId: "geo-natureza",
  skill: "Caracterizar os biomas brasileiros",
  prompt: "O bioma descrito \xE9 o(a)",
  items: [
    {
      key: "caatinga",
      answer: "Caatinga.",
      clue: "Bioma exclusivamente brasileiro, de clima semi\xE1rido, com vegeta\xE7\xE3o xer\xF3fila \u2014 como cactos e arbustos que perdem as folhas na esta\xE7\xE3o seca \u2014 e rios intermitentes.",
      why: "Clima semi\xE1rido, plantas adaptadas \xE0 escassez h\xEDdrica e rios intermitentes caracterizam a Caatinga.",
      subtopic: "biomas",
      difficulty: "facil"
    },
    {
      key: "cerrado",
      answer: "Cerrado.",
      clue: "Vegeta\xE7\xE3o de savana com \xE1rvores de troncos tortuosos e casca grossa, ra\xEDzes profundas e esta\xE7\xF5es seca e chuvosa bem definidas; abriga nascentes de importantes bacias hidrogr\xE1ficas.",
      why: "Troncos retorcidos, casca espessa, ra\xEDzes profundas e o papel de \u201Cber\xE7o das \xE1guas\u201D identificam o Cerrado.",
      subtopic: "biomas"
    },
    {
      key: "amazonia",
      answer: "Amaz\xF4nia.",
      clue: "Floresta equatorial latifoliada, densa, com elevada pluviosidade, grande biodiversidade e solos geralmente pobres, cuja fertilidade depende da reciclagem da mat\xE9ria org\xE2nica.",
      why: "Clima equatorial, chuvas abundantes e floresta latifoliada densa caracterizam a Amaz\xF4nia; seus solos dependem da ciclagem de nutrientes.",
      subtopic: "biomas"
    },
    {
      key: "mata-atlantica",
      answer: "Mata Atl\xE2ntica.",
      clue: "Bioma que se estendia ao longo da faixa litor\xE2nea e foi o mais devastado desde a coloniza\xE7\xE3o, restando hoje uma pequena parte de sua cobertura original.",
      why: "Ocupado desde o in\xEDcio da coloniza\xE7\xE3o e pelas maiores cidades do pa\xEDs, a Mata Atl\xE2ntica \xE9 o bioma mais devastado.",
      subtopic: "biomas",
      difficulty: "facil"
    },
    {
      key: "pampa",
      answer: "Pampa.",
      clue: "Bioma do extremo sul do pa\xEDs, com predom\xEDnio de vegeta\xE7\xE3o rasteira (campos), relevo suave e uso tradicional para a pecu\xE1ria extensiva.",
      why: "Campos de vegeta\xE7\xE3o rasteira, relevo de coxilhas e pecu\xE1ria extensiva definem o Pampa ga\xFAcho.",
      subtopic: "biomas"
    },
    {
      key: "pantanal",
      answer: "Pantanal.",
      clue: "Maior plan\xEDcie alag\xE1vel do mundo, com ciclos anuais de cheia e vazante que regulam a vida de grande diversidade de aves, peixes e mam\xEDferos.",
      why: "A din\xE2mica de cheias e vazantes em uma extensa plan\xEDcie caracteriza o Pantanal.",
      subtopic: "biomas"
    }
  ]
});
var climaUrbanoQs = conceptQuestions({
  prefix: "geo-conceito",
  topicId: "geo-urbana",
  skill: "Compreender conceitos da geografia urbana e da din\xE2mica atmosf\xE9rica",
  prompt: "O fen\xF4meno descrito \xE9 denominado",
  items: [
    {
      key: "ilha-calor",
      answer: "ilha de calor.",
      clue: "\xC1reas centrais de grandes cidades, com muito asfalto, concreto e pouca vegeta\xE7\xE3o, registram temperaturas mais altas do que as \xE1reas perif\xE9ricas e rurais vizinhas.",
      why: "A impermeabiliza\xE7\xE3o do solo, os materiais que absorvem calor e a pouca vegeta\xE7\xE3o elevam a temperatura nos centros urbanos: \xE9 a ilha de calor.",
      difficulty: "facil"
    },
    {
      key: "conurbacao",
      answer: "conurba\xE7\xE3o.",
      clue: "O crescimento horizontal de duas ou mais cidades vizinhas faz com que suas malhas urbanas se encontrem, dificultando a identifica\xE7\xE3o dos limites entre elas.",
      why: "A jun\xE7\xE3o f\xEDsica das manchas urbanas de munic\xEDpios vizinhos \xE9 chamada de conurba\xE7\xE3o."
    },
    {
      key: "exodo",
      answer: "\xEAxodo rural.",
      clue: "Entre as d\xE9cadas de 1950 e 1980, milh\xF5es de brasileiros deixaram o campo em dire\xE7\xE3o \xE0s cidades, atra\xEDdos pela industrializa\xE7\xE3o e expulsos pela mecaniza\xE7\xE3o agr\xEDcola.",
      why: "A migra\xE7\xE3o em massa do campo para a cidade \xE9 o \xEAxodo rural, intenso no Brasil durante a industrializa\xE7\xE3o.",
      difficulty: "facil"
    },
    {
      key: "gentrificacao",
      answer: "gentrifica\xE7\xE3o.",
      clue: "Ap\xF3s a revitaliza\xE7\xE3o de um bairro antigo, a valoriza\xE7\xE3o imobili\xE1ria elevou alugu\xE9is e custos de vida, levando moradores de baixa renda a se mudarem para \xE1reas mais distantes.",
      why: "A substitui\xE7\xE3o de moradores de baixa renda por grupos de maior renda ap\xF3s a valoriza\xE7\xE3o de uma \xE1rea \xE9 chamada de gentrifica\xE7\xE3o.",
      difficulty: "dificil"
    },
    {
      key: "orografica",
      answer: "chuva orogr\xE1fica.",
      clue: "Massas de ar \xFAmidas vindas do oceano encontram uma serra, sobem, resfriam-se e provocam precipita\xE7\xE3o na encosta voltada para o mar.",
      why: "A chuva provocada pela eleva\xE7\xE3o for\xE7ada do ar \xFAmido por barreiras de relevo \xE9 a chuva orogr\xE1fica (ou de relevo).",
      subtopic: "clima"
    }
  ],
  extraDistractors: ["metropoliza\xE7\xE3o.", "macrocefalia urbana."]
});
var climaUrbanoFixed = climaUrbanoQs.map(
  (q) => q.id === "geo-conceito-orografica" ? { ...q, topicId: "geo-natureza", subtopicId: "geo-natureza.clima" } : q
);
var ambientalGeoQs = conceptQuestions({
  prefix: "geo-ambiental",
  topicId: "geo-ambiental",
  skill: "Analisar impactos ambientais e suas causas",
  prompt: "O processo descrito \xE9 o(a)",
  items: [
    {
      key: "assoreamento",
      answer: "assoreamento.",
      clue: "A retirada da mata ciliar exp\xF5e o solo das margens, que \xE9 carregado pelas chuvas e se acumula no leito dos rios, reduzindo sua profundidade.",
      why: "O ac\xFAmulo de sedimentos no leito dos rios, intensificado pela remo\xE7\xE3o da mata ciliar, \xE9 o assoreamento.",
      difficulty: "facil"
    },
    {
      key: "desertificacao",
      answer: "desertifica\xE7\xE3o.",
      clue: "Em \xE1reas de clima semi\xE1rido, o uso intensivo do solo, o desmatamento e o manejo inadequado levam \xE0 perda progressiva da capacidade produtiva da terra.",
      why: "A degrada\xE7\xE3o do solo em regi\xF5es \xE1ridas e semi\xE1ridas por a\xE7\xE3o humana e clim\xE1tica caracteriza a desertifica\xE7\xE3o."
    },
    {
      key: "lixiviacao",
      answer: "lixivia\xE7\xE3o.",
      clue: "Em \xE1reas de chuvas intensas, a \xE1gua que se infiltra no solo arrasta os nutrientes minerais para camadas mais profundas, empobrecendo a superf\xEDcie.",
      why: "A remo\xE7\xE3o de nutrientes pela \xE1gua que percola o solo \xE9 a lixivia\xE7\xE3o, comum em climas \xFAmidos.",
      difficulty: "dificil"
    },
    {
      key: "vocoroca",
      answer: "vo\xE7oroca.",
      clue: "Em solos desprotegidos, o escoamento concentrado da \xE1gua abre grandes fendas profundas no terreno, que podem atingir dezenas de metros.",
      why: "Vo\xE7orocas s\xE3o o est\xE1gio mais avan\xE7ado da eros\xE3o por escoamento concentrado, formando grandes crateras."
    }
  ],
  extraDistractors: ["intemperismo qu\xEDmico.", "eutrofiza\xE7\xE3o."]
});
var filosofiaQs = conceptQuestions({
  prefix: "fil",
  topicId: "fil-pensadores",
  skill: "Associar conceitos filos\xF3ficos a seus autores",
  prompt: "A ideia apresentada est\xE1 associada ao pensamento de",
  items: [
    {
      key: "socrates",
      answer: "S\xF3crates.",
      clue: "Pelo di\xE1logo e por perguntas sucessivas, o fil\xF3sofo levava o interlocutor a reconhecer a pr\xF3pria ignor\xE2ncia e a \u201Cdar \xE0 luz\u201D ideias \u2014 m\xE9todo conhecido como mai\xEAutica.",
      why: "A mai\xEAutica e a ironia s\xE3o o m\xE9todo socr\xE1tico de investiga\xE7\xE3o por meio do di\xE1logo.",
      subtopic: "antiga",
      difficulty: "facil"
    },
    {
      key: "platao",
      answer: "Plat\xE3o.",
      clue: "Na alegoria da caverna, prisioneiros confundem sombras com a realidade; o conhecimento verdadeiro exigiria ascender ao mundo das ideias.",
      why: "A alegoria da caverna, de A Rep\xFAblica, ilustra a teoria plat\xF4nica das ideias e a distin\xE7\xE3o entre apar\xEAncia e realidade.",
      subtopic: "antiga",
      difficulty: "facil"
    },
    {
      key: "aristoteles",
      answer: "Arist\xF3teles.",
      clue: "A virtude moral consiste na justa medida entre dois v\xEDcios, um por excesso e outro por falta, como a coragem entre a temeridade e a covardia.",
      why: "A \xE9tica do justo meio (mesotes) \xE9 central na \xC9tica a Nic\xF4maco, de Arist\xF3teles.",
      subtopic: "antiga"
    },
    {
      key: "descartes",
      answer: "Ren\xE9 Descartes.",
      clue: "Duvidando de tudo o que pode ser posto em d\xFAvida, o fil\xF3sofo encontra uma certeza indubit\xE1vel: \u201Cpenso, logo existo\u201D.",
      why: "A d\xFAvida met\xF3dica e o cogito s\xE3o fundamentos do racionalismo de Descartes.",
      subtopic: "moderna",
      difficulty: "facil"
    },
    {
      key: "kant",
      answer: "Immanuel Kant.",
      clue: "Age apenas segundo uma m\xE1xima tal que possas, ao mesmo tempo, querer que ela se torne uma lei universal.",
      why: "Essa \xE9 uma formula\xE7\xE3o do imperativo categ\xF3rico, princ\xEDpio da \xE9tica do dever de Kant.",
      subtopic: "moderna"
    },
    {
      key: "hobbes",
      answer: "Thomas Hobbes.",
      clue: "No estado de natureza, sem um poder comum, haveria uma guerra de todos contra todos; por isso os indiv\xEDduos transfeririam direitos a um soberano forte.",
      why: "A guerra de todos contra todos e a defesa de um soberano absoluto (o Leviat\xE3) s\xE3o teses de Hobbes.",
      subtopic: "moderna",
      near: ["John Locke.", "Jean-Jacques Rousseau."]
    },
    {
      key: "locke",
      answer: "John Locke.",
      clue: "A mente humana, ao nascer, \xE9 como uma folha em branco; todo conhecimento prov\xE9m da experi\xEAncia. Na pol\xEDtica, o governo deve proteger direitos naturais como a vida, a liberdade e a propriedade.",
      why: "A t\xE1bula rasa (empirismo) e a defesa dos direitos naturais s\xE3o marcas de John Locke.",
      subtopic: "moderna",
      difficulty: "dificil",
      near: ["Thomas Hobbes."]
    },
    {
      key: "rousseau",
      answer: "Jean-Jacques Rousseau.",
      clue: "O ser humano nasce bom e livre, mas a sociedade e a propriedade privada o corrompem; a legitimidade pol\xEDtica deve vir da vontade geral.",
      why: "A bondade natural e a vontade geral, expostas em O Contrato Social, s\xE3o ideias de Rousseau.",
      subtopic: "moderna",
      near: ["Thomas Hobbes."]
    },
    {
      key: "maquiavel",
      answer: "Nicolau Maquiavel.",
      clue: "O governante deve agir conforme a necessidade para conservar o poder, combinando virt\xF9 e fortuna, separando a a\xE7\xE3o pol\xEDtica da moral religiosa.",
      why: "Em O Pr\xEDncipe, Maquiavel analisa a pol\xEDtica de forma realista e aut\xF4noma em rela\xE7\xE3o \xE0 moral crist\xE3.",
      subtopic: "moderna"
    },
    {
      key: "sartre",
      answer: "Jean-Paul Sartre.",
      clue: "A exist\xEAncia precede a ess\xEAncia: o ser humano primeiro existe e depois se define por suas escolhas, sendo \u201Ccondenado a ser livre\u201D.",
      why: "A afirma\xE7\xE3o de que a exist\xEAncia precede a ess\xEAncia sintetiza o existencialismo de Sartre.",
      subtopic: "moderna"
    }
  ],
  extraDistractors: ["Friedrich Nietzsche."]
});
var eticaQs = [
  buildQuestion({
    id: "fil-etica-arendt",
    topicId: "fil-etica",
    difficulty: "dificil",
    skill: "Interpretar conceitos de \xE9tica e pol\xEDtica contempor\xE2neas",
    support: {
      paragraphs: [
        "Ao acompanhar o julgamento de um funcion\xE1rio nazista, a fil\xF3sofa Hannah Arendt observou que ele n\xE3o parecia um monstro, mas algu\xE9m que cumpria ordens sem refletir sobre elas. Ela chamou esse fen\xF4meno de \u201Cbanalidade do mal\u201D."
      ]
    },
    prompt: "O conceito de banalidade do mal destaca o perigo da",
    correct: "aus\xEAncia de pensamento cr\xEDtico diante de ordens e normas.",
    distractors: [
      "natureza essencialmente m\xE1 de todos os seres humanos.",
      "interfer\xEAncia da religi\xE3o nas decis\xF5es pol\xEDticas.",
      "exist\xEAncia de leis escritas em sociedades democr\xE1ticas.",
      "busca individual pela felicidade e pelo prazer."
    ],
    explanation: "Para Arendt, o mal pode ser praticado por pessoas comuns que deixam de pensar e julgar, apenas obedecendo \u2014 da\xED sua \u201Cbanalidade\u201D."
  }),
  buildQuestion({
    id: "fil-etica-cidadania",
    topicId: "fil-etica",
    difficulty: "media",
    skill: "Relacionar \xE9tica, cidadania e vida p\xFAblica",
    support: {
      paragraphs: [
        "Para Arist\xF3teles, o ser humano \xE9 um \u201Canimal pol\xEDtico\u201D (zoon politikon), pois realiza plenamente sua natureza apenas na vida em comunidade, participando das decis\xF5es da p\xF3lis."
      ]
    },
    prompt: "Segundo essa concep\xE7\xE3o, a participa\xE7\xE3o pol\xEDtica \xE9",
    correct: "constitutiva da realiza\xE7\xE3o humana.",
    distractors: [
      "uma obriga\xE7\xE3o imposta pelo soberano.",
      "um obst\xE1culo \xE0 felicidade individual.",
      "um privil\xE9gio de reis e sacerdotes.",
      "uma atividade irrelevante para a \xE9tica."
    ],
    explanation: "Para Arist\xF3teles, a vida na p\xF3lis e a participa\xE7\xE3o pol\xEDtica fazem parte da pr\xF3pria natureza humana e da busca pelo bem viver."
  })
];
var sociologiaQs = conceptQuestions({
  prefix: "soc",
  topicId: "soc-conceitos",
  skill: "Associar conceitos sociol\xF3gicos aos seus autores e defini\xE7\xF5es",
  prompt: "O conceito descrito corresponde a",
  items: [
    {
      key: "fato-social",
      answer: "fato social, de \xC9mile Durkheim.",
      clue: "Maneiras de agir, pensar e sentir exteriores ao indiv\xEDduo, gerais na sociedade e dotadas de poder coercitivo, como as regras de etiqueta ou a l\xEDngua.",
      why: "Exterioridade, generalidade e coercitividade s\xE3o as caracter\xEDsticas do fato social segundo Durkheim.",
      difficulty: "facil"
    },
    {
      key: "acao-social",
      answer: "a\xE7\xE3o social, de Max Weber.",
      clue: "Conduta humana orientada pelo comportamento de outras pessoas e dotada de um sentido atribu\xEDdo pelo pr\xF3prio indiv\xEDduo que age.",
      why: "Para Weber, a sociologia deve compreender a a\xE7\xE3o social, aquela orientada pelo outro e dotada de sentido subjetivo."
    },
    {
      key: "mais-valia",
      answer: "mais-valia, de Karl Marx.",
      clue: "Diferen\xE7a entre o valor produzido pelo trabalhador e o valor que ele recebe como sal\xE1rio, apropriada pelo capitalista.",
      why: "A mais-valia \xE9 o trabalho excedente n\xE3o pago, base da explora\xE7\xE3o no capitalismo segundo Marx.",
      difficulty: "facil"
    },
    {
      key: "capital-cultural",
      answer: "capital cultural, de Pierre Bourdieu.",
      clue: "Conjunto de conhecimentos, h\xE1bitos e refer\xEAncias valorizados socialmente, transmitidos sobretudo pela fam\xEDlia, que favorece o desempenho escolar de alguns grupos.",
      why: "Bourdieu mostrou que o capital cultural herdado ajuda a reproduzir desigualdades por meio da escola.",
      difficulty: "dificil"
    },
    {
      key: "modernidade-liquida",
      answer: "modernidade l\xEDquida, de Zygmunt Bauman.",
      clue: "Na sociedade contempor\xE2nea, rela\xE7\xF5es, empregos e identidades tornam-se fluidos, inst\xE1veis e passageiros.",
      why: "Bauman usou a met\xE1fora da liquidez para descrever a fragilidade dos v\xEDnculos e identidades contempor\xE2neos."
    },
    {
      key: "industria-cultural",
      answer: "ind\xFAstria cultural, de Adorno e Horkheimer.",
      clue: "Produ\xE7\xE3o de bens culturais em s\xE9rie, padronizados e voltados ao lucro, que tende a tornar o p\xFAblico passivo e conformado.",
      why: "Adorno e Horkheimer criaram o conceito de ind\xFAstria cultural para criticar a mercantiliza\xE7\xE3o da cultura."
    }
  ],
  extraDistractors: ["solidariedade mec\xE2nica, de \xC9mile Durkheim."]
});
var culturaQs = conceptQuestions({
  prefix: "soc-cultura",
  topicId: "soc-sociedade",
  skill: "Compreender conceitos relacionados \xE0 cultura e \xE0 diversidade",
  prompt: "A atitude ou o conceito descrito \xE9 o(a)",
  items: [
    {
      key: "etnocentrismo",
      answer: "etnocentrismo.",
      clue: "Ao visitar outro pa\xEDs, um turista classificou como \u201Catrasados\u201D e \u201Cestranhos\u201D os costumes locais, tomando os h\xE1bitos de seu pr\xF3prio grupo como medida de todas as culturas.",
      why: "Julgar outras culturas com base nos valores do pr\xF3prio grupo \xE9 etnocentrismo.",
      difficulty: "facil"
    },
    {
      key: "relativismo",
      answer: "relativismo cultural.",
      clue: "Uma antrop\xF3loga procurou compreender os rituais de uma comunidade a partir dos significados que eles t\xEAm para seus pr\xF3prios membros, sem hierarquiz\xE1-los.",
      why: "Compreender cada cultura em seus pr\xF3prios termos, sem hierarquias, \xE9 a postura do relativismo cultural."
    },
    {
      key: "aculturacao",
      answer: "acultura\xE7\xE3o.",
      clue: "O contato prolongado entre dois grupos culturais distintos provoca mudan\xE7as nos padr\xF5es culturais de um ou de ambos.",
      why: "Acultura\xE7\xE3o \xE9 o processo de transforma\xE7\xE3o cultural resultante do contato cont\xEDnuo entre culturas diferentes.",
      difficulty: "dificil"
    }
  ],
  extraDistractors: ["xenofobia.", "assimila\xE7\xE3o for\xE7ada."]
});
var HUMANAS_QUESTIONS = [
  ...historiaBrasilQs,
  ...historiaGeralQs,
  ...historiaContexto,
  ...fusoQs,
  ...biomasQs,
  ...climaUrbanoFixed,
  ...ambientalGeoQs,
  ...filosofiaQs,
  ...eticaQs,
  ...sociologiaQs,
  ...culturaQs
];

// legacy/src/data/fixtures/questions/linguagens.ts
var CREDIT = "Texto elaborado para fins demonstrativos.";
var figurasQs = conceptQuestions({
  prefix: "por-figura",
  topicId: "por-figuras",
  skill: "Reconhecer figuras de linguagem e seus efeitos de sentido",
  prompt: "No trecho, predomina a figura de linguagem denominada",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "metafora",
      answer: "met\xE1fora.",
      clue: "\u201CMinha av\xF3 era o farol da fam\xEDlia: nas noites mais dif\xEDceis, era para ela que todos olhavam.\u201D",
      why: "A av\xF3 \xE9 identificada com um farol sem conectivo comparativo, por uma rela\xE7\xE3o de semelhan\xE7a (orientar, guiar): \xE9 uma met\xE1fora.",
      subtopic: "semantica",
      difficulty: "facil",
      near: ["compara\xE7\xE3o."]
    },
    {
      key: "comparacao",
      answer: "compara\xE7\xE3o.",
      clue: "\u201CO sil\xEAncio da sala de provas era pesado como uma manh\xE3 de chumbo.\u201D",
      why: "A presen\xE7a do conectivo \u201Ccomo\u201D explicita a semelhan\xE7a entre os termos, caracterizando a compara\xE7\xE3o (s\xEDmile).",
      subtopic: "semantica",
      difficulty: "facil",
      near: ["met\xE1fora."]
    },
    {
      key: "metonimia",
      answer: "meton\xEDmia.",
      clue: "\u201CNa hora do intervalo, a escola inteira desceu para o p\xE1tio, e o pr\xE9dio ficou em sil\xEAncio.\u201D",
      why: "\u201CA escola inteira\u201D designa os estudantes e funcion\xE1rios: emprega-se o lugar pelos seus ocupantes, caso de meton\xEDmia.",
      subtopic: "semantica",
      near: ["met\xE1fora."]
    },
    {
      key: "hiperbole",
      answer: "hip\xE9rbole.",
      clue: "\u201CJ\xE1 pedi um milh\xE3o de vezes para voc\xEA deixar o carregador no lugar!\u201D",
      why: "O exagero intencional (\u201Cum milh\xE3o de vezes\u201D) para enfatizar a ideia \xE9 a hip\xE9rbole.",
      subtopic: "construcao",
      difficulty: "facil"
    },
    {
      key: "antitese",
      answer: "ant\xEDtese.",
      clue: "\u201CNa rua estreita, convivem o luxo dos condom\xEDnios e a falta dos barracos.\u201D",
      why: "A aproxima\xE7\xE3o de ideias opostas (luxo \xD7 falta) cria a ant\xEDtese.",
      subtopic: "construcao",
      near: ["paradoxo."]
    },
    {
      key: "paradoxo",
      answer: "paradoxo.",
      clue: "\u201CEra um sil\xEAncio ensurdecedor, que gritava tudo o que ningu\xE9m dizia.\u201D",
      why: "Ao unir ideias contradit\xF3rias em um mesmo ser (sil\xEAncio que ensurdece e grita), o trecho constr\xF3i um paradoxo, mais intenso que a simples oposi\xE7\xE3o da ant\xEDtese.",
      subtopic: "construcao",
      difficulty: "dificil",
      near: ["ant\xEDtese."]
    },
    {
      key: "prosopopeia",
      answer: "prosopopeia.",
      clue: "\u201CO vento sussurrava segredos \xE0s janelas, e as \xE1rvores dan\xE7avam no quintal.\u201D",
      why: "Atribuir a\xE7\xF5es humanas a seres inanimados (sussurrar, dan\xE7ar) \xE9 prosopopeia, ou personifica\xE7\xE3o.",
      subtopic: "construcao",
      difficulty: "facil"
    },
    {
      key: "eufemismo",
      answer: "eufemismo.",
      clue: "\u201CDepois de uma longa doen\xE7a, seu av\xF4 descansou, cercado pela fam\xEDlia.\u201D",
      why: "\u201CDescansou\u201D suaviza a ideia de morte: trata-se de eufemismo.",
      subtopic: "construcao"
    },
    {
      key: "ironia",
      answer: "ironia.",
      clue: "\u201CQue pontualidade admir\xE1vel! Chegou s\xF3 duas horas depois do combinado.\u201D",
      why: "O elogio afirma o contr\xE1rio do que se pretende dizer (o atraso), produzindo ironia.",
      subtopic: "construcao"
    },
    {
      key: "gradacao",
      answer: "grada\xE7\xE3o.",
      clue: "\u201CPrimeiro estranhou, depois duvidou, enfim revoltou-se contra a decis\xE3o.\u201D",
      why: "A sequ\xEAncia de a\xE7\xF5es em intensidade crescente caracteriza a grada\xE7\xE3o.",
      subtopic: "construcao",
      difficulty: "dificil"
    }
  ],
  extraDistractors: ["onomatopeia.", "sinestesia."]
});
var funcoesQs = conceptQuestions({
  prefix: "por-funcao",
  topicId: "por-funcoes",
  skill: "Identificar a fun\xE7\xE3o da linguagem predominante em um texto",
  prompt: "A fun\xE7\xE3o da linguagem predominante no texto \xE9 a",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "referencial",
      answer: "referencial, centrada na informa\xE7\xE3o.",
      clue: "A prefeitura informou que a vacina\xE7\xE3o contra a gripe ser\xE1 ampliada a partir de segunda-feira para pessoas de 18 a 59 anos, em todos os postos de sa\xFAde, das 8h \xE0s 17h.",
      why: "O texto transmite informa\xE7\xF5es objetivas sobre um fato, com foco no referente: fun\xE7\xE3o referencial (denotativa).",
      difficulty: "facil"
    },
    {
      key: "emotiva",
      answer: "emotiva, centrada no emissor.",
      clue: "Ah, como sinto falta daquelas tardes na casa da minha m\xE3e! Ainda hoje me emociono s\xF3 de lembrar do cheiro de caf\xE9 passado.",
      why: "Predominam a primeira pessoa, as exclama\xE7\xF5es e a express\xE3o de sentimentos de quem fala: fun\xE7\xE3o emotiva (expressiva).",
      difficulty: "facil"
    },
    {
      key: "conativa",
      answer: "conativa, centrada no receptor.",
      clue: "N\xE3o deixe para amanh\xE3! Fa\xE7a sua inscri\xE7\xE3o hoje mesmo e garanta sua vaga no cursinho comunit\xE1rio.",
      why: "O uso do imperativo e a tentativa de convencer o leitor caracterizam a fun\xE7\xE3o conativa (apelativa)."
    },
    {
      key: "fatica",
      answer: "f\xE1tica, centrada no canal.",
      clue: "\u2014 Al\xF4? Al\xF4? Est\xE1 me ouvindo? A liga\xE7\xE3o est\xE1 cortando\u2026 Oi, pode falar, agora sim estou ouvindo.",
      why: "As falas servem para testar e manter o contato comunicativo: fun\xE7\xE3o f\xE1tica."
    },
    {
      key: "metalinguistica",
      answer: "metalingu\xEDstica, centrada no c\xF3digo.",
      clue: "Saudade: substantivo feminino. Sentimento de nostalgia causado pela aus\xEAncia de algu\xE9m ou de algo querido.",
      why: "O texto usa a l\xEDngua para explicar a pr\xF3pria l\xEDngua, como no verbete de dicion\xE1rio: fun\xE7\xE3o metalingu\xEDstica.",
      difficulty: "dificil"
    },
    {
      key: "poetica",
      answer: "po\xE9tica, centrada na mensagem.",
      clue: "Chove chuva mi\xFAda no telhado, / bate leve, bate lento, bate manso, / e o sono, molhado, cai cansado.",
      why: "O trabalho com sonoridade, ritmo e repeti\xE7\xE3o chama aten\xE7\xE3o para a pr\xF3pria constru\xE7\xE3o da mensagem: fun\xE7\xE3o po\xE9tica."
    }
  ]
});
var variacaoQs2 = [
  buildQuestion({
    id: "por-variacao-1",
    topicId: "por-variacao",
    subtopic: "regional",
    difficulty: "media",
    skill: "Reconhecer a varia\xE7\xE3o lingu\xEDstica como fen\xF4meno leg\xEDtimo",
    support: {
      paragraphs: [
        "Em uma mesma cidade, h\xE1 quem diga \u201Cmandioca\u201D, \u201Caipim\u201D ou \u201Cmacaxeira\u201D para se referir \xE0 mesma raiz. As escolhas variam conforme a origem dos falantes, sua hist\xF3ria familiar e os lugares por onde passaram."
      ],
      credit: CREDIT
    },
    prompt: "O texto evidencia que a varia\xE7\xE3o lingu\xEDstica",
    correct: "reflete a diversidade regional e social dos falantes, sem que haja forma errada.",
    distractors: [
      "\xE9 um desvio da norma que deve ser corrigido na fala cotidiana.",
      "ocorre apenas entre falantes de regi\xF5es muito distantes.",
      "prejudica a comunica\xE7\xE3o entre pessoas de uma mesma cidade.",
      "deve ser evitada em qualquer situa\xE7\xE3o de comunica\xE7\xE3o."
    ],
    explanation: "As diferentes palavras s\xE3o variantes leg\xEDtimas, ligadas \xE0 hist\xF3ria e \xE0 origem dos falantes. A varia\xE7\xE3o \xE9 inerente \xE0s l\xEDnguas e n\xE3o representa erro."
  }),
  buildQuestion({
    id: "por-variacao-2",
    topicId: "por-variacao",
    subtopic: "registro",
    difficulty: "media",
    skill: "Adequar o registro lingu\xEDstico \xE0 situa\xE7\xE3o comunicativa",
    support: {
      paragraphs: [
        "Mensagem 1: \u201CE a\xED, mano, bora estudar pro simulado amanh\xE3 cedo? T\xF4 dentro se tu levar o caf\xE9!\u201D",
        "Mensagem 2: \u201CPrezada coordenadora, solicito a reserva da sala de estudos para amanh\xE3, \xE0s 8 horas, a fim de prepararmos o simulado.\u201D"
      ],
      credit: CREDIT
    },
    prompt: "A diferen\xE7a entre as mensagens revela que os falantes",
    correct: "ajustam o grau de formalidade conforme o interlocutor e a situa\xE7\xE3o.",
    distractors: [
      "dominam a norma-padr\xE3o apenas na escrita formal.",
      "cometem erros gramaticais em contextos informais.",
      "empregam a linguagem formal apenas entre amigos.",
      "desconhecem as regras de concord\xE2ncia da l\xEDngua."
    ],
    explanation: "O registro informal \xE9 adequado entre amigos; o formal, em comunica\xE7\xF5es institucionais. Adequar a linguagem \xE0 situa\xE7\xE3o \xE9 compet\xEAncia comunicativa, n\xE3o erro."
  }),
  buildQuestion({
    id: "por-variacao-3",
    topicId: "por-variacao",
    subtopic: "regional",
    difficulty: "dificil",
    skill: "Analisar o preconceito lingu\xEDstico",
    support: {
      paragraphs: [
        "Um apresentador de televis\xE3o ridicularizou o modo de falar de um entrevistado do interior, imitando seu sotaque e afirmando que \u201Cele n\xE3o sabe falar portugu\xEAs\u201D."
      ],
      credit: CREDIT
    },
    prompt: "A atitude do apresentador pode ser classificada como",
    correct: "preconceito lingu\xEDstico, que desvaloriza variedades associadas a determinados grupos.",
    distractors: [
      "corre\xE7\xE3o gramatical necess\xE1ria para preservar a l\xEDngua.",
      "uso adequado da fun\xE7\xE3o metalingu\xEDstica da linguagem.",
      "exemplo de neutralidade no tratamento das variedades.",
      "valoriza\xE7\xE3o do sotaque como patrim\xF4nio cultural."
    ],
    explanation: "Desqualificar uma variedade lingu\xEDstica \u2014 e, com ela, seus falantes \u2014 \xE9 preconceito lingu\xEDstico. Do ponto de vista cient\xEDfico, todas as variedades s\xE3o sistemas organizados."
  })
];
var generosQs = conceptQuestions({
  prefix: "por-genero",
  topicId: "por-generos",
  skill: "Reconhecer g\xEAneros textuais por sua estrutura e finalidade",
  prompt: "O trecho pertence ao g\xEAnero",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "receita",
      answer: "receita culin\xE1ria, de car\xE1ter instrucional.",
      clue: "Ingredientes: 2 x\xEDcaras de farinha, 1 ovo, 1 x\xEDcara de leite. Modo de preparo: misture os ingredientes secos, acrescente o leite aos poucos e mexa at\xE9 obter uma massa lisa.",
      why: "A lista de ingredientes e os verbos no imperativo, que orientam a\xE7\xF5es em sequ\xEAncia, caracterizam a receita, g\xEAnero instrucional.",
      difficulty: "facil"
    },
    {
      key: "noticia",
      answer: "not\xEDcia, de car\xE1ter informativo.",
      clue: "Uma ponte que liga dois bairros da zona norte foi interditada na manh\xE3 desta ter\xE7a-feira ap\xF3s t\xE9cnicos identificarem rachaduras na estrutura. Segundo a Defesa Civil, n\xE3o h\xE1 previs\xE3o de libera\xE7\xE3o.",
      why: "O relato objetivo de um fato recente, com indica\xE7\xE3o de tempo, lugar e fonte, \xE9 caracter\xEDstico da not\xEDcia.",
      difficulty: "facil"
    },
    {
      key: "editorial",
      answer: "editorial, de car\xE1ter opinativo.",
      clue: "A interdi\xE7\xE3o da ponte \xE9 mais um retrato do descaso hist\xF3rico com a manuten\xE7\xE3o urbana. N\xE3o basta interditar: \xE9 urgente que o poder p\xFAblico assuma um plano permanente de conserva\xE7\xE3o.",
      why: "O texto defende um ponto de vista institucional sobre um fato, com argumentos e avalia\xE7\xE3o \u2014 pr\xF3prio do editorial."
    },
    {
      key: "anuncio",
      answer: "an\xFAncio publicit\xE1rio.",
      clue: "Sua energia rende mais com Vitta+. Uma garrafinha por dia e voc\xEA enfrenta qualquer maratona de estudos. Vitta+: o g\xE1s que faltava.",
      why: "A promo\xE7\xE3o de um produto, o slogan e a linguagem persuasiva dirigida ao consumidor caracterizam o an\xFAncio publicit\xE1rio."
    },
    {
      key: "verbete",
      answer: "verbete, de car\xE1ter expositivo.",
      clue: "Ip\xEA (substantivo masculino): \xE1rvore da fam\xEDlia das bignoni\xE1ceas, nativa das Am\xE9ricas, conhecida pelas flores amarelas, roxas ou brancas que surgem no fim do inverno.",
      why: "A defini\xE7\xE3o de um termo, com classe gramatical e informa\xE7\xF5es descritivas, organizada para consulta, caracteriza o verbete.",
      difficulty: "dificil"
    }
  ],
  extraDistractors: ["cr\xF4nica, de car\xE1ter narrativo."]
});
var interpretacaoQs = [
  buildQuestion({
    id: "por-interp-1",
    topicId: "por-interpretacao",
    subtopic: "inferencia",
    difficulty: "media",
    skill: "Inferir informa\xE7\xF5es impl\xEDcitas em textos",
    support: {
      paragraphs: [
        "Toda noite, depois que a casa dormia, L\xFAcia acendia a pequena lumin\xE1ria da cozinha e abria os livros sobre a mesa ainda com cheiro de jantar. Quando o despertador do pai tocava, \xE0s cinco, ela j\xE1 tinha resolvido mais uma lista \u2014 e o caderno estava guardado antes que algu\xE9m acordasse."
      ],
      credit: CREDIT
    },
    prompt: "A partir do texto, infere-se que L\xFAcia",
    correct: "dedica-se aos estudos em hor\xE1rios de sil\xEAncio, sem que a fam\xEDlia perceba.",
    distractors: [
      "estuda apenas nos fins de semana, quando tem tempo livre.",
      "\xE9 obrigada pelo pai a estudar durante a madrugada.",
      "tem um quarto pr\xF3prio, reservado aos estudos.",
      "desistiu dos estudos para ajudar no trabalho dom\xE9stico."
    ],
    explanation: "O texto mostra que L\xFAcia estuda \xE0 noite, na cozinha, e guarda o caderno antes de todos acordarem, o que permite inferir que estuda discretamente nos momentos de sil\xEAncio."
  }),
  buildQuestion({
    id: "por-interp-2",
    topicId: "por-interpretacao",
    subtopic: "argumentacao",
    difficulty: "media",
    skill: "Identificar estrat\xE9gias argumentativas",
    support: {
      paragraphs: [
        "Segundo levantamento de uma organiza\xE7\xE3o de mobilidade urbana, cidades que ampliaram as ciclovias reduziram em at\xE9 30% os acidentes envolvendo ciclistas. Investir em infraestrutura segura, portanto, n\xE3o \xE9 luxo: \xE9 pol\xEDtica de sa\xFAde p\xFAblica."
      ],
      credit: CREDIT
    },
    prompt: "Para sustentar seu ponto de vista, o autor recorre principalmente a",
    correct: "dados estat\xEDsticos atribu\xEDdos a uma fonte especializada.",
    distractors: [
      "relatos pessoais de ciclistas acidentados.",
      "compara\xE7\xF5es entre diferentes meios de transporte.",
      "cita\xE7\xF5es de autoridades pol\xEDticas.",
      "argumentos baseados em senso comum."
    ],
    explanation: "O argumento se apoia no percentual de redu\xE7\xE3o de acidentes, atribu\xEDdo a um levantamento: \xE9 o argumento por comprova\xE7\xE3o (dados estat\xEDsticos)."
  }),
  buildQuestion({
    id: "por-interp-3",
    topicId: "por-interpretacao",
    subtopic: "inferencia",
    difficulty: "facil",
    skill: "Reconhecer o tema central de um texto",
    support: {
      paragraphs: [
        "A biblioteca comunit\xE1ria do bairro come\xE7ou com doze livros em uma estante improvisada. Hoje tem mais de tr\xEAs mil t\xEDtulos, oficinas de escrita e um clube de leitura para adolescentes, tudo mantido por volunt\xE1rios e doa\xE7\xF5es dos pr\xF3prios moradores."
      ],
      credit: CREDIT
    },
    prompt: "O tema central do texto \xE9",
    correct: "a mobiliza\xE7\xE3o comunit\xE1ria em torno do acesso \xE0 leitura.",
    distractors: [
      "a falta de investimento p\xFAblico em bibliotecas.",
      "a substitui\xE7\xE3o dos livros impressos por digitais.",
      "a dificuldade de adolescentes em ler livros longos.",
      "a venda de livros usados em bairros perif\xE9ricos."
    ],
    explanation: "O texto destaca o crescimento da biblioteca gra\xE7as a volunt\xE1rios e doa\xE7\xF5es dos moradores: o foco \xE9 a mobiliza\xE7\xE3o da comunidade pelo acesso \xE0 leitura."
  }),
  buildQuestion({
    id: "por-interp-4",
    topicId: "por-interpretacao",
    subtopic: "argumentacao",
    difficulty: "dificil",
    skill: "Analisar o efeito de sentido de recursos lingu\xEDsticos",
    support: {
      paragraphs: [
        "Dizem que o celular aproxima quem est\xE1 longe. Talvez. Mas, no almo\xE7o de domingo, a fam\xEDlia inteira estava reunida \u2014 e cada um olhava para uma tela diferente."
      ],
      credit: CREDIT
    },
    prompt: "No texto, o uso de \u201CTalvez\u201D e da conjun\xE7\xE3o \u201CMas\u201D produz o efeito de",
    correct: "relativizar uma ideia comum e introduzir uma contraposi\xE7\xE3o a ela.",
    distractors: [
      "confirmar integralmente a opini\xE3o apresentada no in\xEDcio.",
      "acrescentar um novo exemplo que refor\xE7a a tese inicial.",
      "indicar uma conclus\xE3o l\xF3gica do argumento anterior.",
      "estabelecer uma rela\xE7\xE3o de causa entre as ideias."
    ],
    explanation: "\u201CTalvez\u201D enfraquece a afirma\xE7\xE3o inicial e \u201CMas\u201D introduz uma ideia oposta: a tecnologia pode afastar quem est\xE1 perto."
  })
];
var literaturaQs = conceptQuestions({
  prefix: "lit",
  topicId: "lit-escolas",
  skill: "Reconhecer caracter\xEDsticas de estilos de \xE9poca da literatura brasileira",
  prompt: "As caracter\xEDsticas descritas identificam o(a)",
  items: [
    {
      key: "barroco",
      answer: "Barroco.",
      clue: "Estilo marcado pelo conflito entre f\xE9 e raz\xE3o, mat\xE9ria e esp\xEDrito, com linguagem rebuscada, jogos de palavras (cultismo) e de ideias (conceptismo).",
      why: "O dualismo, o cultismo e o conceptismo s\xE3o tra\xE7os do Barroco, representado no Brasil por Greg\xF3rio de Matos e Padre Ant\xF4nio Vieira.",
      subtopic: "classicas"
    },
    {
      key: "arcadismo",
      answer: "Arcadismo.",
      clue: "Poesia que idealiza a vida simples no campo, adota pseud\xF4nimos pastoris e retoma lemas como fugere urbem e carpe diem.",
      why: "Bucolismo, pseud\xF4nimos pastoris e o lema fugere urbem caracterizam o Arcadismo, de autores como Tom\xE1s Ant\xF4nio Gonzaga.",
      subtopic: "classicas",
      difficulty: "facil"
    },
    {
      key: "romantismo",
      answer: "Romantismo.",
      clue: "Valoriza\xE7\xE3o do sentimento e da subjetividade, idealiza\xE7\xE3o da mulher e do amor, nacionalismo e, na prosa, a figura do ind\xEDgena como her\xF3i nacional.",
      why: "Subjetivismo, idealiza\xE7\xE3o e nacionalismo (como no indianismo de Jos\xE9 de Alencar) definem o Romantismo.",
      subtopic: "xix",
      difficulty: "facil"
    },
    {
      key: "realismo",
      answer: "Realismo.",
      clue: "Narrativas que analisam criticamente a sociedade burguesa, com ironia e aprofundamento psicol\xF3gico das personagens, como em Mem\xF3rias P\xF3stumas de Br\xE1s Cubas.",
      why: "Cr\xEDtica social, ironia e an\xE1lise psicol\xF3gica, como na obra de Machado de Assis, s\xE3o tra\xE7os do Realismo.",
      subtopic: "xix",
      near: ["Naturalismo."]
    },
    {
      key: "naturalismo",
      answer: "Naturalismo.",
      clue: "Romances que mostram o comportamento humano determinado pelo meio, pela ra\xE7a e pelo momento hist\xF3rico, com personagens coletivas como em O Corti\xE7o.",
      why: "O determinismo e a influ\xEAncia das ci\xEAncias naturais, como em O Corti\xE7o, de Alu\xEDsio Azevedo, caracterizam o Naturalismo.",
      subtopic: "xix",
      difficulty: "dificil",
      near: ["Realismo."]
    },
    {
      key: "parnasianismo",
      answer: "Parnasianismo.",
      clue: "Poesia que busca a perfei\xE7\xE3o formal, com m\xE9trica rigorosa, rimas ricas, vocabul\xE1rio erudito e defesa da \u201Carte pela arte\u201D.",
      why: "Culto \xE0 forma e lema \u201Carte pela arte\u201D, como em Olavo Bilac, definem o Parnasianismo.",
      subtopic: "xix",
      near: ["Simbolismo."]
    },
    {
      key: "simbolismo",
      answer: "Simbolismo.",
      clue: "Poesia que explora a musicalidade, as sinestesias, o misticismo e o inconsciente, sugerindo mais do que descrevendo.",
      why: "Musicalidade, sinestesia e espiritualidade marcam o Simbolismo, de Cruz e Sousa.",
      subtopic: "xix",
      near: ["Parnasianismo."]
    },
    {
      key: "modernismo",
      answer: "primeira fase do Modernismo.",
      clue: "Ruptura com as formas tradicionais, uso de verso livre, linguagem coloquial, humor e valoriza\xE7\xE3o cr\xEDtica da identidade brasileira, a partir da Semana de Arte Moderna de 1922.",
      why: "A Semana de 1922, o verso livre, a irrever\xEAncia e a busca por uma express\xE3o nacional caracterizam a primeira gera\xE7\xE3o modernista.",
      subtopic: "modernismo",
      difficulty: "facil"
    },
    {
      key: "regionalismo-30",
      answer: "romance regionalista de 1930.",
      clue: "Prosa de den\xFAncia social que retrata a seca, a mis\xE9ria e as rela\xE7\xF5es de poder no Nordeste, como em Vidas Secas, de Graciliano Ramos.",
      why: "A prosa de 1930, com Graciliano Ramos e Rachel de Queiroz, denunciou problemas sociais nordestinos \u2014 o regionalismo da segunda fase modernista.",
      subtopic: "modernismo"
    }
  ]
});
var artesQs = conceptQuestions({
  prefix: "art",
  topicId: "art-movimentos",
  skill: "Reconhecer caracter\xEDsticas de movimentos art\xEDsticos",
  prompt: "As caracter\xEDsticas descritas correspondem ao movimento",
  items: [
    {
      key: "impressionismo",
      answer: "Impressionismo.",
      clue: "Pintores que trabalhavam ao ar livre buscavam captar os efeitos passageiros da luz natural, com pinceladas soltas e vis\xEDveis.",
      why: "A pintura ao ar livre e o interesse pela luz e pelas impress\xF5es moment\xE2neas definem o Impressionismo.",
      difficulty: "facil"
    },
    {
      key: "cubismo",
      answer: "Cubismo.",
      clue: "Representa\xE7\xE3o dos objetos decompostos em formas geom\xE9tricas, mostrando simultaneamente v\xE1rios pontos de vista em uma mesma tela.",
      why: "A fragmenta\xE7\xE3o geom\xE9trica e a simultaneidade de \xE2ngulos caracterizam o Cubismo de Picasso e Braque."
    },
    {
      key: "surrealismo",
      answer: "Surrealismo.",
      clue: "Obras que exploram o inconsciente, os sonhos e associa\xE7\xF5es il\xF3gicas, criando cenas que desafiam a l\xF3gica do mundo real.",
      why: "A explora\xE7\xE3o do inconsciente e do on\xEDrico, influenciada pela psican\xE1lise, \xE9 a marca do Surrealismo."
    },
    {
      key: "expressionismo",
      answer: "Expressionismo.",
      clue: "Cores intensas e formas distorcidas para expressar emo\xE7\xF5es e ang\xFAstias humanas, como na figura que grita sob um c\xE9u avermelhado.",
      why: "A distor\xE7\xE3o e as cores intensas a servi\xE7o da emo\xE7\xE3o caracterizam o Expressionismo."
    },
    {
      key: "antropofagia",
      answer: "Movimento Antropof\xE1gico.",
      clue: "Proposta modernista brasileira de \u201Cdevorar\u201D criticamente as influ\xEAncias estrangeiras para produzir uma arte original, simbolizada pela pintura Abaporu, de Tarsila do Amaral.",
      why: "O Manifesto Antrop\xF3fago (1928) e a obra Abaporu, de Tarsila, propuseram assimilar criticamente a cultura estrangeira.",
      difficulty: "dificil"
    },
    {
      key: "pop-art",
      answer: "Pop Art.",
      clue: "Uso de imagens da cultura de massa \u2014 embalagens, quadrinhos e celebridades \u2014, muitas vezes repetidas com t\xE9cnicas de serigrafia.",
      why: "A apropria\xE7\xE3o da cultura de massa e da publicidade caracteriza a Pop Art, de Andy Warhol e Roy Lichtenstein."
    }
  ]
});
var inglesQs = [
  buildQuestion({
    id: "ing-1",
    topicId: "ing-interpretacao",
    difficulty: "facil",
    skill: "Compreender a ideia principal de textos em l\xEDngua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Community gardens are popping up in vacant lots across many cities. Besides providing fresh vegetables, they give neighbors a reason to meet, share tools and teach each other. \u201CI came for the tomatoes, but I stayed for the people,\u201D says one volunteer."
      ],
      credit: CREDIT
    },
    prompt: "De acordo com o texto, as hortas comunit\xE1rias",
    correct: "fortalecem os la\xE7os entre vizinhos, al\xE9m de produzir alimentos.",
    distractors: [
      "substituem os supermercados nas grandes cidades.",
      "s\xE3o proibidas em terrenos urbanos desocupados.",
      "interessam apenas a quem quer vender tomates.",
      "exigem equipamentos caros e m\xE3o de obra especializada."
    ],
    explanation: "O texto afirma que as hortas oferecem vegetais frescos e motivos para os vizinhos se encontrarem; a fala do volunt\xE1rio refor\xE7a o aspecto social."
  }),
  buildQuestion({
    id: "ing-2",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Identificar a finalidade de g\xEAneros textuais em l\xEDngua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "LOST & FOUND \u2014 Did you leave a blue backpack in Room 12 after Friday's chemistry lab? It contains a calculator and a notebook with the name \u201CSam\u201D. Please pick it up at the front desk before Wednesday."
      ],
      credit: CREDIT
    },
    prompt: "O objetivo desse aviso \xE9",
    correct: "localizar o dono de uma mochila esquecida na escola.",
    distractors: [
      "anunciar a venda de materiais escolares usados.",
      "convidar estudantes para uma aula de qu\xEDmica.",
      "informar o roubo de uma calculadora na escola.",
      "divulgar o novo hor\xE1rio da recep\xE7\xE3o."
    ],
    explanation: "\u201CLost & Found\u201D significa achados e perdidos; o aviso pede que o dono da mochila azul a retire na recep\xE7\xE3o."
  }),
  buildQuestion({
    id: "ing-3",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Reconhecer o sentido de express\xF5es em contexto",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Many students believe that cramming the night before an exam is the best strategy. However, research on memory suggests that spacing study sessions over several days leads to longer-lasting learning."
      ],
      credit: CREDIT
    },
    prompt: "No texto, a palavra \u201CHowever\u201D introduz uma ideia que",
    correct: "se op\xF5e \xE0 cren\xE7a apresentada anteriormente.",
    distractors: [
      "confirma a estrat\xE9gia de estudar na v\xE9spera.",
      "explica a causa da cren\xE7a dos estudantes.",
      "conclui o texto com um resumo.",
      "acrescenta um exemplo semelhante ao anterior."
    ],
    explanation: "\u201CHowever\u201D equivale a \u201Cno entanto\u201D: introduz o contraste entre a cren\xE7a em estudar na v\xE9spera e o que a pesquisa sugere sobre estudos espa\xE7ados."
  }),
  buildQuestion({
    id: "ing-4",
    topicId: "ing-interpretacao",
    difficulty: "dificil",
    skill: "Inferir o posicionamento do autor em textos de opini\xE3o",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Fast fashion lets us buy trendy clothes for very little money. But the real price is paid elsewhere: by rivers polluted with dyes, by workers earning less than a living wage, and by landfills full of shirts worn only twice."
      ],
      credit: CREDIT
    },
    prompt: "Ao afirmar que \u201Cthe real price is paid elsewhere\u201D, o autor",
    correct: "critica os custos sociais e ambientais da moda descart\xE1vel.",
    distractors: [
      "defende que roupas baratas sejam vendidas em outros pa\xEDses.",
      "elogia a democratiza\xE7\xE3o do acesso \xE0 moda.",
      "sugere que as lojas aumentem seus pre\xE7os de etiqueta.",
      "informa que o descarte de roupas \xE9 controlado por lei."
    ],
    explanation: "O \u201Cpre\xE7o real\u201D refere-se \xE0 polui\xE7\xE3o, aos baixos sal\xE1rios e ao lixo t\xEAxtil: o autor critica os impactos ocultos do fast fashion."
  }),
  buildQuestion({
    id: "ing-5",
    topicId: "ing-interpretacao",
    difficulty: "facil",
    skill: "Compreender instru\xE7\xF5es em l\xEDngua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Before you start: charge the device for at least two hours. Do not expose it to water. To turn it on, press and hold the side button for three seconds."
      ],
      credit: CREDIT
    },
    prompt: "Segundo as instru\xE7\xF5es, para ligar o aparelho, o usu\xE1rio deve",
    correct: "manter o bot\xE3o lateral pressionado por tr\xEAs segundos.",
    distractors: [
      "carreg\xE1-lo por tr\xEAs segundos.",
      "mergulh\xE1-lo em \xE1gua por duas horas.",
      "apertar o bot\xE3o lateral duas vezes.",
      "deslig\xE1-lo da tomada antes de us\xE1-lo."
    ],
    explanation: "\u201CPress and hold the side button for three seconds\u201D significa \u201Cpressione e segure o bot\xE3o lateral por tr\xEAs segundos\u201D."
  }),
  buildQuestion({
    id: "ing-6",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Relacionar texto e contexto social em l\xEDngua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "In 1955, Rosa Parks refused to give up her seat to a white passenger on a bus in Montgomery, Alabama. Her arrest sparked a bus boycott that lasted more than a year and became a landmark of the civil rights movement."
      ],
      credit: CREDIT
    },
    prompt: "O texto relata um epis\xF3dio que se tornou s\xEDmbolo da luta",
    correct: "contra a segrega\xE7\xE3o racial nos Estados Unidos.",
    distractors: [
      "pela redu\xE7\xE3o das tarifas de \xF4nibus.",
      "pelo direito de voto das mulheres.",
      "pela independ\xEAncia do estado do Alabama.",
      "contra a privatiza\xE7\xE3o do transporte p\xFAblico."
    ],
    explanation: "A recusa de Rosa Parks e o boicote aos \xF4nibus de Montgomery tornaram-se marcos do movimento pelos direitos civis contra a segrega\xE7\xE3o racial."
  })
];
var espanholQs = [
  buildQuestion({
    id: "esp-1",
    topicId: "esp-interpretacao",
    difficulty: "facil",
    skill: "Compreender a ideia principal de textos em l\xEDngua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "En muchos pueblos de Am\xE9rica Latina, el mercado de los domingos es mucho m\xE1s que un lugar para comprar frutas y verduras: es el espacio donde los vecinos se encuentran, intercambian noticias y mantienen vivas sus tradiciones."
      ],
      credit: CREDIT
    },
    prompt: "Segundo o texto, os mercados de domingo",
    correct: "t\xEAm importante papel social e cultural para as comunidades.",
    distractors: [
      "est\xE3o desaparecendo por causa dos supermercados.",
      "vendem apenas produtos importados.",
      "funcionam somente nas grandes capitais.",
      "s\xE3o frequentados principalmente por turistas."
    ],
    explanation: "O texto afirma que o mercado \xE9 \u201Cmucho m\xE1s que un lugar para comprar\u201D: \xE9 espa\xE7o de encontro e de manuten\xE7\xE3o de tradi\xE7\xF5es."
  }),
  buildQuestion({
    id: "esp-2",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Reconhecer falsos cognatos em l\xEDngua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "\u2014\xBFYa terminaste la tarea? \u2014pregunt\xF3 la profesora.\n\u2014Todav\xEDa no. Me falta una pregunta, pero la entrego enseguida."
      ],
      credit: CREDIT
    },
    prompt: "No di\xE1logo, a palavra \u201Censeguida\u201D indica que o estudante entregar\xE1 a tarefa",
    correct: "imediatamente.",
    distractors: ["no dia seguinte.", "na semana seguinte.", "em sequ\xEAncia a outro colega.", "somente ap\xF3s a aula."],
    explanation: "\u201CEnseguida\u201D significa \u201Cem seguida, imediatamente\u201D. A semelhan\xE7a com \u201Cseguinte\u201D em portugu\xEAs pode induzir ao erro."
  }),
  buildQuestion({
    id: "esp-3",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Interpretar textos publicit\xE1rios em l\xEDngua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "\xA1Apaga la luz que no usas! Peque\xF1os gestos en casa ayudan a reducir el consumo de energ\xEDa y a cuidar el planeta. Campa\xF1a de ahorro energ\xE9tico."
      ],
      credit: CREDIT
    },
    prompt: "A campanha tem como objetivo",
    correct: "incentivar a economia de energia el\xE9trica nas resid\xEAncias.",
    distractors: [
      "vender l\xE2mpadas mais potentes.",
      "anunciar um corte programado de energia.",
      "informar o aumento da tarifa de luz.",
      "promover a instala\xE7\xE3o de novos postes."
    ],
    explanation: "\u201CApaga la luz que no usas\u201D e \u201Cahorro energ\xE9tico\u201D (economia de energia) indicam uma campanha de conscientiza\xE7\xE3o para reduzir o consumo."
  }),
  buildQuestion({
    id: "esp-4",
    topicId: "esp-interpretacao",
    difficulty: "dificil",
    skill: "Identificar posicionamentos em textos de opini\xE3o em espanhol",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "Se dice que los j\xF3venes ya no leen. Sin embargo, nunca se ha le\xEDdo tanto: mensajes, foros, rese\xF1as, fanfics. Quiz\xE1s la pregunta no sea si leen, sino qu\xE9 y c\xF3mo leen."
      ],
      credit: CREDIT
    },
    prompt: "O autor do texto",
    correct: "questiona a ideia de que os jovens n\xE3o leem, propondo outra abordagem.",
    distractors: [
      "confirma que os jovens abandonaram a leitura.",
      "defende a proibi\xE7\xE3o das redes sociais.",
      "afirma que apenas livros impressos s\xE3o leitura.",
      "critica os fanfics como literatura de baixa qualidade."
    ],
    explanation: "Com \u201CSin embargo\u201D (no entanto), o autor contesta o senso comum e sugere discutir o que e como os jovens leem."
  }),
  buildQuestion({
    id: "esp-5",
    topicId: "esp-interpretacao",
    difficulty: "facil",
    skill: "Compreender informa\xE7\xF5es expl\xEDcitas em textos em espanhol",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "Biblioteca Municipal \u2014 Horario de atenci\xF3n: de lunes a viernes, de 9 a 18 horas; s\xE1bados, de 9 a 13 horas. Los domingos permanecemos cerrados."
      ],
      credit: CREDIT
    },
    prompt: "De acordo com o aviso, a biblioteca",
    correct: "n\xE3o abre aos domingos.",
    distractors: [
      "funciona aos s\xE1bados at\xE9 as 18 horas.",
      "abre todos os dias da semana.",
      "atende apenas no per\xEDodo da tarde.",
      "fecha \xE0s 13 horas de segunda a sexta."
    ],
    explanation: "\u201CLos domingos permanecemos cerrados\u201D significa que a biblioteca fica fechada aos domingos."
  }),
  buildQuestion({
    id: "esp-6",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Relacionar textos em espanhol a aspectos culturais",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "El D\xEDa de Muertos, celebrado en M\xE9xico el 1 y 2 de noviembre, no es una fecha triste. Las familias construyen altares con flores de cempas\xFAchil, fotograf\xEDas y la comida favorita de sus seres queridos, para recibirlos con alegr\xEDa."
      ],
      credit: CREDIT
    },
    prompt: "O texto apresenta o D\xEDa de Muertos como uma celebra\xE7\xE3o",
    correct: "festiva de homenagem e mem\xF3ria aos entes falecidos.",
    distractors: [
      "proibida pelas autoridades mexicanas.",
      "marcada exclusivamente pelo luto e pelo sil\xEAncio.",
      "de origem recente, criada por empresas de turismo.",
      "dedicada \xE0s colheitas de flores do outono."
    ],
    explanation: "O texto afirma que a data \u201Cno es una fecha triste\u201D e descreve altares para receber os entes queridos \u201Ccon alegr\xEDa\u201D."
  })
];
var LINGUAGENS_QUESTIONS = [
  ...figurasQs,
  ...funcoesQs,
  ...variacaoQs2,
  ...generosQs,
  ...interpretacaoQs,
  ...literaturaQs,
  ...artesQs,
  ...inglesQs,
  ...espanholQs
];

// legacy/src/data/fixtures/questions/index.ts
var QUESTION_BANK = [
  ...LINGUAGENS_QUESTIONS,
  ...HUMANAS_QUESTIONS,
  ...NATUREZA_QUESTIONS,
  ...MATEMATICA_QUESTIONS
];
var QUESTION_BY_ID = Object.fromEntries(QUESTION_BANK.map((q) => [q.id, q]));

// legacy/src/lib/repositories/questionRepository.ts
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
        [q.prompt, ...q.support?.paragraphs ?? [], q.skill, TOPIC_BY_ID[q.topicId]?.name, SUBJECT_BY_ID[q.subjectId].name].join(" ")
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
var DEMO_ACCOUNT_ID = "demo-marina";
var DEMO_EMAIL = "demo@gabaritei.app";
var MIN = 6e4;
var DAY3 = 864e5;
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
var STRENGTH = {
  portugues: 0.72,
  literatura: 0.66,
  ingles: 0.74,
  espanhol: 0.64,
  artes: 0.64,
  historia: 0.68,
  geografia: 0.63,
  filosofia: 0.58,
  sociologia: 0.65,
  biologia: 0.6,
  fisica: 0.38,
  quimica: 0.34,
  matematica: 0.44
};
var DIFFICULTY_ADJ = { facil: 0.12, media: 0, dificil: -0.14 };
function answerFor(q, rng, progress, bias = 0) {
  const p = Math.min(0.96, Math.max(0.08, STRENGTH[q.subjectId] + DIFFICULTY_ADJ[q.difficulty] + progress * 0.12 + bias));
  const correct = rng() < p;
  if (correct) return { letter: q.correct, correct };
  const wrong = LETTERS.filter((l) => l !== q.correct);
  return { letter: pick(wrong, rng), correct };
}
function timeFor(q, rng) {
  const base = q.difficulty === "facil" ? 70 : q.difficulty === "media" ? 120 : 170;
  return Math.round((base + rng() * 90) * 1e3);
}
var PRACTICE_SUBJECT_WEIGHTS = [
  ["matematica", 5],
  ["quimica", 3],
  ["fisica", 3],
  ["biologia", 2],
  ["portugues", 3],
  ["historia", 2],
  ["geografia", 2],
  ["literatura", 1],
  ["filosofia", 1],
  ["sociologia", 1],
  ["artes", 1]
];
function weightedSubject(rng) {
  const total = PRACTICE_SUBJECT_WEIGHTS.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [s, w] of PRACTICE_SUBJECT_WEIGHTS) {
    r -= w;
    if (r <= 0) return s;
  }
  return "matematica";
}
function seededId(prefix, n) {
  return `${prefix}-${n.toString().padStart(3, "0")}`;
}
function buildPractice(b) {
  const session = createPracticeSession({
    id: b.id,
    mode: b.mode ?? "custom",
    title: b.title,
    questionIds: b.questions.map((q) => q.id),
    filters: {
      subjectId: b.subjectId ?? null,
      topicIds: Array.from(new Set(b.questions.map((q) => q.topicId))),
      subtopicIds: [],
      years: [],
      count: b.questions.length
    },
    timerVisible: true,
    now: b.start
  });
  const answeredCount = b.answeredCount ?? b.questions.length;
  let t2 = b.start;
  let elapsed = 0;
  b.questions.forEach((q, i) => {
    if (i >= answeredCount) return;
    const spent = timeFor(q, b.rng);
    t2 = Math.min(t2 + spent, b.now - 1e3);
    elapsed += spent;
    const ans = b.allCorrect ? { letter: q.correct, correct: true } : answerFor(q, b.rng, b.progress, b.bias);
    session.answers[q.id] = {
      questionId: q.id,
      selected: ans.letter,
      confirmed: true,
      correct: ans.correct,
      answeredAt: new Date(t2).toISOString(),
      timeSpentMs: spent
    };
  });
  const finished = answeredCount >= b.questions.length;
  session.clock = { elapsedMs: elapsed + Math.round(elapsed * 0.08), runningSince: null };
  session.cursorElapsedMs = session.clock.elapsedMs;
  session.currentIndex = finished ? b.questions.length - 1 : answeredCount;
  session.status = finished ? "completed" : "in_progress";
  session.completedAt = finished ? new Date(t2).toISOString() : null;
  session.updatedAt = new Date(t2).toISOString();
  return session;
}
function questionsForSubject(subjectId, count, rng) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const topics = sample(
    subject.topics.map((t2) => t2.id),
    Math.min(subject.topics.length, 1 + Math.floor(rng() * 2)),
    rng
  );
  let pool = QUESTION_BANK.filter((q) => topics.includes(q.topicId));
  if (pool.length < count) pool = QUESTION_BANK.filter((q) => q.subjectId === subjectId);
  return shuffle(pool, rng).slice(0, count);
}
function practiceTitle(qs) {
  const topics = Array.from(new Set(qs.map((q) => TOPIC_BY_ID[q.topicId]?.name)));
  return topics.length === 1 ? topics[0] : topics.length === 2 ? `${topics[0]} e ${topics[1]}` : `${topics[0]} e mais ${topics.length - 1}`;
}
function buildSimulation(b) {
  const sim = createSimulationSession({
    id: b.id,
    config: b.config,
    records: [],
    difficultSubjects: [],
    now: b.at,
    timerHidden: false,
    seed: b.id
  });
  const limit = b.answeredCount ?? sim.questionIds.length;
  const elapsed = Math.round(sim.config.durationMs * b.usage);
  const per = Math.round(elapsed / Math.max(1, limit));
  sim.questionIds.forEach((qid, i) => {
    if (i >= limit) return;
    const q = QUESTION_BY_ID[qid];
    const blank = b.completed && b.rng() < 0.04;
    const ans = answerFor(q, b.rng, b.progress, -0.03);
    sim.answers[qid] = {
      questionId: qid,
      selected: blank ? null : ans.letter,
      answeredAt: blank ? null : new Date(b.at + per * (i + 1)).toISOString(),
      timeSpentMs: per
    };
  });
  sim.marked = b.completed ? [] : sample(sim.questionIds.slice(0, limit), 2, b.rng);
  sim.clock = { elapsedMs: elapsed, runningSince: null };
  sim.cursorElapsedMs = elapsed;
  sim.currentIndex = b.completed ? 0 : limit;
  const endAt = Math.min(b.at + elapsed, b.now - 1e3);
  sim.updatedAt = new Date(endAt).toISOString();
  if (b.completed) {
    sim.status = "completed";
    sim.completedAt = new Date(endAt).toISOString();
    sim.finishReason = "manual";
  }
  return sim;
}
function createDemoAccount(now) {
  const rng = createRng("gabaritei-demo-v1");
  const account = createEmptyAccount({ id: DEMO_ACCOUNT_ID, kind: "demo", name: "Marina Alves", email: DEMO_EMAIL, now: now - 120 * DAY3 });
  account.profile = {
    ...account.profile,
    nickname: "Mari",
    school: "Escola Estadual Professora Ana Lins",
    city: "Recife, PE",
    bio: "3\xBA ano do ensino m\xE9dio. Quero cursar Engenharia Ambiental em uma universidade p\xFAblica."
  };
  account.onboarding = {
    status: "completed",
    goal: "universidade_publica",
    edition: new Date(now).getFullYear() + (new Date(now).getMonth() >= 10 ? 1 : 0),
    difficultSubjects: ["matematica", "quimica", "fisica"],
    level: "intermediario",
    finishedAt: new Date(now - 118 * DAY3).toISOString()
  };
  account.study = { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 };
  account.goals = [
    { kind: "weekly_questions", target: 80, enabled: true },
    { kind: "weekly_accuracy", target: 70, enabled: true },
    { kind: "weekly_study_days", target: 5, enabled: true },
    { kind: "monthly_simulations", target: 3, enabled: true }
  ];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const startDay = 110;
  const practice2 = [];
  let n = 1;
  for (let d = startDay; d >= 1; d--) {
    const active = d <= 12 || rng() < 0.6;
    if (!active) continue;
    const progress = (startDay - d) / startDay;
    const sessions = rng() < 0.3 ? 2 : 1;
    for (let s = 0; s < sessions; s++) {
      const subject = weightedSubject(rng);
      const count = 5 + Math.floor(rng() * 10);
      const qs = questionsForSubject(subject, count, rng);
      const hour = s === 0 ? 14 + Math.floor(rng() * 3) : 19 + Math.floor(rng() * 2);
      const start = today.getTime() - d * DAY3 + hour * 36e5 + Math.floor(rng() * 50) * MIN;
      practice2.push(buildPractice({ id: seededId("demo-lista", n++), questions: qs, start, progress, rng, title: practiceTitle(qs), subjectId: subject, now }));
    }
  }
  const perfectQs = questionsForSubject("portugues", 6, rng);
  practice2.push(
    buildPractice({ id: seededId("demo-lista", n++), questions: perfectQs, start: today.getTime() - 40 * DAY3 + 15 * 36e5, progress: 0.6, rng, title: practiceTitle(perfectQs), allCorrect: true, subjectId: "portugues", now })
  );
  const partialAccount = { practiceSessions: practice2, simulations: [] };
  const wrongSoFar = collectAnswerRecords(partialAccount).filter((r) => !r.correct);
  for (const [i, dAgo] of [[0, 20], [1, 6]]) {
    const ids = Array.from(new Set(wrongSoFar.slice(i * 40, i * 40 + 40).map((r) => r.questionId))).slice(0, 8);
    const qs = ids.map((id) => QUESTION_BY_ID[id]);
    practice2.push(
      buildPractice({ id: seededId("demo-lista", n++), questions: qs, start: today.getTime() - dAgo * DAY3 + 20 * 36e5, progress: 0.8, rng, title: "Revis\xE3o de erros", mode: "retry", bias: 0.08, now })
    );
  }
  const todayQs = questionsForSubject("matematica", 8, rng);
  const todayStart = Math.min(Math.max(today.getTime() + 5 * MIN, now - 100 * MIN), now - MIN);
  practice2.push(
    buildPractice({ id: seededId("demo-lista", n++), questions: todayQs, start: todayStart, progress: 1, rng, title: practiceTitle(todayQs), subjectId: "matematica", now })
  );
  const pausedQs = questionsForSubject("quimica", 10, rng);
  practice2.push(
    buildPractice({ id: "demo-lista-interrompida", questions: pausedQs, start: today.getTime() - 1 * DAY3 + 21 * 36e5, progress: 1, rng, title: practiceTitle(pausedQs), answeredCount: 4, subjectId: "quimica", now })
  );
  const year = new Date(now).getFullYear();
  const sims = [
    buildSimulation({
      id: "demo-simulado-001",
      config: { mode: "custom", edition: null, day: null, areaIds: ["natureza", "matematica"], size: 30, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 82 * DAY3 + 9 * 36e5,
      progress: 0.25,
      rng,
      completed: true,
      usage: 0.82,
      now
    }),
    buildSimulation({
      id: "demo-simulado-002",
      config: { mode: "official", edition: year - 3, day: 1, areaIds: [], size: 90, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 54 * DAY3 + 13 * 36e5,
      progress: 0.5,
      rng,
      completed: true,
      usage: 0.93,
      now
    }),
    buildSimulation({
      id: "demo-simulado-003",
      config: { mode: "custom", edition: null, day: null, areaIds: ["linguagens", "humanas", "natureza", "matematica"], size: 45, foreignLanguage: "ingles", criteria: "weak" },
      at: today.getTime() - 31 * DAY3 + 9 * 36e5,
      progress: 0.7,
      rng,
      completed: true,
      usage: 0.88,
      now
    }),
    buildSimulation({
      id: "demo-simulado-004",
      config: { mode: "official", edition: year - 2, day: 2, areaIds: [], size: 90, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 10 * DAY3 + 13 * 36e5,
      progress: 0.9,
      rng,
      completed: true,
      usage: 0.96,
      now
    }),
    buildSimulation({
      id: "demo-simulado-005",
      config: { mode: "custom", edition: null, day: null, areaIds: ["matematica"], size: 20, foreignLanguage: "ingles", criteria: "weak" },
      at: today.getTime() - 3 * DAY3 + 10 * 36e5,
      progress: 1,
      rng,
      completed: true,
      usage: 0.8,
      now
    }),
    buildSimulation({
      id: "demo-simulado-interrompido",
      config: { mode: "custom", edition: null, day: null, areaIds: ["linguagens", "humanas"], size: 30, foreignLanguage: "espanhol", criteria: "balanced" },
      at: today.getTime() - 2 * DAY3 + 15 * 36e5,
      progress: 1,
      rng,
      completed: false,
      answeredCount: 12,
      usage: 0.42,
      now
    })
  ];
  account.practiceSessions = practice2.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  account.simulations = sims;
  const records = collectAnswerRecords(account);
  const answeredIds = Array.from(new Set(records.map((r) => r.questionId)));
  const wrongIds = Array.from(new Set(records.filter((r) => !r.correct).map((r) => r.questionId)));
  account.favorites = sample(answeredIds, 7, rng);
  account.reviewMarks = sample(wrongIds, 5, rng);
  account.celebratedAchievements = evaluateAchievements({ records, account, now }).filter((a) => a.unlocked).map((a) => a.id);
  return account;
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
  createDemoAccount,
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
