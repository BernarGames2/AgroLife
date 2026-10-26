import type { FieldStatus } from "@/lib/agro";
import { clamp, cn } from "@/lib/utils";

const barColor: Record<FieldStatus, string> = {
  ok: "bg-primary",
  atencao: "bg-[hsl(42_70%_48%)]",
  investigar: "bg-danger",
  "sem-dados": "bg-muted-foreground/40",
};

/** Barra de emergência com marcação da meta. */
export function EmergenceBar({ value, target, status, className }: { value: number; target: number; status: FieldStatus; className?: string }) {
  return (
    <div
      className={cn("relative h-2.5 rounded-full bg-[hsl(110_20%_92%)]", className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={`Emergência de ${Math.round(value)}%, meta de ${Math.round(target)}%`}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-700", barColor[status])} style={{ width: `${clamp(value, 0, 100)}%` }} />
      <div
        className="absolute -top-1 h-[18px] w-[3px] -translate-x-1/2 rounded-full bg-target ring-2 ring-white"
        style={{ left: `${clamp(target, 0, 100)}%` }}
        title={`Meta: ${Math.round(target)}%`}
        aria-hidden
      />
    </div>
  );
}
