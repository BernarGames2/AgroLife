import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Download, LogOut, RotateCcw, Upload } from "lucide-react";
import type { Profile as ProfileData } from "@/types";
import { parseAppData } from "@/lib/storage";
import { plural, toDateInputValue } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, Notice } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function Profile() {
  const { data, session, persisted, updateProfile, restoreDemo, replaceData, signOut } = useAppStore();
  const navigate = useNavigate();
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
          <Button variant="outline" onClick={() => setConfirmRestore(true)}>
            <RotateCcw /> Restaurar dados de demonstração
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              signOut();
              navigate("/", { replace: true });
            }}
          >
            <LogOut /> Sair
          </Button>
        </div>

        {!persisted && (
          <p role="alert" className="rounded-2xl border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn">
            Este navegador não permitiu salvar os dados (modo privado ou armazenamento cheio). Exporte seus dados para não perdê-los.
          </p>
        )}

        <Notice>Protótipo: os dados desta conta ficam apenas neste navegador. Use “Exportar dados” para guardar uma cópia ou levar para outro aparelho.</Notice>
      </Card>

      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar dados de demonstração?"
        description="Os talhões e avaliações atuais serão substituídos pelos dados da Fazenda Horizonte. Exporte seus dados antes, se quiser guardá-los."
        confirmLabel="Restaurar"
        onClose={() => setConfirmRestore(false)}
        onConfirm={() => {
          restoreDemo();
          toast("Dados de demonstração restaurados");
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
