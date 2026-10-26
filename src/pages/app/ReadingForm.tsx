import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { CountSample } from "@/types";
import { classify, coefficientOfVariation, emergenceFromSamples, fieldTitle, sampleEmergences, STATUS_LABEL } from "@/lib/agro";
import { formatNumber, toDateTimeInputValue } from "@/lib/format";
import { cn, parseDecimal } from "@/lib/utils";
import { useAppStore, useField } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import NotFound from "@/pages/NotFound";

type Method = "contagem" | "percentual";
interface SampleRow {
  plants: string;
  meters: string;
}

const numStr = (n: number | undefined) => (n === undefined ? "" : formatNumber(n).replace(/\./g, ""));

export default function ReadingForm() {
  const { id } = useParams();
  const field = useField(id);
  const { addReading } = useAppStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [method, setMethod] = useState<Method>(field?.seedsPerMeter ? "contagem" : "percentual");
  const [date, setDate] = useState(() => toDateTimeInputValue(new Date()));
  const [seedsPerMeter, setSeedsPerMeter] = useState(() => numStr(field?.seedsPerMeter));
  const [rows, setRows] = useState<SampleRow[]>(() => Array.from({ length: 3 }, () => ({ plants: "", meters: "5" })));
  const [percent, setPercent] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!field) return <NotFound inApp />;

  const seeds = parseDecimal(seedsPerMeter);
  const samples: CountSample[] = rows
    .map((r) => ({ plants: parseDecimal(r.plants), meters: parseDecimal(r.meters) }))
    .filter((s) => Number.isFinite(s.plants) && Number.isFinite(s.meters) && s.meters > 0 && s.plants >= 0);
  const fromCount = emergenceFromSamples(samples, seeds);
  const perPoint = sampleEmergences(samples, seeds);
  const cv = coefficientOfVariation(perPoint);
  const value = method === "contagem" ? fromCount : parseDecimal(percent);
  const preview = value !== null && Number.isFinite(value) ? value : null;

  const updateRow = (i: number, patch: Partial<SampleRow>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!field) return;
    if (!date || Number.isNaN(new Date(date).getTime())) return setError("Informe a data e a hora da avaliação.");
    if (new Date(date) > new Date(Date.now() + 5 * 60_000)) return setError("A data da avaliação não pode estar no futuro.");
    if (method === "contagem") {
      if (!(seeds > 0)) return setError("Informe quantas sementes por metro foram distribuídas.");
      if (samples.length === 0) return setError("Preencha ao menos um ponto de contagem (plantas e metros avaliados).");
    }
    if (preview === null || preview < 0) return setError("Informe a emergência observada.");
    if (preview > 100)
      return setError(
        method === "contagem"
          ? "O resultado passou de 100%. Confira as sementes por metro ou as plantas contadas."
          : "A emergência deve estar entre 0% e 100%.",
      );

    addReading(field.id, {
      date: new Date(date).toISOString(),
      emergence: Math.round(preview * 10) / 10,
      method,
      ...(method === "contagem" ? { samples, seedsPerMeter: seeds } : {}),
      notes: notes.trim() || undefined,
    });
    toast("Avaliação registrada");
    navigate(`/app/talhoes/${field.id}`, { replace: true });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to={`/app/talhoes/${field.id}`} className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> {field.name}
      </Link>
      <PageHeader title="Registrar avaliação" subtitle={fieldTitle(field)} />

      <form onSubmit={submit} noValidate className="space-y-6">
        <div className="card space-y-6 p-6 sm:p-8">
          <FormField label="Data e hora da avaliação">
            {(p) => <Input {...p} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />}
          </FormField>

          <div className="space-y-2">
            <p className="text-[15px] font-medium">Como você vai informar?</p>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="radiogroup">
              {(["contagem", "percentual"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  role="radio"
                  aria-checked={method === m}
                  onClick={() => {
                    setMethod(m);
                    setError(null);
                  }}
                  className={cn(
                    "h-10 rounded-full text-[15px] font-medium transition-colors",
                    method === m ? "bg-white text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "contagem" ? "Contagem" : "Percentual"}
                </button>
              ))}
            </div>
          </div>

          {method === "contagem" ? (
            <div className="space-y-5">
              <Notice>
                Em alguns pontos do talhão, conte as plantas emergidas em um trecho da linha (ex.: 5 metros). Quanto mais pontos, mais
                representativo o resultado.
              </Notice>
              <FormField label="Sementes distribuídas por metro" hint="Conforme a regulagem da plantadeira.">
                {(p) => <Input {...p} inputMode="decimal" value={seedsPerMeter} onChange={(e) => setSeedsPerMeter(e.target.value)} className="max-w-48" />}
              </FormField>

              <div className="space-y-3">
                <div className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem] items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>Ponto</span>
                  <span>Plantas</span>
                  <span>Metros</span>
                  <span />
                </div>
                {rows.map((r, i) => (
                  <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem] items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{i + 1}</span>
                    <Input
                      inputMode="numeric"
                      aria-label={`Plantas contadas no ponto ${i + 1}`}
                      value={r.plants}
                      onChange={(e) => updateRow(i, { plants: e.target.value })}
                      placeholder="0"
                    />
                    <Input inputMode="decimal" aria-label={`Metros avaliados no ponto ${i + 1}`} value={r.meters} onChange={(e) => updateRow(i, { meters: e.target.value })} />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ponto ${i + 1}`}
                      disabled={rows.length === 1}
                      onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                    >
                      <X className="text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => setRows((rs) => [...rs, { plants: "", meters: rs[rs.length - 1]?.meters || "5" }])} disabled={rows.length >= 20}>
                  <Plus /> Adicionar ponto
                </Button>
              </div>
            </div>
          ) : (
            <FormField label="Emergência observada (%)">
              {(p) => <Input {...p} inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="Ex.: 88" className="max-w-48" />}
            </FormField>
          )}

          <FormField label="Observações" optional>
            {(p) => (
              <Textarea {...p} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Ex.: falhas concentradas na cabeceira, solo encrostado…" />
            )}
          </FormField>
        </div>

        {/* Resultado em tempo real */}
        <div className="card p-6 sm:p-8" aria-live="polite">
          <p className="eyebrow">Resultado</p>
          {preview !== null && preview >= 0 ? (
            <>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <p className="font-display text-5xl font-bold tracking-tight text-primary tabular">{formatNumber(Math.round(preview * 10) / 10)}%</p>
                {preview <= 100 && <StatusBadge status={classify(preview, field.targetEmergence)} />}
              </div>
              <p className="mt-2 text-muted-foreground">
                Meta do talhão: {Math.round(field.targetEmergence)}%.
                {preview <= 100 && ` Classificação: ${STATUS_LABEL[classify(preview, field.targetEmergence)].toLowerCase()}.`}
              </p>
              {method === "contagem" && perPoint.length > 1 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Variação entre pontos: de {Math.round(Math.min(...perPoint))}% a {Math.round(Math.max(...perPoint))}%
                  {cv !== null && cv > 0.2 ? " — estande desuniforme." : "."}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">Preencha os dados acima para ver a emergência calculada.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => navigate(`/app/talhoes/${field.id}`)}>
            Cancelar
          </Button>
          <Button type="submit">Salvar avaliação</Button>
        </div>
      </form>
    </div>
  );
}
