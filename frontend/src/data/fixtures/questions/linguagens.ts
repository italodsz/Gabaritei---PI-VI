import type { Question } from "@/types";
import { buildQuestion, conceptQuestions } from "./builder";

const CREDIT = "Texto elaborado para fins demonstrativos.";

/* ======================= FIGURAS DE LINGUAGEM ======================= */

const figurasQs = conceptQuestions({
  prefix: "por-figura",
  topicId: "por-figuras",
  skill: "Reconhecer figuras de linguagem e seus efeitos de sentido",
  prompt: "No trecho, predomina a figura de linguagem denominada",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "metafora",
      answer: "metáfora.",
      clue: "“Minha avó era o farol da família: nas noites mais difíceis, era para ela que todos olhavam.”",
      why: "A avó é identificada com um farol sem conectivo comparativo, por uma relação de semelhança (orientar, guiar): é uma metáfora.",
      subtopic: "semantica",
      difficulty: "facil",
      near: ["comparação."],
    },
    {
      key: "comparacao",
      answer: "comparação.",
      clue: "“O silêncio da sala de provas era pesado como uma manhã de chumbo.”",
      why: "A presença do conectivo “como” explicita a semelhança entre os termos, caracterizando a comparação (símile).",
      subtopic: "semantica",
      difficulty: "facil",
      near: ["metáfora."],
    },
    {
      key: "metonimia",
      answer: "metonímia.",
      clue: "“Na hora do intervalo, a escola inteira desceu para o pátio, e o prédio ficou em silêncio.”",
      why: "“A escola inteira” designa os estudantes e funcionários: emprega-se o lugar pelos seus ocupantes, caso de metonímia.",
      subtopic: "semantica",
      near: ["metáfora."],
    },
    {
      key: "hiperbole",
      answer: "hipérbole.",
      clue: "“Já pedi um milhão de vezes para você deixar o carregador no lugar!”",
      why: "O exagero intencional (“um milhão de vezes”) para enfatizar a ideia é a hipérbole.",
      subtopic: "construcao",
      difficulty: "facil",
    },
    {
      key: "antitese",
      answer: "antítese.",
      clue: "“Na rua estreita, convivem o luxo dos condomínios e a falta dos barracos.”",
      why: "A aproximação de ideias opostas (luxo × falta) cria a antítese.",
      subtopic: "construcao",
      near: ["paradoxo."],
    },
    {
      key: "paradoxo",
      answer: "paradoxo.",
      clue: "“Era um silêncio ensurdecedor, que gritava tudo o que ninguém dizia.”",
      why: "Ao unir ideias contraditórias em um mesmo ser (silêncio que ensurdece e grita), o trecho constrói um paradoxo, mais intenso que a simples oposição da antítese.",
      subtopic: "construcao",
      difficulty: "dificil",
      near: ["antítese."],
    },
    {
      key: "prosopopeia",
      answer: "prosopopeia.",
      clue: "“O vento sussurrava segredos às janelas, e as árvores dançavam no quintal.”",
      why: "Atribuir ações humanas a seres inanimados (sussurrar, dançar) é prosopopeia, ou personificação.",
      subtopic: "construcao",
      difficulty: "facil",
    },
    {
      key: "eufemismo",
      answer: "eufemismo.",
      clue: "“Depois de uma longa doença, seu avô descansou, cercado pela família.”",
      why: "“Descansou” suaviza a ideia de morte: trata-se de eufemismo.",
      subtopic: "construcao",
    },
    {
      key: "ironia",
      answer: "ironia.",
      clue: "“Que pontualidade admirável! Chegou só duas horas depois do combinado.”",
      why: "O elogio afirma o contrário do que se pretende dizer (o atraso), produzindo ironia.",
      subtopic: "construcao",
    },
    {
      key: "gradacao",
      answer: "gradação.",
      clue: "“Primeiro estranhou, depois duvidou, enfim revoltou-se contra a decisão.”",
      why: "A sequência de ações em intensidade crescente caracteriza a gradação.",
      subtopic: "construcao",
      difficulty: "dificil",
    },
  ],
  extraDistractors: ["onomatopeia.", "sinestesia."],
});

/* ======================= FUNÇÕES DA LINGUAGEM ======================= */

const funcoesQs = conceptQuestions({
  prefix: "por-funcao",
  topicId: "por-funcoes",
  skill: "Identificar a função da linguagem predominante em um texto",
  prompt: "A função da linguagem predominante no texto é a",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "referencial",
      answer: "referencial, centrada na informação.",
      clue: "A prefeitura informou que a vacinação contra a gripe será ampliada a partir de segunda-feira para pessoas de 18 a 59 anos, em todos os postos de saúde, das 8h às 17h.",
      why: "O texto transmite informações objetivas sobre um fato, com foco no referente: função referencial (denotativa).",
      difficulty: "facil",
    },
    {
      key: "emotiva",
      answer: "emotiva, centrada no emissor.",
      clue: "Ah, como sinto falta daquelas tardes na casa da minha mãe! Ainda hoje me emociono só de lembrar do cheiro de café passado.",
      why: "Predominam a primeira pessoa, as exclamações e a expressão de sentimentos de quem fala: função emotiva (expressiva).",
      difficulty: "facil",
    },
    {
      key: "conativa",
      answer: "conativa, centrada no receptor.",
      clue: "Não deixe para amanhã! Faça sua inscrição hoje mesmo e garanta sua vaga no cursinho comunitário.",
      why: "O uso do imperativo e a tentativa de convencer o leitor caracterizam a função conativa (apelativa).",
    },
    {
      key: "fatica",
      answer: "fática, centrada no canal.",
      clue: "— Alô? Alô? Está me ouvindo? A ligação está cortando… Oi, pode falar, agora sim estou ouvindo.",
      why: "As falas servem para testar e manter o contato comunicativo: função fática.",
    },
    {
      key: "metalinguistica",
      answer: "metalinguística, centrada no código.",
      clue: "Saudade: substantivo feminino. Sentimento de nostalgia causado pela ausência de alguém ou de algo querido.",
      why: "O texto usa a língua para explicar a própria língua, como no verbete de dicionário: função metalinguística.",
      difficulty: "dificil",
    },
    {
      key: "poetica",
      answer: "poética, centrada na mensagem.",
      clue: "Chove chuva miúda no telhado, / bate leve, bate lento, bate manso, / e o sono, molhado, cai cansado.",
      why: "O trabalho com sonoridade, ritmo e repetição chama atenção para a própria construção da mensagem: função poética.",
    },
  ],
});

/* ======================= VARIAÇÃO LINGUÍSTICA ======================= */

const variacaoQs: Question[] = [
  buildQuestion({
    id: "por-variacao-1",
    topicId: "por-variacao",
    subtopic: "regional",
    difficulty: "media",
    skill: "Reconhecer a variação linguística como fenômeno legítimo",
    support: {
      paragraphs: [
        "Em uma mesma cidade, há quem diga “mandioca”, “aipim” ou “macaxeira” para se referir à mesma raiz. As escolhas variam conforme a origem dos falantes, sua história familiar e os lugares por onde passaram.",
      ],
      credit: CREDIT,
    },
    prompt: "O texto evidencia que a variação linguística",
    correct: "reflete a diversidade regional e social dos falantes, sem que haja forma errada.",
    distractors: [
      "é um desvio da norma que deve ser corrigido na fala cotidiana.",
      "ocorre apenas entre falantes de regiões muito distantes.",
      "prejudica a comunicação entre pessoas de uma mesma cidade.",
      "deve ser evitada em qualquer situação de comunicação.",
    ],
    explanation: "As diferentes palavras são variantes legítimas, ligadas à história e à origem dos falantes. A variação é inerente às línguas e não representa erro.",
  }),
  buildQuestion({
    id: "por-variacao-2",
    topicId: "por-variacao",
    subtopic: "registro",
    difficulty: "media",
    skill: "Adequar o registro linguístico à situação comunicativa",
    support: {
      paragraphs: [
        "Mensagem 1: “E aí, mano, bora estudar pro simulado amanhã cedo? Tô dentro se tu levar o café!”",
        "Mensagem 2: “Prezada coordenadora, solicito a reserva da sala de estudos para amanhã, às 8 horas, a fim de prepararmos o simulado.”",
      ],
      credit: CREDIT,
    },
    prompt: "A diferença entre as mensagens revela que os falantes",
    correct: "ajustam o grau de formalidade conforme o interlocutor e a situação.",
    distractors: [
      "dominam a norma-padrão apenas na escrita formal.",
      "cometem erros gramaticais em contextos informais.",
      "empregam a linguagem formal apenas entre amigos.",
      "desconhecem as regras de concordância da língua.",
    ],
    explanation: "O registro informal é adequado entre amigos; o formal, em comunicações institucionais. Adequar a linguagem à situação é competência comunicativa, não erro.",
  }),
  buildQuestion({
    id: "por-variacao-3",
    topicId: "por-variacao",
    subtopic: "regional",
    difficulty: "dificil",
    skill: "Analisar o preconceito linguístico",
    support: {
      paragraphs: [
        "Um apresentador de televisão ridicularizou o modo de falar de um entrevistado do interior, imitando seu sotaque e afirmando que “ele não sabe falar português”.",
      ],
      credit: CREDIT,
    },
    prompt: "A atitude do apresentador pode ser classificada como",
    correct: "preconceito linguístico, que desvaloriza variedades associadas a determinados grupos.",
    distractors: [
      "correção gramatical necessária para preservar a língua.",
      "uso adequado da função metalinguística da linguagem.",
      "exemplo de neutralidade no tratamento das variedades.",
      "valorização do sotaque como patrimônio cultural.",
    ],
    explanation: "Desqualificar uma variedade linguística — e, com ela, seus falantes — é preconceito linguístico. Do ponto de vista científico, todas as variedades são sistemas organizados.",
  }),
];

/* ======================= GÊNEROS TEXTUAIS ======================= */

const generosQs = conceptQuestions({
  prefix: "por-genero",
  topicId: "por-generos",
  skill: "Reconhecer gêneros textuais por sua estrutura e finalidade",
  prompt: "O trecho pertence ao gênero",
  support: (clue) => ({ paragraphs: [clue], credit: CREDIT }),
  items: [
    {
      key: "receita",
      answer: "receita culinária, de caráter instrucional.",
      clue: "Ingredientes: 2 xícaras de farinha, 1 ovo, 1 xícara de leite. Modo de preparo: misture os ingredientes secos, acrescente o leite aos poucos e mexa até obter uma massa lisa.",
      why: "A lista de ingredientes e os verbos no imperativo, que orientam ações em sequência, caracterizam a receita, gênero instrucional.",
      difficulty: "facil",
    },
    {
      key: "noticia",
      answer: "notícia, de caráter informativo.",
      clue: "Uma ponte que liga dois bairros da zona norte foi interditada na manhã desta terça-feira após técnicos identificarem rachaduras na estrutura. Segundo a Defesa Civil, não há previsão de liberação.",
      why: "O relato objetivo de um fato recente, com indicação de tempo, lugar e fonte, é característico da notícia.",
      difficulty: "facil",
    },
    {
      key: "editorial",
      answer: "editorial, de caráter opinativo.",
      clue: "A interdição da ponte é mais um retrato do descaso histórico com a manutenção urbana. Não basta interditar: é urgente que o poder público assuma um plano permanente de conservação.",
      why: "O texto defende um ponto de vista institucional sobre um fato, com argumentos e avaliação — próprio do editorial.",
    },
    {
      key: "anuncio",
      answer: "anúncio publicitário.",
      clue: "Sua energia rende mais com Vitta+. Uma garrafinha por dia e você enfrenta qualquer maratona de estudos. Vitta+: o gás que faltava.",
      why: "A promoção de um produto, o slogan e a linguagem persuasiva dirigida ao consumidor caracterizam o anúncio publicitário.",
    },
    {
      key: "verbete",
      answer: "verbete, de caráter expositivo.",
      clue: "Ipê (substantivo masculino): árvore da família das bignoniáceas, nativa das Américas, conhecida pelas flores amarelas, roxas ou brancas que surgem no fim do inverno.",
      why: "A definição de um termo, com classe gramatical e informações descritivas, organizada para consulta, caracteriza o verbete.",
      difficulty: "dificil",
    },
  ],
  extraDistractors: ["crônica, de caráter narrativo."],
});

/* ======================= INTERPRETAÇÃO ======================= */

const interpretacaoQs: Question[] = [
  buildQuestion({
    id: "por-interp-1",
    topicId: "por-interpretacao",
    subtopic: "inferencia",
    difficulty: "media",
    skill: "Inferir informações implícitas em textos",
    support: {
      paragraphs: [
        "Toda noite, depois que a casa dormia, Lúcia acendia a pequena luminária da cozinha e abria os livros sobre a mesa ainda com cheiro de jantar. Quando o despertador do pai tocava, às cinco, ela já tinha resolvido mais uma lista — e o caderno estava guardado antes que alguém acordasse.",
      ],
      credit: CREDIT,
    },
    prompt: "A partir do texto, infere-se que Lúcia",
    correct: "dedica-se aos estudos em horários de silêncio, sem que a família perceba.",
    distractors: [
      "estuda apenas nos fins de semana, quando tem tempo livre.",
      "é obrigada pelo pai a estudar durante a madrugada.",
      "tem um quarto próprio, reservado aos estudos.",
      "desistiu dos estudos para ajudar no trabalho doméstico.",
    ],
    explanation: "O texto mostra que Lúcia estuda à noite, na cozinha, e guarda o caderno antes de todos acordarem, o que permite inferir que estuda discretamente nos momentos de silêncio.",
  }),
  buildQuestion({
    id: "por-interp-2",
    topicId: "por-interpretacao",
    subtopic: "argumentacao",
    difficulty: "media",
    skill: "Identificar estratégias argumentativas",
    support: {
      paragraphs: [
        "Segundo levantamento de uma organização de mobilidade urbana, cidades que ampliaram as ciclovias reduziram em até 30% os acidentes envolvendo ciclistas. Investir em infraestrutura segura, portanto, não é luxo: é política de saúde pública.",
      ],
      credit: CREDIT,
    },
    prompt: "Para sustentar seu ponto de vista, o autor recorre principalmente a",
    correct: "dados estatísticos atribuídos a uma fonte especializada.",
    distractors: [
      "relatos pessoais de ciclistas acidentados.",
      "comparações entre diferentes meios de transporte.",
      "citações de autoridades políticas.",
      "argumentos baseados em senso comum.",
    ],
    explanation: "O argumento se apoia no percentual de redução de acidentes, atribuído a um levantamento: é o argumento por comprovação (dados estatísticos).",
  }),
  buildQuestion({
    id: "por-interp-3",
    topicId: "por-interpretacao",
    subtopic: "inferencia",
    difficulty: "facil",
    skill: "Reconhecer o tema central de um texto",
    support: {
      paragraphs: [
        "A biblioteca comunitária do bairro começou com doze livros em uma estante improvisada. Hoje tem mais de três mil títulos, oficinas de escrita e um clube de leitura para adolescentes, tudo mantido por voluntários e doações dos próprios moradores.",
      ],
      credit: CREDIT,
    },
    prompt: "O tema central do texto é",
    correct: "a mobilização comunitária em torno do acesso à leitura.",
    distractors: [
      "a falta de investimento público em bibliotecas.",
      "a substituição dos livros impressos por digitais.",
      "a dificuldade de adolescentes em ler livros longos.",
      "a venda de livros usados em bairros periféricos.",
    ],
    explanation: "O texto destaca o crescimento da biblioteca graças a voluntários e doações dos moradores: o foco é a mobilização da comunidade pelo acesso à leitura.",
  }),
  buildQuestion({
    id: "por-interp-4",
    topicId: "por-interpretacao",
    subtopic: "argumentacao",
    difficulty: "dificil",
    skill: "Analisar o efeito de sentido de recursos linguísticos",
    support: {
      paragraphs: [
        "Dizem que o celular aproxima quem está longe. Talvez. Mas, no almoço de domingo, a família inteira estava reunida — e cada um olhava para uma tela diferente.",
      ],
      credit: CREDIT,
    },
    prompt: "No texto, o uso de “Talvez” e da conjunção “Mas” produz o efeito de",
    correct: "relativizar uma ideia comum e introduzir uma contraposição a ela.",
    distractors: [
      "confirmar integralmente a opinião apresentada no início.",
      "acrescentar um novo exemplo que reforça a tese inicial.",
      "indicar uma conclusão lógica do argumento anterior.",
      "estabelecer uma relação de causa entre as ideias.",
    ],
    explanation: "“Talvez” enfraquece a afirmação inicial e “Mas” introduz uma ideia oposta: a tecnologia pode afastar quem está perto.",
  }),
];

/* ======================= LITERATURA ======================= */

const literaturaQs = conceptQuestions({
  prefix: "lit",
  topicId: "lit-escolas",
  skill: "Reconhecer características de estilos de época da literatura brasileira",
  prompt: "As características descritas identificam o(a)",
  items: [
    {
      key: "barroco",
      answer: "Barroco.",
      clue: "Estilo marcado pelo conflito entre fé e razão, matéria e espírito, com linguagem rebuscada, jogos de palavras (cultismo) e de ideias (conceptismo).",
      why: "O dualismo, o cultismo e o conceptismo são traços do Barroco, representado no Brasil por Gregório de Matos e Padre Antônio Vieira.",
      subtopic: "classicas",
    },
    {
      key: "arcadismo",
      answer: "Arcadismo.",
      clue: "Poesia que idealiza a vida simples no campo, adota pseudônimos pastoris e retoma lemas como fugere urbem e carpe diem.",
      why: "Bucolismo, pseudônimos pastoris e o lema fugere urbem caracterizam o Arcadismo, de autores como Tomás Antônio Gonzaga.",
      subtopic: "classicas",
      difficulty: "facil",
    },
    {
      key: "romantismo",
      answer: "Romantismo.",
      clue: "Valorização do sentimento e da subjetividade, idealização da mulher e do amor, nacionalismo e, na prosa, a figura do indígena como herói nacional.",
      why: "Subjetivismo, idealização e nacionalismo (como no indianismo de José de Alencar) definem o Romantismo.",
      subtopic: "xix",
      difficulty: "facil",
    },
    {
      key: "realismo",
      answer: "Realismo.",
      clue: "Narrativas que analisam criticamente a sociedade burguesa, com ironia e aprofundamento psicológico das personagens, como em Memórias Póstumas de Brás Cubas.",
      why: "Crítica social, ironia e análise psicológica, como na obra de Machado de Assis, são traços do Realismo.",
      subtopic: "xix",
      near: ["Naturalismo."],
    },
    {
      key: "naturalismo",
      answer: "Naturalismo.",
      clue: "Romances que mostram o comportamento humano determinado pelo meio, pela raça e pelo momento histórico, com personagens coletivas como em O Cortiço.",
      why: "O determinismo e a influência das ciências naturais, como em O Cortiço, de Aluísio Azevedo, caracterizam o Naturalismo.",
      subtopic: "xix",
      difficulty: "dificil",
      near: ["Realismo."],
    },
    {
      key: "parnasianismo",
      answer: "Parnasianismo.",
      clue: "Poesia que busca a perfeição formal, com métrica rigorosa, rimas ricas, vocabulário erudito e defesa da “arte pela arte”.",
      why: "Culto à forma e lema “arte pela arte”, como em Olavo Bilac, definem o Parnasianismo.",
      subtopic: "xix",
      near: ["Simbolismo."],
    },
    {
      key: "simbolismo",
      answer: "Simbolismo.",
      clue: "Poesia que explora a musicalidade, as sinestesias, o misticismo e o inconsciente, sugerindo mais do que descrevendo.",
      why: "Musicalidade, sinestesia e espiritualidade marcam o Simbolismo, de Cruz e Sousa.",
      subtopic: "xix",
      near: ["Parnasianismo."],
    },
    {
      key: "modernismo",
      answer: "primeira fase do Modernismo.",
      clue: "Ruptura com as formas tradicionais, uso de verso livre, linguagem coloquial, humor e valorização crítica da identidade brasileira, a partir da Semana de Arte Moderna de 1922.",
      why: "A Semana de 1922, o verso livre, a irreverência e a busca por uma expressão nacional caracterizam a primeira geração modernista.",
      subtopic: "modernismo",
      difficulty: "facil",
    },
    {
      key: "regionalismo-30",
      answer: "romance regionalista de 1930.",
      clue: "Prosa de denúncia social que retrata a seca, a miséria e as relações de poder no Nordeste, como em Vidas Secas, de Graciliano Ramos.",
      why: "A prosa de 1930, com Graciliano Ramos e Rachel de Queiroz, denunciou problemas sociais nordestinos — o regionalismo da segunda fase modernista.",
      subtopic: "modernismo",
    },
  ],
});

/* ======================= ARTES ======================= */

const artesQs = conceptQuestions({
  prefix: "art",
  topicId: "art-movimentos",
  skill: "Reconhecer características de movimentos artísticos",
  prompt: "As características descritas correspondem ao movimento",
  items: [
    {
      key: "impressionismo",
      answer: "Impressionismo.",
      clue: "Pintores que trabalhavam ao ar livre buscavam captar os efeitos passageiros da luz natural, com pinceladas soltas e visíveis.",
      why: "A pintura ao ar livre e o interesse pela luz e pelas impressões momentâneas definem o Impressionismo.",
      difficulty: "facil",
    },
    {
      key: "cubismo",
      answer: "Cubismo.",
      clue: "Representação dos objetos decompostos em formas geométricas, mostrando simultaneamente vários pontos de vista em uma mesma tela.",
      why: "A fragmentação geométrica e a simultaneidade de ângulos caracterizam o Cubismo de Picasso e Braque.",
    },
    {
      key: "surrealismo",
      answer: "Surrealismo.",
      clue: "Obras que exploram o inconsciente, os sonhos e associações ilógicas, criando cenas que desafiam a lógica do mundo real.",
      why: "A exploração do inconsciente e do onírico, influenciada pela psicanálise, é a marca do Surrealismo.",
    },
    {
      key: "expressionismo",
      answer: "Expressionismo.",
      clue: "Cores intensas e formas distorcidas para expressar emoções e angústias humanas, como na figura que grita sob um céu avermelhado.",
      why: "A distorção e as cores intensas a serviço da emoção caracterizam o Expressionismo.",
    },
    {
      key: "antropofagia",
      answer: "Movimento Antropofágico.",
      clue: "Proposta modernista brasileira de “devorar” criticamente as influências estrangeiras para produzir uma arte original, simbolizada pela pintura Abaporu, de Tarsila do Amaral.",
      why: "O Manifesto Antropófago (1928) e a obra Abaporu, de Tarsila, propuseram assimilar criticamente a cultura estrangeira.",
      difficulty: "dificil",
    },
    {
      key: "pop-art",
      answer: "Pop Art.",
      clue: "Uso de imagens da cultura de massa — embalagens, quadrinhos e celebridades —, muitas vezes repetidas com técnicas de serigrafia.",
      why: "A apropriação da cultura de massa e da publicidade caracteriza a Pop Art, de Andy Warhol e Roy Lichtenstein.",
    },
  ],
});

/* ======================= INGLÊS ======================= */

const inglesQs: Question[] = [
  buildQuestion({
    id: "ing-1",
    topicId: "ing-interpretacao",
    difficulty: "facil",
    skill: "Compreender a ideia principal de textos em língua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Community gardens are popping up in vacant lots across many cities. Besides providing fresh vegetables, they give neighbors a reason to meet, share tools and teach each other. “I came for the tomatoes, but I stayed for the people,” says one volunteer.",
      ],
      credit: CREDIT,
    },
    prompt: "De acordo com o texto, as hortas comunitárias",
    correct: "fortalecem os laços entre vizinhos, além de produzir alimentos.",
    distractors: [
      "substituem os supermercados nas grandes cidades.",
      "são proibidas em terrenos urbanos desocupados.",
      "interessam apenas a quem quer vender tomates.",
      "exigem equipamentos caros e mão de obra especializada.",
    ],
    explanation: "O texto afirma que as hortas oferecem vegetais frescos e motivos para os vizinhos se encontrarem; a fala do voluntário reforça o aspecto social.",
  }),
  buildQuestion({
    id: "ing-2",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Identificar a finalidade de gêneros textuais em língua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "LOST & FOUND — Did you leave a blue backpack in Room 12 after Friday's chemistry lab? It contains a calculator and a notebook with the name “Sam”. Please pick it up at the front desk before Wednesday.",
      ],
      credit: CREDIT,
    },
    prompt: "O objetivo desse aviso é",
    correct: "localizar o dono de uma mochila esquecida na escola.",
    distractors: [
      "anunciar a venda de materiais escolares usados.",
      "convidar estudantes para uma aula de química.",
      "informar o roubo de uma calculadora na escola.",
      "divulgar o novo horário da recepção.",
    ],
    explanation: "“Lost & Found” significa achados e perdidos; o aviso pede que o dono da mochila azul a retire na recepção.",
  }),
  buildQuestion({
    id: "ing-3",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Reconhecer o sentido de expressões em contexto",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Many students believe that cramming the night before an exam is the best strategy. However, research on memory suggests that spacing study sessions over several days leads to longer-lasting learning.",
      ],
      credit: CREDIT,
    },
    prompt: "No texto, a palavra “However” introduz uma ideia que",
    correct: "se opõe à crença apresentada anteriormente.",
    distractors: [
      "confirma a estratégia de estudar na véspera.",
      "explica a causa da crença dos estudantes.",
      "conclui o texto com um resumo.",
      "acrescenta um exemplo semelhante ao anterior.",
    ],
    explanation: "“However” equivale a “no entanto”: introduz o contraste entre a crença em estudar na véspera e o que a pesquisa sugere sobre estudos espaçados.",
  }),
  buildQuestion({
    id: "ing-4",
    topicId: "ing-interpretacao",
    difficulty: "dificil",
    skill: "Inferir o posicionamento do autor em textos de opinião",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Fast fashion lets us buy trendy clothes for very little money. But the real price is paid elsewhere: by rivers polluted with dyes, by workers earning less than a living wage, and by landfills full of shirts worn only twice.",
      ],
      credit: CREDIT,
    },
    prompt: "Ao afirmar que “the real price is paid elsewhere”, o autor",
    correct: "critica os custos sociais e ambientais da moda descartável.",
    distractors: [
      "defende que roupas baratas sejam vendidas em outros países.",
      "elogia a democratização do acesso à moda.",
      "sugere que as lojas aumentem seus preços de etiqueta.",
      "informa que o descarte de roupas é controlado por lei.",
    ],
    explanation: "O “preço real” refere-se à poluição, aos baixos salários e ao lixo têxtil: o autor critica os impactos ocultos do fast fashion.",
  }),
  buildQuestion({
    id: "ing-5",
    topicId: "ing-interpretacao",
    difficulty: "facil",
    skill: "Compreender instruções em língua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "Before you start: charge the device for at least two hours. Do not expose it to water. To turn it on, press and hold the side button for three seconds.",
      ],
      credit: CREDIT,
    },
    prompt: "Segundo as instruções, para ligar o aparelho, o usuário deve",
    correct: "manter o botão lateral pressionado por três segundos.",
    distractors: [
      "carregá-lo por três segundos.",
      "mergulhá-lo em água por duas horas.",
      "apertar o botão lateral duas vezes.",
      "desligá-lo da tomada antes de usá-lo.",
    ],
    explanation: "“Press and hold the side button for three seconds” significa “pressione e segure o botão lateral por três segundos”.",
  }),
  buildQuestion({
    id: "ing-6",
    topicId: "ing-interpretacao",
    difficulty: "media",
    skill: "Relacionar texto e contexto social em língua inglesa",
    foreignLanguage: "ingles",
    support: {
      paragraphs: [
        "In 1955, Rosa Parks refused to give up her seat to a white passenger on a bus in Montgomery, Alabama. Her arrest sparked a bus boycott that lasted more than a year and became a landmark of the civil rights movement.",
      ],
      credit: CREDIT,
    },
    prompt: "O texto relata um episódio que se tornou símbolo da luta",
    correct: "contra a segregação racial nos Estados Unidos.",
    distractors: [
      "pela redução das tarifas de ônibus.",
      "pelo direito de voto das mulheres.",
      "pela independência do estado do Alabama.",
      "contra a privatização do transporte público.",
    ],
    explanation: "A recusa de Rosa Parks e o boicote aos ônibus de Montgomery tornaram-se marcos do movimento pelos direitos civis contra a segregação racial.",
  }),
];

/* ======================= ESPANHOL ======================= */

const espanholQs: Question[] = [
  buildQuestion({
    id: "esp-1",
    topicId: "esp-interpretacao",
    difficulty: "facil",
    skill: "Compreender a ideia principal de textos em língua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "En muchos pueblos de América Latina, el mercado de los domingos es mucho más que un lugar para comprar frutas y verduras: es el espacio donde los vecinos se encuentran, intercambian noticias y mantienen vivas sus tradiciones.",
      ],
      credit: CREDIT,
    },
    prompt: "Segundo o texto, os mercados de domingo",
    correct: "têm importante papel social e cultural para as comunidades.",
    distractors: [
      "estão desaparecendo por causa dos supermercados.",
      "vendem apenas produtos importados.",
      "funcionam somente nas grandes capitais.",
      "são frequentados principalmente por turistas.",
    ],
    explanation: "O texto afirma que o mercado é “mucho más que un lugar para comprar”: é espaço de encontro e de manutenção de tradições.",
  }),
  buildQuestion({
    id: "esp-2",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Reconhecer falsos cognatos em língua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "—¿Ya terminaste la tarea? —preguntó la profesora.\n—Todavía no. Me falta una pregunta, pero la entrego enseguida.",
      ],
      credit: CREDIT,
    },
    prompt: "No diálogo, a palavra “enseguida” indica que o estudante entregará a tarefa",
    correct: "imediatamente.",
    distractors: ["no dia seguinte.", "na semana seguinte.", "em sequência a outro colega.", "somente após a aula."],
    explanation: "“Enseguida” significa “em seguida, imediatamente”. A semelhança com “seguinte” em português pode induzir ao erro.",
  }),
  buildQuestion({
    id: "esp-3",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Interpretar textos publicitários em língua espanhola",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "¡Apaga la luz que no usas! Pequeños gestos en casa ayudan a reducir el consumo de energía y a cuidar el planeta. Campaña de ahorro energético.",
      ],
      credit: CREDIT,
    },
    prompt: "A campanha tem como objetivo",
    correct: "incentivar a economia de energia elétrica nas residências.",
    distractors: [
      "vender lâmpadas mais potentes.",
      "anunciar um corte programado de energia.",
      "informar o aumento da tarifa de luz.",
      "promover a instalação de novos postes.",
    ],
    explanation: "“Apaga la luz que no usas” e “ahorro energético” (economia de energia) indicam uma campanha de conscientização para reduzir o consumo.",
  }),
  buildQuestion({
    id: "esp-4",
    topicId: "esp-interpretacao",
    difficulty: "dificil",
    skill: "Identificar posicionamentos em textos de opinião em espanhol",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "Se dice que los jóvenes ya no leen. Sin embargo, nunca se ha leído tanto: mensajes, foros, reseñas, fanfics. Quizás la pregunta no sea si leen, sino qué y cómo leen.",
      ],
      credit: CREDIT,
    },
    prompt: "O autor do texto",
    correct: "questiona a ideia de que os jovens não leem, propondo outra abordagem.",
    distractors: [
      "confirma que os jovens abandonaram a leitura.",
      "defende a proibição das redes sociais.",
      "afirma que apenas livros impressos são leitura.",
      "critica os fanfics como literatura de baixa qualidade.",
    ],
    explanation: "Com “Sin embargo” (no entanto), o autor contesta o senso comum e sugere discutir o que e como os jovens leem.",
  }),
  buildQuestion({
    id: "esp-5",
    topicId: "esp-interpretacao",
    difficulty: "facil",
    skill: "Compreender informações explícitas em textos em espanhol",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "Biblioteca Municipal — Horario de atención: de lunes a viernes, de 9 a 18 horas; sábados, de 9 a 13 horas. Los domingos permanecemos cerrados.",
      ],
      credit: CREDIT,
    },
    prompt: "De acordo com o aviso, a biblioteca",
    correct: "não abre aos domingos.",
    distractors: [
      "funciona aos sábados até as 18 horas.",
      "abre todos os dias da semana.",
      "atende apenas no período da tarde.",
      "fecha às 13 horas de segunda a sexta.",
    ],
    explanation: "“Los domingos permanecemos cerrados” significa que a biblioteca fica fechada aos domingos.",
  }),
  buildQuestion({
    id: "esp-6",
    topicId: "esp-interpretacao",
    difficulty: "media",
    skill: "Relacionar textos em espanhol a aspectos culturais",
    foreignLanguage: "espanhol",
    support: {
      paragraphs: [
        "El Día de Muertos, celebrado en México el 1 y 2 de noviembre, no es una fecha triste. Las familias construyen altares con flores de cempasúchil, fotografías y la comida favorita de sus seres queridos, para recibirlos con alegría.",
      ],
      credit: CREDIT,
    },
    prompt: "O texto apresenta o Día de Muertos como uma celebração",
    correct: "festiva de homenagem e memória aos entes falecidos.",
    distractors: [
      "proibida pelas autoridades mexicanas.",
      "marcada exclusivamente pelo luto e pelo silêncio.",
      "de origem recente, criada por empresas de turismo.",
      "dedicada às colheitas de flores do outono.",
    ],
    explanation: "O texto afirma que a data “no es una fecha triste” e descreve altares para receber os entes queridos “con alegría”.",
  }),
];

export const LINGUAGENS_QUESTIONS: Question[] = [
  ...figurasQs,
  ...funcoesQs,
  ...variacaoQs,
  ...generosQs,
  ...interpretacaoQs,
  ...literaturaQs,
  ...artesQs,
  ...inglesQs,
  ...espanholQs,
];
