import type { Metadata } from "next";
import { ExamPage } from "@/features/simulations/ExamPage";

export const metadata: Metadata = { title: "Simulado em andamento" };

export default function Page() {
  return <ExamPage />;
}
