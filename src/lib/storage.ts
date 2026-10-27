import type { AppData, Field, PhotoAnalysis, Plan, Reading, Session } from "@/types";

const DATA_KEY = "agrolife:data:v1";
const SESSION_KEY = "agrolife:session:v1";

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Armazenamento cheio ou bloqueado (ex.: navegação privada).
    return false;
  }
}

export function loadData(): AppData | null {
  return parseAppData(read(DATA_KEY));
}

export function saveData(data: AppData): boolean {
  return write(DATA_KEY, data);
}

export function loadSession(): Session | null {
  const value = read(SESSION_KEY);
  if (isObject(value) && typeof value.email === "string" && typeof value.signedInAt === "string") {
    return { email: value.email, signedInAt: value.signedInAt };
  }
  return null;
}

export function saveSession(session: Session | null): void {
  write(SESSION_KEY, session);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const optionalString = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : undefined);
const optionalNumber = (v: unknown) => (isFiniteNumber(v) ? v : undefined);

function parseReading(value: unknown): Reading | null {
  if (!isObject(value)) return null;
  if (typeof value.id !== "string" || typeof value.date !== "string" || !isFiniteNumber(value.emergence)) return null;
  if (Number.isNaN(new Date(value.date).getTime())) return null;
  const samples = Array.isArray(value.samples)
    ? value.samples.filter(
        (s): s is { plants: number; meters: number } => isObject(s) && isFiniteNumber(s.plants) && isFiniteNumber(s.meters),
      )
    : undefined;
  return {
    id: value.id,
    date: value.date,
    emergence: value.emergence,
    method: value.method === "contagem" ? "contagem" : "percentual",
    samples: samples && samples.length ? samples.map((s) => ({ plants: s.plants, meters: s.meters })) : undefined,
    seedsPerMeter: optionalNumber(value.seedsPerMeter),
    notes: optionalString(value.notes),
  };
}

function parseField(value: unknown): Field | null {
  if (!isObject(value)) return null;
  const { id, name, crop, areaHa, targetEmergence, plantingDate, createdAt } = value;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof crop !== "string" ||
    !isFiniteNumber(areaHa) ||
    !isFiniteNumber(targetEmergence) ||
    typeof plantingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(plantingDate)
  ) {
    return null;
  }
  const readings = Array.isArray(value.readings)
    ? value.readings.map(parseReading).filter((r): r is Reading => r !== null)
    : [];
  return {
    id,
    name,
    crop,
    areaHa,
    targetEmergence,
    plantingDate,
    seedsPerMeter: optionalNumber(value.seedsPerMeter),
    rowSpacingCm: optionalNumber(value.rowSpacingCm),
    cultivar: optionalString(value.cultivar),
    notes: optionalString(value.notes),
    createdAt: typeof createdAt === "string" ? createdAt : new Date().toISOString(),
    readings,
  };
}

function parseAnalysis(value: unknown): PhotoAnalysis | null {
  if (!isObject(value)) return null;
  if (typeof value.id !== "string" || typeof value.date !== "string" || !isFiniteNumber(value.coverage)) return null;
  const uniformity = value.uniformity === "alta" || value.uniformity === "baixa" ? value.uniformity : "media";
  const thumbnail =
    typeof value.thumbnail === "string" && value.thumbnail.startsWith("data:image/") ? value.thumbnail : undefined;
  return {
    id: value.id,
    date: value.date,
    fieldId: optionalString(value.fieldId),
    coverage: value.coverage,
    uniformity,
    lowCells: optionalNumber(value.lowCells) ?? 0,
    totalCells: optionalNumber(value.totalCells) ?? 0,
    thumbnail,
    notes: optionalString(value.notes),
  };
}

/** Valida dados vindos do armazenamento local ou de um arquivo importado. */
export function parseAppData(value: unknown): AppData | null {
  if (!isObject(value) || value.version !== 1 || !isObject(value.profile) || !Array.isArray(value.fields)) {
    return null;
  }
  const p = value.profile;
  return {
    version: 1,
    profile: {
      name: typeof p.name === "string" ? p.name : "",
      property: typeof p.property === "string" ? p.property : "",
      crops: typeof p.crops === "string" ? p.crops : "",
      location: typeof p.location === "string" ? p.location : "",
    },
    fields: value.fields.map(parseField).filter((f): f is Field => f !== null),
    analyses: Array.isArray(value.analyses)
      ? value.analyses.map(parseAnalysis).filter((a): a is PhotoAnalysis => a !== null)
      : [],
    isDemo: value.isDemo === true,
    plan: PLANS.includes(value.plan as Plan) ? (value.plan as Plan) : "gratuito",
    checklist: Array.isArray(value.checklist) ? value.checklist.filter((c): c is string => typeof c === "string") : [],
  };
}

const PLANS: Plan[] = ["gratuito", "premium", "plus"];
