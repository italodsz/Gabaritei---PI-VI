"use client";

import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo } from "react";

import { AreaTag } from "@/components/dominio/area-tag";
import { FaixaChip } from "@/components/dominio/faixa-chip";
import { StatusChip } from "@/components/dominio/status-chip";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/layout/page-header";
import { RemovableChip } from "@/components/ui/removable-chip";
import { Segmented } from "@/components/ui/segmented";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getApi } from "@/lib/api/client";
import { mensagemDoErro } from "@/lib/api/errors";
import type { Area, Faixa, Habilidade, QuestaoResumo } from "@/lib/api/types";
import {
  contarFiltrosAtivos,
  FILTROS_PADRAO,
  filtrosParaQueryString,
  lerFiltrosDaUrl,
  limparDescricaoHabilidadeMock,
  ordenarQuestoes,
  PAGINA_TAMANHO,
  paraFiltrosApi,
  type EstadoFiltros,
  type OrdenarPor,
} from "@/lib/questoes-filtros";

const AREAS: Area[] = ["LC", "CH", "CN", "MT"];
const FAIXAS: { valor: Faixa; rotulo: string }[] = [
  { valor: "facil", rotulo: "Fácil" },
  { valor: "media", rotulo: "Média" },
  { valor: "dificil", rotulo: "Difícil" },
];
const ANOS = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

const ROTULO_AREA: Record<Area, string> = { LC: "Linguagens", CH: "Ciências Humanas", CN: "Ciências da Natureza", MT: "Matemática" };

/**
 * O contrato (Habilidade) não guarda a área da habilidade — e os códigos
 * deveriam se repetir por área (H1 a H30 DENTRO de cada área, seção 3), não
 * ser globalmente únicos como no mock hoje. Por ora, agrupamos a Combobox
 * usando a área que o próprio mock escreve no fim da descrição (ver
 * lib/api/mock/dados.ts). TODO(equipe): ver docs/PENDENCIAS.md.
 */
function areaDaDescricaoMock(descricao: string | null): string {
  return descricao?.match(/\(([A-Z]{2})\)\s*$/)?.[1] ?? "Outras";
}

function toggle<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

function PainelFiltros({
  estado,
  habilidades,
  onMudar,
}: {
  estado: EstadoFiltros;
  habilidades: Habilidade[];
  onMudar: (novo: Partial<EstadoFiltros>) => void;
}) {
  const opcoesHabilidade = useMemo(
    () =>
      habilidades.map((h) => ({
        valor: h.codigo,
        rotulo: `${h.codigo}: ${limparDescricaoHabilidadeMock(h.descricao) ?? "sem descrição"}`,
        grupo: ROTULO_AREA[areaDaDescricaoMock(h.descricao) as Area] ?? "Outras",
      })),
    [habilidades],
  );

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Área</legend>
        <div className="flex flex-col gap-1">
          {AREAS.map((area) => (
            <Checkbox
              key={area}
              rotulo={<AreaTag area={area} />}
              checked={estado.areas.includes(area)}
              onCheckedChange={() => onMudar({ areas: toggle(estado.areas, area), pagina: 1 })}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <Combobox
          rotulo="Habilidade"
          placeholder="Todas"
          valor={estado.habilidades[0] ?? null}
          onValorChange={(v) => onMudar({ habilidades: v ? [v] : [], pagina: 1 })}
          opcoes={opcoesHabilidade}
        />
        {estado.habilidades.length > 0 ? (
          <p className="mt-1.5 text-xs text-ink-2">Questões sem esse dado cadastrado não aparecem neste filtro.</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Ano</legend>
        <div className="flex flex-col gap-1">
          {ANOS.map((ano) => (
            <Checkbox
              key={ano}
              rotulo={ano}
              checked={estado.anos.includes(ano)}
              onCheckedChange={() => onMudar({ anos: toggle(estado.anos, ano), pagina: 1 })}
            />
          ))}
        </div>
        {estado.anos.length > 0 ? (
          <p className="mt-1.5 text-xs text-ink-2">Questões sem esse dado cadastrado não aparecem neste filtro.</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Dificuldade</legend>
        <div className="flex flex-col gap-1">
          {FAIXAS.map((f) => (
            <Checkbox
              key={f.valor}
              rotulo={f.rotulo}
              checked={estado.faixas.includes(f.valor)}
              onCheckedChange={() => onMudar({ faixas: toggle(estado.faixas, f.valor), pagina: 1 })}
            />
          ))}
        </div>
      </fieldset>

      {contarFiltrosAtivos(estado) > 0 ? (
        <button
          type="button"
          onClick={() => onMudar(FILTROS_PADRAO)}
          className="self-start text-sm font-medium text-brand-ink underline underline-offset-2"
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );
}

function LinhaQuestao({ questao, contexto }: { questao: QuestaoResumo; contexto: string }) {
  return (
    <li className="border-b border-rule">
      <Link
        href={`/questoes/${questao.id}?de=questoes${contexto ? `&${contexto}` : ""}`}
        className="flex flex-col gap-2 px-1 py-4 hover:bg-paper-2 focus-visible:bg-paper-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AreaTag area={questao.area} />
            <span className="text-xs text-ink-2">{questao.habilidade?.codigo ?? "Habilidade não informada"}</span>
            <span className="text-xs text-ink-2">{questao.ano ?? "Ano não informado"}</span>
            <FaixaChip faixa={questao.faixa} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{questao.trecho}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusChip status={questao.ultimaTentativa === "acertou" ? "acertou" : questao.ultimaTentativa === "errou" ? "errou" : "nao_respondida"} />
          <span className="text-sm font-medium text-brand-ink">Resolver</span>
        </div>
      </Link>
    </li>
  );
}

function ListaQuestoes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estado = useMemo(() => lerFiltrosDaUrl(searchParams), [searchParams]);

  function onMudar(parcial: Partial<EstadoFiltros>) {
    const novo = { ...estado, ...parcial };
    const qs = filtrosParaQueryString(novo);
    router.replace(qs ? `/questoes?${qs}` : "/questoes", { scroll: false });
  }

  const { data: habilidades } = useQuery({
    queryKey: ["habilidades"],
    queryFn: () => getApi().listarHabilidades(),
  });

  const {
    data: pagina,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questoes", estado.areas, estado.habilidades, estado.anos, estado.faixas, estado.pagina],
    queryFn: () =>
      getApi().listarQuestoes(paraFiltrosApi(estado), { pagina: estado.pagina, porPagina: PAGINA_TAMANHO }),
  });

  const itensOrdenados = useMemo(() => (pagina ? ordenarQuestoes(pagina.itens, estado.ordenar) : []), [pagina, estado.ordenar]);
  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.total / PAGINA_TAMANHO)) : 1;
  const filtrosAtivos = contarFiltrosAtivos(estado);

  const chips: { rotulo: string; aoRemover: () => void }[] = [
    ...estado.areas.map((a) => ({ rotulo: ROTULO_AREA[a], aoRemover: () => onMudar({ areas: toggle(estado.areas, a), pagina: 1 }) })),
    ...estado.habilidades.map((h) => ({
      rotulo: habilidades?.find((x) => x.codigo === h)?.codigo ?? h,
      aoRemover: () => onMudar({ habilidades: toggle(estado.habilidades, h), pagina: 1 }),
    })),
    ...estado.anos.map((a) => ({ rotulo: String(a), aoRemover: () => onMudar({ anos: toggle(estado.anos, a), pagina: 1 }) })),
    ...estado.faixas.map((f) => ({
      rotulo: FAIXAS.find((x) => x.valor === f)?.rotulo ?? f,
      aoRemover: () => onMudar({ faixas: toggle(estado.faixas, f), pagina: 1 }),
    })),
  ];

  return (
    <div>
      <PageHeader titulo="Questões" />

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="mb-4 flex min-h-12 items-center gap-2 rounded-sm border border-rule-strong bg-card px-4 text-sm font-medium text-ink"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Filtros{filtrosAtivos > 0 ? `, ${filtrosAtivos} ativos` : ""}
            </button>
          </SheetTrigger>
          <SheetContent titulo="Filtros" lado="direita">
            <PainelFiltros estado={estado} habilidades={habilidades ?? []} onMudar={onMudar} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <PainelFiltros estado={estado} habilidades={habilidades ?? []} onMudar={onMudar} />
        </aside>

        <div>
          {chips.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <RemovableChip key={i} rotulo={chip.rotulo} onRemover={chip.aoRemover}>
                  {chip.rotulo}
                </RemovableChip>
              ))}
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-ink-2">
              {isLoading ? "Buscando questões…" : pagina ? `${pagina.total} ${pagina.total === 1 ? "questão encontrada" : "questões encontradas"}` : null}
            </p>
            <Segmented
              rotulo="Ordenar por"
              valor={estado.ordenar}
              onValorChange={(v) => onMudar({ ordenar: v as OrdenarPor })}
              opcoes={[
                { valor: "ano_desc", rotulo: "Ano recente" },
                { valor: "ano_asc", rotulo: "Ano antigo" },
                { valor: "faixa_asc", rotulo: "Mais fácil" },
                { valor: "faixa_desc", rotulo: "Mais difícil" },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState mensagem={mensagemDoErro(error)} onTentarDeNovo={() => refetch()} />
          ) : itensOrdenados.length === 0 ? (
            <EmptyState
              titulo="Nenhuma questão com esses filtros."
              descricao={filtrosAtivos > 0 ? "Tente remover algum filtro." : undefined}
              acao={
                filtrosAtivos > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, i) => (
                      <RemovableChip key={i} rotulo={chip.rotulo} onRemover={chip.aoRemover}>
                        Tirar {chip.rotulo}
                      </RemovableChip>
                    ))}
                  </div>
                ) : undefined
              }
            />
          ) : (
            <>
              <ul>
                {itensOrdenados.map((q) => (
                  <LinhaQuestao key={q.id} questao={q} contexto={filtrosParaQueryString(estado)} />
                ))}
              </ul>
              <Pagination
                className="mt-6 justify-center"
                paginaAtual={estado.pagina}
                totalPaginas={totalPaginas}
                onPaginaChange={(p) => onMudar({ pagina: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuestoesClient() {
  return (
    <Suspense fallback={null}>
      <ListaQuestoes />
    </Suspense>
  );
}
