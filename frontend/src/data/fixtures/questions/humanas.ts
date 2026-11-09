import type { Question } from "@/types";
import { buildQuestion, conceptQuestions, type ConceptItem } from "./builder";

/* =========================== HISTÓRIA =========================== */

const historiaBrasil: (ConceptItem & { topic: string })[] = [
  {
    topic: "his-brasil-colonia",
    key: "acucar",
    answer: "economia açucareira colonial.",
    clue: "Atividade econômica que, entre os séculos XVI e XVII, concentrou-se no litoral nordestino, baseada em grandes propriedades, monocultura voltada à exportação e trabalho de africanos escravizados.",
    why: "O modelo descrito — latifúndio, monocultura exportadora e mão de obra escravizada no litoral nordestino — caracteriza a economia açucareira, base da colonização portuguesa nos séculos XVI e XVII.",
    difficulty: "facil",
  },
  {
    topic: "his-brasil-colonia",
    key: "inconfidencia",
    answer: "Inconfidência Mineira.",
    clue: "Conspiração ocorrida em 1789 em Vila Rica, motivada pela ameaça de cobrança da derrama e influenciada por ideias iluministas, que terminou com a execução de Tiradentes.",
    why: "A Inconfidência Mineira (1789) reuniu membros da elite de Minas Gerais contra a cobrança da derrama e foi influenciada pelo Iluminismo e pela independência dos EUA.",
  },
  {
    topic: "his-brasil-colonia",
    key: "conjuracao-baiana",
    answer: "Conjuração Baiana.",
    clue: "Movimento de 1798, em Salvador, com ampla participação de alfaiates, soldados e escravizados, que defendia a república, a igualdade e o fim da escravidão.",
    why: "A Conjuração Baiana (ou Revolta dos Alfaiates) teve caráter popular e defendeu, além da república, o fim da escravidão.",
    difficulty: "dificil",
    near: ["Inconfidência Mineira."],
  },
  {
    topic: "his-brasil-imperio",
    key: "eusebio",
    answer: "Lei Eusébio de Queirós.",
    clue: "Lei de 1850 que proibiu o tráfico internacional de africanos escravizados para o Brasil, em meio a forte pressão britânica.",
    why: "A Lei Eusébio de Queirós (1850) proibiu o tráfico negreiro, em parte pela pressão da Inglaterra, como a Bill Aberdeen.",
    subtopic: "politica",
  },
  {
    topic: "his-brasil-imperio",
    key: "ventre-livre",
    answer: "Lei do Ventre Livre.",
    clue: "Lei de 1871 que declarou livres os filhos de mulheres escravizadas nascidos a partir de sua promulgação, embora pudessem permanecer sob tutela dos senhores até os 21 anos.",
    why: "A Lei do Ventre Livre (1871) libertava os nascidos de mães escravizadas, mas permitia que os senhores os mantivessem sob sua tutela.",
    subtopic: "politica",
    near: ["Lei dos Sexagenários."],
  },
  {
    topic: "his-brasil-imperio",
    key: "aurea",
    answer: "Lei Áurea.",
    clue: "Lei assinada em 13 de maio de 1888 que extinguiu juridicamente a escravidão no Brasil, sem prever políticas de integração para a população liberta.",
    why: "A Lei Áurea (1888) aboliu a escravidão, mas não garantiu terra, educação ou trabalho aos libertos.",
    subtopic: "politica",
    difficulty: "facil",
  },
  {
    topic: "his-brasil-republica",
    key: "cafe-com-leite",
    answer: "política do café com leite.",
    clue: "Prática da Primeira República em que as oligarquias de São Paulo e Minas Gerais se alternavam na indicação de candidatos à Presidência.",
    why: "O revezamento entre paulistas (café) e mineiros (leite) na Presidência ficou conhecido como política do café com leite.",
    subtopic: "primeira",
    near: ["política dos governadores."],
  },
  {
    topic: "his-brasil-republica",
    key: "governadores",
    answer: "política dos governadores.",
    clue: "Acordo da Primeira República em que o governo federal apoiava as oligarquias estaduais e, em troca, recebia apoio de suas bancadas no Congresso.",
    why: "A política dos governadores, consolidada por Campos Sales, trocava apoio federal às oligarquias estaduais por sustentação no Legislativo.",
    subtopic: "primeira",
    difficulty: "dificil",
    near: ["política do café com leite."],
  },
  {
    topic: "his-brasil-republica",
    key: "canudos",
    answer: "Guerra de Canudos.",
    clue: "Conflito ocorrido entre 1896 e 1897 no sertão da Bahia, envolvendo uma comunidade liderada por Antônio Conselheiro e tropas do governo republicano.",
    why: "Canudos, liderada por Antônio Conselheiro, foi destruída pelo Exército após quatro expedições militares.",
    subtopic: "primeira",
    near: ["Revolta da Vacina."],
  },
  {
    topic: "his-brasil-republica",
    key: "vacina",
    answer: "Revolta da Vacina.",
    clue: "Levante popular ocorrido em 1904 no Rio de Janeiro contra a vacinação obrigatória e as reformas urbanas autoritárias.",
    why: "A Revolta da Vacina (1904) expressou a insatisfação popular com a vacinação compulsória e com as demolições de cortiços no centro do Rio.",
    subtopic: "primeira",
  },
  {
    topic: "his-brasil-republica",
    key: "estado-novo",
    answer: "Estado Novo.",
    clue: "Período entre 1937 e 1945 marcado pela centralização autoritária do poder, censura à imprensa e fechamento do Congresso sob o governo de Getúlio Vargas.",
    why: "O Estado Novo (1937–1945) foi a fase ditatorial da Era Vargas, com nova Constituição outorgada e forte centralização.",
    subtopic: "primeira",
    difficulty: "facil",
  },
  {
    topic: "his-brasil-republica",
    key: "ai5",
    answer: "Ato Institucional nº 5.",
    clue: "Medida de dezembro de 1968 que permitiu fechar o Congresso, cassar mandatos e suspender o habeas corpus em casos de crimes políticos.",
    why: "O AI-5 (1968) marcou o endurecimento da ditadura civil-militar, ampliando a repressão e suspendendo garantias.",
    subtopic: "ditadura",
  },
  {
    topic: "his-brasil-republica",
    key: "diretas",
    answer: "movimento Diretas Já.",
    clue: "Mobilização popular de 1983 e 1984, com grandes comícios em várias cidades, que reivindicava eleições diretas para a Presidência da República.",
    why: "As Diretas Já mobilizaram milhões de pessoas em apoio à emenda Dante de Oliveira, que não foi aprovada, mas fortaleceu a redemocratização.",
    subtopic: "ditadura",
    difficulty: "facil",
  },
];

const historiaBrasilQs = historiaBrasil.map(({ topic, ...item }) =>
  conceptQuestions({
    prefix: "his",
    topicId: topic,
    skill: "Identificar processos históricos do Brasil e seus contextos",
    prompt: "O texto descreve o(a)",
    items: [item],
    extraDistractors: historiaBrasil.map((h) => h.answer).concat(["Lei dos Sexagenários.", "Revolta da Chibata."]),
  })[0],
);

const historiaGeralQs = conceptQuestions({
  prefix: "his-geral",
  topicId: "his-geral",
  skill: "Reconhecer processos históricos da história geral",
  prompt: "O processo histórico descrito é o(a)",
  items: [
    {
      key: "feudalismo",
      answer: "feudalismo.",
      clue: "Organização social da Europa medieval baseada na posse da terra, em relações de suserania e vassalagem e no trabalho servil.",
      why: "As relações de suserania e vassalagem e a servidão caracterizam o feudalismo na Europa ocidental medieval.",
      subtopic: "antiga",
      difficulty: "facil",
    },
    {
      key: "renascimento",
      answer: "Renascimento.",
      clue: "Movimento cultural dos séculos XIV a XVI que valorizou o antropocentrismo, o racionalismo e a retomada de referências da Antiguidade greco-romana.",
      why: "O Renascimento retomou a cultura clássica e colocou o ser humano no centro das reflexões (antropocentrismo).",
      subtopic: "antiga",
    },
    {
      key: "reforma",
      answer: "Reforma Protestante.",
      clue: "Movimento iniciado em 1517 com a publicação de 95 teses que criticavam, entre outras práticas, a venda de indulgências pela Igreja Católica.",
      why: "Martinho Lutero publicou as 95 teses em 1517, dando início à Reforma Protestante.",
      subtopic: "antiga",
    },
    {
      key: "industrial",
      answer: "Revolução Industrial.",
      clue: "Processo iniciado na Inglaterra no século XVIII, marcado pela mecanização da produção, pelo uso da máquina a vapor e pela formação do operariado urbano.",
      why: "A mecanização com máquinas a vapor e a formação do proletariado caracterizam a Revolução Industrial inglesa.",
      subtopic: "contemporanea",
      difficulty: "facil",
    },
    {
      key: "francesa",
      answer: "Revolução Francesa.",
      clue: "Processo iniciado em 1789 que derrubou o Antigo Regime na França e difundiu o lema “liberdade, igualdade e fraternidade”.",
      why: "A Revolução Francesa (1789) derrubou o absolutismo e difundiu ideais iluministas por meio da Declaração dos Direitos do Homem e do Cidadão.",
      subtopic: "contemporanea",
      difficulty: "facil",
    },
    {
      key: "crise-1929",
      answer: "Grande Depressão.",
      clue: "Crise econômica mundial desencadeada pela quebra da Bolsa de Valores de Nova York em 1929, com falências em massa e desemprego elevado.",
      why: "A quebra da Bolsa de Nova York, em 1929, iniciou a Grande Depressão, que atingiu economias de todo o mundo.",
      subtopic: "contemporanea",
    },
    {
      key: "guerra-fria",
      answer: "Guerra Fria.",
      clue: "Período de disputa ideológica, política e militar entre Estados Unidos e União Soviética, sem confronto direto entre eles, encerrado com o fim da URSS em 1991.",
      why: "A Guerra Fria opôs os blocos capitalista e socialista entre 1947 e 1991, marcada por corrida armamentista e conflitos indiretos.",
      subtopic: "contemporanea",
    },
    {
      key: "apartheid",
      answer: "apartheid.",
      clue: "Regime de segregação racial institucionalizado na África do Sul entre 1948 e 1994, combatido por movimentos liderados por figuras como Nelson Mandela.",
      why: "O apartheid foi a política oficial de segregação racial sul-africana, encerrada com as eleições multirraciais de 1994.",
      subtopic: "contemporanea",
    },
  ],
  extraDistractors: ["Iluminismo.", "mercantilismo."],
});

const historiaContexto: Question[] = [
  buildQuestion({
    id: "his-contexto-quilombos",
    topicId: "his-brasil-colonia",
    difficulty: "media",
    skill: "Analisar formas de resistência à escravidão",
    support: {
      paragraphs: [
        "Os quilombos foram comunidades formadas por pessoas que fugiam da escravidão. O de Palmares, na serra da Barriga, resistiu por quase um século e chegou a reunir milhares de habitantes, com organização política e produção agrícola próprias.",
      ],
    },
    prompt: "A experiência de Palmares evidencia que a população escravizada",
    correct: "construiu formas organizadas de resistência ao sistema escravista.",
    distractors: [
      "aceitou passivamente as condições impostas pelos senhores.",
      "resistiu apenas por meio de revoltas isoladas e de curta duração.",
      "foi integrada à sociedade colonial com direitos garantidos.",
      "dependeu do apoio da Coroa portuguesa para obter a liberdade.",
    ],
    explanation: "Palmares mostra que a resistência à escravidão foi ativa, duradoura e organizada, com estruturas políticas e econômicas próprias — contrariando a ideia de passividade.",
  }),
  buildQuestion({
    id: "his-contexto-constituicao",
    topicId: "his-brasil-republica",
    subtopic: "ditadura",
    difficulty: "media",
    skill: "Relacionar marcos legais à ampliação da cidadania",
    support: {
      paragraphs: [
        "Promulgada em 1988, após mais de duas décadas de regime autoritário, a atual Constituição brasileira ficou conhecida como “Constituição Cidadã”.",
      ],
    },
    prompt: "Essa denominação se relaciona ao fato de o texto constitucional",
    correct: "ampliar direitos sociais e garantias individuais após a ditadura.",
    distractors: [
      "restabelecer o voto censitário, vinculado à renda.",
      "manter os atos institucionais do período militar.",
      "restringir o voto aos cidadãos alfabetizados.",
      "concentrar os poderes no Executivo federal.",
    ],
    explanation: "A Constituição de 1988 ampliou direitos sociais (saúde, educação, previdência), garantiu liberdades individuais e estendeu o voto facultativo a analfabetos e jovens de 16 e 17 anos.",
  }),
  buildQuestion({
    id: "his-contexto-grecia",
    topicId: "his-geral",
    subtopic: "antiga",
    difficulty: "dificil",
    skill: "Comparar formas de participação política na Antiguidade e na atualidade",
    support: {
      paragraphs: [
        "Na Atenas do século V a.C., os cidadãos participavam diretamente das decisões na Eclésia, a assembleia popular. Contudo, mulheres, estrangeiros e escravizados não eram considerados cidadãos.",
      ],
    },
    prompt: "Com base no texto, a democracia ateniense caracterizava-se por ser",
    correct: "direta, porém restrita a uma parcela da população.",
    distractors: [
      "representativa e universal.",
      "direta e estendida a todos os habitantes.",
      "representativa, mas restrita aos aristocratas.",
      "monárquica, com participação popular consultiva.",
    ],
    explanation: "Os cidadãos votavam diretamente na assembleia, mas a cidadania excluía a maioria da população — mulheres, estrangeiros (metecos) e escravizados.",
  }),
];

/* =========================== GEOGRAFIA =========================== */

const fusos: [string, number, number, string][] = [
  ["Tóquio (UTC+9)", 9, 20, "8h"],
  ["Lisboa (UTC+0)", 0, 15, "12h"],
  ["Moscou (UTC+3)", 3, 18, "12h"],
];

const fusoQs = fusos.map(([cidade, utc, hora, resposta], i) => {
  const diff = utc + 3;
  const wrongs = [`${(hora + diff) % 24}h`, `${(hora - utc + 24) % 24}h`, `${(hora - diff + 1 + 24) % 24}h`, `${(hora - diff - 1 + 24) % 24}h`, `${hora}h`];
  return buildQuestion({
    id: `geo-fuso-${i + 1}`,
    topicId: "geo-cartografia",
    subtopic: "fusos",
    difficulty: "media",
    skill: "Calcular diferenças de horário entre fusos",
    support: {
      paragraphs: [`Uma final de campeonato será disputada em ${cidade} às ${hora}h, horário local. Torcedores em Brasília (UTC−3) acompanharão a transmissão ao vivo.`],
    },
    prompt: "Em Brasília, a transmissão começará às",
    correct: resposta,
    distractors: wrongs.filter((w) => w !== resposta),
    explanation: `A diferença entre UTC${utc >= 0 ? "+" : ""}${utc} e UTC−3 é de ${diff} horas. Como Brasília está a oeste, o horário é atrasado: ${hora}h − ${diff}h = ${resposta}.`,
  });
});

const biomasQs = conceptQuestions({
  prefix: "geo-bioma",
  topicId: "geo-natureza",
  skill: "Caracterizar os biomas brasileiros",
  prompt: "O bioma descrito é o(a)",
  items: [
    {
      key: "caatinga",
      answer: "Caatinga.",
      clue: "Bioma exclusivamente brasileiro, de clima semiárido, com vegetação xerófila — como cactos e arbustos que perdem as folhas na estação seca — e rios intermitentes.",
      why: "Clima semiárido, plantas adaptadas à escassez hídrica e rios intermitentes caracterizam a Caatinga.",
      subtopic: "biomas",
      difficulty: "facil",
    },
    {
      key: "cerrado",
      answer: "Cerrado.",
      clue: "Vegetação de savana com árvores de troncos tortuosos e casca grossa, raízes profundas e estações seca e chuvosa bem definidas; abriga nascentes de importantes bacias hidrográficas.",
      why: "Troncos retorcidos, casca espessa, raízes profundas e o papel de “berço das águas” identificam o Cerrado.",
      subtopic: "biomas",
    },
    {
      key: "amazonia",
      answer: "Amazônia.",
      clue: "Floresta equatorial latifoliada, densa, com elevada pluviosidade, grande biodiversidade e solos geralmente pobres, cuja fertilidade depende da reciclagem da matéria orgânica.",
      why: "Clima equatorial, chuvas abundantes e floresta latifoliada densa caracterizam a Amazônia; seus solos dependem da ciclagem de nutrientes.",
      subtopic: "biomas",
    },
    {
      key: "mata-atlantica",
      answer: "Mata Atlântica.",
      clue: "Bioma que se estendia ao longo da faixa litorânea e foi o mais devastado desde a colonização, restando hoje uma pequena parte de sua cobertura original.",
      why: "Ocupado desde o início da colonização e pelas maiores cidades do país, a Mata Atlântica é o bioma mais devastado.",
      subtopic: "biomas",
      difficulty: "facil",
    },
    {
      key: "pampa",
      answer: "Pampa.",
      clue: "Bioma do extremo sul do país, com predomínio de vegetação rasteira (campos), relevo suave e uso tradicional para a pecuária extensiva.",
      why: "Campos de vegetação rasteira, relevo de coxilhas e pecuária extensiva definem o Pampa gaúcho.",
      subtopic: "biomas",
    },
    {
      key: "pantanal",
      answer: "Pantanal.",
      clue: "Maior planície alagável do mundo, com ciclos anuais de cheia e vazante que regulam a vida de grande diversidade de aves, peixes e mamíferos.",
      why: "A dinâmica de cheias e vazantes em uma extensa planície caracteriza o Pantanal.",
      subtopic: "biomas",
    },
  ],
});

const climaUrbanoQs = conceptQuestions({
  prefix: "geo-conceito",
  topicId: "geo-urbana",
  skill: "Compreender conceitos da geografia urbana e da dinâmica atmosférica",
  prompt: "O fenômeno descrito é denominado",
  items: [
    {
      key: "ilha-calor",
      answer: "ilha de calor.",
      clue: "Áreas centrais de grandes cidades, com muito asfalto, concreto e pouca vegetação, registram temperaturas mais altas do que as áreas periféricas e rurais vizinhas.",
      why: "A impermeabilização do solo, os materiais que absorvem calor e a pouca vegetação elevam a temperatura nos centros urbanos: é a ilha de calor.",
      difficulty: "facil",
    },
    {
      key: "conurbacao",
      answer: "conurbação.",
      clue: "O crescimento horizontal de duas ou mais cidades vizinhas faz com que suas malhas urbanas se encontrem, dificultando a identificação dos limites entre elas.",
      why: "A junção física das manchas urbanas de municípios vizinhos é chamada de conurbação.",
    },
    {
      key: "exodo",
      answer: "êxodo rural.",
      clue: "Entre as décadas de 1950 e 1980, milhões de brasileiros deixaram o campo em direção às cidades, atraídos pela industrialização e expulsos pela mecanização agrícola.",
      why: "A migração em massa do campo para a cidade é o êxodo rural, intenso no Brasil durante a industrialização.",
      difficulty: "facil",
    },
    {
      key: "gentrificacao",
      answer: "gentrificação.",
      clue: "Após a revitalização de um bairro antigo, a valorização imobiliária elevou aluguéis e custos de vida, levando moradores de baixa renda a se mudarem para áreas mais distantes.",
      why: "A substituição de moradores de baixa renda por grupos de maior renda após a valorização de uma área é chamada de gentrificação.",
      difficulty: "dificil",
    },
    {
      key: "orografica",
      answer: "chuva orográfica.",
      clue: "Massas de ar úmidas vindas do oceano encontram uma serra, sobem, resfriam-se e provocam precipitação na encosta voltada para o mar.",
      why: "A chuva provocada pela elevação forçada do ar úmido por barreiras de relevo é a chuva orográfica (ou de relevo).",
      subtopic: "clima",
    },
  ],
  extraDistractors: ["metropolização.", "macrocefalia urbana."],
});

/* Corrige o assunto da chuva orográfica (clima/natureza). */
const climaUrbanoFixed = climaUrbanoQs.map((q) =>
  q.id === "geo-conceito-orografica" ? { ...q, topicId: "geo-natureza", subtopicId: "geo-natureza.clima" } : q,
);

const ambientalGeoQs = conceptQuestions({
  prefix: "geo-ambiental",
  topicId: "geo-ambiental",
  skill: "Analisar impactos ambientais e suas causas",
  prompt: "O processo descrito é o(a)",
  items: [
    {
      key: "assoreamento",
      answer: "assoreamento.",
      clue: "A retirada da mata ciliar expõe o solo das margens, que é carregado pelas chuvas e se acumula no leito dos rios, reduzindo sua profundidade.",
      why: "O acúmulo de sedimentos no leito dos rios, intensificado pela remoção da mata ciliar, é o assoreamento.",
      difficulty: "facil",
    },
    {
      key: "desertificacao",
      answer: "desertificação.",
      clue: "Em áreas de clima semiárido, o uso intensivo do solo, o desmatamento e o manejo inadequado levam à perda progressiva da capacidade produtiva da terra.",
      why: "A degradação do solo em regiões áridas e semiáridas por ação humana e climática caracteriza a desertificação.",
    },
    {
      key: "lixiviacao",
      answer: "lixiviação.",
      clue: "Em áreas de chuvas intensas, a água que se infiltra no solo arrasta os nutrientes minerais para camadas mais profundas, empobrecendo a superfície.",
      why: "A remoção de nutrientes pela água que percola o solo é a lixiviação, comum em climas úmidos.",
      difficulty: "dificil",
    },
    {
      key: "vocoroca",
      answer: "voçoroca.",
      clue: "Em solos desprotegidos, o escoamento concentrado da água abre grandes fendas profundas no terreno, que podem atingir dezenas de metros.",
      why: "Voçorocas são o estágio mais avançado da erosão por escoamento concentrado, formando grandes crateras.",
    },
  ],
  extraDistractors: ["intemperismo químico.", "eutrofização."],
});

/* =========================== FILOSOFIA =========================== */

const filosofiaQs = conceptQuestions({
  prefix: "fil",
  topicId: "fil-pensadores",
  skill: "Associar conceitos filosóficos a seus autores",
  prompt: "A ideia apresentada está associada ao pensamento de",
  items: [
    {
      key: "socrates",
      answer: "Sócrates.",
      clue: "Pelo diálogo e por perguntas sucessivas, o filósofo levava o interlocutor a reconhecer a própria ignorância e a “dar à luz” ideias — método conhecido como maiêutica.",
      why: "A maiêutica e a ironia são o método socrático de investigação por meio do diálogo.",
      subtopic: "antiga",
      difficulty: "facil",
    },
    {
      key: "platao",
      answer: "Platão.",
      clue: "Na alegoria da caverna, prisioneiros confundem sombras com a realidade; o conhecimento verdadeiro exigiria ascender ao mundo das ideias.",
      why: "A alegoria da caverna, de A República, ilustra a teoria platônica das ideias e a distinção entre aparência e realidade.",
      subtopic: "antiga",
      difficulty: "facil",
    },
    {
      key: "aristoteles",
      answer: "Aristóteles.",
      clue: "A virtude moral consiste na justa medida entre dois vícios, um por excesso e outro por falta, como a coragem entre a temeridade e a covardia.",
      why: "A ética do justo meio (mesotes) é central na Ética a Nicômaco, de Aristóteles.",
      subtopic: "antiga",
    },
    {
      key: "descartes",
      answer: "René Descartes.",
      clue: "Duvidando de tudo o que pode ser posto em dúvida, o filósofo encontra uma certeza indubitável: “penso, logo existo”.",
      why: "A dúvida metódica e o cogito são fundamentos do racionalismo de Descartes.",
      subtopic: "moderna",
      difficulty: "facil",
    },
    {
      key: "kant",
      answer: "Immanuel Kant.",
      clue: "Age apenas segundo uma máxima tal que possas, ao mesmo tempo, querer que ela se torne uma lei universal.",
      why: "Essa é uma formulação do imperativo categórico, princípio da ética do dever de Kant.",
      subtopic: "moderna",
    },
    {
      key: "hobbes",
      answer: "Thomas Hobbes.",
      clue: "No estado de natureza, sem um poder comum, haveria uma guerra de todos contra todos; por isso os indivíduos transfeririam direitos a um soberano forte.",
      why: "A guerra de todos contra todos e a defesa de um soberano absoluto (o Leviatã) são teses de Hobbes.",
      subtopic: "moderna",
      near: ["John Locke.", "Jean-Jacques Rousseau."],
    },
    {
      key: "locke",
      answer: "John Locke.",
      clue: "A mente humana, ao nascer, é como uma folha em branco; todo conhecimento provém da experiência. Na política, o governo deve proteger direitos naturais como a vida, a liberdade e a propriedade.",
      why: "A tábula rasa (empirismo) e a defesa dos direitos naturais são marcas de John Locke.",
      subtopic: "moderna",
      difficulty: "dificil",
      near: ["Thomas Hobbes."],
    },
    {
      key: "rousseau",
      answer: "Jean-Jacques Rousseau.",
      clue: "O ser humano nasce bom e livre, mas a sociedade e a propriedade privada o corrompem; a legitimidade política deve vir da vontade geral.",
      why: "A bondade natural e a vontade geral, expostas em O Contrato Social, são ideias de Rousseau.",
      subtopic: "moderna",
      near: ["Thomas Hobbes."],
    },
    {
      key: "maquiavel",
      answer: "Nicolau Maquiavel.",
      clue: "O governante deve agir conforme a necessidade para conservar o poder, combinando virtù e fortuna, separando a ação política da moral religiosa.",
      why: "Em O Príncipe, Maquiavel analisa a política de forma realista e autônoma em relação à moral cristã.",
      subtopic: "moderna",
    },
    {
      key: "sartre",
      answer: "Jean-Paul Sartre.",
      clue: "A existência precede a essência: o ser humano primeiro existe e depois se define por suas escolhas, sendo “condenado a ser livre”.",
      why: "A afirmação de que a existência precede a essência sintetiza o existencialismo de Sartre.",
      subtopic: "moderna",
    },
  ],
  extraDistractors: ["Friedrich Nietzsche."],
});

const eticaQs = [
  buildQuestion({
    id: "fil-etica-arendt",
    topicId: "fil-etica",
    difficulty: "dificil",
    skill: "Interpretar conceitos de ética e política contemporâneas",
    support: {
      paragraphs: [
        "Ao acompanhar o julgamento de um funcionário nazista, a filósofa Hannah Arendt observou que ele não parecia um monstro, mas alguém que cumpria ordens sem refletir sobre elas. Ela chamou esse fenômeno de “banalidade do mal”.",
      ],
    },
    prompt: "O conceito de banalidade do mal destaca o perigo da",
    correct: "ausência de pensamento crítico diante de ordens e normas.",
    distractors: [
      "natureza essencialmente má de todos os seres humanos.",
      "interferência da religião nas decisões políticas.",
      "existência de leis escritas em sociedades democráticas.",
      "busca individual pela felicidade e pelo prazer.",
    ],
    explanation: "Para Arendt, o mal pode ser praticado por pessoas comuns que deixam de pensar e julgar, apenas obedecendo — daí sua “banalidade”.",
  }),
  buildQuestion({
    id: "fil-etica-cidadania",
    topicId: "fil-etica",
    difficulty: "media",
    skill: "Relacionar ética, cidadania e vida pública",
    support: {
      paragraphs: [
        "Para Aristóteles, o ser humano é um “animal político” (zoon politikon), pois realiza plenamente sua natureza apenas na vida em comunidade, participando das decisões da pólis.",
      ],
    },
    prompt: "Segundo essa concepção, a participação política é",
    correct: "constitutiva da realização humana.",
    distractors: [
      "uma obrigação imposta pelo soberano.",
      "um obstáculo à felicidade individual.",
      "um privilégio de reis e sacerdotes.",
      "uma atividade irrelevante para a ética.",
    ],
    explanation: "Para Aristóteles, a vida na pólis e a participação política fazem parte da própria natureza humana e da busca pelo bem viver.",
  }),
];

/* =========================== SOCIOLOGIA =========================== */

const sociologiaQs = conceptQuestions({
  prefix: "soc",
  topicId: "soc-conceitos",
  skill: "Associar conceitos sociológicos aos seus autores e definições",
  prompt: "O conceito descrito corresponde a",
  items: [
    {
      key: "fato-social",
      answer: "fato social, de Émile Durkheim.",
      clue: "Maneiras de agir, pensar e sentir exteriores ao indivíduo, gerais na sociedade e dotadas de poder coercitivo, como as regras de etiqueta ou a língua.",
      why: "Exterioridade, generalidade e coercitividade são as características do fato social segundo Durkheim.",
      difficulty: "facil",
    },
    {
      key: "acao-social",
      answer: "ação social, de Max Weber.",
      clue: "Conduta humana orientada pelo comportamento de outras pessoas e dotada de um sentido atribuído pelo próprio indivíduo que age.",
      why: "Para Weber, a sociologia deve compreender a ação social, aquela orientada pelo outro e dotada de sentido subjetivo.",
    },
    {
      key: "mais-valia",
      answer: "mais-valia, de Karl Marx.",
      clue: "Diferença entre o valor produzido pelo trabalhador e o valor que ele recebe como salário, apropriada pelo capitalista.",
      why: "A mais-valia é o trabalho excedente não pago, base da exploração no capitalismo segundo Marx.",
      difficulty: "facil",
    },
    {
      key: "capital-cultural",
      answer: "capital cultural, de Pierre Bourdieu.",
      clue: "Conjunto de conhecimentos, hábitos e referências valorizados socialmente, transmitidos sobretudo pela família, que favorece o desempenho escolar de alguns grupos.",
      why: "Bourdieu mostrou que o capital cultural herdado ajuda a reproduzir desigualdades por meio da escola.",
      difficulty: "dificil",
    },
    {
      key: "modernidade-liquida",
      answer: "modernidade líquida, de Zygmunt Bauman.",
      clue: "Na sociedade contemporânea, relações, empregos e identidades tornam-se fluidos, instáveis e passageiros.",
      why: "Bauman usou a metáfora da liquidez para descrever a fragilidade dos vínculos e identidades contemporâneos.",
    },
    {
      key: "industria-cultural",
      answer: "indústria cultural, de Adorno e Horkheimer.",
      clue: "Produção de bens culturais em série, padronizados e voltados ao lucro, que tende a tornar o público passivo e conformado.",
      why: "Adorno e Horkheimer criaram o conceito de indústria cultural para criticar a mercantilização da cultura.",
    },
  ],
  extraDistractors: ["solidariedade mecânica, de Émile Durkheim."],
});

const culturaQs = conceptQuestions({
  prefix: "soc-cultura",
  topicId: "soc-sociedade",
  skill: "Compreender conceitos relacionados à cultura e à diversidade",
  prompt: "A atitude ou o conceito descrito é o(a)",
  items: [
    {
      key: "etnocentrismo",
      answer: "etnocentrismo.",
      clue: "Ao visitar outro país, um turista classificou como “atrasados” e “estranhos” os costumes locais, tomando os hábitos de seu próprio grupo como medida de todas as culturas.",
      why: "Julgar outras culturas com base nos valores do próprio grupo é etnocentrismo.",
      difficulty: "facil",
    },
    {
      key: "relativismo",
      answer: "relativismo cultural.",
      clue: "Uma antropóloga procurou compreender os rituais de uma comunidade a partir dos significados que eles têm para seus próprios membros, sem hierarquizá-los.",
      why: "Compreender cada cultura em seus próprios termos, sem hierarquias, é a postura do relativismo cultural.",
    },
    {
      key: "aculturacao",
      answer: "aculturação.",
      clue: "O contato prolongado entre dois grupos culturais distintos provoca mudanças nos padrões culturais de um ou de ambos.",
      why: "Aculturação é o processo de transformação cultural resultante do contato contínuo entre culturas diferentes.",
      difficulty: "dificil",
    },
  ],
  extraDistractors: ["xenofobia.", "assimilação forçada."],
});

export const HUMANAS_QUESTIONS: Question[] = [
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
  ...culturaQs,
];
