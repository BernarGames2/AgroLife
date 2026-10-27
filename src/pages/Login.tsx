import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, PlayCircle } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Form";
import { useAppStore } from "@/store/AppStore";
import { cn, safeInternalPath } from "@/lib/utils";

type Mode = "entrar" | "cadastro";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get("modo") === "cadastro" ? "cadastro" : "entrar";
  const next = safeInternalPath(params.get("next"));
  const navigate = useNavigate();
  const { signIn, signUp, signInDemo } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [property, setProperty] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(m: Mode) {
    const p = new URLSearchParams(params);
    p.set("modo", m);
    setParams(p, { replace: true });
    setErrors({});
    setAuthError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Informe um e-mail válido.";
    if (password.length < 6) errs.password = "A senha precisa ter pelo menos 6 caracteres.";
    if (mode === "cadastro") {
      if (!name.trim()) errs.name = "Informe seu nome.";
      if (!property.trim()) errs.property = "Informe o nome da propriedade.";
    }
    setErrors(errs);
    setAuthError(null);
    if (Object.keys(errs).length) return;

    setBusy(true);
    const error = mode === "cadastro" ? await signUp({ email, password, name, property }) : await signIn(email, password);
    setBusy(false);
    if (error) {
      setAuthError(error);
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <div className="pt-safe flex min-h-dvh flex-col">
      <div className="container flex h-[4.5rem] items-center">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full text-[15px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Voltar ao início
        </Link>
      </div>

      <main className="container flex flex-1 items-start justify-center pb-12 pt-2 sm:items-center">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="size-14" />
            <h1 className="mt-4 text-3xl font-bold">{mode === "cadastro" ? "Criar sua conta" : "Entrar no AgroLife"}</h1>
            <p className="mt-1.5 text-muted-foreground">
              {mode === "cadastro" ? "Comece a acompanhar seus talhões em poucos minutos." : "Acompanhe o estabelecimento da sua lavoura."}
            </p>
          </div>

          <div className="card mt-7 p-6 sm:p-7">
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="tablist" aria-label="Acesso">
              {(["entrar", "cadastro"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "h-10 rounded-full text-[15px] font-medium transition-colors",
                    mode === m ? "bg-white text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "entrar" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} noValidate className="mt-6 space-y-5">
              {mode === "cadastro" && (
                <>
                  <FormField label="Seu nome" error={errors.name}>
                    {(p) => <Input {...p} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Luiza" />}
                  </FormField>
                  <FormField label="Propriedade" error={errors.property}>
                    {(p) => <Input {...p} value={property} onChange={(e) => setProperty(e.target.value)} placeholder="Ex.: Fazenda Horizonte" />}
                  </FormField>
                </>
              )}
              <FormField label="E-mail" error={errors.email}>
                {(p) => (
                  <Input {...p} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
                )}
              </FormField>
              <FormField label="Senha" error={errors.password}>
                {(p) => (
                  <Input
                    {...p}
                    type="password"
                    autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}
              </FormField>

              {authError && (
                <p role="alert" className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-[15px] text-danger">
                  {authError}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {mode === "cadastro" ? "Criar conta" : "Entrar"}
              </Button>
              {mode === "cadastro" && <p className="text-center text-sm text-muted-foreground">Sua conta começa vazia, pronta para cadastrar seus talhões.</p>}
            </form>

            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-2xl"
              onClick={() => {
                signInDemo();
                navigate(next, { replace: true });
              }}
            >
              <PlayCircle /> Explorar a demonstração
            </Button>
            <p className="mt-2 text-center text-sm text-muted-foreground">Dados de exemplo da Fazenda Horizonte, separados da sua conta.</p>
          </div>

          <Notice className="mt-5">
            Protótipo: não há servidor. A conta e os dados ficam apenas neste aparelho e navegador — para usar em outro aparelho, exporte os
            dados no perfil. Não use a senha de outras contas.
          </Notice>
        </div>
      </main>
    </div>
  );
}
