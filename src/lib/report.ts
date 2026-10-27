import type { Field, Profile } from "@/types";
import { buildFieldAlerts, compareAlerts, fieldStatus, fieldTitle, latestReading, STATUS_LABEL } from "@/lib/agro";
import { formatDate, formatNumber } from "@/lib/format";

/** Resumo em texto, para compartilhar por WhatsApp ou e-mail. */
export function reportSummary(field: Field, profile: Profile): string {
  const last = latestReading(field);
  const alerts = buildFieldAlerts(field).sort(compareAlerts);
  const lines = [
    `AgroLife — ${fieldTitle(field)}`,
    ...(profile.property ? [`Propriedade: ${profile.property}`] : []),
    `Área: ${formatNumber(field.areaHa)} ha · Plantio: ${formatDate(field.plantingDate)}`,
    last
      ? `Emergência: ${Math.round(last.emergence)}% (meta ${Math.round(field.targetEmergence)}%) — ${STATUS_LABEL[fieldStatus(field)]}`
      : "Ainda sem avaliação registrada.",
    "",
    ...alerts.map((a) => `• ${a.title}: ${a.action}`),
  ];
  return lines.join("\n");
}
