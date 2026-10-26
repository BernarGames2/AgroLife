import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, ImagePlus, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { analyzeImageFile, renderOverlay, UNIFORMITY_LABEL, type CoverAnalysis } from "@/lib/imageAnalysis";
import { fieldTitle } from "@/lib/agro";
import { formatRelativeDateTime, plural } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { PageHeader, TagBadge } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { FormField, Select } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Result {
  analysis: CoverAnalysis;
  source: HTMLCanvasElement;
  thumbnail: string;
  fileName: string;
}

function interpretation(a: CoverAnalysis): string {
  if (a.lowSignal) {
    return "Pouca vegetação verde foi detectada. Confira se a foto mostra a lavoura de cima, com boa iluminação, ou se as plantas ainda estão emergindo.";
  }
  if (a.lowCells === 0) {
    return "A cobertura verde está distribuída de forma relativamente homogênea na imagem. Nenhuma área com cobertura bem abaixo do restante foi destacada.";
  }
  return `${plural(a.lowCells, "área da imagem tem", "áreas da imagem têm")} cobertura verde bem abaixo do restante da foto. Vale verificar esses pontos a campo — podem indicar falhas de emergência.`;
}

export default function Analyze() {
  const [params] = useSearchParams();
  const { data, addAnalysis, deleteAnalysis } = useAppStore();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMask, setShowMask] = useState(false);
  const [fieldId, setFieldId] = useState(() => {
    const requested = params.get("talhao");
    return data.fields.some((f) => f.id === requested) ? (requested as string) : "";
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (result && canvasRef.current) renderOverlay(canvasRef.current, result.source, result.analysis, { showMask, showGrid: true });
  }, [result, showMask]);

  function pick(f: File | undefined) {
    setError(null);
    setResult(null);
    setSaved(false);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem (JPG, PNG ou HEIC).");
      return;
    }
    setFile(f);
  }

  async function analyze() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const out = await analyzeImageFile(file);
      setResult({ ...out, fileName: file.name });
    } catch {
      setError("Não foi possível ler esta imagem. Tente outra foto ou outro formato (JPG ou PNG).");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setSaved(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function save() {
    if (!result) return;
    addAnalysis({
      date: new Date().toISOString(),
      fieldId: fieldId || undefined,
      coverage: Math.round(result.analysis.coverage * 10) / 10,
      uniformity: result.analysis.uniformity,
      lowCells: result.analysis.lowCells,
      totalCells: result.analysis.cells.length,
      thumbnail: result.thumbnail,
    });
    setSaved(true);
    toast("Análise salva");
  }

  const fieldName = (id?: string) => data.fields.find((f) => f.id === id)?.name;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analisar área" subtitle="Envie uma foto da lavoura para ver pontos de atenção." badge={<TagBadge>Protótipo</TagBadge>} />

      <section className="card space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-[15px] font-medium">Foto da lavoura</p>
          <input
            ref={inputRef}
            id="foto"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {preview ? (
            <div className="space-y-3">
              {!result && <img src={preview} alt="Foto selecionada" className="max-h-80 w-full rounded-2xl border object-cover" />}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm text-muted-foreground">{file?.name}</p>
                <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
                  <RotateCcw /> Trocar foto
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="foto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/40 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary-soft/40"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <ImagePlus className="size-7" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="text-[17px] font-medium">Tirar ou escolher uma foto</span>
              <span className="text-sm text-muted-foreground">Fotografe de cima, a cerca de 1,5 m do solo, com luz natural.</span>
            </label>
          )}
        </div>

        {data.fields.length > 0 && (
          <FormField label="Talhão" optional>
            {(p) => (
              <Select {...p} value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
                <option value="">Não vincular a um talhão</option>
                {data.fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {fieldTitle(f)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        {!result && (
          <Button size="lg" className="w-full rounded-2xl" disabled={!file || busy} onClick={analyze}>
            {busy ? <Loader2 className="animate-spin" /> : <Camera />} {busy ? "Analisando…" : "Analisar área"}
          </Button>
        )}

        {error && (
          <p role="alert" className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <Notice>
          Protótipo: a análise estima a cobertura verde pela cor dos pixels da foto. Sombras, palhada e iluminação interferem no resultado.
          É uma ferramenta de apoio e não substitui a avaliação de um profissional qualificado.
        </Notice>
      </section>

      {result && (
        <section className="card space-y-5 p-6 sm:p-8 animate-fade-in" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-2xl font-bold">Resultado</h2>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-sm">
              {[
                { v: false, label: "Foto" },
                { v: true, label: "Vegetação" },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => setShowMask(o.v)}
                  aria-pressed={showMask === o.v}
                  className={cn("h-8 rounded-full px-3 font-medium", showMask === o.v ? "bg-white shadow-soft" : "text-muted-foreground")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <canvas ref={canvasRef} className="h-auto w-full rounded-2xl border" aria-label="Foto analisada com as áreas de baixa cobertura destacadas em vermelho" />
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block size-3.5 rounded-[4px] border-2 border-red-200 bg-red-600/40" aria-hidden /> Áreas com cobertura bem abaixo do restante da foto
          </p>

          <dl className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {[
              { label: "Cobertura verde", value: `${Math.round(result.analysis.coverage)}%` },
              { label: "Uniformidade", value: UNIFORMITY_LABEL[result.analysis.uniformity] },
              { label: "Pontos de atenção", value: String(result.analysis.lowCells) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/70 px-4 py-3 sm:block sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-2xl font-bold tabular sm:mt-1">{item.value}</dd>
              </div>
            ))}
          </dl>

          <p className="leading-relaxed">{interpretation(result.analysis)}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={save} disabled={saved} className="sm:flex-1">
              <Save /> {saved ? "Análise salva" : "Salvar análise"}
            </Button>
            <Button variant="outline" onClick={reset} className="sm:flex-1">
              <Camera /> Nova análise
            </Button>
          </div>
        </section>
      )}

      {data.analyses.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Análises salvas</h2>
          <ul className="space-y-3">
            {data.analyses.map((a) => (
              <li key={a.id} className="card flex items-center gap-4 p-3 pr-4">
                {a.thumbnail ? (
                  <img src={a.thumbnail} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="size-16 shrink-0 rounded-xl bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {Math.round(a.coverage)}% de cobertura · uniformidade {UNIFORMITY_LABEL[a.uniformity].toLowerCase()}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {fieldName(a.fieldId) ?? "Sem talhão"} · {formatRelativeDateTime(a.date)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Excluir análise" onClick={() => deleteAnalysis(a.id)}>
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
