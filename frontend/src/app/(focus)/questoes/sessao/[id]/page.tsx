import type { Metadata } from "next";
import { PracticeSessionPage } from "@/features/practice/PracticeSessionPage";

export const metadata: Metadata = { title: "Resolvendo questões" };

export default function Page() {
  return <PracticeSessionPage />;
}
