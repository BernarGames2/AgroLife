import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Gauge, Plus, Sprout, TriangleAlert } from "lucide-react";
import { buildAlerts, fieldTitle, summarize } from "@/lib/agro";
import { formatRelativeDateTime } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { PageHeader, SectionTitle, TagBadge } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { FieldCard } from "@/components/FieldCard";
import { AlertCard } from "@/components/AlertCard";
import { EmergenceChart } from "@/components/EmergenceChart";
import { EmptyState } from "@/components/EmptyState";
import { MORE_ITEMS } from "@/lib/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form";

const SHORTCUTS = MORE_ITEMS.filter((i) => i.to !== "/app/perfil");

export default function Dashboard() {
  const { data } = useAppStore();
  const fields = useMemo(() => [...data.fields].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [data.fields]);
  const summary = useMemo(() => summarize(fields), [fields]);
  const alerts = useMemo(() => buildAlerts(fields), [fields]);
  const [chartFieldId, setChartFieldId] = useState<string>();
  const chartField = fields.find((f) => f.id === chartFieldId) ?? fields.find((f) => f.readings.length > 0) ?? fields[0];
  const firstName = data.profile.name.trim().split(/\s+/)[0];

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader
        title={firstName ? `Olá, ${firstName}!` : "Olá!"}
        badge={data.isDemo ? <TagBadge>Demonstração</TagBadge> : undefined}
        subtitle="Veja como estão seus talhões hoje."
        actions={
          <ButtonLink to="/app/talhoes/novo" className="rounded-2xl">
            <Plus /> Novo talhão
          </ButtonLink>
        }
      />

      {fields.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Cadastre seu primeiro talhão"
          description="Comece pelo talhão que mais preocupa você. Depois, registre as contagens de emergência para receber os pontos de atenção."
          action={
            <ButtonLink to="/app/talhoes/novo">
              <Plus /> Cadastrar talhão
            </ButtonLink>
          }
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4" aria-label="Resumo">
            <StatCard label="Talhões monitorados" value={String(summary.fieldCount)} icon={Sprout} />
            <StatCard
              label="Emergência média"
              value={summary.averageEmergence === null ? "—" : `${Math.round(summary.averageEmergence)}%`}
              icon={Gauge}
            />
            <StatCard label="Talhões em atenção" value={String(summary.attentionCount)} icon={TriangleAlert} />
            <StatCard
              label="Última atualização"
              value={summary.lastUpdate ? formatRelativeDateTime(summary.lastUpdate) : "—"}
              icon={Clock}
              className="[&>p:last-child]:text-[1.6rem] sm:[&>p:last-child]:text-3xl"
            />
          </section>

          {chartField && (
            <section className="card p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[1.65rem] font-bold leading-tight">Evolução da emergência</h2>
                  {fields.length === 1 && (
                    <p className="mt-1 text-[17px] text-muted-foreground">
                      <Link to={`/app/talhoes/${chartField.id}`} className="hover:text-foreground hover:underline">
                        {fieldTitle(chartField)}
                      </Link>
                    </p>
                  )}
                </div>
                {fields.length > 1 && (
                  <Select
                    aria-label="Escolher talhão do gráfico"
                    value={chartField.id}
                    onChange={(e) => setChartFieldId(e.target.value)}
                    className="h-10 w-auto min-w-40 text-[15px]"
                  >
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {fieldTitle(f)}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="mt-5">
                <EmergenceChart field={chartField} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Linha tracejada: meta de emergência cadastrada ({Math.round(chartField.targetEmergence)}%).
              </p>
            </section>
          )}

          <section className="space-y-4" aria-labelledby="ferramentas">
            <h2 id="ferramentas" className="text-[1.65rem] font-bold leading-tight">
              Ferramentas
            </h2>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {SHORTCUTS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={
                      to === "/app/premium"
                        ? "flex h-full flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-[hsl(140_42%_26%)] to-[hsl(122_38%_42%)] px-2 py-4 text-center text-sm font-medium text-white shadow-card"
                        : "card flex h-full flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center text-sm font-medium"
                    }
                  >
                    <Icon className={to === "/app/premium" ? "size-6" : "size-6 text-primary"} strokeWidth={1.8} aria-hidden />
                    {to === "/app/premium" ? "Premium" : label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-5">
            <SectionTitle title="Seus talhões" subtitle="Do dado à decisão, do plantio ao estabelecimento." />
            <div className="grid gap-4">
              {fields.map((f) => (
                <FieldCard key={f.id} field={f} />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle
              title="Pontos de atenção"
              action={
                <Link to="/app/alertas" className="shrink-0 rounded-full px-1 py-1 text-[17px] font-medium text-foreground hover:text-primary">
                  Ver todos
                </Link>
              }
            />
            <div className="grid gap-4">
              {alerts.slice(0, 3).map((a) => (
                <AlertCard key={a.id} alert={a} compact />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
