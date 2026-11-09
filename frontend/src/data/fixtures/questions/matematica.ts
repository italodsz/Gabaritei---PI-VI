import type { Question } from "@/types";
import { buildQuestion, numericOptions } from "./builder";
import { formatDecimal, formatMoney, formatNumber } from "@/lib/format";

const money = (n: number) => formatMoney(Math.round(n * 100) / 100);
const num = (n: number, max = 2) => formatDecimal(n, max);

/* Aumentos e descontos sucessivos ------------------------------------- */
const variacao: [string, number, number, number][] = [
  ["um fone de ouvido", 250, 20, 20],
  ["uma bicicleta", 1500, 10, 10],
  ["uma mochila", 160, 25, 20],
  ["um par de tênis", 400, 30, 30],
  ["uma cafeteira", 360, 15, 20],
  ["um celular", 2000, 40, 25],
];

const variacaoQs = variacao.map(([item, p, a, d], i) => {
  const final = p * (1 + a / 100) * (1 - d / 100);
  const opts = numericOptions(final, [p * (1 + (a - d) / 100), p, p * (1 + a / 100), p * (1 - d / 100)], money);
  return buildQuestion({
    id: `mat-variacao-${i + 1}`,
    topicId: "mat-porcentagem",
    subtopic: "variacao",
    difficulty: a === d ? "media" : "facil",
    skill: "Resolver situações que envolvem aumentos e descontos percentuais sucessivos",
    support: {
      paragraphs: [
        `Uma loja reajustou em ${a}% o preço de ${item} que custava ${money(p)}. Semanas depois, anunciou uma promoção com ${d}% de desconto sobre o novo preço.`,
      ],
    },
    prompt: "Durante a promoção, o preço desse produto passou a ser",
    ...opts,
    numeric: true,
    explanation: `Um aumento de ${a}% multiplica o preço por ${num(1 + a / 100)}, e um desconto de ${d}% multiplica por ${num(1 - d / 100)}. Assim, ${money(p)} × ${num(1 + a / 100)} × ${num(1 - d / 100)} = ${money(final)}. Percentuais sucessivos não se somam: o desconto incide sobre um valor já reajustado.`,
  });
});

/* Juros compostos ------------------------------------------------------ */
const juros: [number, number, number, string][] = [
  [1000, 10, 2, "ano"],
  [2000, 5, 2, "mês"],
  [5000, 2, 3, "mês"],
  [800, 10, 3, "ano"],
];

const jurosQs = juros.map(([c, i, n, per], k) => {
  const m = c * Math.pow(1 + i / 100, n);
  const simples = c * (1 + (i / 100) * n);
  const opts = numericOptions(m, [simples, m - c, c * (i / 100) * n, c * (1 + i / 100)], money);
  return buildQuestion({
    id: `mat-juros-${k + 1}`,
    topicId: "mat-porcentagem",
    subtopic: "juros",
    difficulty: n === 3 ? "dificil" : "media",
    skill: "Calcular montantes em aplicações a juros compostos",
    support: {
      paragraphs: [
        `Uma estudante aplicou ${money(c)} em um investimento que rende juros compostos de ${i}% ao ${per}. Ela não fez novos depósitos nem retiradas durante ${n} ${per === "mês" ? "meses" : "anos"}.`,
      ],
    },
    prompt: "Ao final desse período, o montante disponível será de",
    ...opts,
    numeric: true,
    explanation: `No regime composto, M = C·(1 + i)ⁿ. Logo, M = ${money(c)} × ${num(1 + i / 100)}^${n} = ${money(m)}. O valor ${money(simples)} corresponderia a juros simples, em que o rendimento não é incorporado ao capital a cada período.`,
  });
});

/* Regra de três ------------------------------------------------------- */
const diretas: { id: string; text: string; ask: string; a: number; b: number; c: number; unit: string }[] = [
  {
    id: "1",
    text: "Uma impressora de uma escola imprime 48 páginas em 3 minutos, funcionando em ritmo constante.",
    ask: "Para imprimir as 400 páginas de uma apostila, essa impressora levará",
    a: 48,
    b: 3,
    c: 400,
    unit: "minutos",
  },
  {
    id: "2",
    text: "Em uma receita de pão de queijo, são usados 500 g de polvilho para produzir 40 unidades.",
    ask: "Para produzir 140 unidades, mantendo a proporção, serão necessários",
    a: 40,
    b: 500,
    c: 140,
    unit: "gramas de polvilho",
  },
  {
    id: "3",
    text: "Um carro consome 6 litros de combustível a cada 75 km percorridos em rodovia.",
    ask: "Em uma viagem de 450 km nas mesmas condições, o consumo será de",
    a: 75,
    b: 6,
    c: 450,
    unit: "litros",
  },
];

const diretasQs = diretas.map((q) => {
  const ans = (q.c * q.b) / q.a;
  const fmt = (n: number) => `${num(n, 1)} ${q.unit}`;
  const opts = numericOptions(ans, [(q.a * q.b) / q.c, (q.c * q.a) / q.b / 10, ans + q.b, ans / 2], fmt);
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
    explanation: `As grandezas são diretamente proporcionais: dobrando uma, a outra também dobra. Assim, ${num(q.b)}/${num(q.a)} = x/${num(q.c)}, o que dá x = ${num(ans, 1)}.`,
  });
});

const inversas: [number, number, number][] = [
  [6, 20, 8],
  [4, 30, 6],
  [10, 12, 15],
];

const inversasQs = inversas.map(([w1, d1, w2], i) => {
  const ans = (w1 * d1) / w2;
  const fmt = (n: number) => `${num(n, 1)} dias`;
  const opts = numericOptions(ans, [(d1 * w2) / w1, d1 - (w2 - w1), d1 + (w2 - w1), d1 / 2], fmt);
  return buildQuestion({
    id: `mat-regra3-inversa-${i + 1}`,
    topicId: "mat-proporcao",
    subtopic: "regra-de-tres",
    difficulty: "media",
    skill: "Resolver problemas com grandezas inversamente proporcionais",
    support: {
      paragraphs: [
        `Em um mutirão comunitário, ${w1} voluntários pintam todas as salas de uma escola em ${d1} dias, trabalhando no mesmo ritmo. Para a próxima reforma, ${w2} voluntários com o mesmo rendimento participarão.`,
      ],
    },
    prompt: "O tempo necessário para pintar todas as salas será de",
    ...opts,
    numeric: true,
    explanation: `Mais voluntários terminam em menos tempo: as grandezas são inversamente proporcionais. O total de trabalho é ${w1} × ${d1} = ${w1 * d1} voluntário-dias; dividindo por ${w2}, obtemos ${num(ans, 1)} dias.`,
  });
});

/* Escala --------------------------------------------------------------- */
const escalas: [number, number][] = [
  [500000, 4],
  [250000, 6],
  [2000000, 3.5],
  [1500000, 8],
];

const escalaQs = escalas.map(([n, cm], i) => {
  const km = (cm * n) / 100000;
  const fmt = (v: number) => `${num(v, 1)} km`;
  const opts = numericOptions(km, [km * 10, km / 10, (cm * n) / 1000000, km * 100], fmt);
  return buildQuestion({
    id: `mat-escala-${i + 1}`,
    topicId: "mat-proporcao",
    subtopic: "escala",
    difficulty: "facil",
    skill: "Utilizar escalas para calcular distâncias reais",
    support: {
      paragraphs: [
        `Em um mapa rodoviário com escala 1 : ${formatNumber(n)}, a distância em linha reta entre duas cidades é de ${num(cm)} cm.`,
      ],
    },
    prompt: "A distância real, em linha reta, entre essas cidades é de",
    ...opts,
    numeric: true,
    explanation: `Na escala 1 : ${formatNumber(n)}, cada 1 cm do mapa equivale a ${formatNumber(n)} cm reais, ou seja, ${num(n / 100000)} km. Logo, ${num(cm)} cm correspondem a ${num(cm)} × ${num(n / 100000)} = ${num(km, 1)} km.`,
  });
});

/* Estatística --------------------------------------------------------- */
const medidas: { id: string; ctx: string; values: number[]; ask: "media" | "mediana"; unit: string }[] = [
  { id: "1", ctx: "As notas de um estudante em sete simulados foram", values: [620, 580, 710, 650, 600, 690, 640], ask: "mediana", unit: "pontos" },
  { id: "2", ctx: "As temperaturas máximas registradas em uma cidade durante uma semana foram", values: [28, 31, 27, 30, 33, 29, 32], ask: "media", unit: "°C" },
  { id: "3", ctx: "O número de livros emprestados por dia em uma biblioteca escolar, ao longo de uma semana, foi", values: [12, 18, 9, 15, 21, 18, 12], ask: "media", unit: "livros" },
  { id: "4", ctx: "Os tempos, em minutos, que oito estudantes levaram para resolver uma lista foram", values: [42, 35, 50, 38, 47, 40, 55, 44], ask: "mediana", unit: "minutos" },
  { id: "5", ctx: "As idades dos integrantes de um grupo de estudos são", values: [16, 17, 19, 18, 17, 21, 16, 20, 18], ask: "mediana", unit: "anos" },
];

const medidasQs = medidas.map((m) => {
  const sorted = m.values.slice().sort((a, b) => a - b);
  const mean = m.values.reduce((a, b) => a + b, 0) / m.values.length;
  const mid = sorted.length / 2;
  const median = sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
  const unsortedMiddle = m.values[Math.floor(m.values.length / 2)];
  const ans = m.ask === "media" ? mean : median;
  const other = m.ask === "media" ? median : mean;
  const fmt = (v: number) => `${num(v, 1)} ${m.unit}`;
  const opts = numericOptions(ans, [other, unsortedMiddle, sorted[sorted.length - 1] - sorted[0], (sorted[0] + sorted[sorted.length - 1]) / 2], fmt);
  return buildQuestion({
    id: `mat-medidas-${m.id}`,
    topicId: "mat-estatistica",
    subtopic: "medidas",
    difficulty: m.ask === "mediana" ? "media" : "facil",
    skill: "Calcular medidas de tendência central em conjuntos de dados",
    support: { paragraphs: [`${m.ctx}: ${m.values.join("; ")}.`] },
    prompt: `A ${m.ask === "media" ? "média aritmética" : "mediana"} desses valores é`,
    ...opts,
    numeric: true,
    explanation:
      m.ask === "media"
        ? `A média é a soma dos valores dividida pela quantidade: ${m.values.reduce((a, b) => a + b, 0)} ÷ ${m.values.length} = ${num(mean, 1)}. A mediana (${num(median, 1)}) é outra medida, obtida após ordenar os dados.`
        : `Para a mediana, ordenamos os dados: ${sorted.join("; ")}. ${sorted.length % 2 ? `Com ${sorted.length} valores, o termo central é o ${Math.ceil(mid)}º` : `Com ${sorted.length} valores, fazemos a média dos dois termos centrais`}, resultando em ${num(median, 1)}. Usar o valor central sem ordenar é um erro comum.`,
  });
});

/* Leitura de gráfico (imagem) ----------------------------------------- */
const chuvaImage = {
  src: "/questoes/chuvas-semestre.svg",
  alt: "Gráfico de barras com a precipitação mensal de janeiro a junho: janeiro 180 mm, fevereiro 210 mm, março 150 mm, abril 80 mm, maio 60 mm e junho 40 mm.",
  caption: "Precipitação acumulada por mês em um município (dados fictícios).",
  width: 640,
  height: 380,
};

const graficoQs = [
  buildQuestion({
    id: "mat-grafico-1",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "facil",
    skill: "Interpretar informações apresentadas em gráficos de barras",
    support: { paragraphs: ["A Defesa Civil de um município divulgou o gráfico a seguir, com a precipitação acumulada em cada mês do primeiro semestre."] },
    image: chuvaImage,
    prompt: "A maior redução de precipitação em relação ao mês anterior ocorreu na passagem de",
    correct: "março para abril.",
    distractors: ["janeiro para fevereiro.", "fevereiro para março.", "abril para maio.", "maio para junho."],
    explanation: "As variações foram: jan→fev +30 mm; fev→mar −60 mm; mar→abr −70 mm; abr→mai −20 mm; mai→jun −20 mm. A maior redução, de 70 mm, aconteceu de março para abril.",
  }),
  buildQuestion({
    id: "mat-grafico-2",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "media",
    skill: "Calcular a média a partir de dados de um gráfico",
    support: { paragraphs: ["O gráfico apresenta a precipitação mensal registrada em um município ao longo do primeiro semestre."] },
    image: chuvaImage,
    prompt: "A quantidade de meses em que a precipitação ficou acima da média mensal do semestre foi",
    correct: "3",
    distractors: ["1", "2", "4", "5"],
    numeric: true,
    explanation: "A soma é 180 + 210 + 150 + 80 + 60 + 40 = 720 mm, e a média mensal é 720 ÷ 6 = 120 mm. Ficaram acima desse valor janeiro, fevereiro e março: 3 meses.",
  }),
  buildQuestion({
    id: "mat-grafico-3",
    topicId: "mat-estatistica",
    subtopic: "graficos",
    difficulty: "media",
    skill: "Relacionar dados de gráficos a porcentagens",
    support: { paragraphs: ["Observe o gráfico com a precipitação mensal de um município no primeiro semestre."] },
    image: chuvaImage,
    prompt: "A precipitação de junho corresponde a que porcentagem da precipitação de fevereiro, aproximadamente?",
    correct: "19%",
    distractors: ["4%", "17%", "25%", "81%"],
    numeric: true,
    explanation: "Basta dividir 40 por 210: 40 ÷ 210 ≈ 0,19, ou seja, cerca de 19%. O valor 81% seria a redução percentual, não a razão pedida.",
  }),
];

/* Função afim --------------------------------------------------------- */
const taxi: [number, number, number][] = [
  [5, 2.5, 12],
  [6.5, 3, 8],
  [4.8, 2.2, 15],
];

const taxiQs = taxi.map(([fixo, km, dist], i) => {
  const total = fixo + km * dist;
  const opts = numericOptions(total, [km * dist, (fixo + km) * dist, fixo * dist + km, total + km], money);
  return buildQuestion({
    id: `mat-afim-taxi-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "afim",
    difficulty: "facil",
    skill: "Modelar situações com funções afins",
    support: {
      paragraphs: [
        `Em uma cidade, a tarifa de táxi é composta por uma bandeirada fixa de ${money(fixo)} mais ${money(km)} por quilômetro rodado.`,
      ],
    },
    prompt: `O valor a ser pago por uma corrida de ${dist} km é`,
    ...opts,
    numeric: true,
    explanation: `A tarifa é uma função afim: P(x) = ${num(fixo)} + ${num(km)}x. Para x = ${dist}, P = ${num(fixo)} + ${num(km)} × ${dist} = ${money(total)}.`,
  });
});

const planos: [number, number, number][] = [
  [49.9, 12, 109.9],
  [39, 8, 87],
];

const planoQs = planos.map(([fixo, gb, pago], i) => {
  const extra = (pago - fixo) / gb;
  const fmt = (n: number) => `${num(n, 1)} GB`;
  const opts = numericOptions(extra, [pago / gb, extra + 1, extra - 1, (pago + fixo) / gb], fmt);
  return buildQuestion({
    id: `mat-afim-plano-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "afim",
    difficulty: "media",
    skill: "Resolver equações do 1º grau em contextos de consumo",
    support: {
      paragraphs: [
        `Um plano de internet móvel custa ${money(fixo)} por mês, com franquia inclusa. Cada gigabyte adicional consumido é cobrado a ${money(gb)}. Em determinado mês, a fatura de um cliente foi de ${money(pago)}.`,
      ],
    },
    prompt: "A quantidade de gigabytes adicionais consumidos por esse cliente no mês foi",
    ...opts,
    numeric: true,
    explanation: `A fatura segue F(x) = ${num(fixo)} + ${num(gb)}x. Igualando a ${num(pago)}: ${num(gb)}x = ${num(pago - fixo)}, logo x = ${num(extra, 1)} GB.`,
  });
});

/* Função quadrática --------------------------------------------------- */
const projeteis = [20, 30, 10, 40];
const projetilQs = projeteis.map((v, i) => {
  const hmax = (v * v) / 20;
  const fmt = (n: number) => `${num(n, 1)} m`;
  const opts = numericOptions(hmax, [v / 10, (v * v) / 10, v / 2, v * 2], fmt);
  return buildQuestion({
    id: `mat-quadratica-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "quadratica",
    difficulty: "dificil",
    skill: "Determinar o valor máximo de uma função quadrática",
    support: {
      paragraphs: [
        `Durante uma feira de ciências, um foguete de água foi lançado verticalmente. Sua altura h, em metros, t segundos após o lançamento, é descrita por h(t) = −5t² + ${v}t.`,
      ],
    },
    prompt: "A altura máxima atingida pelo foguete foi de",
    ...opts,
    numeric: true,
    explanation: `O máximo ocorre no vértice: t = −b/(2a) = −${v}/(2·(−5)) = ${num(v / 10)} s. Substituindo, h = −5·(${num(v / 10)})² + ${v}·${num(v / 10)} = ${num(hmax, 1)} m.`,
  });
});

/* Exponencial --------------------------------------------------------- */
const bacterias: [number, number, number][] = [
  [500, 3, 12],
  [200, 2, 10],
  [1000, 4, 16],
  [50, 5, 30],
];

const expQs = bacterias.map(([n0, h, total], i) => {
  const n = n0 * Math.pow(2, total / h);
  const fmt = (v: number) => `${formatNumber(v)} bactérias`;
  const opts = numericOptions(n, [n0 * 2 * (total / h), n0 * (total / h), n / 2, n * 2], fmt);
  return buildQuestion({
    id: `mat-exponencial-${i + 1}`,
    topicId: "mat-funcoes",
    subtopic: "exponencial",
    difficulty: "media",
    skill: "Reconhecer e calcular crescimentos exponenciais",
    support: {
      paragraphs: [
        `Em um experimento, uma cultura com ${formatNumber(n0)} bactérias dobra de tamanho a cada ${h} horas, mantidas as condições do laboratório.`,
      ],
    },
    prompt: `Após ${total} horas, a população dessa cultura será de`,
    ...opts,
    numeric: true,
    explanation: `Em ${total} horas ocorrem ${total / h} duplicações. A população é ${formatNumber(n0)} × 2^${total / h} = ${formatNumber(n)}. Crescimentos que dobram em intervalos fixos são exponenciais, não lineares.`,
  });
});

/* Áreas --------------------------------------------------------------- */
const terrenos: [number, number, number][] = [
  [20, 15, 3],
  [30, 12, 4],
  [25, 18, 5],
  [16, 10, 2],
];

const areaQs = terrenos.map(([a, b, r], i) => {
  const ans = a * b - 3 * r * r;
  const fmt = (n: number) => `${formatNumber(n)} m²`;
  const opts = numericOptions(ans, [a * b - 3 * 2 * r, a * b - r * r, a * b, a * b - 3 * r], fmt);
  return buildQuestion({
    id: `mat-areas-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "areas",
    difficulty: "media",
    skill: "Calcular áreas de figuras planas compostas",
    support: {
      paragraphs: [
        `Um terreno retangular mede ${a} m por ${b} m. No centro dele será construído um canteiro circular com ${r} m de raio, e o restante do terreno receberá grama. Utilize π = 3.`,
      ],
    },
    prompt: "A área a ser coberta por grama é de",
    ...opts,
    numeric: true,
    explanation: `A área do retângulo é ${a} × ${b} = ${a * b} m², e a do círculo é π·r² = 3 × ${r}² = ${3 * r * r} m². A área gramada é ${a * b} − ${3 * r * r} = ${formatNumber(ans)} m².`,
  });
});

/* Pitágoras ----------------------------------------------------------- */
const escadas: [number, number, number][] = [
  [5, 3, 4],
  [10, 6, 8],
  [13, 5, 12],
  [17, 8, 15],
];

const pitagorasQs = escadas.map(([l, d, h], i) => {
  const fmt = (n: number) => `${num(n, 1)} m`;
  const opts = numericOptions(h, [l - d, l + d, (l + d) / 2, Math.sqrt(l * l + d * d)], fmt);
  return buildQuestion({
    id: `mat-pitagoras-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "pitagoras",
    difficulty: "facil",
    skill: "Aplicar o teorema de Pitágoras em situações reais",
    support: {
      paragraphs: [
        `Para limpar uma calha, um pintor apoiou uma escada de ${l} m em uma parede vertical. O pé da escada ficou a ${d} m da base da parede, em um piso horizontal.`,
      ],
    },
    prompt: "A altura, na parede, em que o topo da escada ficou apoiado é de",
    ...opts,
    numeric: true,
    explanation: `A escada, a parede e o chão formam um triângulo retângulo com hipotenusa ${l} m. Assim, h² + ${d}² = ${l}², h² = ${l * l - d * d} e h = ${h} m.`,
  });
});

/* Trigonometria ------------------------------------------------------- */
const rampaImage = {
  src: "/questoes/rampa.svg",
  alt: "Triângulo retângulo representando uma rampa: a hipotenusa é a rampa, o ângulo com o solo é de 30 graus e a altura é desconhecida.",
  caption: "Esquema da rampa de acesso (fora de escala).",
  width: 640,
  height: 300,
};

const rampas = [8, 12, 20];
const trigQs = rampas.map((l, i) =>
  buildQuestion({
    id: `mat-trigonometria-${i + 1}`,
    topicId: "mat-geometria-plana",
    subtopic: "trigonometria",
    difficulty: "media",
    skill: "Utilizar razões trigonométricas no triângulo retângulo",
    support: {
      paragraphs: [
        `Uma escola construirá uma rampa de acesso com ${l} m de comprimento, formando um ângulo de 30° com o solo, como no esquema. Considere sen 30° = 0,5 e cos 30° ≈ 0,87.`,
      ],
    },
    image: rampaImage,
    prompt: "A altura vencida pela rampa é de",
    ...numericOptions(l / 2, [l * 0.87, l, l / 3, l * 2], (n) => `${num(n, 2)} m`),
    numeric: true,
    explanation: `A altura é o cateto oposto ao ângulo de 30°. Como sen 30° = altura ÷ comprimento, altura = ${l} × 0,5 = ${num(l / 2)} m. Usar o cosseno daria o afastamento horizontal, não a altura.`,
  }),
);

/* Volumes ------------------------------------------------------------- */
const cilindros: [number, number][] = [
  [1, 2],
  [2, 1.5],
  [0.5, 1.2],
];

const cilindroQs = cilindros.map(([r, h], i) => {
  const litros = 3 * r * r * h * 1000;
  const fmt = (n: number) => `${formatNumber(n)} L`;
  const opts = numericOptions(litros, [3 * r * h * 1000, 3 * 2 * r * h * 1000, litros / 10, 3 * r * r * h * 100], fmt);
  return buildQuestion({
    id: `mat-volume-cilindro-${i + 1}`,
    topicId: "mat-geometria-espacial",
    subtopic: "volumes",
    difficulty: "media",
    skill: "Calcular o volume de cilindros e converter unidades",
    support: {
      paragraphs: [
        `Uma cisterna tem formato de cilindro reto, com raio interno de ${num(r)} m e altura de ${num(h)} m. Use π = 3 e lembre que 1 m³ = 1 000 L.`,
      ],
    },
    prompt: "A capacidade máxima dessa cisterna é de",
    ...opts,
    numeric: true,
    explanation: `V = π·r²·h = 3 × ${num(r)}² × ${num(h)} = ${num(3 * r * r * h, 3)} m³. Convertendo, ${num(3 * r * r * h, 3)} × 1 000 = ${formatNumber(litros)} L.`,
  });
});

const aquarios: [number, number, number][] = [
  [60, 30, 40],
  [80, 40, 50],
];

const aquarioQs = aquarios.map(([c, l, a], i) => {
  const litros = (c * l * a) / 1000;
  const fmt = (n: number) => `${num(n, 1)} L`;
  const opts = numericOptions(litros, [litros * 10, litros / 10, (c + l + a) / 10, (c * l) / 100], fmt);
  return buildQuestion({
    id: `mat-volume-aquario-${i + 1}`,
    topicId: "mat-geometria-espacial",
    subtopic: "volumes",
    difficulty: "facil",
    skill: "Calcular o volume de paralelepípedos",
    support: {
      paragraphs: [`Um aquário com formato de paralelepípedo tem dimensões internas de ${c} cm × ${l} cm × ${a} cm. Considere 1 L = 1 000 cm³.`],
    },
    prompt: "Totalmente cheio, esse aquário comporta",
    ...opts,
    numeric: true,
    explanation: `O volume é ${c} × ${l} × ${a} = ${formatNumber(c * l * a)} cm³. Dividindo por 1 000, obtemos ${num(litros, 1)} L.`,
  });
});

/* Probabilidade ------------------------------------------------------- */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
const frac = (n: number, d: number) => {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
};

const PLURAL = { vermelha: "vermelhas", azul: "azuis", verde: "verdes" } as const;

const urnas: [number, number, number, "vermelha" | "azul" | "verde"][] = [
  [3, 5, 2, "vermelha"],
  [4, 6, 8, "verde"],
  [6, 2, 4, "azul"],
  [5, 7, 3, "vermelha"],
];

const probQs = urnas.map(([v, a, g, alvo], i) => {
  const total = v + a + g;
  const fav = alvo === "vermelha" ? v : alvo === "azul" ? a : g;
  const correct = frac(fav, total);
  const cands = [frac(fav, total - fav), frac(total - fav, total), `1/${total}`, frac(1, 3), frac(fav + 1, total), frac(fav, total + 1)];
  return buildQuestion({
    id: `mat-probabilidade-${i + 1}`,
    topicId: "mat-probabilidade",
    subtopic: "probabilidade",
    difficulty: "facil",
    skill: "Calcular probabilidades em experimentos aleatórios simples",
    support: {
      paragraphs: [
        `Em uma gincana, uma urna contém ${v} bolas vermelhas, ${a} azuis e ${g} verdes, todas do mesmo tamanho e material. Uma bola será retirada ao acaso.`,
      ],
    },
    prompt: `A probabilidade de a bola retirada ser ${alvo} é`,
    correct,
    distractors: cands.filter((c) => c !== correct),
    explanation: `Há ${total} bolas no total e ${fav} são ${PLURAL[alvo]}. A probabilidade é casos favoráveis ÷ casos possíveis = ${fav}/${total} = ${correct}.`,
  });
});

const dadosQ = buildQuestion({
  id: "mat-probabilidade-dados",
  topicId: "mat-probabilidade",
  subtopic: "probabilidade",
  difficulty: "media",
  skill: "Calcular probabilidades com dois eventos",
  support: { paragraphs: ["Dois dados comuns, com faces numeradas de 1 a 6, são lançados simultaneamente em um jogo de tabuleiro."] },
  prompt: "A probabilidade de a soma dos resultados ser igual a 7 é",
  correct: "1/6",
  distractors: ["1/12", "1/36", "7/36", "1/3"],
  explanation: "Há 36 resultados possíveis. Somam 7 os pares (1,6), (2,5), (3,4), (4,3), (5,2) e (6,1): 6 casos. Logo, 6/36 = 1/6.",
});

/* Contagem ----------------------------------------------------------- */
const combos: [number, number, number][] = [
  [3, 5, 4],
  [4, 6, 3],
  [2, 7, 5],
];

const contagemQs = combos.map(([p, r, b], i) => {
  const ans = p * r * b;
  const fmt = (n: number) => `${formatNumber(n)}`;
  const opts = numericOptions(ans, [p + r + b, p * r + b, p * (r + b), ans * 2], fmt);
  return buildQuestion({
    id: `mat-contagem-${i + 1}`,
    topicId: "mat-probabilidade",
    subtopic: "contagem",
    difficulty: "facil",
    skill: "Aplicar o princípio fundamental da contagem",
    support: {
      paragraphs: [`Uma lanchonete monta combos com 1 tipo de pão (${p} opções), 1 recheio (${r} opções) e 1 bebida (${b} opções).`],
    },
    prompt: "A quantidade de combos diferentes que podem ser montados é",
    ...opts,
    numeric: true,
    explanation: `Pelo princípio multiplicativo, as escolhas são independentes: ${p} × ${r} × ${b} = ${ans} combos. Somar as opções (${p + r + b}) não conta as combinações.`,
  });
});

const senha = buildQuestion({
  id: "mat-contagem-senha",
  topicId: "mat-probabilidade",
  subtopic: "contagem",
  difficulty: "media",
  skill: "Contar agrupamentos sem repetição",
  support: { paragraphs: ["O armário de uma escola é aberto com uma senha de 4 algarismos distintos, escolhidos entre 0 e 9."] },
  prompt: "A quantidade de senhas possíveis é",
  correct: "5.040",
  distractors: ["210", "10.000", "6.561", "40"],
  numeric: true,
  explanation: "Há 10 opções para o 1º algarismo, 9 para o 2º, 8 para o 3º e 7 para o 4º, pois não pode haver repetição: 10 × 9 × 8 × 7 = 5.040. O valor 10.000 permitiria repetições.",
});

/* Progressão aritmética ---------------------------------------------- */
const pas: [number, number, number][] = [
  [50, 10, 12],
  [20, 5, 10],
  [100, 15, 8],
];

const paQs = pas.map(([a1, r, n], i) => {
  const an = a1 + (n - 1) * r;
  const opts = numericOptions(an, [a1 + n * r, a1 * n, a1 + (n - 2) * r, (a1 + an) * n / 2], money);
  return buildQuestion({
    id: `mat-pa-${i + 1}`,
    topicId: "mat-progressoes",
    subtopic: "pa",
    difficulty: "facil",
    skill: "Utilizar o termo geral de uma progressão aritmética",
    support: {
      paragraphs: [
        `Para juntar dinheiro para a formatura, um estudante depositou ${money(a1)} no primeiro mês e decidiu aumentar o depósito em ${money(r)} a cada mês seguinte.`,
      ],
    },
    prompt: `O valor depositado no ${n}º mês será de`,
    ...opts,
    numeric: true,
    explanation: `Os depósitos formam uma PA de razão ${num(r)}. Pelo termo geral, aₙ = a₁ + (n − 1)·r = ${num(a1)} + ${n - 1} × ${num(r)} = ${money(an)}.`,
  });
});

const somaPa = buildQuestion({
  id: "mat-pa-soma",
  topicId: "mat-progressoes",
  subtopic: "pa",
  difficulty: "dificil",
  skill: "Calcular a soma dos termos de uma progressão aritmética",
  support: { paragraphs: ["Um atleta iniciou um treino correndo 2 km no primeiro dia e, a cada dia seguinte, correu 0,5 km a mais que no dia anterior, durante 20 dias."] },
  prompt: "A distância total percorrida pelo atleta nesses 20 dias foi de",
  correct: "135 km",
  distractors: ["11,5 km", "40 km", "115 km", "230 km"],
  numeric: true,
  explanation: "O 20º termo é a₂₀ = 2 + 19 × 0,5 = 11,5 km. A soma é S = (a₁ + a₂₀)·n/2 = (2 + 11,5) × 20 / 2 = 135 km.",
});

export const MATEMATICA_QUESTIONS: Question[] = [
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
  somaPa,
];
