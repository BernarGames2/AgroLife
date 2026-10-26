import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { useAppStore } from "@/store/AppStore";

export function PublicLayout() {
  const { session } = useAppStore();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="container flex h-[4.5rem] items-center justify-between gap-4">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/planos" className="hidden rounded-full px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
              Planos
            </Link>
            {session ? (
              <ButtonLink to="/app" size="md" className="rounded-2xl px-5">
                Abrir app
              </ButtonLink>
            ) : (
              <ButtonLink to="/entrar" size="md" className="rounded-2xl px-6">
                Entrar
              </ButtonLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[17px]">AgroLife — protótipo em fase de validação.</p>
          <nav className="flex gap-6 text-[17px]">
            <Link to="/planos" className="hover:text-foreground">
              Planos
            </Link>
            <Link to={session ? "/app" : "/entrar"} className="hover:text-foreground">
              {session ? "Abrir app" : "Entrar"}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
