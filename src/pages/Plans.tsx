import { PlanCards } from "@/components/PlanCards";
import { Notice } from "@/components/ui/Card";
import { useAppStore } from "@/store/AppStore";

const FAQ = [
  {
    q: "Como funcionam os vídeos personalizados do Plus?",
    a: "Na área “Equipe KP” do app, você conta o que está acontecendo no talhão e pode enviar uma foto. A equipe KP grava um vídeo explicando a situação e o que fazer, e o vídeo fica guardado no app.",
  },
  {
    q: "O que é a consultoria presencial do Premium?",
    a: "Você descreve o seu problema e a equipe KP entra em contato para combinar uma visita à propriedade. O Premium também inclui os vídeos do Plus e as Análises Premium.",
  },
  {
    q: "Onde ficam os meus dados?",
    a: "Nesta fase de protótipo, os dados ficam salvos apenas no navegador do seu aparelho. Você pode exportá-los a qualquer momento pela tela de perfil.",
  },
  {
    q: "A análise por foto substitui a visita a campo?",
    a: "Não. A análise estima a cobertura verde pela cor da imagem e serve como apoio. A avaliação de um profissional qualificado continua indispensável.",
  },
];

export default function Plans() {
  const { session } = useAppStore();
  const appPath = (plan: string) => (plan === "gratuito" ? "/app" : "/app/planos");

  return (
    <div className="container py-12 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="text-[2.4rem] font-extrabold leading-tight sm:text-5xl">Planos</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Comece grátis e evolua quando precisar: no Plus, a equipe KP grava vídeos personalizados para a sua lavoura; no Premium, ela
          também pode ir até a sua propriedade.
        </p>
      </div>

      <div className="mt-10">
        <PlanCards
          hrefFor={(plan) => (session ? appPath(plan) : `/entrar?modo=cadastro&next=${encodeURIComponent(appPath(plan))}`)}
          ctaFor={(plan) => (plan === "gratuito" ? (session ? "Abrir app" : "Começar grátis") : `Quero o ${plan === "plus" ? "Plus" : "Premium"}`)}
        />
      </div>

      <Notice className="mt-6 max-w-3xl">
        Protótipo: o pagamento ainda não está disponível. Dentro do app, o Plus e o Premium podem ser ativados em modo de demonstração,
        sem cobrança.
      </Notice>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
        <div className="mt-6 divide-y rounded-3xl border bg-card">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
