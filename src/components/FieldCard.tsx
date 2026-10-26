import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Field } from "@/types";
import { fieldStatus, fieldTitle, latestReading } from "@/lib/agro";
import { formatNumber, formatRelativeDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { EmergenceBar } from "@/components/EmergenceBar";

export function FieldCard({ field }: { field: Field }) {
  const status = fieldStatus(field);
  const last = latestReading(field);
  return (
    <Link
      to={`/app/talhoes/${field.id}`}
      className="card group block p-5 transition-shadow hover:shadow-[0_12px_32px_-14px_hsl(140_30%_20%/0.25)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-sans text-xl font-medium tracking-normal text-foreground">{fieldTitle(field)}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(field.areaHa)} ha · meta {Math.round(field.targetEmergence)}%
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {last ? (
        <>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="font-display text-5xl font-bold leading-none tracking-tight text-primary tabular">
              {Math.round(last.emergence)}%
            </p>
            <p className="text-right text-sm text-muted-foreground">
              emergência atual
              <span className="block text-xs">{formatRelativeDateTime(last.date)}</span>
            </p>
          </div>
          <EmergenceBar className="mt-4" value={last.emergence} target={field.targetEmergence} status={status} />
        </>
      ) : (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          Nenhuma avaliação registrada ainda.
          <span className="inline-flex items-center font-medium text-primary">
            Registrar <ChevronRight className="size-4" />
          </span>
        </div>
      )}
    </Link>
  );
}
