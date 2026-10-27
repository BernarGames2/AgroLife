import { Check, Crown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";

const PLANS = [
  {
    id: "gratuito",
    name: "Gratuito",
    price: "R$ 0",
    note: "durante a fase de validação",
    highlight: false,
    cta: "Começar agora",
    features: [
      "Talhões ilimitados",
      "Registro de contagens e cálculo de emergência",
      "Pontos de atenção e ações sugeridas",
      "Análise de cobertura por foto (protótipo)",
      "Mapa, checklist, comparação e relatórios",
      "AgroLife Academy",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "Em breve",
    note: "todos os recursos avançados em um só lugar",
    highlight: true,
    cta: "Conhecer o Premium",
    features: [
      "Tudo do Gratuito",
      "Plano de correção do solo por talhão",
      "Estimativa de falhas e indicação de replantio",
      "Tendência da emergência para os próximos dias",
      "Prioridade de vistoria e cronograma de ações",
      "Relatório Premium para imprimir ou salvar em PDF",
    ],
  },
  {
    id: "plus",
    name: "Premium Plus",
    price: "Em breve",
    note: "com acompanhamento presencial da equipe KP",
    highlight: false,
    cta: "Conhecer o Premium Plus",
    features: [
      "Tudo do Premium",
      "Visitas técnicas presenciais aos talhões",
      "Avaliação de estande e solo feita no campo",
      "Apoio na regulagem da plantadeira",
      "Relatório da visita com recomendações",
      "Contato direto com a equipe KP",
    ],
  },
];

const FAQ = [
  {
    q: "Onde ficam os meus dados?",
    a: "Nesta fase de protótipo, os dados ficam salvos apenas no navegador do seu aparelho. Você pode exportá-los a qualquer momento pela tela de perfil.",
  },
  {
    q: "A análise por foto substitui a visita a campo?",
    a: "Não. A análise estima a cobertura verde pela cor da imagem e serve como apoio. A avaliação de um profissional qualificado continua indispensável.",
  },
  {
    q: "Quanto vai custar depois da validação?",
    a: "O plano Gratuito continua disponível. Os preços do Premium e do Premium Plus ainda estão sendo definidos com os produtores participantes, e ninguém será cobrado sem aviso prévio.",
  },
  {
    q: "Posso experimentar o Premium?",
    a: "Sim. Dentro do app, em “Premium e Plus”, é possível ativar o Premium e o Premium Plus em modo de demonstração, sem custo.",
  },
];

export default function Plans() {
  const { session } = useAppStore();
  return (
    <div className="container py-12 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="text-[2.4rem] font-extrabold leading-tight sm:text-5xl">Planos</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Comece grátis e evolua quando precisar. Durante a fase de validação, o Premium e o Premium Plus podem ser experimentados em
          modo de demonstração.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const href =
            plan.id === "gratuito"
              ? session
                ? "/app"
                : "/entrar?modo=cadastro"
              : session
                ? "/app/premium"
                : `/entrar?modo=cadastro&next=${encodeURIComponent("/app/premium")}`;
          return (
            <article key={plan.id} className={cn("card flex flex-col p-7", plan.highlight && "border-primary/40 ring-2 ring-primary/15")}>
              {plan.highlight && (
                <span className="mb-4 self-start rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Mais completo</span>
              )}
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                {plan.id !== "gratuito" && <Crown className="size-6 text-primary" strokeWidth={1.9} aria-hidden />}
                {plan.name}
              </h2>
              <p className="mt-3 font-display text-3xl font-extrabold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.note}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug">
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink to={href} variant={plan.highlight ? "primary" : "outline"} size="lg" className="mt-7 rounded-2xl">
                {plan.id === "gratuito" && session ? "Abrir app" : plan.cta}
              </ButtonLink>
              {plan.id !== "gratuito" && <p className="mt-2 text-center text-xs text-muted-foreground">Ativação em modo de demonstração no app</p>}
            </article>
          );
        })}
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
        <div className="mt-6 divide-y rounded-3xl border bg-card">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
