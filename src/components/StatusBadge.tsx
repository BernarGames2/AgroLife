import type { AlertLevel, FieldStatus } from "@/lib/agro";
import { ALERT_LABEL, STATUS_LABEL } from "@/lib/agro";
import { cn } from "@/lib/utils";

type Tone = "ok" | "atencao" | "investigar" | "info" | "neutro";

const toneClass: Record<Tone, string> = {
  ok: "border-ok-border bg-ok-bg text-ok",
  atencao: "border-warn-border bg-warn-bg text-warn",
  investigar: "border-danger-border bg-danger-bg text-danger",
  info: "border-info-border bg-info-bg text-info",
  neutro: "border-border bg-muted text-muted-foreground",
};

const dotClass: Record<Tone, string> = {
  ok: "bg-[radial-gradient(circle_at_35%_30%,#9be38a,#2fa52f_55%,#1d7a22)]",
  atencao: "bg-[radial-gradient(circle_at_35%_30%,#fff2a8,#f5c518_55%,#d39c06)]",
  investigar: "bg-[radial-gradient(circle_at_35%_30%,#ff9d8f,#e0302a_55%,#a81812)]",
  info: "bg-[radial-gradient(circle_at_35%_30%,#b7d3f2,#4f86c6_55%,#2f5f99)]",
  neutro: "bg-[radial-gradient(circle_at_35%_30%,#e5e7e3,#a3aaa2_55%,#7d857c)]",
};

export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-[1.15em] shrink-0 rounded-full shadow-[inset_0_-1px_1px_rgb(0_0_0/0.15)]", dotClass[tone], className)} />;
}

function Pill({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium",
        toneClass[tone],
        className,
      )}
    >
      <StatusDot tone={tone} />
      {label}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: FieldStatus; className?: string }) {
  const tone: Tone = status === "sem-dados" ? "neutro" : status;
  return <Pill tone={tone} label={STATUS_LABEL[status]} className={className} />;
}

export function AlertBadge({ level, className }: { level: AlertLevel; className?: string }) {
  return <Pill tone={level} label={ALERT_LABEL[level]} className={className} />;
}
