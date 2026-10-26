import { MapPinOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound({ inApp = false }: { inApp?: boolean }) {
  return (
    <div className={inApp ? "py-16" : "grid min-h-dvh place-items-center px-5"}>
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
          <MapPinOff className="size-8" strokeWidth={1.8} aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">O endereço pode estar incorreto ou o item pode ter sido removido.</p>
        <ButtonLink to={inApp ? "/app" : "/"} className="mt-6">
          {inApp ? "Voltar ao dashboard" : "Voltar ao início"}
        </ButtonLink>
      </div>
    </div>
  );
}
