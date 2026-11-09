/** Formatação pt-BR centralizada. */

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Número com até `max` casas decimais, sem zeros desnecessários. */
export function formatDecimal(value: number, max = 2): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: max });
}

export function formatMoney(value: number): string {
  return `R$ ${formatNumber(value, 2)}`;
}

export function formatPercent(ratio: number, decimals = 0): string {
  return `${formatNumber(ratio * 100, decimals)}%`;
}

export function formatDuration(ms: number, opts: { compact?: boolean } = {}): string {
  if (ms > 0 && ms < 60000) return `${Math.max(1, Math.round(ms / 1000))} s`;
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (opts.compact) {
    if (hours === 0) return `${minutes} min`;
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  }
  if (hours === 0) return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  const h = `${hours} ${hours === 1 ? "hora" : "horas"}`;
  return minutes === 0 ? h : `${h} e ${minutes} min`;
}

/** Relógio hh:mm:ss ou mm:ss. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Tempo médio por questão, em formato curto (ex.: 2min 15s). */
export function formatShortSeconds(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dateLongFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });

export function formatDate(iso: string | number | Date): string {
  return dateFmt.format(new Date(iso)).replace(".", "");
}

export function formatDateLong(iso: string | number | Date): string {
  return dateLongFmt.format(new Date(iso));
}

export function formatTime(iso: string | number | Date): string {
  return timeFmt.format(new Date(iso));
}

export function formatWeekday(iso: string | number | Date): string {
  return weekdayFmt.format(new Date(iso));
}

export function formatRelativeDay(iso: string | number | Date, now: number): string {
  const d = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date(now)).getTime();
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff > 1 && diff < 7) return `Há ${diff} dias`;
  return formatDate(iso);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dayKey(date: Date | number | string): string {
  const d = new Date(date);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${formatNumber(n)} ${n === 1 ? singular : plural}`;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
