import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, Field, FieldInput, KpRequest, PhotoAnalysis, Plan, Profile, Reading, Session } from "@/types";
import { createDemoData, createEmptyData, DEMO_EMAIL } from "@/lib/demo";
import { findAccount, hashPassword, normalizeEmail, saveAccount, verifyPassword } from "@/lib/accounts";
import { loadData, loadSession, migrateLegacyData, saveData, saveSession } from "@/lib/storage";
import { createId } from "@/lib/utils";

interface SignUpInput {
  email: string;
  password: string;
  name: string;
  property: string;
}

/** Resultado de entrar ou criar conta: null quando deu certo, ou a mensagem de erro. */
type AuthResult = Promise<string | null>;

const BLANK_PROFILE: Profile = { name: "", property: "", crops: "", location: "" };

function dataFor(session: Session | null): AppData {
  if (!session) return createEmptyData(BLANK_PROFILE);
  const stored = loadData(session.email);
  if (stored) return stored;
  if (session.email === DEMO_EMAIL) return createDemoData();
  const account = findAccount(session.email);
  return createEmptyData({ ...BLANK_PROFILE, name: account?.name ?? "" });
}

interface AppStore {
  data: AppData;
  session: Session | null;
  /** Falso quando o navegador não permitiu salvar (ex.: armazenamento cheio). */
  persisted: boolean;
  isDemoSession: boolean;
  /** Verdadeiro logo após "Sair", para voltar à página inicial em vez da tela de entrar. */
  signedOut: boolean;
  signIn: (email: string, password: string) => AuthResult;
  signUp: (input: SignUpInput) => AuthResult;
  signInDemo: () => void;
  signOut: () => void;
  updateProfile: (profile: Profile) => void;
  addField: (input: FieldInput) => Field;
  updateField: (id: string, input: FieldInput) => void;
  deleteField: (id: string) => void;
  addReading: (fieldId: string, reading: Omit<Reading, "id">) => void;
  deleteReading: (fieldId: string, readingId: string) => void;
  addAnalysis: (analysis: Omit<PhotoAnalysis, "id">) => void;
  deleteAnalysis: (id: string) => void;
  /** Na demonstração, recria os dados de exemplo; numa conta, apaga talhões, avaliações e análises. */
  resetData: () => void;
  replaceData: (data: AppData) => void;
  setPlan: (plan: Plan) => void;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
  addKpRequest: (request: Omit<KpRequest, "id" | "createdAt">) => KpRequest;
  updateKpRequest: (id: string, patch: Partial<Omit<KpRequest, "id">>) => void;
  deleteKpRequest: (id: string) => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    migrateLegacyData();
    return loadSession();
  });
  const [data, setData] = useState<AppData>(() => dataFor(session));
  const [persisted, setPersisted] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  // Os dados são salvos sempre na conta conectada; sem sessão, nada é salvo.
  useEffect(() => {
    if (session) setPersisted(saveData(session.email, data));
  }, [data, session]);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const startSession = useCallback((email: string, next: AppData) => {
    setSignedOut(false);
    setData(next);
    setSession({ email: normalizeEmail(email), signedInAt: new Date().toISOString() });
  }, []);

  const updateFields = useCallback((fn: (fields: Field[]) => Field[]) => {
    setData((d) => ({ ...d, fields: fn(d.fields) }));
  }, []);

  const store = useMemo<AppStore>(
    () => ({
      data,
      session,
      persisted,
      isDemoSession: session?.email === DEMO_EMAIL,
      signedOut,
      signIn: async (email, password) => {
        const account = findAccount(email);
        if (!account) return "Não encontramos uma conta com esse e-mail neste aparelho. Crie uma conta ou explore a demonstração.";
        if (!(await verifyPassword(password, account))) return "Senha incorreta.";
        // Contas da versão anterior não tinham senha: a primeira entrada define a senha.
        if (!account.hash) saveAccount({ ...account, ...(await hashPassword(password)) });
        startSession(account.email, dataFor({ email: account.email, signedInAt: "" }));
        return null;
      },
      signUp: async ({ email, password, name, property }) => {
        const normalized = normalizeEmail(email);
        if (normalized === DEMO_EMAIL) return "Esse e-mail é usado pela demonstração. Use outro e-mail.";
        if (findAccount(normalized)) return "Já existe uma conta com esse e-mail neste aparelho. Use a aba Entrar.";
        saveAccount({ email: normalized, name: name.trim(), createdAt: new Date().toISOString(), ...(await hashPassword(password)) });
        // Conta nova começa sempre vazia, só com o nome e a propriedade.
        startSession(normalized, createEmptyData({ ...BLANK_PROFILE, name: name.trim(), property: property.trim() }));
        return null;
      },
      signInDemo: () => startSession(DEMO_EMAIL, createDemoData()),
      signOut: () => {
        setSignedOut(true);
        setSession(null);
        setData(createEmptyData(BLANK_PROFILE));
      },
      updateProfile: (profile) => setData((d) => ({ ...d, profile })),
      addField: (input) => {
        const field: Field = { ...input, id: createId(), createdAt: new Date().toISOString(), readings: [] };
        updateFields((fields) => [...fields, field]);
        return field;
      },
      updateField: (id, input) => updateFields((fields) => fields.map((f) => (f.id === id ? { ...f, ...input } : f))),
      deleteField: (id) =>
        setData((d) => ({
          ...d,
          fields: d.fields.filter((f) => f.id !== id),
          analyses: d.analyses.map((a) => (a.fieldId === id ? { ...a, fieldId: undefined } : a)),
          kpRequests: d.kpRequests.map((r) => (r.fieldId === id ? { ...r, fieldId: undefined } : r)),
        })),
      addReading: (fieldId, reading) =>
        updateFields((fields) =>
          fields.map((f) => (f.id === fieldId ? { ...f, readings: [...f.readings, { ...reading, id: createId() }] } : f)),
        ),
      deleteReading: (fieldId, readingId) =>
        updateFields((fields) =>
          fields.map((f) => (f.id === fieldId ? { ...f, readings: f.readings.filter((r) => r.id !== readingId) } : f)),
        ),
      addAnalysis: (analysis) =>
        setData((d) => ({ ...d, analyses: [{ ...analysis, id: createId() }, ...d.analyses].slice(0, 30) })),
      deleteAnalysis: (id) => setData((d) => ({ ...d, analyses: d.analyses.filter((a) => a.id !== id) })),
      resetData: () =>
        setData((d) =>
          session?.email === DEMO_EMAIL
            ? { ...createDemoData(), plan: d.plan }
            : { ...createEmptyData(d.profile), plan: d.plan, checklist: d.checklist },
        ),
      replaceData: (next) => setData(next),
      setPlan: (plan) => setData((d) => ({ ...d, plan })),
      toggleChecklistItem: (id) =>
        setData((d) => ({
          ...d,
          checklist: d.checklist.includes(id) ? d.checklist.filter((c) => c !== id) : [...d.checklist, id],
        })),
      resetChecklist: () => setData((d) => ({ ...d, checklist: [] })),
      addKpRequest: (input) => {
        const request: KpRequest = { ...input, id: createId(), createdAt: new Date().toISOString() };
        setData((d) => ({ ...d, kpRequests: [request, ...d.kpRequests] }));
        return request;
      },
      updateKpRequest: (id, patch) =>
        setData((d) => ({ ...d, kpRequests: d.kpRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteKpRequest: (id) => setData((d) => ({ ...d, kpRequests: d.kpRequests.filter((r) => r.id !== id) })),
    }),
    [data, session, persisted, signedOut, startSession, updateFields],
  );

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore deve ser usado dentro de AppStoreProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useField(id: string | undefined): Field | undefined {
  const { data } = useAppStore();
  return data.fields.find((f) => f.id === id);
}
