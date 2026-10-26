import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import type { Field } from "@/types";
import { daysAfterPlanting, sortReadings } from "@/lib/agro";
import { formatDate, formatShortDate } from "@/lib/format";

interface Point {
  label: string;
  date: string;
  emergence: number;
  dap: number;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Point;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-card">
      <p className="font-semibold tabular">{Math.round(point.emergence)}% de emergência</p>
      <p className="text-muted-foreground">
        {formatDate(point.date)} · {point.dap} {point.dap === 1 ? "dia" : "dias"} após o plantio
      </p>
    </div>
  );
}

export function EmergenceChart({ field, height = 240 }: { field: Field; height?: number }) {
  const data: Point[] = sortReadings(field.readings).map((r) => ({
    label: formatShortDate(r.date),
    date: r.date,
    emergence: Math.round(r.emergence * 10) / 10,
    dap: daysAfterPlanting(field, new Date(r.date)),
  }));

  if (data.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed bg-muted/50 text-center text-sm text-muted-foreground" style={{ height }}>
        <p className="max-w-xs px-6">O gráfico aparece assim que houver avaliações registradas para este talhão.</p>
      </div>
    );
  }

  const target = Math.round(field.targetEmergence);
  const min = Math.min(target, ...data.map((d) => d.emergence));
  const yMin = Math.max(0, Math.floor((min - 10) / 10) * 10);

  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 14, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickMargin={10}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, 100]}
            tickCount={Math.min(6, (100 - yMin) / 10 + 1)}
            tickFormatter={(v: number) => `${v}%`}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <ReferenceLine
            y={target}
            stroke="hsl(var(--target))"
            strokeWidth={2}
            strokeDasharray="8 7"
            label={{ value: `Meta ${target}%`, position: "insideBottomRight", fill: "hsl(40 60% 36%)", fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 2 }} />
          <Line
            type="linear"
            dataKey="emergence"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4.5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
