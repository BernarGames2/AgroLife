import { Check, Crown } from "lucide-react";
import type { Plan } from "@/types";
import { formatPrice, PLAN_ORDER, PLANS, PRICE_PERIOD, previousPlanName } from "@/lib/plans";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PlanCardsProps {
  /** Plano atual (dentro do app). */
  current?: Plan;
  /** Ação ao escolher um plano dentro do app. */
  onChoose?: (plan: Plan) => void;
  /** Link para cada plano (página pública). */
  hrefFor?: (plan: Plan) => string;
  ctaFor?: (plan: Plan) => string;
}

export function PlanCards({ current, onChoose, hrefFor, ctaFor }: PlanCardsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id];
        const highlight = id === "premium";
        const isCurrent = current === id;
        const includes = previousPlanName(id);
        const cta = ctaFor?.(id) ?? (id === "gratuito" ? "Usar o Gratuito" : `Assinar ${plan.name}`);
        return (
          <article
            key={id}
            className={cn(
              "card flex flex-col p-6 sm:p-7",
              highlight && "border-primary/40 ring-2 ring-primary/15",
              isCurrent && "border-primary ring-2 ring-primary/30",
            )}
          >
            {/* Selo do plano; sem selo, o espaço só é reservado no computador para alinhar os cartões lado a lado. */}
            <div className={cn("mb-3 min-h-7 flex-wrap gap-2", isCurrent || highlight ? "flex" : "hidden lg:flex")}>
              {isCurrent && <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">Seu plano</span>}
              {highlight && !isCurrent && (
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Mais completo</span>
              )}
            </div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              {id !== "gratuito" && <Crown className="size-6 text-primary" strokeWidth={1.9} aria-hidden />}
              {plan.name}
            </h2>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-tight">
              {formatPrice(plan.price)}
              {plan.price > 0 && <span className="ml-1 font-sans text-base font-medium text-muted-foreground">/{PRICE_PERIOD}</span>}
            </p>
            <p className="mt-1 text-[15px] text-muted-foreground">{plan.tagline}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {includes && (
                <li className="flex gap-3 text-[15px] font-semibold leading-snug">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  Tudo do {includes}
                </li>
              )}
              {plan.features.map((f) => (
                <li key={f} className="flex gap-3 text-[15px] leading-snug">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            {onChoose ? (
              <Button
                size="lg"
                variant={highlight ? "primary" : "outline"}
                className="mt-7 rounded-2xl"
                disabled={isCurrent}
                onClick={() => onChoose(id)}
              >
                {isCurrent ? "Plano atual" : cta}
              </Button>
            ) : hrefFor ? (
              <ButtonLink to={hrefFor(id)} size="lg" variant={highlight ? "primary" : "outline"} className="mt-7 rounded-2xl">
                {cta}
              </ButtonLink>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
