import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, ClipboardList, Crown, Lock, Printer, Shovel, Sprout, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import type { Field } from "@/types";
import { fieldStatus, latestReading } from "@/lib/agro";
import { formatInt, formatShortDate } from "@/lib/format";
import { actionSchedule, correctionPlan, estimateGaps, inspectionPriority, projectEmergence, type ReplantAdvice } from "@/lib/premium";
import { useAppStore } from "@/store/AppStore";
import { StatusBadge } from "@/components/StatusBadge";
import { TagBadge } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const PLUS_BENEFITS = [
  "Visitas técnicas presenciais da equipe KP aos talhões",
  "Avaliação de estande e solo feita no campo",
  "Apoio na regulagem da plantadeira",
  "Relatório da visita com recomendações",
  "Contato direto com a equipe KP",
];

const ADVICE: Record<ReplantAdvice, { label: string; className: string }> = {
  adequado: { label: "Estande adequado", className: "border-ok-border bg-ok-bg text-ok" },
  monitorar: { label: "Monitorar e investigar as causas", className: "border-warn-border bg-warn-bg text-warn" },
  "avaliar-replantio": { label: "Avaliar replantio com um agrônomo", className: "border-danger-border bg-danger-bg text-danger" },
};

function Feature({
  n,
  icon: Icon,
  title,
  description,
  unlocked,
  children,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  description: string;
  unlocked: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={cn("card break-inside-avoid p-5 sm:p-6", !unlocked && "bg-card/70")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", unlocked ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground")}>
          <Icon className="size-5" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-sans text-base font-semibold leading-snug tracking-normal sm:text-lg">
            {n}. {title}
            {!unlocked && <Lock className="mb-0.5 ml-1.5 inline size-4 text-muted-foreground" aria-label="Bloqueado" />}
          </h2>
          <p className="text-[15px] leading-snug text-muted-foreground">{description}</p>
        </div>
      </div>
      {unlocked && <div className="mt-5">{children}</div>}
    </section>
  );
}

function FieldHeading({ field }: { field: Field }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link to={`/app/talhoes/${field.id}`} className="font-semibold hover:underline">
        {field.name} — {field.crop}
      </Link>
      <StatusBadge status={fieldStatus(field)} className="px-2.5 py-0.5 text-xs" />
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-muted/60 px-4 py-3 text-[15px] text-muted-foreground">{children}</p>;
}

export default function Premium() {
  const { data, setPlan } = useAppStore();
  const toast = useToast();
  const unlocked = data.plan !== "gratuito";
  const fields = useMemo(() => [...data.fields].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true })), [data.fields]);
  const attention = fields.filter((f) => {
    const s = fieldStatus(f);
    return s === "atencao" || s === "investigar";
  });
  const priority = useMemo(() => inspectionPriority(fields), [fields]);

  const activate = (plan: "premium" | "plus") => {
    setPlan(plan);
    toast(plan === "plus" ? "Premium Plus ativado (demonstração)" : "Premium ativado (demonstração)");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Destaque do plano */}
      <section className="rounded-3xl bg-gradient-to-br from-[hsl(140_45%_24%)] via-[hsl(134_42%_32%)] to-[hsl(120_40%_42%)] p-6 text-white shadow-card sm:p-8 print:bg-none print:p-0 print:text-foreground print:shadow-none">
        <Crown className="size-8" strokeWidth={1.8} aria-hidden />
        <h1 className="mt-3 text-[1.9rem] font-extrabold leading-tight sm:text-4xl">AgroLife Premium</h1>
        <p className="mt-1.5 text-[17px] text-white/85 print:text-muted-foreground">Todos os recursos avançados em um só lugar. Do dado à decisão.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
          {unlocked ? (
            <>
              <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold">
                <Check className="size-4" aria-hidden /> {data.plan === "plus" ? "Premium Plus ativo" : "Premium ativo"} (demonstração)
              </span>
              <button onClick={() => setPlan("gratuito")} className="text-sm text-white/80 underline-offset-4 hover:underline">
                Voltar ao plano gratuito
              </button>
            </>
          ) : (
            <>
              <Button variant="light" onClick={() => activate("premium")}>
                Ativar Premium (demonstração)
              </Button>
              <span className="text-sm text-white/80">Preço: em breve</span>
            </>
          )}
        </div>
      </section>

      <Feature n={1} icon={Shovel} title="Plano de correção do solo" description="Causas prováveis e soluções para cada talhão em atenção." unlocked={unlocked}>
        {attention.length === 0 ? (
          <Empty>Nenhum talhão em atenção no momento.</Empty>
        ) : (
          <div className="space-y-4">
            {attention.map((f) => {
              const plan = correctionPlan(f);
              if (!plan) return null;
              return (
                <div key={f.id} className="rounded-2xl border p-4">
                  <FieldHeading field={f} />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Causas prováveis</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {plan.causes.map((c) => (
                      <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warn" aria-hidden />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Soluções</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {plan.solutions.map((s) => (
                      <li key={s} className="flex gap-2.5 text-[15px] leading-relaxed">
                        <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Feature>

      <Feature
        n={2}
        icon={Sprout}
        title="Estimativa de falhas e replantio"
        description="Plantas faltantes estimadas e indicação sobre avaliar replantio."
        unlocked={unlocked}
      >
        <div className="space-y-3">
          {fields.map((f) => {
            const gaps = estimateGaps(f);
            return (
              <div key={f.id} className="rounded-2xl border p-4">
                <FieldHeading field={f} />
                {gaps ? (
                  <>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[15px]">
                      <div>
                        <dt className="text-sm text-muted-foreground">Esperado na meta</dt>
                        <dd className="font-semibold tabular">{formatInt(gaps.expectedPlantsHa)} plantas/ha</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Estimado hoje</dt>
                        <dd className="font-semibold tabular">{formatInt(gaps.actualPlantsHa)} plantas/ha</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Faltantes por hectare</dt>
                        <dd className="font-semibold tabular">{formatInt(gaps.missingPlantsHa)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Faltantes no talhão</dt>
                        <dd className="font-semibold tabular">{formatInt(gaps.missingTotal)}</dd>
                      </div>
                    </dl>
                    <p className={cn("mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium", ADVICE[gaps.advice].className)}>
                      {ADVICE[gaps.advice].label}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {latestReading(f) ? "Informe sementes por metro e espaçamento no cadastro do talhão para calcular." : "Registre uma avaliação para calcular."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Feature>

      <Feature
        n={3}
        icon={TrendingUp}
        title="Tendência da emergência"
        description="Projeção indicativa para os próximos 2 dias com base nos últimos registros."
        unlocked={unlocked}
      >
        <div className="space-y-3">
          {fields.map((f) => {
            const last = latestReading(f);
            const proj = projectEmergence(f);
            const final = proj?.[proj.length - 1]?.emergence;
            return (
              <div key={f.id} className="rounded-2xl border p-4">
                <FieldHeading field={f} />
                {last && proj ? (
                  <>
                    <ol className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <li className="rounded-xl bg-muted/70 px-2 py-2.5">
                        <p className="text-xs text-muted-foreground">Último registro</p>
                        <p className="font-display text-xl font-bold tabular">{Math.round(last.emergence)}%</p>
                      </li>
                      {proj.map((p) => (
                        <li key={p.date.toISOString()} className="rounded-xl border border-dashed px-2 py-2.5">
                          <p className="text-xs text-muted-foreground">{formatShortDate(p.date)}</p>
                          <p className="font-display text-xl font-bold tabular text-primary">{Math.round(p.emergence)}%</p>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {final !== undefined && final >= f.targetEmergence - 3
                        ? "A tendência indica aproximação da meta."
                        : `A tendência indica que o talhão deve seguir abaixo da meta de ${Math.round(f.targetEmergence)}%.`}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">São necessárias pelo menos duas avaliações para projetar.</p>
                )}
              </div>
            );
          })}
        </div>
      </Feature>

      <Feature n={4} icon={ClipboardList} title="Prioridade de vistoria" description="Ordem sugerida para visitar os talhões a campo." unlocked={unlocked}>
        <ol className="space-y-2">
          {priority.map((item, i) => (
            <li key={item.field.id} className="flex items-start gap-3 rounded-2xl border p-4">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  i === 0 && item.status !== "ok" ? "bg-danger text-white" : "bg-primary-soft text-primary",
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <FieldHeading field={item.field} />
                <p className="mt-1 text-sm text-muted-foreground">{item.reasons.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </Feature>

      <Feature n={5} icon={CalendarClock} title="Cronograma de ações" description="Passo a passo para corrigir e reavaliar os talhões em atenção." unlocked={unlocked}>
        {attention.length === 0 ? (
          <Empty>Nenhum talhão em atenção no momento. Mantenha a rotina de monitoramento.</Empty>
        ) : (
          <div className="space-y-4">
            {attention.map((f) => (
              <div key={f.id} className="rounded-2xl border p-4">
                <FieldHeading field={f} />
                <ol className="mt-3 space-y-3 border-l-2 border-primary/25 pl-4">
                  {actionSchedule(f).map((step) => (
                    <li key={step.title} className="relative">
                      <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card" aria-hidden />
                      <p className="text-sm font-semibold text-primary">{formatShortDate(step.date)}</p>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-[15px] leading-snug text-muted-foreground">{step.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Feature>

      <Feature n={6} icon={Printer} title="Relatório Premium" description="Imprima ou salve em PDF esta página com todas as análises." unlocked={unlocked}>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer /> Imprimir ou salvar PDF
        </Button>
      </Feature>

      {/* Premium Plus */}
      <section className={cn("card border-2 p-5 sm:p-7 print:hidden", data.plan === "plus" ? "border-primary/50" : "border-primary/25")}>
        <div className="flex flex-wrap items-center gap-2">
          <UsersRound className="size-6 text-primary" strokeWidth={1.9} aria-hidden />
          <h2 className="text-2xl font-bold">AgroLife Premium Plus</h2>
          <TagBadge>Demonstração</TagBadge>
        </div>
        <p className="mt-2 text-[15px] text-muted-foreground">Tudo do Premium + acompanhamento presencial da equipe KP na sua propriedade.</p>
        <ul className="mt-4 space-y-2">
          {PLUS_BENEFITS.map((b) => (
            <li key={b} className="flex gap-2.5 text-[15px]">
              <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {data.plan === "plus" ? (
            <p className="rounded-2xl border border-ok-border bg-ok-bg px-4 py-3 text-[15px] text-ok">
              Premium Plus ativo (demonstração). Na versão final, as visitas da equipe KP serão agendadas por aqui.
            </p>
          ) : (
            <>
              <Button onClick={() => activate("plus")}>Ativar Premium Plus (demonstração)</Button>
              <span className="text-sm text-muted-foreground">Preço: em breve</span>
            </>
          )}
        </div>
      </section>

      <Notice>
        Protótipo: não há cobrança real e a ativação é apenas demonstrativa. Estimativas e projeções são indicativas, baseadas nos dados
        registrados, e não substituem a avaliação de um profissional agrônomo.
      </Notice>
    </div>
  );
}
