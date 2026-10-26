import { useMemo, useState } from "react";
import { Plus, Search, Sprout } from "lucide-react";
import { compareByStatus, fieldStatus, STATUS_LABEL, type FieldStatus } from "@/lib/agro";
import { formatNumber, plural } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { FieldCard } from "@/components/FieldCard";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

type Filter = "todos" | FieldStatus;
type Sort = "status" | "nome";

const FILTERS: Filter[] = ["todos", "investigar", "atencao", "ok", "sem-dados"];

export default function Fields() {
  const { data } = useAppStore();
  const [filter, setFilter] = useState<Filter>("todos");
  const [sort, setSort] = useState<Sort>("nome");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { todos: data.fields.length, investigar: 0, atencao: 0, ok: 0, "sem-dados": 0 };
    for (const f of data.fields) c[fieldStatus(f)]++;
    return c;
  }, [data.fields]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return data.fields
      .filter((f) => filter === "todos" || fieldStatus(f) === filter)
      .filter((f) => !q || `${f.name} ${f.crop} ${f.cultivar ?? ""}`.toLocaleLowerCase("pt-BR").includes(q))
      .sort(sort === "status" ? compareByStatus : (a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }));
  }, [data.fields, filter, sort, query]);

  const totalArea = data.fields.reduce((sum, f) => sum + f.areaHa, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Talhões"
        subtitle={
          data.fields.length
            ? `${plural(data.fields.length, "talhão", "talhões")} · ${formatNumber(totalArea)} ha monitorados`
            : "Cadastre e acompanhe cada área da propriedade."
        }
        actions={
          <ButtonLink to="/app/talhoes/novo" className="rounded-2xl">
            <Plus /> Novo talhão
          </ButtonLink>
        }
      />

      {data.fields.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Nenhum talhão cadastrado"
          description="Cadastre o primeiro talhão informando cultura, área, data de plantio e meta de emergência."
          action={
            <ButtonLink to="/app/talhoes/novo">
              <Plus /> Cadastrar talhão
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, cultura ou cultivar"
                aria-label="Buscar talhões"
                className="pl-11"
              />
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {FILTERS.filter((f) => f === "todos" || counts[f] > 0).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                    filter === f ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "todos" ? "Todos" : STATUS_LABEL[f]} <span className="tabular opacity-75">({counts[f]})</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              Ordenar por
              {(["nome", "status"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={cn("rounded-full px-2 py-1 font-medium", sort === s ? "text-primary underline underline-offset-4" : "hover:text-foreground")}
                >
                  {s === "nome" ? "nome" : "prioridade"}
                </button>
              ))}
            </div>
          </div>

          {visible.length ? (
            <div className="grid gap-4">
              {visible.map((f) => (
                <FieldCard key={f.id} field={f} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Nenhum talhão encontrado com esses filtros.</p>
          )}
        </>
      )}
    </div>
  );
}
