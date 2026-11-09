import type { Metadata } from "next";
import { SimulationResultPage } from "@/features/simulations/SimulationResultPage";

export const metadata: Metadata = { title: "Resultado do simulado" };

export default function Page() {
  return <SimulationResultPage />;
}
