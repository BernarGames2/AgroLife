const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const numberFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** Interpreta "AAAA-MM-DD" como data local (sem deslocamento de fuso). */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toDateTimeInputValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${toDateInputValue(date)}T${h}:${min}`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Diferença em dias de calendário entre duas datas (b − a). */
export function calendarDaysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86_400_000);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? toDate(value) : value;
  return dateFmt.format(date);
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === "string" ? toDate(value) : value;
  return shortDateFmt.format(date);
}

/** "Hoje, 08:42", "Ontem, 16:20" ou "15/09, 09:10". */
export function formatRelativeDateTime(value: string | Date, now: Date = new Date()): string {
  const date = typeof value === "string" ? toDate(value) : value;
  const diff = calendarDaysBetween(date, now);
  const time = timeFmt.format(date);
  if (diff === 0) return `Hoje, ${time}`;
  if (diff === 1) return `Ontem, ${time}`;
  if (date.getFullYear() !== now.getFullYear()) return `${dateFmt.format(date)}, ${time}`;
  return `${shortDateFmt.format(date)}, ${time}`;
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatInt(value: number): string {
  return intFmt.format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${formatInt(count)} ${Math.abs(count) === 1 ? singular : pluralForm}`;
}

function toDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDate(value) : new Date(value);
}
