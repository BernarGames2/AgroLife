import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, badge, actions, className }: { title: ReactNode; subtitle?: ReactNode; badge?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[2rem] font-bold leading-tight sm:text-4xl">{title}</h1>
          {badge}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {subtitle && <p className="mt-1.5 text-[17px] leading-snug text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

export function TagBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-primary/40 bg-primary-soft/70 px-3 py-1 text-sm font-medium text-primary">
      {children}
    </span>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[1.65rem] font-bold leading-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
