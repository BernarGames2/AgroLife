export type ReadingMethod = "contagem" | "percentual";

/** Um ponto de contagem: plantas emergidas em um trecho de linha. */
export interface CountSample {
  plants: number;
  meters: number;
}

/** Uma avaliação de emergência registrada em um talhão. */
export interface Reading {
  id: string;
  /** Data e hora da avaliação (ISO 8601). */
  date: string;
  /** Emergência em % (0–100). */
  emergence: number;
  method: ReadingMethod;
  samples?: CountSample[];
  /** Sementes por metro usadas no cálculo, quando o método é contagem. */
  seedsPerMeter?: number;
  notes?: string;
}

export interface Field {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  /** Meta de emergência em %. */
  targetEmergence: number;
  /** Data de plantio (AAAA-MM-DD). */
  plantingDate: string;
  seedsPerMeter?: number;
  rowSpacingCm?: number;
  cultivar?: string;
  notes?: string;
  createdAt: string;
  readings: Reading[];
}

export type FieldInput = Omit<Field, "id" | "createdAt" | "readings">;

export interface Profile {
  name: string;
  property: string;
  crops: string;
  location: string;
}

export interface Session {
  email: string;
  signedInAt: string;
}

export type Uniformity = "alta" | "media" | "baixa";

export interface PhotoAnalysis {
  id: string;
  date: string;
  fieldId?: string;
  /** Cobertura verde estimada em % (0–100). */
  coverage: number;
  uniformity: Uniformity;
  lowCells: number;
  totalCells: number;
  /** Miniatura em data URL (JPEG reduzido). */
  thumbnail?: string;
  notes?: string;
}

/** Gratuito < Plus (vídeos da equipe KP) < Premium (consultoria presencial e análises). */
export type Plan = "gratuito" | "plus" | "premium";

export type KpRequestType = "video" | "consultoria";

/** Pedido feito à equipe KP: vídeo personalizado (Plus) ou consultoria presencial (Premium). */
export interface KpRequest {
  id: string;
  type: KpRequestType;
  createdAt: string;
  fieldId?: string;
  /** O que está acontecendo, nas palavras do produtor. */
  message: string;
  /** Foto reduzida (data URL JPEG). */
  photo?: string;
  /** Telefone para contato (consultoria). */
  phone?: string;
  /** Melhor período para a visita (consultoria). */
  preferredPeriod?: string;
  /** Quando o pedido foi enviado à KP (pelo WhatsApp ou compartilhamento). */
  sentAt?: string;
  /** Link do vídeo recebido da KP. */
  videoUrl?: string;
  /** Data combinada para a visita. */
  scheduledFor?: string;
  completedAt?: string;
}

export interface AppData {
  version: 1;
  profile: Profile;
  fields: Field[];
  analyses: PhotoAnalysis[];
  /** Indica que os dados atuais são de demonstração. */
  isDemo: boolean;
  /** Plano ativo (no protótipo, a ativação é apenas demonstrativa). */
  plan: Plan;
  /** Itens marcados no checklist de plantio. */
  checklist: string[];
  kpRequests: KpRequest[];
}
