import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";

const PLANS = [
  {
    name: "Produtor",
    price: "Gratuito",
    note: "durante a fase de validação",
    highlight: true,
    cta: "Começar agora",
    features: [
      "Talhões ilimitados",
      "Registro de contagens e cálculo de emergência",
      "Pontos de atenção e ações sugeridas",
      "Análise de cobertura por foto (protótipo)",
      "Exportação dos dados",
    ],
  },
  {
    name: "Agrônomo / Consultor",
    price: "Em breve",
    note: "para quem acompanha várias propriedades",
    highlight: false,
    cta: "Quero ser avisado",
    features: ["Várias propriedades em uma conta", "Relatórios para compartilhar com o produtor", "Histórico por safra"],
  },
  {
    name: "Cooperativa / Empresa",
    price: "Sob consulta",
    note: "para equipes técnicas",
    highlight: false,
    cta: "Falar com a equipe",
    features: ["Painel consolidado por região", "Gestão de equipes de campo", "Integração com outros sistemas"],
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
    a: "Os valores ainda estão sendo definidos com os produtores participantes. Ninguém será cobrado sem aviso prévio.",
  },
];

export default function Plans() {
  const { session } = useAppStore();
  return (
    <div className="container py-12 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="text-[2.4rem] font-extrabold leading-tight sm:text-5xl">Planos</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          O AgroLife está em fase de validação. Durante esse período, o acesso para produtores é gratuito.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article key={plan.name} className={cn("card flex flex-col p-7", plan.highlight && "border-primary/40 ring-2 ring-primary/15")}>
            {plan.highlight && (
              <span className="mb-4 self-start rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Disponível agora</span>
            )}
            <h2 className="text-2xl font-bold">{plan.name}</h2>
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
            {plan.highlight ? (
              <ButtonLink to={session ? "/app" : "/entrar?modo=cadastro"} size="lg" className="mt-7 rounded-2xl">
                {session ? "Abrir app" : plan.cta}
              </ButtonLink>
            ) : (
              <span className="mt-7 inline-flex h-14 items-center justify-center rounded-2xl border border-dashed text-[15px] font-medium text-muted-foreground">
                {plan.cta} · em breve
              </span>
            )}
          </article>
        ))}
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
