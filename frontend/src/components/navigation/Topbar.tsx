"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, LogOut, Monitor, Moon, Search, Settings, Sun, User } from "@/components/icons";
import { useState } from "react";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { Avatar } from "@/components/ui/Feedback";
import { Kbd } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Modal";
import { IconTile } from "@/components/ui/Card";
import { useAppStore } from "@/stores/appStore";
import { useActiveAccount } from "@/hooks/useAccount";
import { useHotkeys } from "@/hooks/useHotkeys";
import { CommandPalette } from "./CommandPalette";
import { PaletteDots } from "@/components/theme/PalettePicker";
import { spring } from "@/lib/animations";
import type { ThemePreference } from "@/types";


export function Topbar() {
  const router = useRouter();
  const account = useActiveAccount();
  const theme = useAppStore((s) => s.device.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const palette = useAppStore((s) => s.device.palette);
  const setPalette = useAppStore((s) => s.setPalette);
  const signOut = useAppStore((s) => s.signOut);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  useHotkeys({
    "mod+k": (e) => {
      e.preventDefault();
      setPaletteOpen((v) => !v);
    },
    "/": (e) => {
      e.preventDefault();
      setPaletteOpen(true);
    },
  });

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-bg">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <motion.button
          type="button"
          onClick={() => setPaletteOpen(true)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          transition={spring.snappy}
          className="group flex h-11 min-w-0 flex-1 items-center gap-3 sm:max-w-md rounded-2xl border border-border bg-surface px-4 text-left text-sm text-fg-subtle shadow-xs transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-sm"
          aria-label="Abrir busca global"
        >
          <Search className="size-[18px] transition-colors group-hover:text-fg" aria-hidden />
          <span className="flex-1 truncate">Buscar matérias, assuntos e questões…</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </motion.button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Menu
            label="Menu do usuário"
            trigger={({ open, toggle, id, ref }) => (
              <button
                ref={ref}
                id={id}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex h-12 items-center gap-2.5 rounded-2xl py-1 pr-3 pl-1.5 transition-colors hover:bg-surface-2"
              >
                <Avatar name={account.profile.name} size={38} />
                <span className="hidden text-left md:block">
                  <span className="block max-w-36 truncate text-sm leading-tight font-semibold">{account.profile.nickname || account.profile.name}</span>
                  <span className="block text-xs leading-tight text-fg-subtle">{account.profile.kind === "demo" ? "Demonstração" : account.profile.kind === "new" ? "Estudante novo" : "Conta local"}</span>
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy}>
                  <ChevronDown className="size-4 text-fg-subtle" />
                </motion.span>
              </button>
            )}
          >
            {(close) => (
              <>
                <div className="flex items-center gap-3 px-3 pt-2 pb-3">
                  <Avatar name={account.profile.name} size={42} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{account.profile.name}</p>
                    <p className="truncate text-xs text-fg-subtle">{account.profile.email}</p>
                  </div>
                </div>
                <MenuSeparator />
                <MenuItem
                  icon={User}
                  onSelect={() => {
                    close();
                    router.push("/perfil");
                  }}
                >
                  Perfil e conquistas
                </MenuItem>
                <MenuItem
                  icon={Settings}
                  onSelect={() => {
                    close();
                    router.push("/configuracoes");
                  }}
                >
                  Configurações
                </MenuItem>
                <MenuSeparator />
                <div className="px-2 py-2">
                  <p className="mb-2 px-1 text-xs font-semibold text-fg-subtle">Tema</p>
                  <SegmentedControl<ThemePreference>
                    ariaLabel="Tema"
                    layoutId="menu-theme"
                    size="sm"
                    fullWidth
                    value={theme}
                    onChange={setTheme}
                    options={[
                      { value: "light", label: "Claro", icon: Sun },
                      { value: "dark", label: "Escuro", icon: Moon },
                      { value: "system", label: "Auto", icon: Monitor },
                    ]}
                  />
                  <p className="mt-3 mb-2 px-1 text-xs font-semibold text-fg-subtle">Paleta</p>
                  <PaletteDots value={palette} onChange={setPalette} />
                </div>
                <MenuSeparator />
                <MenuItem
                  icon={LogOut}
                  tone="danger"
                  onSelect={() => {
                    close();
                    setConfirmExit(true);
                  }}
                >
                  Sair
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ConfirmDialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false);
          signOut();
          router.replace("/entrar");
        }}
        icon={
          <IconTile tone="coral" size="lg">
            <LogOut />
          </IconTile>
        }
        title="Sair da conta?"
        description="Seus dados continuam salvos neste navegador. Você pode entrar novamente quando quiser."
        confirmLabel="Sair"
        tone="primary"
      />
    </header>
  );
}
