import type { Metadata } from "next";
import { PerformancePage } from "@/features/performance/PerformancePage";

export const metadata: Metadata = { title: "Desempenho" };

export default function Page() {
  return <PerformancePage />;
}
