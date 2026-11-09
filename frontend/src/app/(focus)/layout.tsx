import { AuthGate } from "@/components/layout/AuthGate";
import { FocusSkeleton } from "@/components/layout/Skeletons";

/** Layout dedicado às sessões de estudo (sem menu lateral). */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate mode="app" fallback={<FocusSkeleton />}>
      {children}
    </AuthGate>
  );
}
