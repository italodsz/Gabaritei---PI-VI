"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AreaTag } from "@/components/dominio/area-tag";
import { AreaTile } from "@/components/dominio/area-tile";
import { CriterioRecomendacao } from "@/components/dominio/criterio-recomendacao";
import { FoguinhoBadge } from "@/components/dominio/foguinho-badge";
import { WeekStrip } from "@/components/dominio/week-strip";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressToMinimum } from "@/components/ui/progress-to-minimum";
import { Skeleton } from "@/components/ui/skeleton";
import { getApi } from "@/lib/api/client";
import { mensagemDoErro } from "@/lib/api/errors";
import type { Area } from "@/lib/api/types";
import { limparDescricaoHabilidadeMock } from "@/lib/questoes-filtros";
import { lerSessaoAtivaId, salvarFilaSessao, salvarSessaoAtivaId } from "@/lib/sessao-ativa";

const AREAS: Area[] = ["LC", "CH", "CN", "MT"];

function saudacaoPeloHorario(hora: number): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function Bloco({
  titulo,
  carregando,
  erro,
  onTentarDeNovo,
  children,
}: {
  titulo?: string;
  carregando: boolean;
  erro: unknown;
  onTentarDeNovo: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      {titulo ? <h2 className="mb-3 text-lg text-ink">{titulo}</h2> : null}
      {carregando ? (
        <Skeleton className="h-24 w-full" />
      ) : erro ? (
        <ErrorState mensagem={mensagemDoErro(erro)} onTentarDeNovo={onTentarDeNovo} />
      ) : (
        children
      )}
    </section>
  );
}

function BlocoRetomar() {
  const sessaoId = lerSessaoAtivaId();
  const { data: sessao, isLoading } = useQuery({
    queryKey: ["sessao-ativa", sessaoId],
    queryFn: () => (sessaoId ? getApi().obterSessao(sessaoId) : Promise.resolve(null)),
    enabled: !!sessaoId,
  });

  if (!sessaoId || isLoading || !sessao || sessao.encerradaEm) return null;

  return (
    <div className="mb-6 rounded-md bg-paper-2 p-5">
      <p className="font-medium text-ink">
        Você parou na questão {sessao.respondidas + 1} de {sessao.total}
      </p>
      <Link href={`/treino/${sessaoId}`} className="mt-2 inline-block">
        Continuar
      </Link>
    </div>
  );
}

/**
 * Faixa principal (etapa V, item 1): verde-floresta sólido, saudação pelo primeiro
 * nome e horário, a próxima ação numa frase, um botão grande. Sem gradiente. A lógica
 * de "começar treino" é a mesma de antes — só a apresentação mudou.
 */
function FaixaPrincipal() {
  const router = useRouter();
  const [hora] = useState(() => new Date().getHours());
  const [iniciando, setIniciando] = useState(false);

  const { data: perfil } = useQuery({ queryKey: ["perfil"], queryFn: () => getApi().obterPerfil() });
  const { data: reforco, isLoading: carregandoReforco, error: erroReforco, refetch: refazerReforco } = useQuery({
    queryKey: ["reforco"],
    queryFn: () => getApi().obterReforco(),
  });
  const {
    data: resumoGeral,
    isLoading: carregandoResumo,
    error: erroResumo,
    refetch: refazerResumo,
  } = useQuery({ queryKey: ["resumo-geral"], queryFn: () => getApi().obterResumoGeral() });

  const semHistorico = resumoGeral?.respondidas === 0;
  const prioridade = reforco?.prioridades[0];
  const primeiroNome = perfil?.nome.split(" ")[0] ?? "";
  const saudacao = `${saudacaoPeloHorario(hora)}${primeiroNome ? `, ${primeiroNome}` : ""}.`;

  const pedidoPronto = reforco && resumoGeral && !semHistorico && prioridade;
  const { data: previa, isLoading: carregandoPrevia } = useQuery({
    queryKey: ["previa-inicio", prioridade?.habilidade.codigo],
    queryFn: () =>
      getApi().obterRecomendacoes({
        modo: "habilidade",
        areas: prioridade ? [prioridade.area] : undefined,
        habilidade: prioridade?.habilidade.codigo,
        quantidade: 1,
      }),
    enabled: !!pedidoPronto,
  });

  async function comecarComPrevia() {
    if (!prioridade) return;
    setIniciando(true);
    try {
      const { sessao, primeira } = await getApi().iniciarSessao({
        modo: "habilidade",
        areas: [prioridade.area],
        habilidade: prioridade.habilidade.codigo,
        quantidade: 10,
      });
      salvarSessaoAtivaId(sessao.id);
      salvarFilaSessao(sessao.id, { itens: primeira.itens, aviso: primeira.aviso });
      router.push(`/treino/${sessao.id}`);
    } finally {
      setIniciando(false);
    }
  }

  function irParaEscolhaDeArea() {
    document.getElementById("comecar-por-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Bloco
      carregando={carregandoReforco || carregandoResumo}
      erro={erroReforco || erroResumo}
      onTentarDeNovo={() => {
        void refazerReforco();
        void refazerResumo();
      }}
    >
      <section className="rounded-md bg-forest-ink p-6 text-paper lg:p-8">
        <h1 tabIndex={-1} className="font-display text-3xl">
          {saudacao}
        </h1>
        {semHistorico ? (
          <>
            <p className="mt-2 max-w-md text-lg">Vamos montar seu primeiro treino.</p>
            <Button variante="inverso" className="mt-5" onClick={irParaEscolhaDeArea}>
              Escolher por onde começar
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 max-w-md text-lg">
              {prioridade ? `Bora treinar ${prioridade.habilidade.codigo} de ${prioridade.area}?` : "Bora continuar treinando?"}
            </p>
            <Button variante="inverso" className="mt-5" onClick={comecarComPrevia} carregando={iniciando} textoCarregando="Preparando">
              Começar treino
            </Button>
          </>
        )}
      </section>
      {!semHistorico && (carregandoPrevia || previa?.itens[0]) ? (
        <div className="mt-4">
          {carregandoPrevia ? (
            <Skeleton className="h-16 w-full" />
          ) : previa?.itens[0] ? (
            <CriterioRecomendacao criterio={previa.itens[0].criterio} />
          ) : null}
        </div>
      ) : null}
    </Bloco>
  );
}

function BlocoEscolherAreaETema() {
  const router = useRouter();
  const [tema, setTema] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [iniciando, setIniciando] = useState(false);

  const { data: resumoGeral } = useQuery({ queryKey: ["resumo-geral"], queryFn: () => getApi().obterResumoGeral() });
  if (resumoGeral?.respondidas !== 0) return null;

  async function comecarComTema() {
    setIniciando(true);
    try {
      const { sessao, primeira } = await getApi().iniciarSessao({
        modo: "tema",
        areas: areas.length ? areas : undefined,
        temaTexto: tema || undefined,
        quantidade: 10,
      });
      salvarSessaoAtivaId(sessao.id);
      salvarFilaSessao(sessao.id, { itens: primeira.itens, aviso: primeira.aviso });
      router.push(`/treino/${sessao.id}`);
    } finally {
      setIniciando(false);
    }
  }

  return (
    <section id="comecar-por-area" className="scroll-mt-6 rounded-md border-t-2 border-t-ink bg-card p-6">
      <h2 className="text-xl text-ink">Por onde você quer começar?</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {AREAS.map((area) => (
          <AreaTile
            key={area}
            area={area}
            checked={areas.includes(area)}
            onCheckedChange={() =>
              setAreas((atual) => (atual.includes(area) ? atual.filter((a) => a !== area) : [...atual, area]))
            }
          />
        ))}
      </div>
      <div className="mt-4">
        <Field
          rotulo="Tema (opcional)"
          placeholder="Ex.: revolução industrial"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        />
      </div>
      <Button onClick={comecarComTema} carregando={iniciando} textoCarregando="Preparando" className="mt-4">
        Começar treino
      </Button>
    </section>
  );
}

function BlocoFoguinhoEMeta() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["regularidade"],
    queryFn: () => getApi().obterRegularidade(),
  });

  return (
    <Bloco carregando={isLoading} erro={error} onTentarDeNovo={() => refetch()}>
      {data ? (
        <div className="rounded-md bg-paper-2 p-6">
          <FoguinhoBadge atual={data.foguinho.atual} melhor={data.foguinho.melhor} hojeContou={data.foguinho.hojeContou} emRisco={data.foguinho.emRisco} />
          <WeekStrip dias={data.semana} className="mt-5" />
          <div className="mt-5">
            <ProgressBar valor={data.metaSemanal.feito} total={data.metaSemanal.alvo} rotulo="Meta semanal de questões" />
            <p className="mt-1 text-sm text-ink-2">
              {data.metaSemanal.feito} de {data.metaSemanal.alvo} questões esta semana
            </p>
          </div>
        </div>
      ) : null}
    </Bloco>
  );
}

function BlocoReforco() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reforco"],
    queryFn: () => getApi().obterReforco(),
  });

  return (
    <Bloco titulo="Reforço prioritário" carregando={isLoading} erro={error} onTentarDeNovo={() => refetch()}>
      {data?.status === "dados_insuficientes" ? (
        <ProgressToMinimum
          atual={data.respostasAtuais}
          minimo={data.respostasMinimas}
          rotulo="apontar o que reforçar"
        />
      ) : data && data.prioridades.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {data.prioridades.slice(0, 3).map((p) => (
            <li key={p.habilidade.codigo} className="flex items-center justify-between gap-3 border-b border-rule pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <AreaTag area={p.area} />
                  <span className="text-sm text-ink">{p.habilidade.codigo}</span>
                </div>
                <p className="mt-1 text-xs text-ink-2">
                  {limparDescricaoHabilidadeMock(p.habilidade.descricao) ?? "sem descrição"}
                </p>
                <p className="mt-1 text-xs text-ink-2">
                  {Math.round(p.taxaAcerto * 100)}% de acerto em {p.respostas} respostas
                </p>
              </div>
              <Link href={`/treino?modo=habilidade&habilidade=${p.habilidade.codigo}&area=${p.area}`}>Treinar</Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-ink-2">Nenhuma prioridade de reforço no momento.</p>
      )}
    </Bloco>
  );
}

export function InicioClient() {
  return (
    <div>
      <FaixaPrincipal />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <BlocoRetomar />
          <BlocoEscolherAreaETema />
        </div>

        <div className="flex flex-col gap-8">
          <BlocoFoguinhoEMeta />
          <BlocoReforco />
        </div>
      </div>
    </div>
  );
}
