import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppStoreProvider } from "@/store/AppStore";
import { ToastProvider } from "@/components/ui/Toast";
import { PublicLayout } from "@/components/PublicLayout";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";

// As telas do app (e o gráfico) são carregadas sob demanda para a página inicial abrir rápido.
const Login = lazy(() => import("@/pages/Login"));
const Plans = lazy(() => import("@/pages/Plans"));
const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Fields = lazy(() => import("@/pages/app/Fields"));
const FieldDetail = lazy(() => import("@/pages/app/FieldDetail"));
const FieldForm = lazy(() => import("@/pages/app/FieldForm"));
const ReadingForm = lazy(() => import("@/pages/app/ReadingForm"));
const Analyze = lazy(() => import("@/pages/app/Analyze"));
const Alerts = lazy(() => import("@/pages/app/Alerts"));
const Profile = lazy(() => import("@/pages/app/Profile"));

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-muted-foreground" role="status" aria-label="Carregando">
      <Loader2 className="size-7 animate-spin" aria-hidden />
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="planos" element={<Plans />} />
              </Route>
              <Route path="entrar" element={<Login />} />
              <Route
                path="app"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="talhoes" element={<Fields />} />
                <Route path="talhoes/novo" element={<FieldForm />} />
                <Route path="talhoes/:id" element={<FieldDetail />} />
                <Route path="talhoes/:id/editar" element={<FieldForm />} />
                <Route path="talhoes/:id/avaliar" element={<ReadingForm />} />
                <Route path="analisar" element={<Analyze />} />
                <Route path="alertas" element={<Alerts />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="*" element={<NotFound inApp />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AppStoreProvider>
  );
}
