"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AreaTag } from "@/components/dominio/area-tag";
import { CriterioRecomendacao } from "@/components/dominio/criterio-recomendacao";
import { FoguinhoBadge } from "@/components/dominio/foguinho-badge";
import { WeekStrip } from "@/components/dominio/week-strip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function BlocoProximaPratica() {
  const router = useRouter();
  const [tema, setTema] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [iniciando, setIniciando] = useState(false);

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

  return (
    <Bloco
      carregando={carregandoReforco || carregandoResumo}
      erro={erroReforco || erroResumo}
      onTentarDeNovo={() => {
        void refazerReforco();
        void refazerResumo();
      }}
    >
      <div className="rounded-md border-t-2 border-t-ink bg-card p-6">
        {semHistorico ? (
          <>
            <h2 className="text-2xl text-ink">Escolha um tema para começar</h2>
            <p className="mt-2 text-sm text-ink-2">
              Ainda não temos seu histórico, então vamos usar o tema que você escolher.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <Field
                rotulo="Tema (opcional)"
                placeholder="Ex.: revolução industrial"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {AREAS.map((area) => (
                  <Checkbox
                    key={area}
                    rotulo={<AreaTag area={area} />}
                    checked={areas.includes(area)}
                    onCheckedChange={() =>
                      setAreas((atual) => (atual.includes(area) ? atual.filter((a) => a !== area) : [...atual, area]))
                    }
                  />
                ))}
              </div>
              <Button onClick={comecarComTema} carregando={iniciando} textoCarregando="Preparando" className="self-start">
                Começar treino
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-ink">
              {prioridade
                ? `Treinar ${prioridade.habilidade.codigo} de ${prioridade.area}`
                : "Continuar treinando"}
            </h2>
            {carregandoPrevia ? (
              <Skeleton className="mt-3 h-20 w-full" />
            ) : previa?.itens[0] ? (
              <CriterioRecomendacao criterio={previa.itens[0].criterio} className="mt-3" />
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={comecarComPrevia} carregando={iniciando} textoCarregando="Preparando">
                Começar treino
              </Button>
              <Link href="/treino" className="inline-flex min-h-11 items-center">
                Escolher outro modo
              </Link>
            </div>
          </>
        )}
      </div>
    </Bloco>
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
        <div className="rounded-md bg-paper-2 p-5">
          <FoguinhoBadge atual={data.foguinho.atual} melhor={data.foguinho.melhor} hojeContou={data.foguinho.hojeContou} emRisco={data.foguinho.emRisco} />
          <WeekStrip dias={data.semana} className="mt-4" />
          <div className="mt-4">
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
  const { data: perfil } = useQuery({ queryKey: ["perfil"], queryFn: () => getApi().obterPerfil() });

  return (
    <div>
      <h1 tabIndex={-1} className="mb-6 text-2xl text-ink">
        Olá{perfil ? `, ${perfil.nome}` : ""}.
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <BlocoRetomar />
          <BlocoProximaPratica />
        </div>

        <div className="flex flex-col gap-8">
          <BlocoFoguinhoEMeta />
          <BlocoReforco />
        </div>
      </div>
    </div>
  );
}
