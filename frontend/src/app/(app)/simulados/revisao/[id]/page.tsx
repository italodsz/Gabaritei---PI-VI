import type { Metadata } from "next";
import { SimulationReviewPage } from "@/features/simulations/SimulationReviewPage";

export const metadata: Metadata = { title: "Revisão do simulado" };

export default function Page() {
  return <SimulationReviewPage />;
}
