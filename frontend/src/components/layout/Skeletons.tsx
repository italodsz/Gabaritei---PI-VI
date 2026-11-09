import { Skeleton } from "@/components/ui/Feedback";

/** Esqueleto exibido enquanto o armazenamento local é hidratado. */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh" role="status" aria-label="Carregando">
      <div className="h-dvh w-[256px] shrink-0 bg-ink" />
      <div className="flex-1">
        <div className="flex h-[72px] items-center gap-4 border-b border-border px-8">
          <Skeleton className="h-11 w-full max-w-md" />
          <Skeleton className="ml-auto size-11 rounded-full" />
        </div>
        <div className="mx-auto max-w-[1320px] space-y-6 px-8 pt-8">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-12 gap-5">
            <Skeleton className="col-span-8 h-64 rounded-[24px]" />
            <Skeleton className="col-span-4 h-64 rounded-[24px]" />
            <Skeleton className="col-span-4 h-40 rounded-[24px]" />
            <Skeleton className="col-span-4 h-40 rounded-[24px]" />
            <Skeleton className="col-span-4 h-40 rounded-[24px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FocusSkeleton() {
  return (
    <div className="min-h-dvh" role="status" aria-label="Carregando">
      <div className="flex h-16 items-center gap-4 border-b border-border px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="ml-auto h-8 w-28" />
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-4 px-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
