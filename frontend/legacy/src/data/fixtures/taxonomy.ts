import type { Area, AreaId, Subject, SubjectId, Topic } from "@/types";

export const AREAS: Area[] = [
  {
    id: "linguagens",
    name: "Linguagens, Códigos e suas Tecnologias",
    shortName: "Linguagens",
    description: "Língua portuguesa, literatura, língua estrangeira e artes.",
    day: 1,
    officialRange: [1, 45],
  },
  {
    id: "humanas",
    name: "Ciências Humanas e suas Tecnologias",
    shortName: "Ciências Humanas",
    description: "História, geografia, filosofia e sociologia.",
    day: 1,
    officialRange: [46, 90],
  },
  {
    id: "natureza",
    name: "Ciências da Natureza e suas Tecnologias",
    shortName: "Ciências da Natureza",
    description: "Física, química e biologia.",
    day: 2,
    officialRange: [91, 135],
  },
  {
    id: "matematica",
    name: "Matemática e suas Tecnologias",
    shortName: "Matemática",
    description: "Raciocínio quantitativo, geometria, funções e estatística.",
    day: 2,
    officialRange: [136, 180],
  },
];

const t = (subjectId: SubjectId, id: string, name: string, subtopics: [string, string][]): Topic => ({
  id,
  subjectId,
  name,
  subtopics: subtopics.map(([sid, sname]) => ({ id: `${id}.${sid}`, name: sname })),
});

export const SUBJECTS: Subject[] = [
  {
    id: "portugues",
    areaId: "linguagens",
    name: "Língua Portuguesa",
    topics: [
      t("portugues", "por-interpretacao", "Interpretação de texto", [
        ["inferencia", "Inferência e sentido global"],
        ["argumentacao", "Estratégias argumentativas"],
      ]),
      t("portugues", "por-figuras", "Figuras de linguagem", [
        ["semantica", "Figuras de palavra"],
        ["construcao", "Figuras de construção e pensamento"],
      ]),
      t("portugues", "por-funcoes", "Funções da linguagem", [["funcoes", "Funções e intencionalidade"]]),
      t("portugues", "por-variacao", "Variação linguística", [
        ["regional", "Variação regional e social"],
        ["registro", "Formalidade e registro"],
      ]),
      t("portugues", "por-generos", "Gêneros textuais", [["generos", "Reconhecimento de gêneros"]]),
    ],
  },
  {
    id: "literatura",
    areaId: "linguagens",
    name: "Literatura",
    topics: [
      t("literatura", "lit-escolas", "Escolas literárias", [
        ["classicas", "Do Quinhentismo ao Arcadismo"],
        ["xix", "Romantismo, Realismo e Simbolismo"],
        ["modernismo", "Modernismo e contemporâneos"],
      ]),
    ],
  },
  {
    id: "artes",
    areaId: "linguagens",
    name: "Artes",
    topics: [t("artes", "art-movimentos", "Movimentos artísticos", [["vanguardas", "Vanguardas e arte brasileira"]])],
  },
  {
    id: "ingles",
    areaId: "linguagens",
    name: "Inglês",
    topics: [t("ingles", "ing-interpretacao", "Leitura em inglês", [["compreensao", "Compreensão global"]])],
  },
  {
    id: "espanhol",
    areaId: "linguagens",
    name: "Espanhol",
    topics: [t("espanhol", "esp-interpretacao", "Leitura em espanhol", [["comprension", "Compreensão global"]])],
  },
  {
    id: "historia",
    areaId: "humanas",
    name: "História",
    topics: [
      t("historia", "his-brasil-colonia", "Brasil Colônia", [["economia", "Economia e sociedade colonial"]]),
      t("historia", "his-brasil-imperio", "Brasil Império", [["politica", "Política imperial e abolição"]]),
      t("historia", "his-brasil-republica", "Brasil República", [
        ["primeira", "Primeira República e Era Vargas"],
        ["ditadura", "Ditadura e redemocratização"],
      ]),
      t("historia", "his-geral", "História Geral", [
        ["antiga", "Antiguidade e Idade Média"],
        ["contemporanea", "Idade Contemporânea"],
      ]),
    ],
  },
  {
    id: "geografia",
    areaId: "humanas",
    name: "Geografia",
    topics: [
      t("geografia", "geo-cartografia", "Cartografia", [
        ["escala", "Escalas"],
        ["fusos", "Fusos horários"],
      ]),
      t("geografia", "geo-natureza", "Clima, relevo e biomas", [
        ["biomas", "Biomas brasileiros"],
        ["clima", "Clima e dinâmica atmosférica"],
      ]),
      t("geografia", "geo-urbana", "Geografia urbana e população", [["urbanizacao", "Urbanização"]]),
      t("geografia", "geo-ambiental", "Questões ambientais", [["impactos", "Impactos ambientais"]]),
    ],
  },
  {
    id: "filosofia",
    areaId: "humanas",
    name: "Filosofia",
    topics: [
      t("filosofia", "fil-pensadores", "Pensadores e conceitos", [
        ["antiga", "Filosofia antiga"],
        ["moderna", "Filosofia moderna e contemporânea"],
      ]),
      t("filosofia", "fil-etica", "Ética e política", [["etica", "Ética e cidadania"]]),
    ],
  },
  {
    id: "sociologia",
    areaId: "humanas",
    name: "Sociologia",
    topics: [
      t("sociologia", "soc-conceitos", "Teoria sociológica", [["classicos", "Autores clássicos"]]),
      t("sociologia", "soc-sociedade", "Cultura, trabalho e cidadania", [["cultura", "Cultura e identidade"]]),
    ],
  },
  {
    id: "fisica",
    areaId: "natureza",
    name: "Física",
    topics: [
      t("fisica", "fis-cinematica", "Cinemática", [
        ["velocidade", "Velocidade média"],
        ["mruv", "Movimento uniformemente variado"],
      ]),
      t("fisica", "fis-energia", "Energia e potência", [
        ["mecanica", "Energia mecânica"],
        ["potencia", "Trabalho e potência"],
      ]),
      t("fisica", "fis-eletricidade", "Eletricidade", [
        ["ohm", "Lei de Ohm"],
        ["consumo", "Consumo de energia elétrica"],
      ]),
      t("fisica", "fis-termologia", "Termologia", [["calorimetria", "Calorimetria"]]),
      t("fisica", "fis-ondas", "Ondulatória", [["ondas", "Velocidade de ondas"]]),
      t("fisica", "fis-hidrostatica", "Hidrostática", [
        ["densidade", "Densidade"],
        ["pressao", "Pressão hidrostática"],
      ]),
    ],
  },
  {
    id: "quimica",
    areaId: "natureza",
    name: "Química",
    topics: [
      t("quimica", "qui-solucoes", "Soluções", [
        ["concentracao", "Concentração comum"],
        ["diluicao", "Diluição"],
      ]),
      t("quimica", "qui-estequiometria", "Estequiometria", [
        ["mol", "Quantidade de matéria"],
        ["massa-molar", "Massa molar"],
      ]),
      t("quimica", "qui-acido-base", "Ácidos, bases e pH", [["ph", "Escala de pH"]]),
      t("quimica", "qui-ambiental", "Química ambiental", [["poluicao", "Poluição e impactos"]]),
    ],
  },
  {
    id: "biologia",
    areaId: "natureza",
    name: "Biologia",
    topics: [
      t("biologia", "bio-citologia", "Citologia", [["organelas", "Organelas celulares"]]),
      t("biologia", "bio-genetica", "Genética", [["mendel", "Primeira lei de Mendel"]]),
      t("biologia", "bio-ecologia", "Ecologia", [
        ["relacoes", "Relações ecológicas"],
        ["cadeias", "Cadeias e teias alimentares"],
      ]),
      t("biologia", "bio-fisiologia", "Fisiologia humana", [["sistemas", "Sistemas do corpo humano"]]),
    ],
  },
  {
    id: "matematica",
    areaId: "matematica",
    name: "Matemática",
    topics: [
      t("matematica", "mat-porcentagem", "Porcentagem e juros", [
        ["variacao", "Aumentos e descontos"],
        ["juros", "Juros simples e compostos"],
      ]),
      t("matematica", "mat-proporcao", "Razão, proporção e escala", [
        ["regra-de-tres", "Regra de três"],
        ["escala", "Escala"],
      ]),
      t("matematica", "mat-estatistica", "Estatística", [
        ["medidas", "Média, mediana e moda"],
        ["graficos", "Leitura de gráficos"],
      ]),
      t("matematica", "mat-funcoes", "Funções", [
        ["afim", "Função afim"],
        ["quadratica", "Função quadrática"],
        ["exponencial", "Crescimento exponencial"],
      ]),
      t("matematica", "mat-geometria-plana", "Geometria plana", [
        ["areas", "Áreas"],
        ["pitagoras", "Teorema de Pitágoras"],
        ["trigonometria", "Trigonometria no triângulo"],
      ]),
      t("matematica", "mat-geometria-espacial", "Geometria espacial", [["volumes", "Volumes"]]),
      t("matematica", "mat-probabilidade", "Probabilidade e contagem", [
        ["probabilidade", "Probabilidade"],
        ["contagem", "Princípio fundamental da contagem"],
      ]),
      t("matematica", "mat-progressoes", "Progressões", [["pa", "Progressão aritmética"]]),
    ],
  },
];

export const SUBJECT_BY_ID: Record<SubjectId, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, Subject>;

export const AREA_BY_ID: Record<AreaId, Area> = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<
  AreaId,
  Area
>;

export const TOPICS: Topic[] = SUBJECTS.flatMap((s) => s.topics);

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((tp) => [tp.id, tp]));

export const SUBTOPIC_NAME: Record<string, string> = Object.fromEntries(
  TOPICS.flatMap((tp) => tp.subtopics.map((s) => [s.id, s.name])),
);

export function subjectsOfArea(areaId: AreaId): Subject[] {
  return SUBJECTS.filter((s) => s.areaId === areaId);
}

/** Edições do ENEM no formato de dois dias (a partir de 2009). */
export const ENEM_EDITIONS: number[] = Array.from({ length: 2025 - 2009 + 1 }, (_, i) => 2025 - i);

/** Anos de referência usados como filtro no acervo demonstrativo. */
export const REFERENCE_YEARS: number[] = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
