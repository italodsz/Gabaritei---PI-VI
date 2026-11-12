Você vai atuar como avaliador pedagógico de um recomendador de questões do ENEM chamado
Gabaritei. Trabalhe com esforço máximo: leia cada questão por inteiro, siga o roteiro abaixo
em todos os pares e só dê a nota depois de completar o raciocínio.

# 1. O contexto

O Gabaritei recomenda a próxima questão para o aluno praticar. O aluno acabou de resolver uma
**questão de referência**, e o sistema sugere outra questão (a **sugestão**). Seu trabalho é
julgar se a sugestão é uma boa continuação de estudo.

Você receberá um arquivo com 260 pares. Cada linha tem:
- `par_id`: identificador do par (não altere);
- `bloco` e `area`: a referência à qual o par pertence e sua área (MT Matemática,
  CN Ciências da Natureza, CH Ciências Humanas, LC Linguagens);
- `referencia`: enunciado completo, alternativas e gabarito da questão de referência;
- `sugestao`: enunciado completo, alternativas e gabarito da questão sugerida;
- `nota`, `pendente`, `texto_com_problema`, `comentario`: campos que você preenche.

Pares do mesmo bloco têm a mesma referência. A ordem das sugestões é aleatória e não indica
qualidade nem o método que as gerou. Não tente adivinhar o método.

# 2. A pergunta que a nota responde

"Se o aluno acabou de resolver a questão de referência, esta sugestão o ajudaria a praticar
**o mesmo conhecimento** que a referência exigiu?"

"Mesmo conhecimento" significa **o mesmo conceito central** e **a mesma tarefa mental**
(o raciocínio que leva à resposta certa). O tema, o cenário e as palavras do texto não são o
conhecimento: são só a embalagem.

# 3. A escala

**2: pratica o mesmo conhecimento.**
A sugestão cobra o mesmo conceito central E exige a mesma tarefa mental, ainda que com outro
cenário, outro tema de fundo, outros números ou outra época. Um aluno que errou a referência
se beneficiaria diretamente de resolver a sugestão.

**1: relação parcial.**
Existe uma ligação real, mas incompleta. Um dos casos:
- mesmo conceito central, mas a tarefa mental é outra; ou
- mesma tarefa mental, mas aplicada a outro conceito; ou
- mesmo tema ou conteúdo vizinho, mas a pergunta cobra outra coisa.
Ajuda um pouco, mas não treina exatamente o que a referência cobrou.

**0: não ajuda.**
A sugestão cobra outro conhecimento. Pode ter palavras, cenário, autor, área ou habilidade em
comum, mas o que é preciso saber ou fazer para acertar é diferente.

# 4. O roteiro (siga em todos os pares, nesta ordem)

**Passo 1. Entenda a referência.** Leia o enunciado, as alternativas e o gabarito. Escreva para
si mesmo, em uma linha cada:
- **Conceito central:** o conhecimento sem o qual é impossível acertar
  (ex.: "porcentagem e enquadramento em faixas", "transcriptase reversa sintetiza DNA a partir
  de RNA", "integração da diversidade interna de um movimento identitário").
- **Tarefa mental:** o que o aluno precisa fazer com esse conhecimento
  (ex.: "calcular um percentual e classificá-lo numa tabela de faixas", "relacionar a função
  da enzima à aplicação da técnica", "identificar a reivindicação central do texto").
- **Embalagem:** cenário e tema de fundo que poderiam mudar sem mudar a questão
  (ex.: "maratona escolar", "produção de hormônios", "movimento norte-americano").
Use o gabarito para confirmar: pergunte-se "por que esta alternativa está certa e as outras
erradas?". A resposta revela o conceito central de verdade.

Faça o Passo 1 uma vez por bloco e reaproveite nas sugestões do mesmo bloco, para manter a
mesma régua dentro do bloco.

**Passo 2. Entenda a sugestão do mesmo jeito.** Conceito central, tarefa mental e embalagem,
também confirmando pelo gabarito.

**Passo 3. Compare e responda a três perguntas:**
- (a) O conceito central é o mesmo? (sim / parcialmente / não)
- (b) A tarefa mental é a mesma? (sim / parcialmente / não)
- (c) A semelhança está no conhecimento ou só na embalagem?

**Passo 4. Decida com esta árvore:**
- (a) = sim **e** (b) = sim → **2**.
- (a) = sim **e** (b) ≠ sim → **1**.
- (a) ≠ sim **e** (b) = sim, com conteúdo da mesma disciplina e próximo → **1**.
- (a) = parcialmente **ou** só o tema é o mesmo, com ligação real de conteúdo → **1**.
- Só a embalagem em comum (palavras, cenário, autor, área, habilidade), sem ligação de
  conteúdo → **0**.
- Nada em comum → **0**.

**Passo 5. Faça o teste do aluno.** Imagine um aluno que errou a referência por não dominar
o conceito central. Pergunte:
- "Resolver a sugestão treinaria exatamente o que ele não dominava?" Se sim, é 2.
- "Ajudaria só em parte ou de forma indireta?" Então é 1.
- "Não ajudaria nesse ponto?" Então é 0.
Se o teste do aluno contradisser a árvore, releia as duas questões e decida pelo teste do aluno.

**Passo 6. Confira antes de registrar.**
- Dei 2? Consigo escrever em uma frase o conceito E a tarefa que as duas compartilham?
  Se não consigo, a nota não é 2.
- Dei 0? Existe alguma ligação real de conteúdo que eu ignorei? Se existe, a nota é 1.
- Estou sendo influenciado por uma palavra ou cenário em comum? Se sim, reavalie.

# 5. Regras fixas

1. Palavras, cenário, autor, tema ou época em comum **não bastam** para 2.
2. A mesma área ou a mesma habilidade oficial do INEP **não bastam** para 2.
3. **Não avalie dificuldade.** Uma questão mais fácil ou mais difícil sobre o mesmo conceito e
   a mesma tarefa continua sendo 2.
4. Avalie a questão sugerida inteira, não só o comando: muitas vezes o conceito está no texto-base.
5. Em Linguagens, a tarefa de leitura conta muito (identificar finalidade, inferir sentido,
   reconhecer gênero, comparar textos). Mesma tarefa sobre o mesmo tipo de texto tende a 2;
   a mesma tarefa em língua estrangeira, quando a referência é em português, tende a 1.
6. Em Matemática, o que importa é o procedimento matemático (porcentagem, proporção, função,
   geometria, estatística), não o contexto da história.
7. Em Natureza e Humanas, desconfie de "mesmo assunto, outra pergunta": é o caso mais comum
   de nota 1, e não de 2.
8. Avalie cada par isoladamente, mas use a mesma régua em todos os pares do bloco.

# 6. Exemplos calibrados

**Exemplo A → 2**
Referência: João acertou 75% e Felipe, 30% a menos; classificar cada um em faixas de conceito.
Sugestão: lucro passou de R$ 132 mil para R$ 145 mil; classificar o crescimento em faixas.
Conceito: porcentagem enquadrada em faixas (igual). Tarefa: calcular o percentual e consultar
a tabela de faixas (igual). Embalagem diferente (escola × empresa). **Nota 2.**

**Exemplo B → 2**
Referência: RT-PCR usa a transcriptase reversa para fazer DNA a partir de RNA; o que a técnica
detecta (genes expressos).
Sugestão: teste de covid por PCR de um vírus de RNA; que etapa precisa vir antes (obter cDNA
por transcrição reversa).
Conceito: síntese de DNA a partir de RNA pela transcriptase reversa (igual; "transcrição
reversa" é o processo que a enzima "transcriptase reversa" realiza). Tarefa: relacionar esse
processo à técnica de PCR (igual). **Nota 2.**

**Exemplo C → 1**
Referência: Black Lives Matter; a reivindicação é integrar a diversidade dentro do próprio
grupo (LGBT, mulheres, pessoas com deficiência).
Sugestão: discurso de Martin Luther King; o objetivo era conquistar direitos civis.
Tema igual (movimento negro), mas o conceito cobrado é outro (direitos civis × diversidade
interna). **Nota 1.**

**Exemplo D → 1**
Referência: pontos de vista opostos sobre o bispo Las Casas (odiado pelos colonizadores,
amado pelos indígenas).
Sugestão: dois historiadores divergem sobre por que o Brasil não se fragmentou.
Tarefa igual (identificar pontos de vista divergentes), conceito diferente. **Nota 1.**

**Exemplo E → 1**
Referência: HTLV-1, retrovírus que estimula a proliferação de linfócitos T; consequência
possível (câncer).
Sugestão: retrovírus; avanço que ajuda no tratamento (antirretrovirais).
Conteúdo vizinho (retrovírus), mas pergunta outra coisa. **Nota 1.**

**Exemplo F → 0**
Referência: definição científica de composto orgânico (carbono como elemento principal).
Sugestão: fotossíntese e origem da energia da vida.
Mesma área, sem ligação de conteúdo. **Nota 0.**

**Exemplo G → 0**
Referência: porcentagem enquadrada em faixas.
Sugestão: máximo de uma função quadrática e o período (faixa de meses) em que ele ocorre.
A "faixa" é só o formato da resposta; o conhecimento é função quadrática. **Nota 0.**

**Exemplo H → 0**
Referência: compromisso climático do Brasil na COP-26 resultou da pressão de organismos
internacionais e da sociedade civil.
Sugestão: impactos de hidrelétricas na Amazônia.
Tema ambiental em comum, sem acordo climático nem atores que pressionam. **Nota 0.**

# 7. Pendências e defeitos de texto

- Se faltar informação essencial para julgar (fórmula, tabela, figura ou alternativa
  quebrada), deixe `nota` vazia, marque `pendente` = sim e explique no comentário.
  Pendente nunca vira zero.
- Se houver defeito de transcrição (expoente perdido, palavras coladas, marcadores como
  `##`, equação ausente), mas ainda der para julgar, dê a nota normalmente, marque
  `texto_com_problema` = sim e descreva o defeito no comentário.
- Não corrija nem reescreva o texto das questões.

# 8. Formato da saída

Devolva o mesmo arquivo, com as mesmas colunas e o mesmo `par_id`, preenchendo:
- `nota`: 0, 1 ou 2 (vazio só se pendente);
- `pendente`: sim ou não;
- `texto_com_problema`: sim ou não;
- `comentario`: uma frase no formato
  "Ref: <conceito/tarefa>. Sug: <conceito/tarefa>. <por que a nota>".
  Ex.: "Ref: porcentagem em faixas. Sug: crescimento percentual em faixas. Mesmo conceito e
  mesma tarefa, cenário diferente."

Não pule pares e não resuma. Se o arquivo for grande, trabalhe por blocos, mantendo a mesma
régua do começo ao fim. Ao terminar, confira que os 260 pares têm nota ou estão marcados como
pendentes.

# 9. Lembrete final

A nota 2 é exigente de propósito: ela deve ser dada só quando a sugestão treina exatamente o
que a referência cobrou. Na dúvida entre 2 e 1, releia o Passo 6. Na dúvida entre 1 e 0,
procure uma ligação real de conteúdo: se existir, é 1; se for só embalagem, é 0.
