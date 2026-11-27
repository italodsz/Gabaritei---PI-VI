# Conta de demonstração (Julio)

`scripts/conta-demo-julio.mjs` cria a conta **Julio Andrade** e preenche seis semanas de uso, para
gravar vídeos de demonstração. Usa só as rotas públicas da API (as mesmas do navegador), então
funciona no servidor local e no site publicado. Nada é gravado direto no banco.

```sh
node scripts/conta-demo-julio.mjs --url https://SEU-SITE --senha 'SenhaDoJulio'
```

Precisa de Node 22 ou mais novo e de um clone do repositório (o script usa o motor do front-end e o
catálogo do recomendador). Opções no topo do arquivo.

## O que é gerado

- Perfil (escola, cidade, bio), preferências e metas; onboarding concluído.
- Cerca de 45 listas e práticas em 27 dias de estudo: listas por tema, prática sob medida (seguindo o
  `titulo_area`), revisões de erros e tentativas do desafio de acertos; duas em andamento.
- Sete simulados: por área, geral, ENEM Dia 1 · Humanas (45 questões) e um em andamento.
- Plano de estudos com cards concluídos, em andamento e novos; notas com texto e atalhos.
- Favoritas e marcadas para revisar.
- Perfil TRI: as respostas passam por `/responder` e `/perfil-tri/respostas`, como no app. As
  respostas seguem o modelo 3PL com a habilidade do Julio, então não enviesam o ajuste δ do sistema.

O recorde e as últimas tentativas do desafio ficam só no navegador (`gabaritei:desafio:v1`). O script
grava `desafio-julio-console.txt`: depois de entrar como Julio, cole o conteúdo no Console (F12).

## Modo dev

O servidor liga o modo dev pelo e-mail: inclua `julio.demo@gabaritei.app` em `GABARITEI_DEVS`
(Railway: Variables) ou em `backend/dados/devs.txt` (local) e reinicie.

## Rodar de novo

Sem `--substituir`, o script não mexe numa conta que já tem dados. Com `--substituir`, troca estudos,
plano e notas. O perfil TRI só recebe respostas na primeira vez (`--reenviar-tri` força, duplicando eventos).
