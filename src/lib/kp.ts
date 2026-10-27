import type { Field, KpRequest, Profile } from "@/types";
import { fieldTitle, latestReading } from "@/lib/agro";
import { formatDate, formatNumber } from "@/lib/format";

export const KP_TYPE_LABEL: Record<KpRequest["type"], string> = {
  video: "Vídeo personalizado",
  consultoria: "Consultoria presencial",
};

export type KpStatusTone = "neutro" | "atencao" | "info" | "ok";

export interface KpStatus {
  label: string;
  tone: KpStatusTone;
}

export function kpRequestStatus(req: KpRequest): KpStatus {
  if (!req.sentAt) return { label: "Não enviado", tone: "atencao" };
  if (req.type === "video") {
    return req.videoUrl ? { label: "Vídeo disponível", tone: "ok" } : { label: "Aguardando vídeo", tone: "info" };
  }
  if (req.completedAt) return { label: "Visita realizada", tone: "ok" };
  if (req.scheduledFor) return { label: `Visita em ${formatDate(req.scheduledFor)}`, tone: "ok" };
  return { label: "Aguardando contato", tone: "info" };
}

/** Texto enviado à equipe KP pelo WhatsApp. */
export function kpMessage(req: Pick<KpRequest, "type" | "message" | "phone" | "preferredPeriod">, field: Field | undefined, profile: Profile): string {
  const last = field ? latestReading(field) : undefined;
  const who = [profile.name, profile.property].filter(Boolean).join(" — ");
  const lines = [
    `Olá, equipe KP! ${req.type === "video" ? "Pedido de vídeo personalizado" : "Pedido de consultoria presencial"} pelo AgroLife.`,
    ...(who ? [`Produtor: ${who}`] : []),
    ...(field
      ? [
          `Talhão: ${fieldTitle(field)} (${formatNumber(field.areaHa)} ha)` +
            (last ? ` · emergência ${Math.round(last.emergence)}% (meta ${Math.round(field.targetEmergence)}%)` : ""),
        ]
      : []),
    `O que está acontecendo: ${req.message.trim()}`,
    ...(req.type === "consultoria" && req.phone ? [`Telefone: ${req.phone}`] : []),
    ...(req.type === "consultoria" && req.preferredPeriod ? [`Melhor período para a visita: ${req.preferredPeriod}`] : []),
  ];
  return lines.join("\n");
}
