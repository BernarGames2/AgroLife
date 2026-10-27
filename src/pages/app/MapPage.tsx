import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Map as MapIcon, Plus } from "lucide-react";
import { fieldStatus, latestReading, STATUS_LABEL, type FieldStatus } from "@/lib/agro";
import { formatNumber } from "@/lib/format";
import { treemap } from "@/lib/treemap";
import { useAppStore } from "@/store/AppStore";
import { PageHeader, TagBadge } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusDot } from "@/components/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/** Proporção do mapa: mais alto no celular, para os blocos não ficarem estreitos demais. */
function useMapAspect(): number {
  const query = "(min-width: 640px)";
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide ? 1.25 : 0.85;
}

const blockClass: Record<FieldStatus, string> = {
  ok: "border-[hsl(176_40%_55%)] bg-[hsl(176_45%_86%)] hover:bg-[hsl(176_45%_82%)]",
  atencao: "border-[hsl(30_75%_65%)] bg-[hsl(30_80%_90%)] hover:bg-[hsl(30_80%_86%)]",
  investigar: "border-[hsl(350_60%_70%)] bg-[hsl(350_70%_92%)] hover:bg-[hsl(350_70%_88%)]",
  "sem-dados": "border-border bg-muted hover:bg-muted/70",
};

export default function MapPage() {
  const { data } = useAppStore();
  const aspect = useMapAspect();
  const rects = useMemo(() => treemap(data.fields.map((f) => ({ id: f.id, value: f.areaHa })), aspect), [data.fields, aspect]);
  const byId = new Map(data.fields.map((f) => [f.id, f]));
  const totalArea = data.fields.reduce((s, f) => s + f.areaHa, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mapa da propriedade"
        subtitle={data.profile.property || "Minha propriedade"}
        badge={<TagBadge>Mapa ilustrativo</TagBadge>}
      />

      {data.fields.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="Nenhum talhão no mapa"
          description="Cadastre talhões para vê-los representados aqui, com tamanho proporcional à área."
          action={
            <ButtonLink to="/app/talhoes/novo">
              <Plus /> Cadastrar talhão
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="card p-3 sm:p-4">
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-[hsl(195_45%_93%)] bg-[radial-gradient(hsl(195_30%_80%)_1px,transparent_1px)] [background-size:14px_14px]"
              style={{ aspectRatio: `${aspect}` }}
            >
              {rects.map((r) => {
                const field = byId.get(r.id);
                if (!field) return null;
                const status = fieldStatus(field);
                const last = latestReading(field);
                return (
                  <Link
                    key={r.id}
                    to={`/app/talhoes/${field.id}`}
                    className="absolute p-1.5 sm:p-2"
                    style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
                  >
                    <span className={cn("flex h-full w-full flex-col overflow-hidden rounded-xl border-2 p-2.5 transition-colors sm:p-3", blockClass[status])}>
                      <span className="truncate text-sm font-semibold sm:text-base">{field.name}</span>
                      <span className="truncate text-xs text-foreground/70 sm:text-sm">
                        {field.crop} · {last ? `${Math.round(last.emergence)}%` : "sem avaliação"}
                      </span>
                      <span className="mt-auto truncate text-xs text-foreground/60">{formatNumber(field.areaHa)} ha</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {(["ok", "atencao", "investigar", "sem-dados"] as FieldStatus[])
              .filter((s) => data.fields.some((f) => fieldStatus(f) === s))
              .map((s) => (
                <span key={s} className="inline-flex items-center gap-2">
                  <StatusDot tone={s === "sem-dados" ? "neutro" : s} className="size-3.5" /> {STATUS_LABEL[s]}
                </span>
              ))}
          </div>

          <Notice>
            Representação ilustrativa: cada bloco tem tamanho proporcional à área do talhão ({formatNumber(totalArea)} ha no total), mas não
            corresponde à posição real na propriedade. Toque em um talhão para ver os detalhes.
          </Notice>
        </>
      )}
    </div>
  );
}
