import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Video } from "lucide-react";
import type { Plan } from "@/types";
import { hasPlan, PLANS } from "@/lib/plans";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { PlanCards } from "@/components/PlanCards";
import { Notice } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function AppPlans() {
  const { data, setPlan } = useAppStore();
  const toast = useToast();

  function choose(plan: Plan) {
    setPlan(plan);
    toast(plan === "gratuito" ? "Você voltou ao plano Gratuito" : `Plano ${PLANS[plan].name} ativado (demonstração)`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const included = [
    hasPlan(data.plan, "plus") && {
      to: "/app/kp",
      icon: Video,
      title: hasPlan(data.plan, "premium") ? "Vídeos e consultoria da equipe KP" : "Vídeos personalizados da equipe KP",
      text: hasPlan(data.plan, "premium") ? "Peça um vídeo ou uma visita à propriedade." : "Conte o que está acontecendo e receba um vídeo.",
    },
    hasPlan(data.plan, "premium") && {
      to: "/app/premium",
      icon: Sparkles,
      title: "Análises Premium",
      text: "Correção do solo, falhas e replantio, tendência e cronograma.",
    },
  ].filter(Boolean) as Array<{ to: string; icon: typeof Video; title: string; text: string }>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Planos" subtitle={`Seu plano atual: ${PLANS[data.plan].name}.`} />

      {included.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Incluído no seu plano</h2>
          {included.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="card flex items-center gap-4 p-5 hover:bg-muted/40">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted-foreground">{text}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </section>
      )}

      <PlanCards current={data.plan} onChoose={choose} ctaFor={(plan) => (plan === "gratuito" ? "Voltar ao Gratuito" : `Assinar ${PLANS[plan].name}`)} />

      <Notice>
        Protótipo: o pagamento ainda não está disponível. Ao assinar aqui, o plano é ativado apenas em modo de demonstração, sem
        cobrança.
      </Notice>
    </div>
  );
}
