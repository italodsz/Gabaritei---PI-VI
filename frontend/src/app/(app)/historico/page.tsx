import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryPage } from "@/features/history/HistoryPage";

export const metadata: Metadata = { title: "Histórico" };

export default function Page() {
  return (
    <Suspense>
      <HistoryPage />
    </Suspense>
  );
}
