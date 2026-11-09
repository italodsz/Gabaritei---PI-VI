import type { Metadata } from "next";
import { HomePage } from "@/features/home/HomePage";

export const metadata: Metadata = { title: "Início" };

export default function Page() {
  return <HomePage />;
}
