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
const More = lazy(() => import("@/pages/app/More"));
const MapPage = lazy(() => import("@/pages/app/MapPage"));
const Checklist = lazy(() => import("@/pages/app/Checklist"));
const Compare = lazy(() => import("@/pages/app/Compare"));
const Reports = lazy(() => import("@/pages/app/Reports"));
const Academy = lazy(() => import("@/pages/app/Academy"));
const Premium = lazy(() => import("@/pages/app/Premium"));
const AppPlans = lazy(() => import("@/pages/app/AppPlans"));
const KpTeam = lazy(() => import("@/pages/app/KpTeam"));

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
                <Route path="mais" element={<More />} />
                <Route path="mapa" element={<MapPage />} />
                <Route path="checklist" element={<Checklist />} />
                <Route path="comparar" element={<Compare />} />
                <Route path="relatorios" element={<Reports />} />
                <Route path="academy" element={<Academy />} />
                <Route path="premium" element={<Premium />} />
                <Route path="planos" element={<AppPlans />} />
                <Route path="kp" element={<KpTeam />} />
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
