import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, className }: { label: string; value: string; icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("card flex min-h-36 flex-col justify-between gap-4 p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow text-[13px] leading-snug">{label}</p>
        <Icon className="size-6 shrink-0 text-primary" strokeWidth={1.8} aria-hidden />
      </div>
      <p className="font-display text-[2rem] font-bold leading-tight tracking-tight tabular sm:text-4xl">{value}</p>
    </div>
  );
}
