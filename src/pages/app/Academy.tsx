import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ACADEMY_ARTICLES, ACADEMY_CATEGORIES, type AcademyCategory } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Notice } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Filter = "todos" | AcademyCategory;

export default function Academy() {
  const [filter, setFilter] = useState<Filter>("todos");
  const articles = filter === "todos" ? ACADEMY_ARTICLES : ACADEMY_ARTICLES.filter((a) => a.category === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="AgroLife Academy" subtitle="Conteúdos curtos que complementam o monitoramento." />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["todos", ...Object.keys(ACADEMY_CATEGORIES)] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "todos" ? "Todos" : ACADEMY_CATEGORIES[f]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <details key={a.id} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer list-none">
              <p className="eyebrow text-[11px]">{ACADEMY_CATEGORIES[a.category]}</p>
              <h2 className="mt-1.5 font-sans text-lg font-semibold tracking-normal">{a.title}</h2>
              <p className="mt-1 leading-relaxed text-muted-foreground">{a.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                <span className="group-open:hidden">Saiba mais</span>
                <span className="hidden group-open:inline">Mostrar menos</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <ul className="mt-3 space-y-2 border-t pt-3">
              {a.tips.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-[15px] leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <Notice>Conteúdo educativo e geral. Para recomendações específicas da sua lavoura, consulte um profissional qualificado.</Notice>
    </div>
  );
}
