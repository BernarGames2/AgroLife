import { useMemo, useState } from "react";
import { BellOff } from "lucide-react";
import { ALERT_LABEL, buildAlerts, type AlertLevel } from "@/lib/agro";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { AlertCard } from "@/components/AlertCard";
import { EmptyState } from "@/components/EmptyState";
import { StatusDot } from "@/components/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Filter = "todos" | AlertLevel;
const ORDER: AlertLevel[] = ["investigar", "atencao", "info", "ok"];

export default function Alerts() {
  const { data } = useAppStore();
  const alerts = useMemo(() => buildAlerts(data.fields), [data.fields]);
  const [filter, setFilter] = useState<Filter>("todos");

  const counts = useMemo(() => {
    const c = { todos: alerts.length, investigar: 0, atencao: 0, info: 0, ok: 0 } as Record<Filter, number>;
    for (const a of alerts) c[a.level]++;
    return c;
  }, [alerts]);

  const visible = filter === "todos" ? alerts : alerts.filter((a) => a.level === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Alertas" subtitle="Indicadores que merecem sua atenção hoje." />

      {alerts.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhum alerta por enquanto"
          description="Os alertas aparecem quando há talhões cadastrados e avaliações de emergência registradas."
          action={<ButtonLink to="/app/talhoes/novo">Cadastrar talhão</ButtonLink>}
        />
      ) : (
        <>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {(["todos", ...ORDER] as Filter[])
              .filter((f) => f === "todos" || counts[f] > 0)
              .map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    filter === f ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f !== "todos" && <StatusDot tone={f} className="size-3" />}
                  {f === "todos" ? "Todos" : ALERT_LABEL[f]} <span className="tabular opacity-75">({counts[f]})</span>
                </button>
              ))}
          </div>

          <div className="grid gap-4">
            {visible.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </>
      )}

      <Notice>
        Os alertas são indicativos, gerados a partir dos dados informados, e não substituem a avaliação de um profissional qualificado.
      </Notice>
    </div>
  );
}
