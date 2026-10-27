import { useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarCheck, Camera, Crown, ImagePlus, Lock, MessageCircle, Trash2, Video, X } from "lucide-react";
import type { KpRequest, KpRequestType } from "@/types";
import { fieldTitle } from "@/lib/agro";
import { whatsappLink } from "@/lib/config";
import { formatRelativeDateTime, toDateInputValue } from "@/lib/format";
import { drawScaled, loadImage } from "@/lib/imageAnalysis";
import { KP_TYPE_LABEL, kpMessage, kpRequestStatus, type KpStatusTone } from "@/lib/kp";
import { formatPrice, hasPlan, PLANS, PRICE_PERIOD } from "@/lib/plans";
import { isHttpUrl } from "@/lib/video";
import { useAppStore } from "@/store/AppStore";
import { PageHeader } from "@/components/PageHeader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const toneClass: Record<KpStatusTone, string> = {
  neutro: "border-border bg-muted text-muted-foreground",
  atencao: "border-warn-border bg-warn-bg text-warn",
  info: "border-info-border bg-info-bg text-info",
  ok: "border-ok-border bg-ok-bg text-ok",
};

const PERIODS = ["Qualquer horário", "Manhã", "Tarde"];

async function photoToDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);
  return drawScaled(img, 720).toDataURL("image/jpeg", 0.75);
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new File([bytes], name, { type: mime });
}

/**
 * Compartilha com foto quando o aparelho permite; senão abre o WhatsApp só com o texto.
 * Tudo antes do compartilhamento é síncrono: o Safari exige que ele ocorra logo após o toque.
 */
async function sendToKp(text: string, photo?: string): Promise<boolean> {
  if (photo && typeof navigator.canShare === "function") {
    const file = dataUrlToFile(photo, "foto-lavoura.jpg");
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        return true;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return false;
      }
    }
  }
  window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  return true;
}

function HowItWorks({ premium }: { premium: boolean }) {
  const steps = [
    { icon: MessageCircle, title: "Conte o que está acontecendo", text: "Descreva o problema do talhão e, se quiser, envie uma foto." },
    {
      icon: Video,
      title: premium ? "A equipe KP responde" : "A equipe KP grava um vídeo",
      text: premium ? "Com um vídeo explicando ou combinando uma visita à propriedade." : "Um vídeo personalizado explicando a situação e o que fazer.",
    },
    { icon: CalendarCheck, title: "Tudo fica guardado aqui", text: "Os vídeos e as visitas ficam junto de cada talhão." },
  ];
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="rounded-2xl border border-dashed p-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
            <Icon className="size-5" strokeWidth={1.9} aria-hidden />
          </div>
          <p className="mt-2 font-semibold">{title}</p>
          <p className="text-sm leading-snug text-muted-foreground">{text}</p>
        </li>
      ))}
    </ol>
  );
}

function RequestCard({ req }: { req: KpRequest }) {
  const { data, updateKpRequest, deleteKpRequest } = useAppStore();
  const toast = useToast();
  const field = data.fields.find((f) => f.id === req.fieldId);
  const status = kpRequestStatus(req);
  const [link, setLink] = useState(req.videoUrl ?? "");
  const [editingLink, setEditingLink] = useState(false);
  const [date, setDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function send() {
    const ok = await sendToKp(kpMessage(req, field, data.profile), req.photo);
    if (ok && !req.sentAt) updateKpRequest(req.id, { sentAt: new Date().toISOString() });
  }

  function saveLink(e: FormEvent) {
    e.preventDefault();
    if (!isHttpUrl(link)) {
      toast("Cole um link válido, começando com https://", "error");
      return;
    }
    updateKpRequest(req.id, { videoUrl: link.trim() });
    setEditingLink(false);
    toast("Vídeo adicionado");
  }

  const showLinkForm = req.type === "video" && req.sentAt && (!req.videoUrl || editingLink);

  return (
    <article className="card space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            {req.type === "video" ? <Video className="size-5 text-primary" aria-hidden /> : <CalendarCheck className="size-5 text-primary" aria-hidden />}
            {KP_TYPE_LABEL[req.type]}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {field ? (
              <Link to={`/app/talhoes/${field.id}`} className="hover:underline">
                {fieldTitle(field)}
              </Link>
            ) : (
              "Sem talhão"
            )}{" "}
            · {formatRelativeDateTime(req.createdAt)}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-3 py-1 text-sm font-medium", toneClass[status.tone])}>{status.label}</span>
      </div>

      <div className="flex gap-3">
        {req.photo && <img src={req.photo} alt="Foto enviada" className="size-20 shrink-0 rounded-xl border object-cover" />}
        <p className="whitespace-pre-line leading-relaxed">{req.message}</p>
      </div>

      {req.type === "video" && req.videoUrl && !editingLink && (
        <div className="space-y-2">
          <VideoPlayer url={req.videoUrl} title={`Vídeo da equipe KP${field ? ` — ${field.name}` : ""}`} />
          <button onClick={() => setEditingLink(true)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Trocar link do vídeo
          </button>
        </div>
      )}

      {!req.sentAt ? (
        <div className="space-y-2">
          <Button onClick={send} className="w-full sm:w-auto">
            <MessageCircle /> Enviar para a equipe KP
          </Button>
          <p className="text-sm text-muted-foreground">O pedido é enviado pelo WhatsApp{req.photo ? ", com a foto quando o aparelho permitir" : ""}.</p>
        </div>
      ) : (
        <>
          {req.type === "video" && !req.videoUrl && <p className="text-[15px] text-muted-foreground">A equipe KP está preparando o seu vídeo.</p>}
          {showLinkForm && (
            <form onSubmit={saveLink} className="space-y-2 rounded-2xl bg-muted/60 p-4">
              <label htmlFor={`link-${req.id}`} className="block text-[15px] font-medium">
                Recebeu o vídeo? Cole o link aqui
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={`link-${req.id}`}
                  type="url"
                  inputMode="url"
                  placeholder="https://youtu.be/…"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="h-11"
                />
                <Button type="submit" className="shrink-0">
                  Salvar vídeo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Funciona com links do YouTube, Google Drive, Vimeo ou arquivo de vídeo.</p>
            </form>
          )}
          {req.type === "consultoria" && !req.scheduledFor && (
            <form
              className="space-y-2 rounded-2xl bg-muted/60 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!date) return;
                updateKpRequest(req.id, { scheduledFor: date });
                toast("Data da visita registrada");
              }}
            >
              <p className="text-[15px] text-muted-foreground">A equipe KP vai entrar em contato para combinar a visita.</p>
              <label htmlFor={`data-${req.id}`} className="block text-[15px] font-medium">
                Já combinou a data?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id={`data-${req.id}`} type="date" min={toDateInputValue(new Date())} value={date} onChange={(e) => setDate(e.target.value)} className="h-11 sm:max-w-56" />
                <Button type="submit" disabled={!date} className="shrink-0">
                  Registrar data
                </Button>
              </div>
            </form>
          )}
          {req.type === "consultoria" && req.scheduledFor && !req.completedAt && (
            <Button variant="outline" onClick={() => updateKpRequest(req.id, { completedAt: new Date().toISOString() })}>
              <CalendarCheck /> Marcar visita como realizada
            </Button>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        {req.sentAt ? (
          <button onClick={send} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <MessageCircle className="size-4" aria-hidden /> Falar de novo com a KP
          </button>
        ) : (
          <span />
        )}
        <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-danger">
          <Trash2 className="size-4" aria-hidden /> Excluir
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir pedido?"
        description="O pedido e o link do vídeo serão removidos deste aparelho."
        confirmLabel="Excluir"
        tone="danger"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteKpRequest(req.id)}
      />
    </article>
  );
}

export default function KpTeam() {
  const [params] = useSearchParams();
  const { data, addKpRequest } = useAppStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const canVideo = hasPlan(data.plan, "plus");
  const canVisit = hasPlan(data.plan, "premium");

  const [type, setType] = useState<KpRequestType>(params.get("tipo") === "consultoria" && canVisit ? "consultoria" : "video");
  const [fieldId, setFieldId] = useState(() => {
    const requested = params.get("talhao");
    return data.fields.some((f) => f.id === requested) ? (requested as string) : "";
  });
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [phone, setPhone] = useState("");
  const [period, setPeriod] = useState(PERIODS[0]);
  const [error, setError] = useState<string | null>(null);

  const requests = data.kpRequests;

  async function pickPhoto(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      setPhoto(await photoToDataUrl(file));
    } catch {
      toast("Não foi possível ler esta foto.", "error");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) return setError("Conte com um pouco mais de detalhe o que está acontecendo.");
    if (type === "consultoria" && phone.replace(/\D/g, "").length < 10) return setError("Informe um telefone com DDD para a equipe KP entrar em contato.");
    setError(null);
    addKpRequest({
      type,
      fieldId: fieldId || undefined,
      message: message.trim(),
      photo,
      ...(type === "consultoria" ? { phone: phone.trim(), preferredPeriod: period } : {}),
    });
    setMessage("");
    setPhoto(undefined);
    toast("Pedido criado. Agora é só enviar para a equipe KP.");
  }

  if (!canVideo) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Equipe KP" subtitle="Vídeos personalizados e consultoria para a sua lavoura." />
        <section className="card space-y-5 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Lock className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-bold">Disponível nos planos Plus e Premium</h2>
              <p className="mt-1 text-muted-foreground">
                No Plus ({formatPrice(PLANS.plus.price)}/{PRICE_PERIOD}), a equipe KP grava vídeos personalizados sobre a sua lavoura. No
                Premium ({formatPrice(PLANS.premium.price)}/{PRICE_PERIOD}), também pode ir até a sua propriedade.
              </p>
            </div>
          </div>
          <HowItWorks premium={false} />
          <ButtonLink to="/app/planos" className="w-full sm:w-auto">
            <Crown /> Ver planos
          </ButtonLink>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Equipe KP" subtitle="Conte o que está acontecendo na sua lavoura." />

      <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-[15px] font-medium">O que você precisa?</p>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="radiogroup">
            {(["video", "consultoria"] as const).map((t) => {
              const locked = t === "consultoria" && !canVisit;
              return (
                <button
                  type="button"
                  key={t}
                  role="radio"
                  aria-checked={type === t}
                  disabled={locked}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-1.5 rounded-full text-[15px] font-medium transition-colors disabled:opacity-60",
                    type === t ? "bg-white text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {locked && <Lock className="size-3.5" aria-hidden />}
                  {t === "video" ? "Vídeo" : "Consultoria"}
                </button>
              );
            })}
          </div>
          {!canVisit && (
            <p className="text-sm text-muted-foreground">
              Consultoria presencial no{" "}
              <Link to="/app/planos" className="font-medium text-primary hover:underline">
                Premium
              </Link>
              .
            </p>
          )}
        </div>

        {data.fields.length > 0 && (
          <FormField label="Talhão" optional>
            {(p) => (
              <Select {...p} value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
                <option value="">Geral / sem talhão</option>
                {data.fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {fieldTitle(f)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        <FormField label={type === "video" ? "O que está acontecendo?" : "Qual é o seu problema?"}>
          {(p) => (
            <Textarea
              {...p}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="Ex.: falhas na linha perto da cabeceira, plantas amareladas, emergência parou nos 76%…"
              className="min-h-32"
            />
          )}
        </FormField>

        <div className="space-y-2">
          <p className="text-[15px] font-medium">
            Foto <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
          </p>
          <input ref={fileRef} id="kp-foto" type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
          {photo ? (
            <div className="flex items-center gap-3">
              <img src={photo} alt="Foto anexada" className="size-20 rounded-xl border object-cover" />
              <Button variant="ghost" size="sm" onClick={() => setPhoto(undefined)}>
                <X /> Remover
              </Button>
            </div>
          ) : (
            <label
              htmlFor="kp-foto"
              className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/40 px-4 py-4 text-[15px] font-medium hover:border-primary/50"
            >
              <ImagePlus className="size-6 text-primary" aria-hidden /> Tirar ou escolher uma foto
            </label>
          )}
        </div>

        {type === "consultoria" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Telefone para contato">
              {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(65) 99999-9999" />}
            </FormField>
            <FormField label="Melhor período para a visita">
              {(p) => (
                <Select {...p} value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {PERIODS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full rounded-2xl">
          {type === "video" ? <Video /> : <CalendarCheck />} {type === "video" ? "Pedir vídeo" : "Pedir consultoria"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Seus pedidos</h2>
        {requests.length === 0 ? (
          <div className="card space-y-4 p-6">
            <p className="text-muted-foreground">Você ainda não fez nenhum pedido. Veja como funciona:</p>
            <HowItWorks premium={canVisit} />
          </div>
        ) : (
          requests.map((r) => <RequestCard key={r.id} req={r} />)
        )}
      </section>

      <Notice>
        <Camera className="mb-0.5 mr-1.5 inline size-4" aria-hidden />
        Protótipo: o pedido vai para a equipe KP pelo WhatsApp. Quando receber o vídeo, cole o link no pedido para guardá-lo aqui, junto
        do talhão.
      </Notice>
    </div>
  );
}
