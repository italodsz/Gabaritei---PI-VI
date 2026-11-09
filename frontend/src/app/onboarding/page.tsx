import type { Metadata } from "next";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";

export const metadata: Metadata = { title: "Primeiros passos" };

export default function Page() {
  return <OnboardingFlow />;
}
