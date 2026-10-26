import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { FieldInput } from "@/types";
import { CROP_PRESETS, CROPS } from "@/lib/agro";
import { formatNumber, parseLocalDate, toDateInputValue } from "@/lib/format";
import { parseDecimal } from "@/lib/utils";
import { useAppStore, useField } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import NotFound from "@/pages/NotFound";

interface FormState {
  name: string;
  crop: string;
  areaHa: string;
  targetEmergence: string;
  plantingDate: string;
  seedsPerMeter: string;
  rowSpacingCm: string;
  cultivar: string;
  notes: string;
}

const num = (n: number | undefined) => (n === undefined ? "" : formatNumber(n).replace(/\./g, ""));

export default function FieldForm() {
  const { id } = useParams();
  const existing = useField(id);
  const { data, addField, updateField } = useAppStore();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      return {
        name: existing.name,
        crop: existing.crop,
        areaHa: num(existing.areaHa),
        targetEmergence: num(existing.targetEmergence),
        plantingDate: existing.plantingDate,
        seedsPerMeter: num(existing.seedsPerMeter),
        rowSpacingCm: num(existing.rowSpacingCm),
        cultivar: existing.cultivar ?? "",
        notes: existing.notes ?? "",
      };
    }
    const preset = CROP_PRESETS.Soja;
    return {
      name: `Talhão ${String(data.fields.length + 1).padStart(2, "0")}`,
      crop: "Soja",
      areaHa: "",
      targetEmergence: String(preset.target),
      plantingDate: toDateInputValue(new Date()),
      seedsPerMeter: num(preset.seedsPerMeter),
      rowSpacingCm: String(preset.rowSpacingCm),
      cultivar: "",
      notes: "",
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  if (isEdit && !existing) return <NotFound inApp />;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function changeCrop(crop: string) {
    const preset = CROP_PRESETS[crop];
    setForm((f) => ({
      ...f,
      crop,
      // Ao cadastrar, sugere valores típicos da cultura; ao editar, mantém o que já foi informado.
      ...(!isEdit && preset
        ? { targetEmergence: String(preset.target), seedsPerMeter: num(preset.seedsPerMeter), rowSpacingCm: String(preset.rowSpacingCm) }
        : {}),
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    const area = parseDecimal(form.areaHa);
    const target = parseDecimal(form.targetEmergence);
    const seeds = form.seedsPerMeter.trim() ? parseDecimal(form.seedsPerMeter) : undefined;
    const spacing = form.rowSpacingCm.trim() ? parseDecimal(form.rowSpacingCm) : undefined;
    const name = form.name.trim();

    if (!name) errs.name = "Informe um nome para o talhão.";
    else if (data.fields.some((f) => f.id !== id && f.name.trim().toLowerCase() === name.toLowerCase()))
      errs.name = "Já existe um talhão com esse nome.";
    if (!(area > 0) || area > 100_000) errs.areaHa = "Informe a área em hectares (maior que zero).";
    if (!(target > 0) || target > 100) errs.targetEmergence = "A meta deve estar entre 1% e 100%.";
    if (!form.plantingDate) errs.plantingDate = "Informe a data de plantio.";
    else if (parseLocalDate(form.plantingDate) > new Date()) errs.plantingDate = "A data de plantio não pode estar no futuro.";
    if (seeds !== undefined && !(seeds > 0)) errs.seedsPerMeter = "Informe um número maior que zero ou deixe em branco.";
    if (spacing !== undefined && !(spacing > 0 && spacing <= 300)) errs.rowSpacingCm = "Informe o espaçamento em centímetros ou deixe em branco.";

    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }

    const input: FieldInput = {
      name,
      crop: form.crop,
      areaHa: area,
      targetEmergence: target,
      plantingDate: form.plantingDate,
      seedsPerMeter: seeds,
      rowSpacingCm: spacing,
      cultivar: form.cultivar.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (existing) {
      updateField(existing.id, input);
      toast("Talhão atualizado");
      navigate(`/app/talhoes/${existing.id}`);
    } else {
      const created = addField(input);
      toast("Talhão cadastrado");
      navigate(`/app/talhoes/${created.id}`, { replace: true });
    }
  }

  const backTo = existing ? `/app/talhoes/${existing.id}` : "/app/talhoes";

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to={backTo} className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Voltar
      </Link>
      <PageHeader
        title={existing ? "Editar talhão" : "Novo talhão"}
        subtitle={existing ? existing.name : "Informe os dados do plantio para acompanhar a emergência."}
      />

      <form onSubmit={submit} noValidate className="card space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nome do talhão" error={errors.name}>
            {(p) => <Input {...p} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} />}
          </FormField>
          <FormField label="Cultura">
            {(p) => (
              <Select {...p} value={form.crop} onChange={(e) => changeCrop(e.target.value)}>
                {CROPS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="Área (ha)" error={errors.areaHa}>
            {(p) => <Input {...p} inputMode="decimal" value={form.areaHa} onChange={(e) => set("areaHa", e.target.value)} placeholder="Ex.: 35" />}
          </FormField>
          <FormField label="Meta de emergência (%)" error={errors.targetEmergence} hint="Percentual de sementes que deveriam emergir.">
            {(p) => <Input {...p} inputMode="decimal" value={form.targetEmergence} onChange={(e) => set("targetEmergence", e.target.value)} />}
          </FormField>
          <FormField label="Data de plantio" error={errors.plantingDate}>
            {(p) => (
              <Input {...p} type="date" max={toDateInputValue(new Date())} value={form.plantingDate} onChange={(e) => set("plantingDate", e.target.value)} />
            )}
          </FormField>
          <FormField label="Cultivar / híbrido" optional>
            {(p) => <Input {...p} value={form.cultivar} onChange={(e) => set("cultivar", e.target.value)} maxLength={60} />}
          </FormField>
        </div>

        <fieldset className="space-y-4 rounded-2xl border bg-muted/50 p-5">
          <legend className="px-1 text-[15px] font-semibold">Regulagem da plantadeira</legend>
          <p className="-mt-1 text-sm leading-relaxed text-muted-foreground">
            Usada para calcular a emergência a partir da contagem de plantas e estimar o estande. Os valores sugeridos são apenas referência — use os da sua regulagem.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Sementes por metro" optional error={errors.seedsPerMeter}>
              {(p) => <Input {...p} inputMode="decimal" value={form.seedsPerMeter} onChange={(e) => set("seedsPerMeter", e.target.value)} />}
            </FormField>
            <FormField label="Espaçamento entre linhas (cm)" optional error={errors.rowSpacingCm}>
              {(p) => <Input {...p} inputMode="decimal" value={form.rowSpacingCm} onChange={(e) => set("rowSpacingCm", e.target.value)} />}
            </FormField>
          </div>
        </fieldset>

        <FormField label="Observações" optional>
          {(p) => (
            <Textarea {...p} value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={500} placeholder="Ex.: área de baixada, histórico de compactação…" />
          )}
        </FormField>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => navigate(backTo)}>
            Cancelar
          </Button>
          <Button type="submit">{existing ? "Salvar alterações" : "Cadastrar talhão"}</Button>
        </div>
      </form>
    </div>
  );
}
