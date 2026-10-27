import { describe, expect, it } from "vitest";
import type { Field } from "@/types";
import { createDemoFields } from "@/lib/demo";
import { actionSchedule, correctionPlan, estimateGaps, inspectionPriority, projectEmergence, replantAdvice } from "@/lib/premium";
import { treemap } from "@/lib/treemap";

const NOW = new Date(2026, 9, 27, 10, 0);
const demo = () => createDemoFields(NOW);
const byName = (fields: Field[], name: string) => fields.find((f) => f.name === name)!;

describe("estimativa de falhas", () => {
  it("calcula plantas faltantes por hectare e no talhão", () => {
    const f = byName(demo(), "Talhão 03"); // 14 sem/m, 50 cm, meta 92%, atual 76%, 41 ha
    const g = estimateGaps(f)!;
    expect(g.expectedPlantsHa).toBeCloseTo(280_000 * 0.92);
    expect(g.actualPlantsHa).toBeCloseTo(280_000 * 0.76);
    expect(g.missingPlantsHa).toBeCloseTo(280_000 * 0.16);
    expect(g.missingTotal).toBeCloseTo(280_000 * 0.16 * 41);
  });

  it("só indica avaliar replantio quando a emergência fica bem abaixo da meta", () => {
    expect(replantAdvice(91, 92)).toBe("adequado");
    expect(replantAdvice(84, 93)).toBe("monitorar");
    expect(replantAdvice(76, 92)).toBe("monitorar");
    expect(replantAdvice(60, 92)).toBe("avaliar-replantio");
  });

  it("não estima sem regulagem cadastrada", () => {
    const f = { ...byName(demo(), "Talhão 01"), seedsPerMeter: undefined };
    expect(estimateGaps(f)).toBeNull();
  });
});

describe("tendência da emergência", () => {
  it("projeta ganhos decrescentes e nunca passa de 100%", () => {
    const proj = projectEmergence(byName(demo(), "Talhão 03"))!; // 74 → 76 (+2/dia)
    expect(proj).toHaveLength(2);
    expect(proj[0].emergence).toBeCloseTo(77.2);
    expect(proj[1].emergence).toBeCloseTo(77.9);
    const full: Field = {
      ...byName(demo(), "Talhão 01"),
      readings: [
        { id: "a", date: new Date(2026, 9, 25).toISOString(), emergence: 90, method: "percentual" },
        { id: "b", date: new Date(2026, 9, 26).toISOString(), emergence: 99, method: "percentual" },
      ],
    };
    expect(projectEmergence(full)!.every((p) => p.emergence <= 100)).toBe(true);
  });

  it("exige ao menos duas avaliações", () => {
    expect(projectEmergence({ ...byName(demo(), "Talhão 01"), readings: [] })).toBeNull();
  });
});

describe("prioridade e cronograma", () => {
  it("coloca primeiro o talhão mais crítico", () => {
    const order = inspectionPriority(demo(), NOW).map((i) => i.field.name);
    expect(order).toEqual(["Talhão 03", "Talhão 02", "Talhão 01"]);
  });

  it("monta cronograma só para talhões em atenção", () => {
    const fields = demo();
    expect(actionSchedule(byName(fields, "Talhão 01"), NOW)).toEqual([]);
    const steps = actionSchedule(byName(fields, "Talhão 03"), NOW);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[steps.length - 1].title).toMatch(/agrônomo/);
  });

  it("sugere causas ligadas à plantadeira quando o estande é desuniforme", () => {
    const plan = correctionPlan(byName(demo(), "Talhão 03"))!;
    expect(plan.causes[0]).toMatch(/distribuição irregular/);
    expect(correctionPlan(byName(demo(), "Talhão 01"))).toBeNull();
  });
});

describe("treemap do mapa", () => {
  it("ocupa todo o espaço com áreas proporcionais", () => {
    const rects = treemap(
      [
        { id: "a", value: 35 },
        { id: "b", value: 22 },
        { id: "c", value: 41 },
      ],
      1.25,
    );
    expect(rects).toHaveLength(3);
    const total = rects.reduce((s, r) => s + r.w * r.h, 0);
    expect(total).toBeCloseTo(1);
    const c = rects.find((r) => r.id === "c")!;
    expect(c.w * c.h).toBeCloseTo(41 / 98);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(1 + 1e-9);
      expect(r.y + r.h).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it("ignora áreas zeradas", () => {
    expect(treemap([{ id: "a", value: 0 }])).toEqual([]);
  });
});
