import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect, useMemo } from "react";
import { Bell, Camera, LayoutDashboard, Loader2, LogOut, Menu, Sprout, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buildAlerts, isActionable } from "@/lib/agro";
import { MORE_ITEMS, NAV_ITEMS } from "@/lib/navigation";
import { useAppStore } from "@/store/AppStore";
import { cn } from "@/lib/utils";

const BOTTOM: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/talhoes", label: "Talhões", icon: Sprout },
  { to: "/app/analisar", label: "Analisar", icon: Camera },
  { to: "/app/alertas", label: "Alertas", icon: Bell },
  { to: "/app/mais", label: "Mais", icon: Menu },
];

function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-danger px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background tabular",
        className,
      )}
      aria-label={`${count} ${count === 1 ? "alerta" : "alertas"} que pedem atenção`}
    >
      {count}
    </span>
  );
}

export function AppLayout() {
  const { data, signOut } = useAppStore();
  const { pathname } = useLocation();
  const alertCount = useMemo(() => buildAlerts(data.fields).filter((a) => isActionable(a.level)).length, [data.fields]);
  // "Mais" fica ativo também nas seções que só aparecem dentro dele.
  const inMore = pathname === "/app/mais" || MORE_ITEMS.some((i) => pathname.startsWith(i.to));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh md:flex">
      {/* Menu lateral (telas maiores) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r bg-card/60 px-4 py-6 print:hidden md:flex">
        <div className="px-2">
          <Logo to="/app" />
          <p className="mt-2 text-xs text-muted-foreground">Do início bem feito, ao lucro perfeito.</p>
        </div>
        <nav className="mt-6 flex flex-col gap-0.5" aria-label="Navegação principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-2.5 text-[15px] font-medium transition-colors",
                  isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-5" strokeWidth={1.9} aria-hidden />
              {label}
              {to === "/app/alertas" && <CountBadge count={alertCount} className="ml-auto" />}
              {to === "/app/planos" && data.plan !== "gratuito" && (
                <span className="ml-auto size-2.5 shrink-0 rounded-full bg-primary" title="Plano ativo" aria-label="plano ativo" />
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 px-2 pt-6">
          <p className="text-sm leading-snug text-muted-foreground">
            {data.profile.property || "Minha propriedade"}
            {data.isDemo && <span className="block text-xs">Dados de demonstração</span>}
          </p>
          <button onClick={signOut} className="flex items-center gap-2 rounded-full text-sm font-medium text-danger hover:underline">
            <LogOut className="size-4" aria-hidden /> Sair
          </button>
        </div>
      </aside>

      <main className="pb-nav pt-safe min-w-0 flex-1 md:pb-12 print:p-0">
        <div className="mx-auto w-full max-w-3xl px-5 pt-8 sm:px-8 md:pt-10 print:max-w-none print:p-0">
          <Suspense
            fallback={
              <div className="grid min-h-[50vh] place-items-center text-muted-foreground" role="status" aria-label="Carregando">
                <Loader2 className="size-7 animate-spin" aria-hidden />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Barra inferior (celular) */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-[hsl(72_30%_98%)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md print:hidden md:hidden"
      >
        <ul className="mx-auto grid h-[var(--nav-height)] max-w-lg grid-cols-5">
          {BOTTOM.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[13px] transition-colors",
                    isActive || (to === "/app/mais" && inMore) ? "font-medium text-primary" : "text-muted-foreground",
                  )
                }
              >
                <span className="relative">
                  <Icon className="size-7" strokeWidth={1.7} aria-hidden />
                  {to === "/app/alertas" && <CountBadge count={alertCount} className="absolute -right-2.5 -top-1.5" />}
                </span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
