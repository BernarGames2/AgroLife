import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/AppStore";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, signedOut } = useAppStore();
  const location = useLocation();
  if (!session && signedOut) return <Navigate to="/" replace />;
  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/entrar?next=${next}`} replace />;
  }
  return <>{children}</>;
}
