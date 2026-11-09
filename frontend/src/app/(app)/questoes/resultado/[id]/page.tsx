import type { Metadata } from "next";
import { PracticeResultPage } from "@/features/practice/PracticeResultPage";

export const metadata: Metadata = { title: "Resultado da lista" };

export default function Page() {
  return <PracticeResultPage />;
}
