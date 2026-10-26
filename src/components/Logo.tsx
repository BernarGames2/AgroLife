import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[hsl(138_40%_27%)] to-[hsl(136_38%_40%)] text-white shadow-soft",
        className,
      )}
      aria-hidden
    >
      <Sprout className="size-[55%]" strokeWidth={2.2} />
    </span>
  );
}

export function Logo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-3 rounded-full", className)} aria-label="AgroLife — início">
      <LogoMark />
      <span className="font-display text-[1.6rem] font-bold tracking-tight text-foreground">AgroLife</span>
    </Link>
  );
}
