import { Link } from "react-router-dom";
import { ChevronRight, Crown } from "lucide-react";
import { MORE_ITEMS } from "@/lib/navigation";
import { formatPrice, PLANS, PRICE_PERIOD } from "@/lib/plans";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

/** Todas as seções que não cabem na barra inferior do celular. */
export default function More() {
  const { data } = useAppStore();
  const tools = MORE_ITEMS.filter((i) => i.to !== "/app/planos");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Mais" subtitle="Todas as ferramentas do AgroLife." />

      <Link
        to="/app/planos"
        className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[hsl(140_42%_26%)] to-[hsl(122_38%_42%)] p-5 text-white shadow-card"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Crown className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">Planos Plus e Premium</span>
          <span className="block text-sm text-white/85">
            {data.plan === "gratuito"
              ? `Vídeos e consultoria da equipe KP a partir de ${formatPrice(PLANS.plus.price)}/${PRICE_PERIOD}`
              : `Seu plano: ${PLANS[data.plan].name}`}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0" aria-hidden />
      </Link>

      <ul className="grid grid-cols-2 gap-3">
        {tools.map(({ to, label, icon: Icon, description }) => (
          <li key={to}>
            <Link to={to} className={cn("card flex h-full flex-col gap-3 p-4 transition-shadow hover:shadow-[0_12px_32px_-14px_hsl(140_30%_20%/0.25)]")}>
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm leading-snug text-muted-foreground">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
