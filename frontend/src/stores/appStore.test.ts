import { afterEach, describe, expect, it, vi } from "vitest";

describe("persistência do appStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("continua funcionando quando o localStorage está bloqueado", async () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("bloqueado");
      },
    });
    const { useAppStore } = await import("./appStore");
    expect(useAppStore.persist).toBeDefined();
    await useAppStore.persist.rehydrate();
    useAppStore.getState().setPalette("oceano");
    expect(useAppStore.getState().device.palette).toBe("oceano");
  });
});
