"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { MotionProvider } from "./MotionProvider";
import { ThemeController } from "./ThemeController";
import { ToastViewport } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hidratação manual: evita divergência entre HTML do servidor e estado local.
    Promise.resolve(useAppStore.persist.rehydrate())
      .catch(() => undefined)
      .finally(() => {
        if (!useAppStore.getState().hydrated) useAppStore.setState({ hydrated: true });
      });
  }, []);

  return (
    <MotionProvider>
      <ThemeController />
      {children}
      <ToastViewport />
    </MotionProvider>
  );
}
