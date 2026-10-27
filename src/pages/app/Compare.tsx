import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeftRight } from "lucide-react";
import type { Field } from "@/types";
import { daysAfterPlanting, fieldStatus, formatStand, latestReading, plantsPerHectare, sortReadings, STATUS_LABEL } from "@/lib/agro";
import { formatDate, formatNumber } from "@/lib/format";
import { lastSampleCv } from "@/lib/premium";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SERIES_COLORS = ["hsl(136 40% 33%)", "hsl(38 85% 50%)", "hsl(205 65% 45%)", "hsl(330 55% 50%)", "hsl(265 45% 55%)", "hsl(175 50% 35%)"];

function rows(fields: Field[]): Array<{ label: string; values: string[] }> {
  return [
    { label: "Cultura", values: fields.map((f) => f.crop) },
    { label: "Área", values: fields.map((f) => `${formatNumber(f.areaHa)} ha`) },
    { label: "Plantio", values: fields.map((f) => formatDate(f.plantingDate)) },
    {
      label: "Emergência atual",
      values: fields.map((f) => {
        const last = latestReading(f);
        return last ? `${Math.round(last.emergence)}%` : "—";
      }),
    },
    { label: "Meta", values: fields.map((f) => `${Math.round(f.targetEmergence)}%`) },
    {
      label: "Diferença para a meta",
      values: fields.map((f) => {
        const last = latestReading(f);
        if (!last) return "—";
        const diff = Math.round(last.emergence) - Math.round(f.targetEmergence);
        return `${diff > 0 ? "+" : ""}${diff} p.p.`;
      }),
    },
    { label: "Status", values: fields.map((f) => STATUS_LABEL[fieldStatus(f)]) },
    {
      label: "Estande estimado",
      values: fields.map((f) => {
        const last = latestReading(f);
        const stand = last && f.seedsPerMeter && f.rowSpacingCm ? plantsPerHectare(f.seedsPerMeter, f.rowSpacingCm, last.emergence) : null;
        return stand === null ? "—" : formatStand(stand);
      }),
    },
    {
      label: "Variação entre pontos",
      values: fields.map((f) => {
        const cv = lastSampleCv(f);
        return cv === null ? "—" : `${Math.round(cv * 100)}%`;
      }),
    },
    { label: "Avaliações", values: fields.map((f) => String(f.readings.length)) },
  ];
}

export default function Compare() {
  const { data } = useAppStore();
  const fields = useMemo(() => [...data.fields].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true })), [data.fields]);
  const [selected, setSelected] = useState<string[]>(() => fields.slice(0, 2).map((f) => f.id));
  const chosen = fields.filter((f) => selected.includes(f.id));

  const series = chosen.map((f) => ({
    field: f,
    color: SERIES_COLORS[fields.indexOf(f) % SERIES_COLORS.length],
    data: sortReadings(f.readings).map((r) => ({ dap: daysAfterPlanting(f, new Date(r.date)), emergence: Math.round(r.emergence * 10) / 10 })),
  }));

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (fields.length < 2) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Comparar talhões" subtitle="Selecione dois ou mais talhões." />
        <EmptyState
          icon={ArrowLeftRight}
          title="Cadastre pelo menos dois talhões"
          description="A comparação mostra a evolução da emergência e os principais indicadores lado a lado."
          action={<ButtonLink to="/app/talhoes/novo">Cadastrar talhão</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Comparar talhões" subtitle="Selecione dois ou mais talhões." />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {fields.map((f) => {
          const on = selected.includes(f.id);
          const color = SERIES_COLORS[fields.indexOf(f) % SERIES_COLORS.length];
          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              aria-pressed={on}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                on ? "border-primary/40 bg-primary-soft text-foreground" : "bg-white text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-2.5 rounded-full" style={{ background: on ? color : "hsl(var(--border))" }} aria-hidden />
              {f.name}
            </button>
          );
        })}
      </div>

      {chosen.length < 2 ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Selecione pelo menos dois talhões para comparar.</p>
      ) : (
        <>
          <section className="card p-5 sm:p-7">
            <h2 className="text-2xl font-bold">Evolução da emergência</h2>
            <p className="mt-1 text-muted-foreground">Por dias após o plantio, para comparar talhões plantados em datas diferentes.</p>
            <div className="-ml-2 mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="dap"
                    domain={["dataMin", "dataMax"]}
                    allowDecimals={false}
                    tickFormatter={(v: number) => `dia ${v}`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={(v: number) => `${v} dias após o plantio`}
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                  {series.map((s) => (
                    <Line
                      key={s.field.id}
                      data={s.data}
                      dataKey="emergence"
                      name={s.field.name}
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className={cn("w-full text-left text-[15px]", chosen.length > 2 && "min-w-[30rem]")}>
                <thead>
                  <tr className="border-b bg-muted/60">
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground sm:px-5">
                      Indicador
                    </th>
                    {chosen.map((f) => (
                      <th key={f.id} scope="col" className="px-3 py-3 font-semibold sm:px-4">
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows(chosen).map((row) => (
                    <tr key={row.label} className="border-b last:border-0">
                      <th scope="row" className="px-4 py-3 font-normal text-muted-foreground sm:px-5">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={chosen[i].id} className="px-3 py-3 font-medium tabular sm:px-4">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
