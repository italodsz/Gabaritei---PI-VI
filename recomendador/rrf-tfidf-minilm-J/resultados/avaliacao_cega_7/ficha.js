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
ch.push(P('Avaliação cega 7 — Gabaritei',{h:HeadingLevel.TITLE}));
ch.push(P('Avaliador: ______________________________    Data: ___/___/______'));
ch.push(P('Como avaliar',{h:HeadingLevel.HEADING_1}));
[
 'São 12 blocos, 3 de cada área. Cada bloco tem uma questão de referência (com o título dela) e de 3 a 6 sugestões. As sugestões aparecem sem título de propósito, para não indicar de onde vieram.',
 'Para cada sugestão, dê uma nota de 0 a 10 para a pergunta: "para quem acabou de fazer a referência, quão boa é esta sugestão como próxima questão de estudo?"',
 'Guia: 8 a 10 = pratica praticamente o mesmo conhecimento; 5 a 7 = conteúdo vizinho, que vale a pena praticar em seguida; 3 a 4 = só o tema geral em comum; 0 a 2 = não deveria ser sugerida.',
 'Não avalie a dificuldade. Se faltar informação para julgar (figura, fórmula ou texto quebrado), deixe em branco e marque Pendente.',
 'Avalie sozinho, sem IA. A ordem das sugestões é aleatória e não indica posição nem método.',
].forEach(t=>ch.push(P(t)));
data.forEach(b=>{
  ch.push(new Paragraph({children:[new PageBreak()]}));
  ch.push(P(`Bloco ${b.bloco} — ${AREA[b.ref.area]}`,{h:HeadingLevel.HEADING_1}));
  ch.push(P('Questão de referência',{h:HeadingLevel.HEADING_2}));
  ch.push(P(`Título: ${b.titulo}`,{bold:true}));
  ch.push(...questao(b.ref));
  b.sug.forEach((s,k)=>{
    ch.push(P(`Sugestão S${b.bloco}.${k+1}`,{h:HeadingLevel.HEADING_2}));
    ch.push(...questao(s));
    ch.push(P('Nota (0 a 10): ______     Pendente: (   )     Texto com problema: (   )     Já tinha visto: (   )',{bold:true}));
    ch.push(P('Comentário (opcional): ______________________________________________',{after:240}));
  });
});
ch.push(new Paragraph({children:[new PageBreak()]}));
ch.push(P('Resumo para devolver',{h:HeadingLevel.HEADING_1}));
ch.push(P('Se preferir, responda só nesta lista, no formato S1.1=8, S1.2=3 e assim por diante.'));
data.forEach(b=>ch.push(P(`Bloco ${b.bloco}:  `+b.sug.map((s,k)=>`S${b.bloco}.${k+1} = ___`).join('    '))));
const doc=new Document({styles:{default:{document:{run:{font:'Arial',size:22}}}},sections:[{properties:{page:{margin:{top:1134,bottom:1134,left:1134,right:1134}}},children:ch}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync('Avaliacao_Cega_7_Gabaritei.docx',b));
