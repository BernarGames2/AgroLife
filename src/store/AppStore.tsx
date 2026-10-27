import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, Field, FieldInput, PhotoAnalysis, Plan, Profile, Reading, Session } from "@/types";
import { createDemoData, createEmptyData, DEMO_EMAIL, DEMO_PROFILE } from "@/lib/demo";
import { loadData, loadSession, saveData, saveSession } from "@/lib/storage";
import { createId } from "@/lib/utils";

interface SignUpInput {
  email: string;
  name: string;
  property: string;
  withDemoData: boolean;
}

interface AppStore {
  data: AppData;
  session: Session | null;
  /** Falso quando o navegador não permitiu salvar (ex.: armazenamento cheio). */
  persisted: boolean;
  signIn: (email: string) => void;
  signUp: (input: SignUpInput) => void;
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
  restoreDemo: () => void;
  replaceData: (data: AppData) => void;
  setPlan: (plan: Plan) => void;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData() ?? createDemoData());
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    setPersisted(saveData(data));
  }, [data]);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const startSession = useCallback((email: string) => {
    setSession({ email: email.trim().toLowerCase(), signedInAt: new Date().toISOString() });
  }, []);

  const updateFields = useCallback((fn: (fields: Field[]) => Field[]) => {
    setData((d) => ({ ...d, fields: fn(d.fields) }));
  }, []);

  const store = useMemo<AppStore>(
    () => ({
      data,
      session,
      persisted,
      signIn: (email) => startSession(email),
      signUp: ({ email, name, property, withDemoData }) => {
        const profile: Profile = {
          name: name.trim(),
          property: property.trim(),
          crops: withDemoData ? DEMO_PROFILE.crops : "",
          location: withDemoData ? DEMO_PROFILE.location : "",
        };
        setData(withDemoData ? createDemoData(new Date(), profile) : createEmptyData(profile));
        startSession(email);
      },
      signInDemo: () => {
        setData(createDemoData());
        startSession(DEMO_EMAIL);
      },
      signOut: () => setSession(null),
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
      restoreDemo: () =>
        setData((d) => ({ ...createDemoData(), profile: d.isDemo ? DEMO_PROFILE : d.profile, plan: d.plan, checklist: d.checklist })),
      replaceData: (next) => setData(next),
      setPlan: (plan) => setData((d) => ({ ...d, plan })),
      toggleChecklistItem: (id) =>
        setData((d) => ({
          ...d,
          checklist: d.checklist.includes(id) ? d.checklist.filter((c) => c !== id) : [...d.checklist, id],
        })),
      resetChecklist: () => setData((d) => ({ ...d, checklist: [] })),
    }),
    [data, session, persisted, startSession, updateFields],
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
