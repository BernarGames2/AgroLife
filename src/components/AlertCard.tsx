import type { FieldAlert } from "@/lib/agro";
import { formatDate } from "@/lib/format";
import { AlertBadge } from "@/components/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";

export function AlertCard({ alert, compact = false }: { alert: FieldAlert; compact?: boolean }) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xl font-medium text-foreground">{alert.fieldName}</p>
          {!compact && <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(alert.date)}</p>}
        </div>
        <AlertBadge level={alert.level} />
      </div>
      <h3 className={compact ? "mt-3 font-sans text-lg font-semibold tracking-normal" : "mt-4 font-sans text-xl font-semibold tracking-normal"}>
        {alert.title}
      </h3>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{alert.description}</p>
      {!compact && (
        <p className="mt-3 leading-relaxed text-foreground">
          <strong className="font-semibold">Ação sugerida:</strong> {alert.action}
        </p>
      )}
      <ButtonLink to={`/app/talhoes/${alert.fieldId}`} variant="outline" size="sm" className="mt-4">
        Ver talhão
      </ButtonLink>
    </article>
  );
}
