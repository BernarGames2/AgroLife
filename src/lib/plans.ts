import type { Plan } from "@/types";

/** Fonte única dos planos: usada na página pública, no app e no perfil. */

export interface PlanInfo {
  id: Plan;
  name: string;
  /** Preço em reais por período; 0 = gratuito. */
  price: number;
  tagline: string;
  /** Recursos exclusivos deste plano (os dos planos anteriores estão incluídos). */
  features: string[];
}

export const PRICE_PERIOD = "mês";

export const PLAN_ORDER: Plan[] = ["gratuito", "plus", "premium"];

export const PLANS: Record<Plan, PlanInfo> = {
  gratuito: {
    id: "gratuito",
    name: "Gratuito",
    price: 0,
    tagline: "Para monitorar seus talhões",
    features: [
      "Talhões ilimitados",
      "Registro de contagens e cálculo de emergência",
      "Pontos de atenção e ações sugeridas",
      "Análise de cobertura por foto (protótipo)",
      "Mapa, checklist, comparação e relatórios",
      "AgroLife Academy",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: 19.9,
    tagline: "Com vídeos personalizados da equipe KP",
    features: [
      "Vídeos personalizados da equipe KP: conte o que está acontecendo e receba um vídeo explicando",
      "Envie fotos e descreva o problema de cada talhão",
      "Vídeos guardados junto do talhão para rever quando quiser",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 25.9,
    tagline: "Com consultoria presencial da equipe KP",
    features: [
      "Consultoria presencial: conte seu problema e a equipe KP pode ir até a propriedade",
      "Análises Premium: plano de correção do solo, estimativa de falhas e replantio, tendência da emergência",
      "Prioridade de vistoria, cronograma de ações e relatório Premium",
    ],
  },
};

/** O plano atual inclui os recursos do plano exigido? */
export function hasPlan(current: Plan, required: Plan): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

export function formatPrice(price: number): string {
  if (price === 0) return "Grátis";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function previousPlanName(plan: Plan): string | null {
  const i = PLAN_ORDER.indexOf(plan);
  return i > 0 ? PLANS[PLAN_ORDER[i - 1]].name : null;
}
