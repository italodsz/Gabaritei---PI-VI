"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type {
  AccountData,
  DeviceSettings,
  OnboardingPreferences,
  PersonalGoal,
  PracticeSession,
  SimulationSession,
  StudyPreferences,
  UserProfile,
} from "@/types";
import { ACCOUNT_SCHEMA_VERSION, DEMO_ACCOUNT_ID, DEMO_EMAIL, createDemoAccount, createEmptyAccount } from "@/data/seeds/accounts";
import { accountIdFromEmail } from "@/lib/services/authService";
import { isPaletteId } from "@/lib/theme/palettes";

/** localStorage quando disponível; senão memória (modo privado, dados do site bloqueados): o app funciona, só não lembra entre visitas. */
function safeStorage(): StateStorage {
  try {
    const probe = "gabaritei:probe";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => void memory.set(key, value),
      removeItem: (key) => void memory.delete(key),
    };
  }
}

/**
 * Estado global persistido (localStorage, chave versionada).
 * Os repositórios locais leem/escrevem aqui; uma integração futura
 * pode sincronizar `accounts[activeAccountId]` com o back-end.
 */

export const STORAGE_KEY = "gabaritei:v1";
export const STORE_VERSION = 1;
export const NEW_STUDENT_ID = "estudante-novo";

export interface AppState {
  hydrated: boolean;
  accounts: Record<string, AccountData>;
  activeAccountId: string | null;
  device: DeviceSettings;

  /* sessão demonstrativa */
  signInDemo: (now: number) => void;
  startNewStudent: (now: number) => void;
  signInWithEmail: (email: string) => "ok" | "not_found";
  register: (input: { name: string; email: string }, now: number) => "ok" | "exists";
  signOut: () => void;

  /* conta ativa */
  completeOnboarding: (prefs: Omit<OnboardingPreferences, "status" | "finishedAt">, now: number) => void;
  skipOnboarding: (now: number) => void;
  updateOnboardingPrefs: (prefs: Partial<OnboardingPreferences>) => void;
  updateProfile: (patch: Partial<Pick<UserProfile, "name" | "nickname" | "school" | "city" | "bio">>) => void;
  updateStudy: (patch: Partial<StudyPreferences>) => void;
  setGoals: (goals: PersonalGoal[]) => void;
  toggleFavorite: (questionId: string) => boolean;
  toggleReviewMark: (questionId: string) => boolean;
  markCelebrated: (ids: string[]) => void;
  resetAccountData: (now: number) => void;

  /* sessões */
  addPractice: (session: PracticeSession) => void;
  updatePractice: (id: string, fn: (s: PracticeSession) => PracticeSession) => void;
  removePractice: (id: string) => void;
  addSimulation: (session: SimulationSession) => void;
  updateSimulation: (id: string, fn: (s: SimulationSession) => SimulationSession) => void;
  removeSimulation: (id: string) => void;

  /* dispositivo */
  setTheme: (theme: DeviceSettings["theme"]) => void;
  setMotion: (motion: DeviceSettings["motion"]) => void;
  setPalette: (palette: DeviceSettings["palette"]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const DEFAULT_DEVICE: DeviceSettings = { theme: "system", motion: "system", palette: "gabaritei", sidebarCollapsed: false };

type Persisted = Pick<AppState, "accounts" | "activeAccountId" | "device">;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      /** Atualiza a conta ativa de forma imutável. */
      const updateActive = (fn: (a: AccountData) => AccountData) => {
        const { activeAccountId, accounts } = get();
        if (!activeAccountId || !accounts[activeAccountId]) return;
        set({ accounts: { ...accounts, [activeAccountId]: fn(accounts[activeAccountId]) } });
      };

      return {
        hydrated: false,
        accounts: {},
        activeAccountId: null,
        device: DEFAULT_DEVICE,

        signInDemo: (now) => {
          const { accounts } = get();
          const demo = accounts[DEMO_ACCOUNT_ID] ?? createDemoAccount(now);
          set({ accounts: { ...accounts, [DEMO_ACCOUNT_ID]: demo }, activeAccountId: DEMO_ACCOUNT_ID });
        },

        startNewStudent: (now) => {
          const fresh = createEmptyAccount({ id: NEW_STUDENT_ID, kind: "new", name: "Estudante", email: "estudante@exemplo.com", now });
          fresh.profile.nickname = "Estudante";
          set({ accounts: { ...get().accounts, [NEW_STUDENT_ID]: fresh }, activeAccountId: NEW_STUDENT_ID });
        },

        signInWithEmail: (email) => {
          const target = email.trim().toLowerCase();
          if (target === DEMO_EMAIL) {
            get().signInDemo(Date.now());
            return "ok";
          }
          const found = Object.values(get().accounts).find((a) => a.profile.email.toLowerCase() === target && a.profile.kind === "registered");
          if (!found) return "not_found";
          set({ activeAccountId: found.profile.id });
          return "ok";
        },

        register: ({ name, email }, now) => {
          const normalized = email.trim().toLowerCase();
          const exists = normalized === DEMO_EMAIL || Object.values(get().accounts).some((a) => a.profile.email.toLowerCase() === normalized);
          if (exists) return "exists";
          const id = accountIdFromEmail(normalized);
          const account = createEmptyAccount({ id, kind: "registered", name: name.trim(), email: normalized, now });
          set({ accounts: { ...get().accounts, [id]: account }, activeAccountId: id });
          return "ok";
        },

        signOut: () => set({ activeAccountId: null }),

        completeOnboarding: (prefs, now) =>
          updateActive((a) => ({
            ...a,
            onboarding: { ...a.onboarding, ...prefs, status: "completed", finishedAt: new Date(now).toISOString() },
          })),

        skipOnboarding: (now) =>
          updateActive((a) => ({ ...a, onboarding: { ...a.onboarding, status: "skipped", finishedAt: new Date(now).toISOString() } })),

        updateOnboardingPrefs: (prefs) => updateActive((a) => ({ ...a, onboarding: { ...a.onboarding, ...prefs } })),

        updateProfile: (patch) => updateActive((a) => ({ ...a, profile: { ...a.profile, ...patch } })),

        updateStudy: (patch) => updateActive((a) => ({ ...a, study: { ...a.study, ...patch } })),

        setGoals: (goals) => updateActive((a) => ({ ...a, goals })),

        toggleFavorite: (questionId) => {
          let added = false;
          updateActive((a) => {
            added = !a.favorites.includes(questionId);
            return { ...a, favorites: added ? [questionId, ...a.favorites] : a.favorites.filter((f) => f !== questionId) };
          });
          return added;
        },

        toggleReviewMark: (questionId) => {
          let added = false;
          updateActive((a) => {
            added = !a.reviewMarks.includes(questionId);
            return { ...a, reviewMarks: added ? [questionId, ...a.reviewMarks] : a.reviewMarks.filter((f) => f !== questionId) };
          });
          return added;
        },

        markCelebrated: (ids) =>
          updateActive((a) => ({ ...a, celebratedAchievements: Array.from(new Set([...a.celebratedAchievements, ...ids])) })),

        resetAccountData: (now) => {
          const { activeAccountId, accounts } = get();
          if (!activeAccountId) return;
          const current = accounts[activeAccountId];
          if (!current) return;
          let next: AccountData;
          if (current.profile.kind === "demo") next = createDemoAccount(now);
          else {
            next = createEmptyAccount({ id: current.profile.id, kind: current.profile.kind, name: current.profile.name, email: current.profile.email, now });
            next.profile = current.profile;
            next.onboarding = current.onboarding;
            next.study = current.study;
          }
          set({ accounts: { ...accounts, [activeAccountId]: next } });
        },

        addPractice: (session) => updateActive((a) => ({ ...a, practiceSessions: [...a.practiceSessions, session] })),
        updatePractice: (id, fn) =>
          updateActive((a) => ({ ...a, practiceSessions: a.practiceSessions.map((s) => (s.id === id ? fn(s) : s)) })),
        removePractice: (id) => updateActive((a) => ({ ...a, practiceSessions: a.practiceSessions.filter((s) => s.id !== id) })),

        addSimulation: (session) => updateActive((a) => ({ ...a, simulations: [...a.simulations, session] })),
        updateSimulation: (id, fn) =>
          updateActive((a) => ({ ...a, simulations: a.simulations.map((s) => (s.id === id ? fn(s) : s)) })),
        removeSimulation: (id) => updateActive((a) => ({ ...a, simulations: a.simulations.filter((s) => s.id !== id) })),

        setTheme: (theme) => set({ device: { ...get().device, theme } }),
        setMotion: (motion) => set({ device: { ...get().device, motion } }),
        setPalette: (palette) => set({ device: { ...get().device, palette } }),
        setSidebarCollapsed: (sidebarCollapsed) => set({ device: { ...get().device, sidebarCollapsed } }),
      };
    },
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(safeStorage),
      skipHydration: true,
      partialize: (s): Persisted => ({ accounts: s.accounts, activeAccountId: s.activeAccountId, device: s.device }),
      migrate: (persisted, version) => {
        // Ponto único de migração entre versões do armazenamento.
        const state = (persisted ?? {}) as Partial<Persisted>;
        if (version < STORE_VERSION) {
          return { accounts: {}, activeAccountId: null, device: state.device ?? DEFAULT_DEVICE };
        }
        return state as Persisted;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Persisted>;
        const accounts = Object.fromEntries(
          Object.entries(p.accounts ?? {}).filter(([, a]) => a && a.schemaVersion === ACCOUNT_SCHEMA_VERSION),
        );
        const activeAccountId = p.activeAccountId && accounts[p.activeAccountId] ? p.activeAccountId : null;
        const device = { ...DEFAULT_DEVICE, ...(p.device ?? {}) };
        if (!isPaletteId(device.palette)) device.palette = DEFAULT_DEVICE.palette;
        return { ...current, accounts, activeAccountId, device };
      },
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
