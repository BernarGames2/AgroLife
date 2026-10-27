import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Crown, Download, LogOut, RotateCcw, Trash2, Upload } from "lucide-react";
import type { Profile as ProfileData } from "@/types";
import { parseAppData } from "@/lib/storage";
import { plural, toDateInputValue } from "@/lib/format";
import { PLANS } from "@/lib/plans";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, Notice } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function Profile() {
  const { data, session, persisted, isDemoSession, updateProfile, resetData, replaceData, signOut } = useAppStore();
  const toast = useToast();
  const [form, setForm] = useState<ProfileData>(data.profile);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [pendingImport, setPendingImport] = useState<ReturnType<typeof parseAppData>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Mantém o formulário em sincronia quando o perfil é restaurado ou importado.
  useEffect(() => setForm(data.profile), [data.profile]);

  const dirty = (Object.keys(form) as (keyof ProfileData)[]).some((k) => form[k] !== data.profile[k]);

  function save(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Informe seu nome.", "error");
      return;
    }
    updateProfile({
      name: form.name.trim(),
      property: form.property.trim(),
      crops: form.crops.trim(),
      location: form.location.trim(),
    });
    toast("Alterações salvas");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrolife-${toDateInputValue(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importFile(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      const parsed = parseAppData(JSON.parse(await file.text()));
      if (!parsed) throw new Error("invalid");
      setPendingImport(parsed);
    } catch {
      toast("Arquivo inválido. Use um arquivo exportado pelo AgroLife.", "error");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Meu perfil" subtitle="Produtor rural" />

      <Card className="p-6 sm:p-8">
        <form onSubmit={save} className="space-y-5">
          <FormField label="Nome">
            {(p) => <Input {...p} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          </FormField>
          <FormField label="Propriedade">
            {(p) => <Input {...p} value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />}
          </FormField>
          <FormField label="Culturas" hint="Separe por vírgulas.">
            {(p) => <Input {...p} value={form.crops} onChange={(e) => setForm({ ...form, crops: e.target.value })} placeholder="Ex.: Soja, Milho" />}
          </FormField>
          <FormField label="Localização aproximada">
            {(p) => (
              <Input {...p} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex.: Município – UF" />
            )}
          </FormField>
          <Button type="submit" disabled={!dirty} className="rounded-2xl">
            Salvar alterações
          </Button>
        </form>
      </Card>

      <Link to="/app/planos" className="card flex items-center gap-4 p-5 hover:bg-muted/40">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Crown className="size-6" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-muted-foreground">Plano atual</span>
          <span className="block text-lg font-semibold">
            {PLANS[data.plan].name}
            {data.plan !== "gratuito" && <span className="ml-1.5 text-sm font-normal text-muted-foreground">(demonstração)</span>}
          </span>
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          {data.plan === "gratuito" ? "Ver planos" : "Gerenciar"} <ChevronRight className="size-4" aria-hidden />
        </span>
      </Link>

      <Card className="space-y-5 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Configurações</h2>
        {session && (
          <p className="text-[15px] text-muted-foreground">
            Conectado como <strong className="font-medium text-foreground">{session.email}</strong>
          </p>
        )}

        <div className="flex flex-col items-start gap-3">
          <Button variant="outline" onClick={exportData}>
            <Download /> Exportar dados
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Importar dados
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => importFile(e.target.files?.[0])} />
          {isDemoSession ? (
            <Button variant="outline" onClick={() => setConfirmRestore(true)}>
              <RotateCcw /> Restaurar dados de demonstração
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirmRestore(true)}>
              <Trash2 /> Apagar talhões e avaliações
            </Button>
          )}
          <Button variant="danger" onClick={signOut}>
            <LogOut /> Sair
          </Button>
        </div>

        {!persisted && (
          <p role="alert" className="rounded-2xl border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn">
            Este navegador não permitiu salvar os dados (modo privado ou armazenamento cheio). Exporte seus dados para não perdê-los.
          </p>
        )}

        <Notice>
          {isDemoSession
            ? "Você está na demonstração: os dados são de exemplo e ficam separados das contas criadas neste aparelho."
            : "Protótipo: os dados desta conta ficam apenas neste navegador. Use “Exportar dados” para guardar uma cópia ou levar para outro aparelho."}
        </Notice>
      </Card>

      <ConfirmDialog
        open={confirmRestore}
        title={isDemoSession ? "Restaurar dados de demonstração?" : "Apagar talhões e avaliações?"}
        description={
          isDemoSession
            ? "Os dados de exemplo da Fazenda Horizonte voltam ao estado inicial."
            : "Todos os talhões, avaliações, análises e pedidos à equipe KP desta conta serão apagados. Seu perfil e seu plano continuam. Exporte seus dados antes, se quiser guardá-los."
        }
        confirmLabel={isDemoSession ? "Restaurar" : "Apagar"}
        tone={isDemoSession ? "primary" : "danger"}
        onClose={() => setConfirmRestore(false)}
        onConfirm={() => {
          resetData();
          toast(isDemoSession ? "Dados de demonstração restaurados" : "Talhões e avaliações apagados");
        }}
      />
      <ConfirmDialog
        open={pendingImport !== null}
        title="Importar dados?"
        description={`O arquivo tem ${plural(pendingImport?.fields.length ?? 0, "talhão", "talhões")}. Os dados atuais deste navegador serão substituídos.`}
        confirmLabel="Importar"
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return;
          replaceData(pendingImport);
          toast("Dados importados");
        }}
      />
    </div>
  );
}
