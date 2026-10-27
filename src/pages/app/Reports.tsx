import { useMemo, useState } from "react";
import { FileText, Printer, Share2 } from "lucide-react";
import { useAppStore } from "@/store/AppStore";
import { shareText } from "@/lib/share";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FieldReport } from "@/components/FieldReport";
import { reportSummary } from "@/lib/report";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function Reports() {
  const { data } = useAppStore();
  const toast = useToast();
  const fields = useMemo(() => [...data.fields].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true })), [data.fields]);
  const [selected, setSelected] = useState(fields[0]?.id ?? "");
  const [generated, setGenerated] = useState<string | null>(null);
  const field = fields.find((f) => f.id === generated);

  async function share() {
    if (!field) return;
    const result = await shareText(`Relatório — ${field.name}`, reportSummary(field, data.profile));
    if (result === "copied") toast("Resumo copiado. Cole no WhatsApp ou e-mail.");
    if (result === "failed") toast("Não foi possível compartilhar neste navegador.", "error");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 print:hidden">
        <PageHeader title="Relatórios" subtitle="Selecione um talhão e gere o relatório." />

        {fields.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum talhão para relatar"
            description="Cadastre um talhão e registre avaliações para gerar relatórios."
            action={<ButtonLink to="/app/talhoes/novo">Cadastrar talhão</ButtonLink>}
          />
        ) : (
          <section className="card space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Talhão">
              {fields.map((f) => (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={selected === f.id}
                  onClick={() => setSelected(f.id)}
                  className={cn(
                    "h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                    selected === f.id ? "border-primary/40 bg-primary-soft text-primary" : "bg-white text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <Button onClick={() => setGenerated(selected)} disabled={!selected}>
              <FileText /> Gerar relatório
            </Button>
          </section>
        )}
      </div>

      {field && (
        <>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Imprimir ou salvar PDF
            </Button>
            <Button variant="outline" onClick={share}>
              <Share2 /> Compartilhar resumo
            </Button>
          </div>
          <FieldReport field={field} profile={data.profile} />
        </>
      )}
    </div>
  );
}
