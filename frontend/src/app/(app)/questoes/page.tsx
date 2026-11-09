import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeConfigPage } from "@/features/practice/PracticeConfigPage";

export const metadata: Metadata = { title: "Questões" };

export default function Page() {
  return (
    <Suspense>
      <PracticeConfigPage />
    </Suspense>
  );
}
