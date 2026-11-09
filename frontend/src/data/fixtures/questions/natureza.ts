import type { Question } from "@/types";
import { buildQuestion, conceptQuestions, numericOptions } from "./builder";
import { formatDecimal, formatMoney, formatNumber } from "@/lib/format";

const num = (n: number, max = 2) => formatDecimal(n, max);

/* =========================== FÍSICA =========================== */

const viagens: [string, number, number, number][] = [
  ["Um ônibus intermunicipal", 180, 2, 30],
  ["Uma família, de carro,", 240, 3, 0],
  ["Um ciclista profissional", 90, 2, 30],
  ["Um caminhão de entregas", 330, 5, 30],
];

const velocidadeQs = viagens.map(([who, d, h, m], i) => {
  const t = h + m / 60;
  const v = d / t;
  const fmt = (n: number) => `${num(n, 1)} km/h`;
  const opts = numericOptions(v, [d / (h + m / 100), v / 3.6, d * t / 10, v + 10], fmt);
  return buildQuestion({
    id: `fis-velocidade-${i + 1}`,
    topicId: "fis-cinematica",
    subtopic: "velocidade",
    difficulty: m ? "media" : "facil",
    skill: "Calcular velocidade média e converter unidades de tempo",
    support: { paragraphs: [`${who} percorreu ${d} km em ${h} h${m ? ` e ${m} min` : ""}, incluindo as paradas previstas no trajeto.`] },
    prompt: "A velocidade média desenvolvida nesse percurso foi de",
    ...opts,
    numeric: true,
    explanation: `A velocidade média é a distância total dividida pelo tempo total. ${m ? `Primeiro, convertemos ${h} h e ${m} min em ${num(t)} h (pois ${m} min = ${num(m / 60)} h). ` : ""}Assim, vₘ = ${d} ÷ ${num(t)} = ${num(v, 1)} km/h.`,
  });
});

const frenagens: [number, number][] = [
  [72, 5],
  [108, 6],
  [54, 3],
];

const frenagemQs = frenagens.map(([kmh, a], i) => {
  const v = kmh / 3.6;
  const dist = (v * v) / (2 * a);
  const fmt = (n: number) => `${num(n, 1)} m`;
  const opts = numericOptions(dist, [(kmh * kmh) / (2 * a), v / a, dist * 2, v * (v / a)], fmt);
  return buildQuestion({
    id: `fis-mruv-${i + 1}`,
    topicId: "fis-cinematica",
    subtopic: "mruv",
    difficulty: "dificil",
    skill: "Aplicar a equação de Torricelli em situações de frenagem",
    support: {
      paragraphs: [`Um carro trafega a ${kmh} km/h quando o motorista aciona os freios, imprimindo uma desaceleração constante de ${a} m/s² até a parada completa.`],
    },
    prompt: "A distância percorrida durante a frenagem é de",
    ...opts,
    numeric: true,
    explanation: `Convertendo, ${kmh} km/h = ${num(v)} m/s. Pela equação de Torricelli, 0 = v₀² − 2·a·d, logo d = ${num(v)}² ÷ (2 × ${a}) = ${num(dist, 1)} m. Esquecer a conversão de km/h para m/s é o erro mais comum.`,
  });
});

const cinetica: [string, number, number][] = [
  ["um skatista de 60 kg", 60, 5],
  ["uma bola de boliche de 6 kg", 6, 4],
  ["um carro de 1 000 kg", 1000, 20],
];

const cineticaQs = cinetica.map(([who, m, v], i) => {
  const ec = (m * v * v) / 2;
  const fmt = (n: number) => `${formatNumber(n)} J`;
  const opts = numericOptions(ec, [m * v, m * v * v, (m * v) / 2, ec * 2], fmt);
  return buildQuestion({
    id: `fis-energia-cinetica-${i + 1}`,
    topicId: "fis-energia",
    subtopic: "mecanica",
    difficulty: "facil",
    skill: "Calcular a energia cinética de um corpo",
    support: { paragraphs: [`Em determinado instante, ${who} se desloca a ${v} m/s.`] },
    prompt: "A energia cinética associada a esse movimento é de",
    ...opts,
    numeric: true,
    explanation: `A energia cinética é Ec = m·v²/2 = ${formatNumber(m)} × ${v}² ÷ 2 = ${formatNumber(ec)} J. O valor m·v (${formatNumber(m * v)}) corresponde à quantidade de movimento, outra grandeza.`,
  });
});

const potencial: [number, number][] = [
  [50, 12],
  [2, 45],
];

const potencialQs = potencial.map(([m, h], i) => {
  const ep = m * 10 * h;
  const fmt = (n: number) => `${formatNumber(n)} J`;
  const opts = numericOptions(ep, [m * h, m * 9.8 * h * 10, ep / 2, ep * 10], fmt);
  return buildQuestion({
    id: `fis-energia-potencial-${i + 1}`,
    topicId: "fis-energia",
    subtopic: "mecanica",
    difficulty: "facil",
    skill: "Calcular energia potencial gravitacional",
    support: { paragraphs: [`Um objeto de ${m} kg é elevado por um guindaste até uma altura de ${h} m em relação ao solo. Considere g = 10 m/s².`] },
    prompt: "A energia potencial gravitacional do objeto nessa posição, em relação ao solo, é de",
    ...opts,
    numeric: true,
    explanation: `Eₚ = m·g·h = ${m} × 10 × ${h} = ${formatNumber(ep)} J.`,
  });
});

const chuveiros: [number, number, number, number][] = [
  [5500, 20, 30, 0.8],
  [4400, 15, 30, 0.9],
  [6000, 10, 30, 0.75],
  [2000, 30, 30, 0.8],
];

const consumoQs = chuveiros.map(([w, min, dias, tarifa], i) => {
  const kwh = (w / 1000) * (min / 60) * dias;
  const custo = kwh * tarifa;
  const opts = numericOptions(custo, [(w / 1000) * min * dias * tarifa / 10, kwh, (w / 1000) * (min / 60) * tarifa, custo * 2], formatMoney);
  return buildQuestion({
    id: `fis-consumo-${i + 1}`,
    topicId: "fis-eletricidade",
    subtopic: "consumo",
    difficulty: "media",
    skill: "Calcular consumo de energia elétrica e seu custo",
    support: {
      paragraphs: [
        `Em uma residência, um aparelho de ${formatNumber(w)} W fica ligado ${min} minutos por dia, durante ${dias} dias. A distribuidora cobra ${formatMoney(tarifa)} por kWh consumido.`,
      ],
    },
    prompt: "O custo mensal da energia consumida por esse aparelho é de",
    ...opts,
    numeric: true,
    explanation: `Energia = potência × tempo. Em kW e horas: ${num(w / 1000)} kW × ${num(min / 60, 3)} h × ${dias} dias = ${num(kwh, 2)} kWh. O custo é ${num(kwh, 2)} × ${formatMoney(tarifa)} = ${formatMoney(custo)}.`,
  });
});

const resistores: [number, number][] = [
  [220, 10],
  [12, 4],
  [127, 50],
];

const ohmQs = resistores.map(([u, i2], i) => {
  const r = u / i2;
  const fmt = (n: number) => `${num(n, 1)} Ω`;
  const opts = numericOptions(r, [u * i2, i2 / u, u - i2, u + i2], fmt);
  return buildQuestion({
    id: `fis-ohm-${i + 1}`,
    topicId: "fis-eletricidade",
    subtopic: "ohm",
    difficulty: "facil",
    skill: "Aplicar a primeira lei de Ohm",
    support: { paragraphs: [`Um resistor ôhmico é ligado a uma tensão de ${u} V e passa a ser percorrido por uma corrente de ${num(i2)} A.`] },
    image: i === 0 ? { src: "/questoes/circuito.svg", alt: "Circuito simples com uma fonte de tensão ligada a um resistor e um amperímetro em série.", caption: "Circuito utilizado no experimento.", width: 560, height: 300 } : undefined,
    prompt: "A resistência elétrica desse resistor é de",
    ...opts,
    numeric: true,
    explanation: `Pela lei de Ohm, U = R·i, então R = U ÷ i = ${u} ÷ ${num(i2)} = ${num(r, 1)} Ω. O produto U·i (${formatNumber(u * i2)}) corresponde à potência, em watts.`,
  });
});

const aquecimentos: [number, number, number][] = [
  [500, 20, 80],
  [200, 25, 100],
  [1000, 15, 45],
];

const calorQs = aquecimentos.map(([m, t0, t1], i) => {
  const q = m * (t1 - t0);
  const fmt = (n: number) => `${formatNumber(n)} cal`;
  const opts = numericOptions(q, [m * t1, m * t0, m + (t1 - t0), q / 10], fmt);
  return buildQuestion({
    id: `fis-calorimetria-${i + 1}`,
    topicId: "fis-termologia",
    subtopic: "calorimetria",
    difficulty: "facil",
    skill: "Calcular quantidade de calor sensível",
    support: { paragraphs: [`Para preparar um chá, ${m} g de água são aquecidos de ${t0} °C até ${t1} °C. O calor específico da água é 1 cal/(g·°C) e não há perdas para o ambiente.`] },
    prompt: "A quantidade de calor absorvida pela água foi de",
    ...opts,
    numeric: true,
    explanation: `Q = m·c·ΔT = ${m} × 1 × (${t1} − ${t0}) = ${formatNumber(q)} cal. A variação de temperatura, e não a temperatura final, entra no cálculo.`,
  });
});

const ondasQs = [
  buildQuestion({
    id: "fis-ondas-1",
    topicId: "fis-ondas",
    difficulty: "media",
    skill: "Relacionar velocidade, frequência e comprimento de onda",
    support: { paragraphs: ["Uma emissora de rádio FM transmite na frequência de 100 MHz. As ondas de rádio se propagam no ar com velocidade aproximada de 3 × 10⁸ m/s."] },
    prompt: "O comprimento de onda dessas ondas é de aproximadamente",
    correct: "3 m",
    distractors: ["0,3 m", "30 m", "300 m", "3.000 m"],
    numeric: true,
    explanation: "Pela equação fundamental da ondulatória, v = λ·f. Assim, λ = 3 × 10⁸ ÷ (100 × 10⁶) = 3 m.",
  }),
  buildQuestion({
    id: "fis-ondas-2",
    topicId: "fis-ondas",
    difficulty: "facil",
    skill: "Relacionar velocidade, frequência e comprimento de onda",
    support: { paragraphs: ["Um diapasão emite um som de 680 Hz. Considere que o som se propaga no ar a 340 m/s."] },
    prompt: "O comprimento de onda desse som no ar é de",
    correct: "0,5 m",
    distractors: ["2 m", "0,2 m", "5 m", "1,5 m"],
    numeric: true,
    explanation: "λ = v ÷ f = 340 ÷ 680 = 0,5 m. Inverter a razão (680 ÷ 340 = 2) é um erro frequente.",
  }),
  buildQuestion({
    id: "fis-ondas-3",
    topicId: "fis-ondas",
    difficulty: "media",
    skill: "Reconhecer propriedades das ondas sonoras",
    support: { paragraphs: ["Ao ouvir uma mesma nota musical tocada por um violão e por uma flauta, com mesma intensidade e mesma altura, uma pessoa consegue distinguir os dois instrumentos."] },
    prompt: "A característica do som que permite essa distinção é o(a)",
    correct: "timbre.",
    distractors: ["frequência.", "intensidade.", "velocidade de propagação.", "comprimento de onda."],
    explanation: "O timbre depende da composição de harmônicos produzida por cada fonte. Como a nota (frequência) e a intensidade são iguais, é o timbre que diferencia os instrumentos.",
  }),
];

const densidadeQs = [
  buildQuestion({
    id: "fis-densidade-1",
    topicId: "fis-hidrostatica",
    subtopic: "densidade",
    difficulty: "facil",
    skill: "Calcular densidade e prever flutuação",
    support: { paragraphs: ["Um bloco maciço de 400 g ocupa um volume de 500 cm³. A densidade da água é 1 g/cm³."] },
    prompt: "Com base na densidade do bloco, ao ser colocado em água ele",
    correct: "flutuará, pois sua densidade é 0,8 g/cm³.",
    distractors: [
      "afundará, pois sua densidade é 1,25 g/cm³.",
      "afundará, pois sua massa é maior que 1 g.",
      "flutuará, pois sua densidade é 1,25 g/cm³.",
      "ficará em equilíbrio no fundo, pois sua densidade é 1 g/cm³.",
    ],
    explanation: "d = m ÷ V = 400 ÷ 500 = 0,8 g/cm³. Como é menor que a densidade da água, o bloco flutua, com parte do volume submersa.",
  }),
  buildQuestion({
    id: "fis-densidade-2",
    topicId: "fis-hidrostatica",
    subtopic: "densidade",
    difficulty: "media",
    skill: "Calcular massa a partir da densidade",
    support: { paragraphs: ["O etanol tem densidade aproximada de 0,8 kg/L. Um tanque de combustível foi abastecido com 50 L de etanol."] },
    prompt: "A massa de etanol colocada no tanque é de aproximadamente",
    correct: "40 kg",
    distractors: ["62,5 kg", "50 kg", "4 kg", "400 kg"],
    numeric: true,
    explanation: "m = d·V = 0,8 × 50 = 40 kg. Dividir o volume pela densidade (62,5) resultaria em unidade incorreta.",
  }),
  buildQuestion({
    id: "fis-pressao-1",
    topicId: "fis-hidrostatica",
    subtopic: "pressao",
    difficulty: "media",
    skill: "Calcular pressão hidrostática",
    support: { paragraphs: ["Um mergulhador está a 20 m de profundidade no mar. Considere a densidade da água 1 000 kg/m³ e g = 10 m/s²."] },
    prompt: "A pressão exercida apenas pela coluna de água sobre o mergulhador é de",
    correct: "2 × 10⁵ Pa",
    distractors: ["2 × 10³ Pa", "2 × 10⁴ Pa", "2 × 10⁶ Pa", "1 × 10⁵ Pa"],
    explanation: "p = ρ·g·h = 1 000 × 10 × 20 = 200 000 Pa = 2 × 10⁵ Pa, o equivalente a cerca de 2 atm além da pressão atmosférica.",
  }),
];

/* =========================== QUÍMICA =========================== */

const solucoes: [string, number, number][] = [
  ["sal de cozinha", 18, 0.5],
  ["açúcar", 120, 2],
  ["hidróxido de sódio", 8, 0.25],
];

const concQs = solucoes.map(([soluto, m, v], i) => {
  const c = m / v;
  const fmt = (n: number) => `${num(n, 1)} g/L`;
  const opts = numericOptions(c, [m * v, v / m, m / (v * 1000), c / 2], fmt);
  return buildQuestion({
    id: `qui-concentracao-${i + 1}`,
    topicId: "qui-solucoes",
    subtopic: "concentracao",
    difficulty: "facil",
    skill: "Calcular a concentração comum de soluções",
    support: { paragraphs: [`Em uma aula prática, ${m} g de ${soluto} foram dissolvidos em água até completar ${num(v)} L de solução.`] },
    prompt: "A concentração comum da solução obtida é de",
    ...opts,
    numeric: true,
    explanation: `C = m ÷ V = ${m} g ÷ ${num(v)} L = ${num(c, 1)} g/L.`,
  });
});

const diluicoes: [number, number, number][] = [
  [10, 200, 1000],
  [40, 50, 400],
  [6, 300, 900],
];

const diluicaoQs = diluicoes.map(([c1, v1, v2], i) => {
  const c2 = (c1 * v1) / v2;
  const fmt = (n: number) => `${num(n, 2)} g/L`;
  const opts = numericOptions(c2, [(c1 * v2) / v1, c1 * (v2 - v1) / v2, c1 / 2, c2 * 10], fmt);
  return buildQuestion({
    id: `qui-diluicao-${i + 1}`,
    topicId: "qui-solucoes",
    subtopic: "diluicao",
    difficulty: "media",
    skill: "Aplicar a relação de diluição C₁V₁ = C₂V₂",
    support: { paragraphs: [`Um técnico diluiu ${v1} mL de uma solução de concentração ${c1} g/L, adicionando água até atingir ${v2} mL.`] },
    prompt: "A concentração da nova solução é de",
    ...opts,
    numeric: true,
    explanation: `Na diluição a massa de soluto se conserva: C₁·V₁ = C₂·V₂. Logo, C₂ = ${c1} × ${v1} ÷ ${v2} = ${num(c2, 2)} g/L.`,
  });
});

const moleculas: [string, string, number, number][] = [
  ["água (H₂O)", "H = 1; O = 16", 18, 3],
  ["gás carbônico (CO₂)", "C = 12; O = 16", 44, 2],
  ["glicose (C₆H₁₂O₆)", "C = 12; H = 1; O = 16", 180, 0.5],
  ["cloreto de sódio (NaCl)", "Na = 23; Cl = 35,5", 58.5, 4],
];

const molQs = moleculas.map(([sub, massas, mm, n], i) => {
  const m = mm * n;
  const fmt = (v: number) => `${num(v, 1)} g`;
  const opts = numericOptions(m, [mm / n, mm, n * 6, mm + n], fmt);
  return buildQuestion({
    id: `qui-mol-${i + 1}`,
    topicId: "qui-estequiometria",
    subtopic: "mol",
    difficulty: i === 2 ? "media" : "facil",
    skill: "Relacionar quantidade de matéria e massa",
    support: { paragraphs: [`Considere as massas atômicas: ${massas}.`] },
    prompt: `A massa correspondente a ${num(n)} mol de ${sub} é de`,
    ...opts,
    numeric: true,
    explanation: `A massa molar de ${sub} é ${num(mm, 1)} g/mol. Portanto, m = n·M = ${num(n)} × ${num(mm, 1)} = ${num(m, 1)} g.`,
  });
});

const estequio = buildQuestion({
  id: "qui-estequiometria-combustao",
  topicId: "qui-estequiometria",
  subtopic: "massa-molar",
  difficulty: "dificil",
  skill: "Realizar cálculos estequiométricos em reações de combustão",
  support: {
    paragraphs: [
      "A combustão completa do metano é representada por CH₄ + 2 O₂ → CO₂ + 2 H₂O. Considere as massas molares: CH₄ = 16 g/mol e CO₂ = 44 g/mol.",
    ],
  },
  prompt: "A queima completa de 32 g de metano libera uma massa de gás carbônico igual a",
  correct: "88 g",
  distractors: ["44 g", "22 g", "64 g", "176 g"],
  numeric: true,
  explanation: "32 g de CH₄ correspondem a 32 ÷ 16 = 2 mol. A proporção CH₄ : CO₂ é 1 : 1, então formam-se 2 mol de CO₂, ou 2 × 44 = 88 g.",
});

const phQs = [
  buildQuestion({
    id: "qui-ph-1",
    topicId: "qui-acido-base",
    difficulty: "facil",
    skill: "Classificar soluções pela escala de pH",
    support: { paragraphs: ["Uma estudante mediu o pH, a 25 °C, de alguns materiais: suco de limão (pH 2), café (pH 5), água pura (pH 7), água do mar (pH 8) e água sanitária (pH 12)."] },
    prompt: "Entre os materiais analisados, o mais básico é o(a)",
    correct: "água sanitária.",
    distractors: ["suco de limão.", "café.", "água pura.", "água do mar."],
    explanation: "A 25 °C, pH acima de 7 indica meio básico; quanto maior o pH, mais básico. A água sanitária, com pH 12, é a mais básica da lista.",
  }),
  buildQuestion({
    id: "qui-ph-2",
    topicId: "qui-acido-base",
    difficulty: "dificil",
    skill: "Relacionar pH e concentração de íons H⁺",
    support: { paragraphs: ["A água de um lago passou de pH 6 para pH 4 após um período de chuvas ácidas."] },
    prompt: "Em relação à situação inicial, a concentração de íons H⁺ na água do lago ficou",
    correct: "100 vezes maior.",
    distractors: ["2 vezes maior.", "10 vezes maior.", "100 vezes menor.", "2 vezes menor."],
    explanation: "A escala de pH é logarítmica: pH = −log[H⁺]. Diminuir o pH em 2 unidades significa multiplicar [H⁺] por 10² = 100.",
  }),
  buildQuestion({
    id: "qui-ph-3",
    topicId: "qui-acido-base",
    difficulty: "media",
    skill: "Compreender reações de neutralização no cotidiano",
    support: { paragraphs: ["Para aliviar a azia, causada pelo excesso de ácido clorídrico no estômago, algumas pessoas utilizam antiácidos à base de hidróxido de magnésio."] },
    prompt: "O alívio ocorre porque o antiácido",
    correct: "reage com o ácido em uma reação de neutralização.",
    distractors: [
      "aumenta a produção de ácido clorídrico.",
      "é um ácido mais forte que o clorídrico.",
      "dissolve as paredes do estômago.",
      "transforma o ácido em gás oxigênio.",
    ],
    explanation: "O hidróxido de magnésio é uma base: reage com o HCl formando sal e água, o que eleva o pH do suco gástrico e reduz a sensação de queimação.",
  }),
];

const ambientalQs = conceptQuestions({
  prefix: "qui-ambiental",
  topicId: "qui-ambiental",
  skill: "Relacionar fenômenos ambientais às substâncias envolvidas",
  prompt: "O fenômeno ambiental descrito é conhecido como",
  items: [
    {
      key: "chuva-acida",
      answer: "chuva ácida.",
      clue: "Óxidos de enxofre e de nitrogênio liberados por indústrias e veículos reagem com a água da atmosfera, formando ácidos que corroem monumentos e afetam lagos e florestas.",
      why: "SO₂ e NOₓ reagem com a água atmosférica formando ácidos sulfúrico e nítrico, que tornam a precipitação mais ácida: é a chuva ácida.",
    },
    {
      key: "efeito-estufa",
      answer: "intensificação do efeito estufa.",
      clue: "O aumento da concentração de gases como CO₂ e metano na atmosfera retém mais radiação infravermelha, elevando a temperatura média do planeta.",
      why: "CO₂ e CH₄ absorvem radiação infravermelha; o aumento de sua concentração intensifica o efeito estufa natural e contribui para o aquecimento global.",
    },
    {
      key: "eutrofizacao",
      answer: "eutrofização.",
      clue: "O despejo de esgoto rico em fosfatos e nitratos em um lago provoca a proliferação de algas, reduzindo o oxigênio dissolvido e causando a morte de peixes.",
      why: "O excesso de nutrientes favorece o crescimento de algas; sua decomposição consome oxigênio dissolvido. Esse processo é a eutrofização.",
    },
    {
      key: "ozonio",
      answer: "destruição da camada de ozônio.",
      clue: "Compostos clorofluorcarbonetos (CFCs), antes usados em aerossóis e refrigeradores, liberam radicais de cloro na estratosfera, reduzindo a proteção contra a radiação ultravioleta.",
      why: "Os radicais de cloro dos CFCs catalisam a decomposição do O₃ estratosférico, diminuindo a filtragem da radiação UV.",
    },
    {
      key: "inversao",
      answer: "inversão térmica.",
      clue: "Em manhãs frias de inverno, uma camada de ar mais quente se forma acima do ar frio próximo ao solo, dificultando a dispersão de poluentes nas grandes cidades.",
      why: "Na inversão térmica o ar frio, mais denso, fica preso sob uma camada quente, impedindo a circulação vertical e concentrando poluentes.",
    },
  ],
  extraDistractors: ["lixiviação.", "assoreamento."],
});

/* =========================== BIOLOGIA =========================== */

const organelaQs = conceptQuestions({
  prefix: "bio-organela",
  topicId: "bio-citologia",
  skill: "Associar organelas celulares às suas funções",
  prompt: "A estrutura celular responsável pela função descrita é o(a)",
  items: [
    {
      key: "mitocondria",
      answer: "mitocôndria.",
      clue: "Células musculares de atletas apresentam grande quantidade de uma organela responsável pela respiração celular aeróbia, que produz ATP a partir da glicose.",
      why: "A mitocôndria realiza as etapas aeróbias da respiração celular, produzindo a maior parte do ATP. Células com alta demanda energética têm muitas mitocôndrias.",
      difficulty: "facil",
    },
    {
      key: "cloroplasto",
      answer: "cloroplasto.",
      clue: "Nas células das folhas, uma organela que contém clorofila converte energia luminosa em energia química, produzindo glicose e liberando oxigênio.",
      why: "O cloroplasto contém clorofila e realiza a fotossíntese, produzindo glicose e O₂ a partir de CO₂, água e luz.",
      difficulty: "facil",
    },
    {
      key: "ribossomo",
      answer: "ribossomo.",
      clue: "Células do pâncreas que produzem grandes quantidades de enzimas digestivas precisam de muitas estruturas que traduzem o RNA mensageiro em cadeias de aminoácidos.",
      why: "Os ribossomos realizam a tradução: leem o RNA mensageiro e unem aminoácidos, sintetizando proteínas.",
    },
    {
      key: "lisossomo",
      answer: "lisossomo.",
      clue: "Glóbulos brancos englobam bactérias e as digerem com o auxílio de vesículas repletas de enzimas hidrolíticas.",
      why: "Lisossomos contêm enzimas digestivas e realizam a digestão intracelular, essencial na defesa feita por fagócitos.",
    },
    {
      key: "golgi",
      answer: "complexo golgiense.",
      clue: "Proteínas produzidas pela célula são modificadas, empacotadas em vesículas e encaminhadas para secreção.",
      why: "O complexo golgiense modifica, armazena e empacota substâncias em vesículas de secreção.",
      difficulty: "dificil",
    },
  ],
  extraDistractors: ["núcleo.", "centríolo.", "vacúolo."],
});

const mendelQs = [
  buildQuestion({
    id: "bio-mendel-1",
    topicId: "bio-genetica",
    difficulty: "media",
    skill: "Calcular probabilidades em cruzamentos monoíbridos",
    support: { paragraphs: ["Em ervilhas, a cor amarela da semente (V) é dominante sobre a verde (v). Duas plantas heterozigotas foram cruzadas."] },
    prompt: "A probabilidade de uma semente descendente ser verde é",
    correct: "1/4",
    distractors: ["1/2", "3/4", "1/3", "0"],
    explanation: "Vv × Vv gera VV, Vv, Vv e vv. Apenas vv (1 em 4) apresenta semente verde, o fenótipo recessivo.",
  }),
  buildQuestion({
    id: "bio-mendel-2",
    topicId: "bio-genetica",
    difficulty: "media",
    skill: "Analisar cruzamentos-teste",
    support: { paragraphs: ["Um criador cruzou um cão de pelagem escura heterozigoto (Ee) com uma cadela de pelagem clara (ee), característica recessiva."] },
    prompt: "A proporção esperada de filhotes de pelagem clara é de",
    correct: "50%",
    distractors: ["25%", "75%", "100%", "0%"],
    numeric: true,
    explanation: "Ee × ee produz metade Ee (escuros) e metade ee (claros). Logo, 50% dos filhotes devem ter pelagem clara.",
  }),
  buildQuestion({
    id: "bio-mendel-3",
    topicId: "bio-genetica",
    difficulty: "dificil",
    skill: "Calcular probabilidades condicionais em genética",
    support: { paragraphs: ["Um casal com pigmentação normal teve um filho albino. O albinismo é uma condição autossômica recessiva. Eles têm outra filha, com pigmentação normal."] },
    prompt: "A probabilidade de essa filha ser portadora do alelo para albinismo é",
    correct: "2/3",
    distractors: ["1/4", "1/2", "3/4", "1/3"],
    explanation: "Os pais são Aa. Entre os descendentes normais (AA, Aa, Aa), dois em três são heterozigotos. Como já se sabe que a filha é normal, a probabilidade é 2/3.",
  }),
];

const relacoesQs = conceptQuestions({
  prefix: "bio-relacao",
  topicId: "bio-ecologia",
  skill: "Identificar relações ecológicas entre seres vivos",
  prompt: "A relação ecológica descrita é classificada como",
  items: [
    {
      key: "liquen",
      answer: "mutualismo.",
      clue: "Nos liquens, algas produzem matéria orgânica pela fotossíntese, enquanto fungos fornecem umidade e sais minerais; nenhum dos dois sobrevive bem isoladamente.",
      why: "Ambas as espécies se beneficiam e a associação é obrigatória: trata-se de mutualismo.",
      subtopic: "relacoes",
    },
    {
      key: "carrapato",
      answer: "parasitismo.",
      clue: "Carrapatos fixam-se à pele de bois e se alimentam de seu sangue, podendo transmitir doenças ao hospedeiro.",
      why: "O carrapato se beneficia e o boi é prejudicado sem ser morto imediatamente: parasitismo.",
      subtopic: "relacoes",
    },
    {
      key: "remora",
      answer: "comensalismo.",
      clue: "Rêmoras se prendem ao corpo de tubarões e se alimentam dos restos das presas deles, sem prejudicá-los.",
      why: "A rêmora aproveita restos de alimento e o tubarão não é prejudicado nem beneficiado: comensalismo.",
      subtopic: "relacoes",
    },
    {
      key: "onca",
      answer: "predação.",
      clue: "No Pantanal, onças-pintadas caçam capivaras e jacarés, que servem como fonte de alimento.",
      why: "Um organismo mata e consome o outro: predação (predatismo).",
      subtopic: "relacoes",
      difficulty: "facil",
    },
    {
      key: "luz",
      answer: "competição.",
      clue: "Em uma floresta densa, árvores de espécies diferentes crescem em altura disputando a luz solar disponível.",
      why: "Espécies diferentes disputam um mesmo recurso limitado, a luz: competição interespecífica.",
      subtopic: "relacoes",
    },
  ],
  extraDistractors: ["inquilinismo.", "amensalismo."],
});

const cadeiaImage = {
  src: "/questoes/cadeia-alimentar.svg",
  alt: "Cadeia alimentar: capim, gafanhoto, sapo, cobra e gavião, ligados por setas no sentido do fluxo de energia.",
  caption: "Representação simplificada de uma cadeia alimentar.",
  width: 680,
  height: 220,
};

const cadeiaQs = [
  buildQuestion({
    id: "bio-cadeia-1",
    topicId: "bio-ecologia",
    subtopic: "cadeias",
    difficulty: "media",
    skill: "Analisar o fluxo de energia nas cadeias alimentares",
    image: cadeiaImage,
    support: { paragraphs: ["Considere que, em média, apenas 10% da energia de um nível trófico é transferida para o nível seguinte, e que o capim fixou 100 000 kcal."] },
    prompt: "A energia disponível para o sapo é de aproximadamente",
    correct: "1.000 kcal",
    distractors: ["10.000 kcal", "100 kcal", "10 kcal", "30.000 kcal"],
    numeric: true,
    explanation: "Do capim (100 000 kcal) ao gafanhoto chegam 10% (10 000 kcal); do gafanhoto ao sapo, novamente 10%: 1 000 kcal.",
  }),
  buildQuestion({
    id: "bio-cadeia-2",
    topicId: "bio-ecologia",
    subtopic: "cadeias",
    difficulty: "facil",
    skill: "Identificar níveis tróficos",
    image: cadeiaImage,
    support: { paragraphs: ["Observe a cadeia alimentar representada."] },
    prompt: "Nessa cadeia, a cobra ocupa o nível de",
    correct: "consumidor terciário.",
    distractors: ["produtor.", "consumidor primário.", "consumidor secundário.", "decompositor."],
    explanation: "Capim é produtor; gafanhoto, consumidor primário; sapo, secundário; cobra, terciário; e o gavião, quaternário.",
  }),
];

const fisiologiaQs = conceptQuestions({
  prefix: "bio-fisiologia",
  topicId: "bio-fisiologia",
  skill: "Relacionar órgãos e estruturas às suas funções no organismo",
  prompt: "A estrutura que desempenha a função descrita é o(a)",
  items: [
    {
      key: "pancreas",
      answer: "pâncreas, por meio da insulina.",
      clue: "Após uma refeição rica em carboidratos, a glicemia aumenta e um hormônio facilita a entrada de glicose nas células, reduzindo o nível de açúcar no sangue.",
      why: "A insulina, produzida pelas células beta do pâncreas, promove a captação de glicose pelas células, reduzindo a glicemia.",
    },
    {
      key: "hemacias",
      answer: "hemácia, por meio da hemoglobina.",
      clue: "Em altitudes elevadas, o organismo passa a produzir mais células sanguíneas responsáveis pelo transporte de oxigênio.",
      why: "As hemácias contêm hemoglobina, proteína que transporta O₂. Em altitudes elevadas, sua produção aumenta.",
    },
    {
      key: "nefron",
      answer: "néfron, nos rins.",
      clue: "Unidades microscópicas filtram o sangue, reabsorvem substâncias úteis e formam a urina.",
      why: "Os néfrons são as unidades funcionais dos rins, responsáveis pela filtração do sangue e formação da urina.",
    },
    {
      key: "alveolos",
      answer: "alvéolo pulmonar.",
      clue: "Pequenas bolsas de parede fina, envolvidas por capilares, permitem que o oxigênio passe para o sangue e o gás carbônico seja eliminado.",
      why: "Nos alvéolos ocorre a hematose: trocas gasosas entre o ar e o sangue dos capilares.",
      difficulty: "facil",
    },
  ],
  extraDistractors: ["fígado, por meio da bile.", "tireoide, por meio da calcitonina."],
});

export const NATUREZA_QUESTIONS: Question[] = [
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
  ...fisiologiaQs,
];
