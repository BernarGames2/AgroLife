import { describe, expect, it } from "vitest";
import {
  buildAlerts,
  buildFieldAlerts,
  classify,
  coefficientOfVariation,
  emergenceFromSamples,
  fieldStatus,
  percentagePoints,
  plantsPerHectare,
  summarize,
} from "@/lib/agro";
import { createDemoFields } from "@/lib/demo";
import type { Field } from "@/types";

const NOW = new Date(2026, 9, 26, 10, 0);

function field(partial: Partial<Field> = {}): Field {
  return {
    id: "f1",
    name: "Talhão 10",
    crop: "Soja",
    areaHa: 10,
    targetEmergence: 92,
    plantingDate: "2026-10-16",
    createdAt: new Date(2026, 9, 16).toISOString(),
    readings: [],
    ...partial,
  };
}

describe("classify", () => {
  it("segue os limites usados no protótipo", () => {
    expect(classify(91, 92)).toBe("ok");
    expect(classify(95, 92)).toBe("ok");
    expect(classify(89, 92)).toBe("ok");
    expect(classify(88, 92)).toBe("atencao");
    expect(classify(84, 93)).toBe("atencao");
    expect(classify(82, 92)).toBe("atencao");
    expect(classify(81, 92)).toBe("investigar");
    expect(classify(76, 92)).toBe("investigar");
  });
});

describe("cálculos agronômicos", () => {
  it("calcula a emergência a partir da contagem na linha", () => {
    const value = emergenceFromSamples(
      [
        { plants: 64, meters: 5 },
        { plants: 62, meters: 5 },
      ],
      14,
    );
    expect(value).toBeCloseTo((126 / 10 / 14) * 100);
  });

  it("ignora pontos inválidos e exige sementes por metro", () => {
    expect(emergenceFromSamples([{ plants: 10, meters: 0 }], 14)).toBeNull();
    expect(emergenceFromSamples([{ plants: 10, meters: 1 }], 0)).toBeNull();
  });

  it("estima o estande em plantas por hectare", () => {
    // 14 sementes/m em linhas de 50 cm = 280 mil sementes/ha
    expect(plantsPerHectare(14, 50, 100)).toBeCloseTo(280_000);
    expect(plantsPerHectare(14, 50, 91)).toBeCloseTo(254_800);
    expect(plantsPerHectare(14, 0, 91)).toBeNull();
  });

  it("calcula o coeficiente de variação", () => {
    expect(coefficientOfVariation([10, 10, 10])).toBe(0);
    expect(coefficientOfVariation([10])).toBeNull();
    expect(coefficientOfVariation([80, 100])).toBeCloseTo(14.142 / 90, 3);
  });

  it("flexiona pontos percentuais", () => {
    expect(percentagePoints(1)).toBe("1 ponto percentual");
    expect(percentagePoints(9)).toBe("9 pontos percentuais");
  });
});

describe("alertas", () => {
  it("pede a primeira avaliação quando não há registros", () => {
    const alerts = buildFieldAlerts(field(), NOW);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].level).toBe("info");
    expect(fieldStatus(field())).toBe("sem-dados");
  });

  it("gera o alerta de status com a diferença para a meta", () => {
    const f = field({ readings: [{ id: "r1", date: new Date(2026, 9, 25).toISOString(), emergence: 76, method: "percentual" }] });
    const [main] = buildFieldAlerts(f, NOW);
    expect(main.level).toBe("investigar");
    expect(main.description).toContain("16 pontos percentuais abaixo");
    expect(main.action).toMatch(/plantadeira/);
  });

  it("aponta estande desuniforme quando os pontos variam muito", () => {
    const f = field({
      readings: [
        {
          id: "r1",
          date: new Date(2026, 9, 25).toISOString(),
          emergence: 76,
          method: "contagem",
          seedsPerMeter: 14,
          samples: [
            { plants: 66, meters: 5 },
            { plants: 36, meters: 5 },
            { plants: 60, meters: 5 },
            { plants: 40, meters: 5 },
          ],
        },
      ],
    });
    expect(buildFieldAlerts(f, NOW).some((a) => a.title === "Estande desuniforme")).toBe(true);
  });

  it("aponta emergência estabilizada abaixo da meta", () => {
    const f = field({
      readings: [
        { id: "r1", date: new Date(2026, 9, 23).toISOString(), emergence: 80, method: "percentual" },
        { id: "r2", date: new Date(2026, 9, 25).toISOString(), emergence: 80, method: "percentual" },
      ],
    });
    expect(buildFieldAlerts(f, NOW).some((a) => a.title === "Emergência estabilizada abaixo da meta")).toBe(true);
  });

  it("avisa quando a avaliação está desatualizada durante o estabelecimento", () => {
    const f = field({
      plantingDate: "2026-10-06",
      readings: [{ id: "r1", date: new Date(2026, 9, 14).toISOString(), emergence: 91, method: "percentual" }],
    });
    expect(buildFieldAlerts(f, NOW).some((a) => a.title === "Avaliação desatualizada")).toBe(true);
  });

  it("ordena por gravidade", () => {
    const alerts = buildAlerts(createDemoFields(NOW), NOW);
    expect(alerts.map((a) => a.level)).toEqual(["investigar", "atencao", "atencao", "ok"]);
    expect(alerts[0].fieldName).toBe("Talhão 03");
  });
});

describe("dados de demonstração", () => {
  it("reproduzem o painel da Fazenda Horizonte", () => {
    const fields = createDemoFields(NOW);
    expect(fields.map(fieldStatus)).toEqual(["ok", "atencao", "investigar"]);
    const s = summarize(fields);
    expect(s.fieldCount).toBe(3);
    expect(Math.round(s.averageEmergence ?? 0)).toBe(84);
    expect(s.attentionCount).toBe(2);
    expect(new Date(s.lastUpdate ?? "").getHours()).toBe(8);
  });

  it("têm contagens coerentes com a emergência registrada", () => {
    for (const f of createDemoFields(NOW)) {
      const last = f.readings[f.readings.length - 1];
      const computed = emergenceFromSamples(last.samples ?? [], last.seedsPerMeter ?? 0);
      expect(Math.round(computed ?? 0)).toBe(last.emergence);
    }
  });
});
