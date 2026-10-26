import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, ClipboardPlus, Pencil, Trash2 } from "lucide-react";
import {
  buildFieldAlerts,
  compareAlerts,
  daysAfterPlanting,
  fieldStatus,
  fieldTitle,
  formatStand,
  latestReading,
  plantsPerHectare,
  sampleEmergences,
  sortReadings,
} from "@/lib/agro";
import { formatDate, formatNumber, formatRelativeDateTime, plural } from "@/lib/format";
import { useAppStore, useField } from "@/store/AppStore";
import { StatusBadge, AlertBadge } from "@/components/StatusBadge";
import { EmergenceBar } from "@/components/EmergenceBar";
import { EmergenceChart } from "@/components/EmergenceChart";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import NotFound from "@/pages/NotFound";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/70 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export default function FieldDetail() {
  const { id } = useParams();
  const field = useField(id);
  const { data, deleteField, deleteReading } = useAppStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

  if (!field) return <NotFound inApp />;

  const status = fieldStatus(field);
  const last = latestReading(field);
  const alerts = buildFieldAlerts(field).sort(compareAlerts);
  const readings = sortReadings(field.readings).reverse();
  const dap = daysAfterPlanting(field);
  const stand =
    last && field.seedsPerMeter && field.rowSpacingCm ? plantsPerHectare(field.seedsPerMeter, field.rowSpacingCm, last.emergence) : null;
  const analyses = data.analyses.filter((a) => a.fieldId === field.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/app/talhoes" className="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Talhões
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-[2rem] font-bold leading-tight sm:text-4xl">{fieldTitle(field)}</h1>
          <StatusBadge status={status} className="mt-1" />
        </div>
        <p className="text-[17px] text-muted-foreground">
          {formatNumber(field.areaHa)} ha · meta {Math.round(field.targetEmergence)}% · {plural(Math.max(0, dap), "dia", "dias")} após o plantio
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <ButtonLink to={`/app/talhoes/${field.id}/avaliar`}>
            <ClipboardPlus /> Registrar avaliação
          </ButtonLink>
          <ButtonLink to={`/app/analisar?talhao=${field.id}`} variant="outline">
            <Camera /> Analisar foto
          </ButtonLink>
        </div>
      </header>

      {/* Emergência atual */}
      <section className="card p-5 sm:p-7">
        {last ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Emergência atual</p>
                <p className="mt-2 font-display text-6xl font-bold leading-none tracking-tight text-primary tabular">{Math.round(last.emergence)}%</p>
              </div>
              <p className="text-right text-sm text-muted-foreground">
                Meta {Math.round(field.targetEmergence)}%
                <span className="block">{formatRelativeDateTime(last.date)}</span>
              </p>
            </div>
            <EmergenceBar className="mt-5" value={last.emergence} target={field.targetEmergence} status={status} />
            {stand !== null && (
              <p className="mt-4 text-[15px] text-muted-foreground">
                Estande estimado: <strong className="font-semibold text-foreground">{formatStand(stand)}</strong>
              </p>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold">Nenhuma avaliação registrada</p>
            <p className="mt-1 text-muted-foreground">Registre a primeira contagem para acompanhar a emergência deste talhão.</p>
            <ButtonLink to={`/app/talhoes/${field.id}/avaliar`} className="mt-4">
              <ClipboardPlus /> Registrar avaliação
            </ButtonLink>
          </div>
        )}
      </section>

      {/* Pontos de atenção do talhão */}
      {last && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Pontos de atenção</h2>
          {alerts.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-sans text-lg font-semibold tracking-normal">{a.title}</h3>
                <AlertBadge level={a.level} />
              </div>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{a.description}</p>
              <p className="mt-2 leading-relaxed">
                <strong className="font-semibold">Ação sugerida:</strong> {a.action}
              </p>
            </article>
          ))}
        </section>
      )}

      <section className="card p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Evolução da emergência</h2>
        <p className="mt-1 text-muted-foreground">Linha tracejada: meta de {Math.round(field.targetEmergence)}%.</p>
        <div className="mt-5">
          <EmergenceChart field={field} />
        </div>
      </section>

      {/* Histórico */}
      <section className="card p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Avaliações</h2>
          <span className="text-sm text-muted-foreground">{plural(readings.length, "registro", "registros")}</span>
        </div>
        {readings.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Ainda não há avaliações.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {readings.map((r) => {
              const perPoint = r.samples && r.seedsPerMeter ? sampleEmergences(r.samples, r.seedsPerMeter) : [];
              return (
                <li key={r.id} className="flex items-start gap-4 py-4">
                  <p className="w-16 shrink-0 font-display text-2xl font-bold tabular">{Math.round(r.emergence)}%</p>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{formatRelativeDateTime(r.date)}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.method === "contagem" && r.samples
                        ? `Contagem em ${plural(r.samples.length, "ponto", "pontos")}${perPoint.length > 1 ? ` (de ${Math.round(Math.min(...perPoint))}% a ${Math.round(Math.max(...perPoint))}%)` : ""}`
                        : "Percentual informado"}
                    </p>
                    {r.notes && <p className="mt-1 text-sm leading-relaxed">{r.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Excluir avaliação de ${formatDate(r.date)}`} onClick={() => setReadingToDelete(r.id)}>
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {analyses.length > 0 && (
        <section className="card p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Análises de foto</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {analyses.map((a) => (
              <li key={a.id} className="overflow-hidden rounded-2xl border bg-muted/50">
                {a.thumbnail && <img src={a.thumbnail} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="p-3 text-sm">
                  <p className="font-semibold">{Math.round(a.coverage)}% de cobertura</p>
                  <p className="text-muted-foreground">{formatDate(a.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dados do talhão */}
      <section className="card p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Dados do talhão</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <Info label="Cultura" value={field.crop} />
          <Info label="Área" value={`${formatNumber(field.areaHa)} ha`} />
          <Info label="Plantio" value={formatDate(field.plantingDate)} />
          <Info label="Meta" value={`${Math.round(field.targetEmergence)}%`} />
          <Info label="Sementes/metro" value={field.seedsPerMeter ? formatNumber(field.seedsPerMeter) : "—"} />
          <Info label="Espaçamento" value={field.rowSpacingCm ? `${formatNumber(field.rowSpacingCm)} cm` : "—"} />
          {field.cultivar && <Info label="Cultivar / híbrido" value={field.cultivar} />}
        </dl>
        {field.notes && <p className="mt-4 leading-relaxed text-muted-foreground">{field.notes}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink to={`/app/talhoes/${field.id}/editar`} variant="outline">
            <Pencil /> Editar talhão
          </ButtonLink>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 /> Excluir talhão
          </Button>
        </div>
      </section>

      <Notice>Os pontos de atenção são indicativos, gerados a partir dos dados informados, e não substituem a avaliação de um profissional qualificado.</Notice>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir talhão?"
        description={`${field.name} e todas as suas avaliações serão removidos deste navegador. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir talhão"
        tone="danger"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteField(field.id);
          toast("Talhão excluído");
          navigate("/app/talhoes", { replace: true });
        }}
      />
      <ConfirmDialog
        open={readingToDelete !== null}
        title="Excluir avaliação?"
        description="O registro será removido do histórico e os pontos de atenção serão recalculados."
        confirmLabel="Excluir"
        tone="danger"
        onClose={() => setReadingToDelete(null)}
        onConfirm={() => {
          if (readingToDelete) deleteReading(field.id, readingToDelete);
          toast("Avaliação excluída");
        }}
      />
    </div>
  );
}
