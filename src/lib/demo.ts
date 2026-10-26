import type { AppData, CountSample, Field, Profile, Reading } from "@/types";
import { toDateInputValue } from "@/lib/format";

export const DEMO_EMAIL = "demo@agrolife.app";

export const DEMO_PROFILE: Profile = {
  name: "Luiza",
  property: "Fazenda Horizonte",
  crops: "Soja, Milho",
  location: "Região Oeste (dados de demonstração)",
};

function at(now: Date, daysAgo: number, hours: number, minutes: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hours, minutes);
  return d.toISOString();
}

function plantedDaysAgo(now: Date, days: number): string {
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days));
}

function series(
  fieldId: string,
  now: Date,
  points: Array<[daysAgo: number, emergence: number]>,
  time: [number, number],
  last?: { samples: CountSample[]; seedsPerMeter: number; notes?: string },
): Reading[] {
  return points.map(([daysAgo, emergence], i) => {
    const isLast = i === points.length - 1;
    return {
      id: `${fieldId}-r${i + 1}`,
      date: at(now, daysAgo, time[0], time[1]),
      emergence,
      method: isLast && last ? "contagem" : "percentual",
      ...(isLast && last ? { samples: last.samples, seedsPerMeter: last.seedsPerMeter, notes: last.notes } : {}),
    };
  });
}

/**
 * Dados de demonstração da Fazenda Horizonte. As datas são geradas em relação
 * ao momento atual para que a demonstração sempre pareça recente.
 */
export function createDemoFields(now: Date = new Date()): Field[] {
  const createdAt = at(now, 14, 7, 30);
  return [
    {
      id: "demo-talhao-01",
      name: "Talhão 01",
      crop: "Soja",
      areaHa: 35,
      targetEmergence: 92,
      plantingDate: plantedDaysAgo(now, 10),
      seedsPerMeter: 14,
      rowSpacingCm: 50,
      createdAt,
      readings: series("demo-talhao-01", now, [[4, 58], [3, 72], [2, 83], [1, 89], [0, 91]], [8, 42], {
        seedsPerMeter: 14,
        samples: [
          { plants: 64, meters: 5 },
          { plants: 62, meters: 5 },
          { plants: 65, meters: 5 },
          { plants: 63, meters: 5 },
          { plants: 64, meters: 5 },
        ],
        notes: "Estande uniforme nos cinco pontos avaliados.",
      }),
    },
    {
      id: "demo-talhao-02",
      name: "Talhão 02",
      crop: "Milho",
      areaHa: 22,
      targetEmergence: 93,
      plantingDate: plantedDaysAgo(now, 12),
      seedsPerMeter: 3.3,
      rowSpacingCm: 50,
      createdAt,
      readings: series("demo-talhao-02", now, [[5, 55], [4, 68], [3, 77], [2, 82], [1, 84]], [16, 20], {
        seedsPerMeter: 3.3,
        samples: [
          { plants: 30, meters: 10 },
          { plants: 25, meters: 10 },
          { plants: 29, meters: 10 },
          { plants: 27, meters: 10 },
        ],
      }),
    },
    {
      id: "demo-talhao-03",
      name: "Talhão 03",
      crop: "Soja",
      areaHa: 41,
      targetEmergence: 92,
      plantingDate: plantedDaysAgo(now, 13),
      seedsPerMeter: 14,
      rowSpacingCm: 50,
      notes: "Área de baixada, solo mais argiloso.",
      createdAt,
      readings: series("demo-talhao-03", now, [[6, 45], [5, 58], [4, 68], [3, 74], [2, 76]], [9, 10], {
        seedsPerMeter: 14,
        samples: [
          { plants: 66, meters: 5 },
          { plants: 36, meters: 5 },
          { plants: 60, meters: 5 },
          { plants: 40, meters: 5 },
          { plants: 64, meters: 5 },
        ],
        notes: "Falhas concentradas próximas à cabeceira.",
      }),
    },
  ];
}

export function createDemoData(now: Date = new Date(), profile: Profile = DEMO_PROFILE): AppData {
  return {
    version: 1,
    profile: { ...profile },
    fields: createDemoFields(now),
    analyses: [],
    isDemo: true,
  };
}

export function createEmptyData(profile: Profile): AppData {
  return { version: 1, profile: { ...profile }, fields: [], analyses: [], isDemo: false };
}
