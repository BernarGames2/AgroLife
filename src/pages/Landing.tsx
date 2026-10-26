import { ArrowRight, ChartLine, ClipboardList, Compass, MapPinned, Stethoscope, BellRing } from "lucide-react";
import { HeroIllustration } from "@/components/HeroIllustration";
import { StatusDot } from "@/components/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { useAppStore } from "@/store/AppStore";

const FEATURES = [
  {
    icon: ChartLine,
    title: "Monitoramento",
    text: "Acompanhe a emergência das plantas e o desempenho dos seus talhões.",
  },
  {
    icon: Stethoscope,
    title: "Diagnóstico",
    text: "Identifique padrões que podem indicar problemas no estabelecimento da lavoura.",
  },
  {
    icon: Compass,
    title: "Decisão",
    text: "Receba pontos de atenção e recomendações para ajudar na tomada de decisão.",
  },
];

const STEPS = [
  {
    icon: MapPinned,
    title: "Cadastre o talhão",
    text: "Informe cultura, área, data de plantio e a meta de emergência esperada.",
  },
  {
    icon: ClipboardList,
    title: "Registre as contagens",
    text: "Conte as plantas emergidas em alguns pontos da linha. O AgroLife calcula a emergência e o estande.",
  },
  {
    icon: BellRing,
    title: "Acompanhe os alertas",
    text: "Veja quais talhões estão dentro do esperado e quais merecem uma visita a campo.",
  },
];

export default function Landing() {
  const { session } = useAppStore();
  const startHref = session ? "/app" : "/entrar?modo=cadastro";
  const newFieldHref = session ? "/app/talhoes/novo" : `/entrar?modo=cadastro&next=${encodeURIComponent("/app/talhoes/novo")}`;

  return (
    <>
      {/* Hero */}
      <section className="container grid items-center gap-10 pb-14 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24">
        <div className="animate-fade-in">
          <span className="inline-flex rounded-full border border-ok-border bg-ok-bg px-4 py-1.5 text-[15px] font-medium text-primary">
            Do início bem feito, ao lucro perfeito.
          </span>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.08] sm:text-6xl">
            Transforme os dados do plantio em decisões melhores.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Monitore o estabelecimento da sua lavoura, identifique possíveis falhas e acompanhe seus talhões em um só lugar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={startHref} size="lg" className="rounded-2xl">
              Começar agora <ArrowRight />
            </ButtonLink>
            <a href="#sobre" className="inline-flex h-14 items-center justify-center rounded-2xl border bg-white px-7 text-base font-medium shadow-soft hover:bg-muted">
              Conhecer o AgroLife
            </a>
          </div>
          <p className="mt-6 text-[15px] text-muted-foreground">Protótipo com dados de demonstração da Fazenda Horizonte.</p>
        </div>

        <div className="relative animate-fade-in [animation-delay:120ms]">
          <div className="overflow-hidden rounded-[2rem] border shadow-card">
            <HeroIllustration className="block h-auto w-full" />
          </div>
          {/* Prévia do que o app mostra */}
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:left-6">
            <StatusDot tone="investigar" className="text-lg" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Talhão 03 — Soja</p>
              <p className="text-xs text-muted-foreground">76% de emergência · meta 92%</p>
            </div>
          </div>
          <div className="absolute -top-4 right-4 hidden rounded-2xl border bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block">
            <p className="eyebrow">Emergência média</p>
            <p className="font-display text-2xl font-bold">84%</p>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="scroll-mt-20 bg-[hsl(85_20%_93%)] py-16 sm:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-[2.1rem] font-extrabold leading-[1.12] sm:text-5xl">Do dado à decisão, do plantio ao estabelecimento.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              O AgroLife é uma plataforma de monitoramento e apoio à decisão para ajudar produtores, agrônomos e técnicos a
              identificar riscos de falhas no estabelecimento da lavoura.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="card p-7">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-7" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="container py-16 sm:py-24">
        <h2 className="text-[2.1rem] font-extrabold leading-tight sm:text-4xl">Como funciona</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-3xl border border-dashed p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <Icon className="size-6 text-primary" strokeWidth={1.8} aria-hidden />
              </div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Chamada final */}
      <section className="container pb-16 sm:pb-24">
        <div className="rounded-[2rem] bg-gradient-to-br from-[hsl(140_42%_26%)] via-[hsl(136_36%_36%)] to-[hsl(110_34%_48%)] px-7 py-10 text-white shadow-card sm:px-12 sm:py-14">
          <h2 className="max-w-xl text-[2.1rem] font-extrabold leading-[1.12] sm:text-5xl">Comece pelo talhão que mais preocupa você.</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
            Cadastre, monitore e acompanhe os pontos de atenção em poucos cliques.
          </p>
          <ButtonLink to={newFieldHref} variant="light" size="lg" className="mt-7 w-full rounded-2xl sm:w-auto">
            Cadastrar talhão
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
