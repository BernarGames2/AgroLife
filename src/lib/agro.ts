import type { CountSample, Field, Reading } from "@/types";
import { calendarDaysBetween, formatInt, parseLocalDate, plural } from "@/lib/format";

export type FieldStatus = "ok" | "atencao" | "investigar" | "sem-dados";
export type AlertLevel = "investigar" | "atencao" | "info" | "ok";

/**
 * Limites (em pontos percentuais abaixo da meta) usados na classificação.
 * Até 3 p.p. abaixo: dentro do esperado. Até 10 p.p.: atenção. Acima disso: investigar.
 */
export const STATUS_LIMITS = { ok: 3, atencao: 10 } as const;

/** Avaliações com mais de N dias são consideradas desatualizadas durante o estabelecimento. */
export const STALE_AFTER_DAYS = 7;
/** Janela (dias após o plantio) em que a emergência ainda costuma ser acompanhada. */
export const ESTABLISHMENT_WINDOW_DAYS = 35;
/** Coeficiente de variação entre pontos de contagem acima do qual o estande é considerado desuniforme. */
export const UNEVEN_CV = 0.2;

export const CROPS = ["Soja", "Milho", "Feijão", "Algodão", "Trigo", "Sorgo", "Girassol", "Outra"] as const;

/** Valores sugeridos para preencher o formulário; o produtor deve ajustar à própria regulagem. */
export const CROP_PRESETS: Record<string, { seedsPerMeter: number; rowSpacingCm: number; target: number }> = {
  Soja: { seedsPerMeter: 14, rowSpacingCm: 50, target: 90 },
  Milho: { seedsPerMeter: 3.3, rowSpacingCm: 50, target: 95 },
  Feijão: { seedsPerMeter: 12, rowSpacingCm: 45, target: 90 },
  Algodão: { seedsPerMeter: 10, rowSpacingCm: 90, target: 90 },
  Trigo: { seedsPerMeter: 60, rowSpacingCm: 17, target: 85 },
  Sorgo: { seedsPerMeter: 10, rowSpacingCm: 50, target: 85 },
  Girassol: { seedsPerMeter: 3.6, rowSpacingCm: 80, target: 90 },
  Outra: { seedsPerMeter: 10, rowSpacingCm: 50, target: 90 },
};

export const STATUS_LABEL: Record<FieldStatus, string> = {
  ok: "Dentro do esperado",
  atencao: "Atenção",
  investigar: "Investigar",
  "sem-dados": "Sem avaliação",
};

export const ALERT_LABEL: Record<AlertLevel, string> = {
  ok: "Dentro do esperado",
  atencao: "Atenção",
  investigar: "Investigar",
  info: "Informação",
};

const LEVEL_WEIGHT: Record<AlertLevel, number> = { investigar: 0, atencao: 1, info: 2, ok: 3 };
const STATUS_WEIGHT: Record<FieldStatus, number> = { investigar: 0, atencao: 1, "sem-dados": 2, ok: 3 };

export function sortReadings(readings: Reading[]): Reading[] {
  return [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function latestReading(field: Field): Reading | undefined {
  const sorted = sortReadings(field.readings);
  return sorted[sorted.length - 1];
}

export function classify(emergence: number, target: number): Exclude<FieldStatus, "sem-dados"> {
  const gap = Math.round(target) - Math.round(emergence);
  if (gap <= STATUS_LIMITS.ok) return "ok";
  if (gap <= STATUS_LIMITS.atencao) return "atencao";
  return "investigar";
}

export function fieldStatus(field: Field): FieldStatus {
  const last = latestReading(field);
  return last ? classify(last.emergence, field.targetEmergence) : "sem-dados";
}

export function compareByStatus(a: Field, b: Field): number {
  return STATUS_WEIGHT[fieldStatus(a)] - STATUS_WEIGHT[fieldStatus(b)] || a.name.localeCompare(b.name, "pt-BR");
}

export function daysAfterPlanting(field: Pick<Field, "plantingDate">, at: Date = new Date()): number {
  return calendarDaysBetween(parseLocalDate(field.plantingDate), at);
}

export function percentagePoints(value: number): string {
  return plural(Math.round(value), "ponto percentual", "pontos percentuais");
}

/** Emergência (%) a partir de pontos de contagem e das sementes distribuídas por metro. */
export function emergenceFromSamples(samples: CountSample[], seedsPerMeter: number): number | null {
  const valid = samples.filter((s) => Number.isFinite(s.plants) && Number.isFinite(s.meters) && s.meters > 0 && s.plants >= 0);
  if (valid.length === 0 || !(seedsPerMeter > 0)) return null;
  const plants = valid.reduce((sum, s) => sum + s.plants, 0);
  const meters = valid.reduce((sum, s) => sum + s.meters, 0);
  return (plants / meters / seedsPerMeter) * 100;
}

export function sampleEmergences(samples: CountSample[], seedsPerMeter: number): number[] {
  if (!(seedsPerMeter > 0)) return [];
  return samples.filter((s) => s.meters > 0).map((s) => (s.plants / s.meters / seedsPerMeter) * 100);
}

/** Coeficiente de variação (desvio padrão amostral / média). */
export function coefficientOfVariation(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return null;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance) / mean;
}

/** Estande estimado em plantas por hectare. */
export function plantsPerHectare(seedsPerMeter: number, rowSpacingCm: number, emergencePct: number): number | null {
  if (!(seedsPerMeter > 0) || !(rowSpacingCm > 0)) return null;
  const metersOfRowPerHa = 10_000 / (rowSpacingCm / 100);
  return seedsPerMeter * metersOfRowPerHa * (emergencePct / 100);
}

export function formatStand(plantsHa: number): string {
  if (plantsHa >= 1000) {
    return `${(plantsHa / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil plantas/ha`;
  }
  return `${formatInt(plantsHa)} plantas/ha`;
}

export interface FieldAlert {
  id: string;
  fieldId: string;
  fieldName: string;
  level: AlertLevel;
  date: string;
  title: string;
  description: string;
  action: string;
  /** Alerta principal (status do talhão); os demais são complementares. */
  primary: boolean;
}

export function buildFieldAlerts(field: Field, now: Date = new Date()): FieldAlert[] {
  const sorted = sortReadings(field.readings);
  const last = sorted[sorted.length - 1];
  const base = { fieldId: field.id, fieldName: field.name };

  if (!last) {
    return [
      {
        ...base,
        id: `${field.id}:sem-dados`,
        level: "info",
        date: field.createdAt,
        title: "Nenhuma avaliação registrada",
        description: "Registre a primeira contagem de emergência para acompanhar o estabelecimento deste talhão.",
        action: "Faça a contagem de plantas em alguns pontos do talhão e registre o resultado.",
        primary: true,
      },
    ];
  }

  const alerts: FieldAlert[] = [];
  const target = Math.round(field.targetEmergence);
  const current = Math.round(last.emergence);
  const gap = target - current;
  const status = classify(current, target);

  if (status === "ok") {
    alerts.push({
      ...base,
      id: `${field.id}:status`,
      level: "ok",
      date: last.date,
      title: "Talhão dentro do esperado",
      description:
        current > target
          ? `Emergência de ${current}%, acima da meta de ${target}%.`
          : `Emergência de ${current}% frente à meta de ${target}%.`,
      action: "Manter a rotina de monitoramento.",
      primary: true,
    });
  } else {
    alerts.push({
      ...base,
      id: `${field.id}:status`,
      level: status,
      date: last.date,
      title: "Emergência abaixo da meta",
      description: `Os dados registrados estão ${percentagePoints(gap)} abaixo da meta definida para este talhão (${current}% frente a ${target}%).`,
      action:
        status === "investigar"
          ? "Recomenda-se verificar profundidade de deposição, distribuição das sementes e regulagem da plantadeira."
          : "Recomenda-se seguir monitorando nos próximos dias e conferir a uniformidade do estande.",
      primary: true,
    });
  }

  if (last.samples && last.seedsPerMeter) {
    const perPoint = sampleEmergences(last.samples, last.seedsPerMeter);
    const cv = coefficientOfVariation(perPoint);
    if (perPoint.length >= 3 && cv !== null && cv > UNEVEN_CV) {
      const min = Math.round(Math.min(...perPoint));
      const max = Math.round(Math.max(...perPoint));
      alerts.push({
        ...base,
        id: `${field.id}:desuniforme`,
        level: "atencao",
        date: last.date,
        title: "Estande desuniforme",
        description: `As contagens variaram bastante entre os pontos avaliados (de ${min}% a ${max}%).`,
        action: "Percorra as áreas com menor contagem para identificar falhas localizadas e suas possíveis causas.",
        primary: false,
      });
    }
  }

  const previous = sorted[sorted.length - 2];
  if (previous && gap > STATUS_LIMITS.ok) {
    const growth = last.emergence - previous.emergence;
    const interval = calendarDaysBetween(new Date(previous.date), new Date(last.date));
    if (interval >= 1 && growth < 1) {
      alerts.push({
        ...base,
        id: `${field.id}:estabilizada`,
        level: "atencao",
        date: last.date,
        title: "Emergência estabilizada abaixo da meta",
        description: `A emergência ${growth <= 0 ? "não avançou" : "praticamente não avançou"} entre as duas últimas avaliações e segue abaixo da meta.`,
        action: "Converse com um agrônomo sobre as possíveis causas e se há necessidade de ações corretivas.",
        primary: false,
      });
    }
  }

  const age = calendarDaysBetween(new Date(last.date), now);
  if (age > STALE_AFTER_DAYS && daysAfterPlanting(field, now) <= ESTABLISHMENT_WINDOW_DAYS) {
    alerts.push({
      ...base,
      id: `${field.id}:desatualizada`,
      level: "info",
      date: last.date,
      title: "Avaliação desatualizada",
      description: `A última avaliação foi há ${plural(age, "dia", "dias")}, ainda durante o estabelecimento da lavoura.`,
      action: "Registre uma nova contagem para acompanhar a evolução da emergência.",
      primary: false,
    });
  }

  return alerts;
}

export function compareAlerts(a: FieldAlert, b: FieldAlert): number {
  return (
    LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level] ||
    Number(b.primary) - Number(a.primary) ||
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function buildAlerts(fields: Field[], now: Date = new Date()): FieldAlert[] {
  return fields.flatMap((f) => buildFieldAlerts(f, now)).sort(compareAlerts);
}

export function isActionable(level: AlertLevel): boolean {
  return level === "investigar" || level === "atencao";
}

export interface FarmSummary {
  fieldCount: number;
  totalAreaHa: number;
  averageEmergence: number | null;
  attentionCount: number;
  lastUpdate: string | null;
}

export function summarize(fields: Field[]): FarmSummary {
  const latest = fields.map(latestReading).filter((r): r is Reading => Boolean(r));
  const averageEmergence = latest.length ? latest.reduce((sum, r) => sum + r.emergence, 0) / latest.length : null;
  const lastUpdate = latest.reduce<string | null>(
    (acc, r) => (acc === null || new Date(r.date) > new Date(acc) ? r.date : acc),
    null,
  );
  return {
    fieldCount: fields.length,
    totalAreaHa: fields.reduce((sum, f) => sum + f.areaHa, 0),
    averageEmergence,
    attentionCount: fields.filter((f) => {
      const s = fieldStatus(f);
      return s === "atencao" || s === "investigar";
    }).length,
    lastUpdate,
  };
}

export function fieldTitle(field: Pick<Field, "name" | "crop">): string {
  return `${field.name} — ${field.crop}`;
}
