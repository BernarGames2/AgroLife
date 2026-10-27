import type { Field } from "@/types";
import {
  buildFieldAlerts,
  coefficientOfVariation,
  fieldStatus,
  latestReading,
  plantsPerHectare,
  sampleEmergences,
  sortReadings,
  STALE_AFTER_DAYS,
  UNEVEN_CV,
  type FieldStatus,
} from "@/lib/agro";
import { calendarDaysBetween } from "@/lib/format";

/**
 * Recursos do plano Premium. Todos os resultados são indicativos e calculados
 * apenas a partir dos dados registrados no app.
 */

/* ---------- Estimativa de falhas e replantio ---------- */

export type ReplantAdvice = "adequado" | "monitorar" | "avaliar-replantio";

export interface GapEstimate {
  expectedPlantsHa: number;
  actualPlantsHa: number;
  missingPlantsHa: number;
  /** Plantas faltantes no talhão inteiro. */
  missingTotal: number;
  advice: ReplantAdvice;
}

/** Abaixo desta fração da meta, a indicação é avaliar replantio com um agrônomo. */
export const REPLANT_FRACTION = 0.75;

export function replantAdvice(emergence: number, target: number): ReplantAdvice {
  if (emergence >= target - 3) return "adequado";
  if (emergence < target * REPLANT_FRACTION) return "avaliar-replantio";
  return "monitorar";
}

export function estimateGaps(field: Field): GapEstimate | null {
  const last = latestReading(field);
  if (!last || !field.seedsPerMeter || !field.rowSpacingCm) return null;
  const expected = plantsPerHectare(field.seedsPerMeter, field.rowSpacingCm, field.targetEmergence);
  const actual = plantsPerHectare(field.seedsPerMeter, field.rowSpacingCm, last.emergence);
  if (expected === null || actual === null) return null;
  const missing = Math.max(0, expected - actual);
  return {
    expectedPlantsHa: expected,
    actualPlantsHa: actual,
    missingPlantsHa: missing,
    missingTotal: missing * field.areaHa,
    advice: replantAdvice(last.emergence, field.targetEmergence),
  };
}

/* ---------- Tendência da emergência ---------- */

export interface ProjectionPoint {
  date: Date;
  emergence: number;
}

/** A cada dia o ganho projetado cai, porque a emergência tende a se estabilizar. */
export const TREND_DAMPING = 0.6;

/**
 * Projeção indicativa para os próximos dias, usando o ritmo diário entre as duas
 * últimas avaliações com amortecimento. Retorna null com menos de duas avaliações.
 */
export function projectEmergence(field: Field, days = 2): ProjectionPoint[] | null {
  const sorted = sortReadings(field.readings);
  if (sorted.length < 2) return null;
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const lastDate = new Date(last.date);
  const interval = Math.max(1, calendarDaysBetween(new Date(prev.date), lastDate));
  const rate = Math.max(0, (last.emergence - prev.emergence) / interval);

  const points: ProjectionPoint[] = [];
  let value = last.emergence;
  let gain = rate * TREND_DAMPING;
  for (let i = 1; i <= days; i++) {
    value = Math.min(100, value + gain);
    gain *= TREND_DAMPING;
    const date = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + i, lastDate.getHours(), lastDate.getMinutes());
    points.push({ date, emergence: Math.round(value * 10) / 10 });
  }
  return points;
}

/* ---------- Prioridade de vistoria ---------- */

export interface InspectionItem {
  field: Field;
  status: FieldStatus;
  score: number;
  reasons: string[];
}

export function lastSampleCv(field: Field): number | null {
  const last = latestReading(field);
  if (!last?.samples || !last.seedsPerMeter) return null;
  return coefficientOfVariation(sampleEmergences(last.samples, last.seedsPerMeter));
}

export function inspectionPriority(fields: Field[], now: Date = new Date()): InspectionItem[] {
  const maxArea = Math.max(1, ...fields.map((f) => f.areaHa));
  return fields
    .map((field) => {
      const last = latestReading(field);
      const status = fieldStatus(field);
      const reasons: string[] = [];
      let score = 0;
      if (!last) {
        score = 8;
        reasons.push("Ainda sem avaliação registrada");
      } else {
        const gap = Math.max(0, field.targetEmergence - last.emergence);
        // Áreas maiores pesam mais: a mesma falha representa mais plantas perdidas.
        score += gap * (1 + field.areaHa / maxArea);
        if (gap > 3) reasons.push(`${Math.round(gap)} p.p. abaixo da meta`);
        const cv = lastSampleCv(field);
        if (cv !== null && cv > UNEVEN_CV) {
          score += 6;
          reasons.push("Estande desuniforme entre os pontos");
        }
        const age = calendarDaysBetween(new Date(last.date), now);
        if (age > STALE_AFTER_DAYS) {
          score += 3;
          reasons.push(`Última avaliação há ${age} dias`);
        }
      }
      if (reasons.length === 0) reasons.push("Sem pendências no momento");
      return { field, status, score: Math.round(score * 10) / 10, reasons };
    })
    .sort((a, b) => b.score - a.score || a.field.name.localeCompare(b.field.name, "pt-BR"));
}

/* ---------- Cronograma de ações ---------- */

export interface ActionStep {
  date: Date;
  title: string;
  detail: string;
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

export function actionSchedule(field: Field, now: Date = new Date()): ActionStep[] {
  const status = fieldStatus(field);
  if (status === "ok") return [];
  if (status === "sem-dados") {
    return [
      { date: addDays(now, 0), title: "Primeira contagem", detail: "Conte as plantas emergidas em pelo menos 5 pontos do talhão." },
      { date: addDays(now, 3), title: "Segunda contagem", detail: "Repita nos mesmos pontos para acompanhar a evolução." },
    ];
  }
  const steps: ActionStep[] = [
    {
      date: addDays(now, 0),
      title: status === "investigar" ? "Vistoria nas áreas com falha" : "Percorrer o talhão",
      detail:
        status === "investigar"
          ? "Abra a linha nos pontos com falha e observe sementes e plântulas: profundidade, umidade, crosta, pragas."
          : "Confira a uniformidade do estande em diferentes partes do talhão.",
    },
    {
      date: addDays(now, 1),
      title: "Registrar a vistoria",
      detail: "Anote no AgroLife o que foi observado e, se possível, faça uma análise por foto das áreas com falha.",
    },
    {
      date: addDays(now, 2),
      title: "Nova contagem de emergência",
      detail: "Conte as plantas nos mesmos pontos da última avaliação para medir a evolução.",
    },
  ];
  if (status === "investigar") {
    steps.push({
      date: addDays(now, 4),
      title: "Decidir com o agrônomo",
      detail: "Com a nova contagem e a tendência, avalie com um agrônomo se há necessidade de replantio ou outra ação corretiva.",
    });
  } else {
    steps.push({
      date: addDays(now, 5),
      title: "Reavaliar",
      detail: "Se a emergência não avançar, aprofunde a investigação das causas.",
    });
  }
  return steps;
}

/* ---------- Plano de correção do solo ---------- */

export interface CorrectionPlan {
  causes: string[];
  solutions: string[];
}

export function correctionPlan(field: Field): CorrectionPlan | null {
  const status = fieldStatus(field);
  if (status === "ok" || status === "sem-dados") return null;
  const alerts = buildFieldAlerts(field);
  const uneven = alerts.some((a) => a.id.endsWith(":desuniforme"));
  const stalled = alerts.some((a) => a.id.endsWith(":estabilizada"));
  const causes: string[] = [];
  const solutions: string[] = [];

  if (uneven) {
    causes.push("Falhas localizadas: distribuição irregular das sementes, variação de profundidade ou embuchamento da plantadeira.");
    solutions.push("Revisar discos, dosadores, pressão das rodas e velocidade de operação antes das próximas áreas.");
    solutions.push("Mapear as reboleiras com falha para acompanhar separadamente.");
  } else {
    causes.push("Problema generalizado: umidade inadequada no plantio, crosta ou compactação superficial, ou baixo vigor do lote de sementes.");
    solutions.push("Verificar a umidade e a presença de crosta na superfície do solo.");
    solutions.push("Conferir o laudo de germinação e vigor do lote de sementes.");
  }
  if (stalled) {
    causes.push("A emergência parou de avançar: plântulas podem ter morrido antes de emergir (pragas de solo, doenças ou crosta).");
    solutions.push("Abrir a linha em pontos com falha e observar sementes e plântulas.");
  }
  if (status === "investigar") {
    solutions.push("Avaliar a compactação com penetrômetro ou trincheira nas áreas mais afetadas.");
  }
  solutions.push("Para as próximas safras: análise de solo, correção de acidez e manejo da compactação conforme recomendação técnica.");
  return { causes, solutions };
}
