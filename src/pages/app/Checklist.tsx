import { CheckCircle2, Circle, PartyPopper, RotateCcw } from "lucide-react";
import { PLANTING_CHECKLIST } from "@/lib/content";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function Checklist() {
  const { data, toggleChecklistItem, resetChecklist } = useAppStore();
  const done = PLANTING_CHECKLIST.filter((i) => data.checklist.includes(i.id)).length;
  const total = PLANTING_CHECKLIST.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Checklist de plantio" subtitle="Do início bem feito, ao lucro perfeito." />

      <section className="card p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-[hsl(110_20%_92%)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Progresso do checklist"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="w-12 text-right font-display text-xl font-bold tabular">{pct}%</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {done} de {total} itens verificados
        </p>

        {done === total && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl border border-ok-border bg-ok-bg px-4 py-3 text-[15px] font-medium text-ok">
            <PartyPopper className="size-5 shrink-0" aria-hidden /> Tudo conferido. Bom plantio!
          </p>
        )}

        <ul className="mt-5 space-y-2">
          {PLANTING_CHECKLIST.map((item) => {
            const checked = data.checklist.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                    checked ? "border-ok-border bg-ok-bg/70" : "bg-white hover:bg-muted/60",
                  )}
                >
                  {checked ? (
                    <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 size-6 shrink-0 text-muted-foreground/60" aria-hidden />
                  )}
                  <span>
                    <span className={cn("block font-medium", checked && "text-primary")}>{item.label}</span>
                    <span className="block text-sm leading-snug text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {done > 0 && (
          <Button variant="ghost" size="sm" className="mt-4" onClick={resetChecklist}>
            <RotateCcw /> Reiniciar checklist
          </Button>
        )}
      </section>

      <Notice>Use o checklist antes de cada plantio. As marcações ficam salvas neste navegador.</Notice>
    </div>
  );
}
