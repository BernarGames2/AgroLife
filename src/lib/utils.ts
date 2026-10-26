import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Aceita apenas caminhos internos do app (ex.: "/app/talhoes"), para evitar
 * redirecionamentos para outros sites via parâmetro "next".
 */
export function safeInternalPath(value: string | null | undefined, fallback = "/app"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Converte texto digitado no padrão brasileiro ("12,5") em número. */
export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return Number.NaN;
  return Number(normalized);
}
