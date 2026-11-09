import type { Metadata } from "next";
import { RecoverForm } from "@/features/auth/RecoverForm";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function Page() {
  return <RecoverForm />;
}
