import type { Metadata } from "next";
import { SimulationsPage } from "@/features/simulations/SimulationsPage";

export const metadata: Metadata = { title: "Simulados" };

export default function Page() {
  return <SimulationsPage />;
}
