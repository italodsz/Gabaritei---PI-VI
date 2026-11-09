import type { Metadata } from "next";
import { Suspense } from "react";
import { NewSimulationPage } from "@/features/simulations/NewSimulationPage";

export const metadata: Metadata = { title: "Novo simulado" };

export default function Page() {
  return (
    <Suspense>
      <NewSimulationPage />
    </Suspense>
  );
}
