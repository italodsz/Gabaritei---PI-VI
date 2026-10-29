const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,HeadingLevel,PageBreak,AlignmentType}=require('docx');
const data=JSON.parse(fs.readFileSync('conteudo.json','utf8'));
const AREA={MT:'Matemática',CN:'Ciências da Natureza',CH:'Ciências Humanas',LC:'Linguagens'};
const clean=t=>t.replace(/\*\*|__/g,'').replace(/(^|\s)_([^_]+)_/g,'$1$2').replace(/\\([\[\]*_])/g,'$1');
const P=(text,o={})=>new Paragraph({spacing:{after:o.after??120},children:[new TextRun({text,bold:o.bold,italics:o.it,size:o.size})],...(o.h?{heading:o.h}:{})});
const paras=t=>clean(t).split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>P(s));
function questao(q){
  const out=paras(q.texto);
  q.opcoes.forEach(([l,t])=>out.push(P(`${l}) ${clean(t)}`,{after:60})));
  out.push(P(`Gabarito: ${q.gabarito}`,{it:true,after:160}));
  return out;
}
const ch=[];
ch.push(P('Avaliação cega de relevância — Gabaritei',{h:HeadingLevel.TITLE}));
ch.push(P('Avaliador: ______________________________    Data: ___/___/______'));
ch.push(P('Como avaliar',{h:HeadingLevel.HEADING_1}));
[
 'São 8 blocos. Cada bloco tem uma questão de referência e 3 sugestões. Compare cada sugestão com a referência do mesmo bloco e pergunte: "essa sugestão ajudaria a praticar o mesmo conhecimento exigido pela referência?"',
 'Nota 0: cobra conteúdo ou habilidade diferente. Nota 1: tem relação, mas o foco é outro. Nota 2: cobra o mesmo conteúdo e a mesma tarefa, mesmo com outro cenário.',
 'Não basta compartilhar palavras, cenário, autor ou tema. Não avalie a dificuldade.',
 'Se faltar informação para julgar (figura, fórmula ou alternativa quebrada), deixe a nota em branco e marque Pendente. Pendente nunca vira zero.',
 'Avalie sozinho: não consulte IA, colegas nem avaliações anteriores. A ordem das sugestões é aleatória e não indica posição na busca.',
].forEach(t=>ch.push(P(t)));
data.forEach(b=>{
  ch.push(new Paragraph({children:[new PageBreak()]}));
  ch.push(P(`Bloco ${b.bloco} — ${AREA[b.ref.area]}`,{h:HeadingLevel.HEADING_1}));
  ch.push(P('Questão de referência',{h:HeadingLevel.HEADING_2}));
  ch.push(...questao(b.ref));
  b.sug.forEach((s,k)=>{
    ch.push(P(`Sugestão S${b.bloco}${k+1}`,{h:HeadingLevel.HEADING_2}));
    ch.push(...questao(s));
    ch.push(P('Nota (0, 1 ou 2): ______     Pendente: (   )     Texto com problema: (   )     Já tinha visto: (   )',{bold:true}));
    ch.push(P('Comentário (opcional): ______________________________________________',{after:240}));
  });
});
ch.push(new Paragraph({children:[new PageBreak()]}));
ch.push(P('Resumo para devolver',{h:HeadingLevel.HEADING_1}));
ch.push(P('Se preferir, responda só nesta lista: S11=…, S12=…, S13=…, até S83=…'));
data.forEach(b=>ch.push(P(`Bloco ${b.bloco}:  S${b.bloco}1 = ___    S${b.bloco}2 = ___    S${b.bloco}3 = ___`)));
const doc=new Document({styles:{default:{document:{run:{font:'Arial',size:22}}}},sections:[{properties:{page:{margin:{top:1134,bottom:1134,left:1134,right:1134}}},children:ch}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync('Avaliacao_Cega_Gabaritei.docx',b));
