import type { Field, Profile } from "@/types";
import {
  buildFieldAlerts,
  compareAlerts,
  daysAfterPlanting,
  fieldStatus,
  fieldTitle,
  formatStand,
  latestReading,
  plantsPerHectare,
  sortReadings,
} from "@/lib/agro";
import { formatDate, formatNumber, formatRelativeDateTime } from "@/lib/format";
import { LogoMark } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import { EmergenceChart } from "@/components/EmergenceChart";

export function FieldReport({ field, profile }: { field: Field; profile: Profile }) {
  const last = latestReading(field);
  const status = fieldStatus(field);
  const alerts = buildFieldAlerts(field).sort(compareAlerts);
  const readings = sortReadings(field.readings).reverse();
  const stand = last && field.seedsPerMeter && field.rowSpacingCm ? plantsPerHectare(field.seedsPerMeter, field.rowSpacingCm, last.emergence) : null;

  return (
    <article className="card space-y-6 p-6 sm:p-8 print:border-0 print:p-0 print:shadow-none">
      <header className="flex items-start justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">AgroLife</p>
            <p className="text-sm text-muted-foreground">Relatório do talhão</p>
          </div>
        </div>
        <p className="text-right text-sm text-muted-foreground">
          {profile.property || "Propriedade"}
          <span className="block">Gerado em {formatDate(new Date())}</span>
        </p>
      </header>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl font-bold">{fieldTitle(field)}</h2>
        <StatusBadge status={status} />
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Área", `${formatNumber(field.areaHa)} ha`],
          ["Plantio", `${formatDate(field.plantingDate)} (${daysAfterPlanting(field)} dias)`],
          ["Emergência", last ? `${Math.round(last.emergence)}%` : "—"],
          ["Meta", `${Math.round(field.targetEmergence)}%`],
          ["Estande estimado", stand !== null ? formatStand(stand) : "—"],
          ...(field.cultivar ? [["Cultivar", field.cultivar]] : []),
          ["Sementes/metro", field.seedsPerMeter ? formatNumber(field.seedsPerMeter) : "—"],
          ["Espaçamento", field.rowSpacingCm ? `${formatNumber(field.rowSpacingCm)} cm` : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-muted/70 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="break-inside-avoid">
        <h3 className="text-lg font-bold">Pontos de atenção</h3>
        <ul className="mt-2 space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 text-[15px] text-muted-foreground">{a.description}</p>
              <p className="mt-1.5 text-[15px]">
                <strong className="font-semibold">Ação sugerida:</strong> {a.action}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="break-inside-avoid">
        <h3 className="text-lg font-bold">Evolução da emergência</h3>
        <div className="mt-3">
          <EmergenceChart field={field} height={220} />
        </div>
      </section>

      {readings.length > 0 && (
        <section className="break-inside-avoid">
          <h3 className="text-lg font-bold">Avaliações</h3>
          <table className="mt-2 w-full text-left text-[15px]">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 font-medium">Data</th>
                <th className="py-2 font-medium">Emergência</th>
                <th className="py-2 font-medium">Método</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2">{formatRelativeDateTime(r.date)}</td>
                  <td className="py-2 font-medium tabular">{Math.round(r.emergence)}%</td>
                  <td className="py-2 text-muted-foreground">{r.method === "contagem" ? `Contagem (${r.samples?.length ?? 0} pontos)` : "Percentual"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {field.notes && (
        <section>
          <h3 className="text-lg font-bold">Observações</h3>
          <p className="mt-1 text-muted-foreground">{field.notes}</p>
        </section>
      )}

      <p className="border-t pt-4 text-sm text-muted-foreground">
        Relatório gerado a partir dos dados informados no AgroLife. As indicações não substituem a avaliação de um profissional qualificado.
      </p>
    </article>
  );
}
