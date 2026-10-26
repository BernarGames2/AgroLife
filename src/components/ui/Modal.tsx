import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}

/** Diálogo de confirmação baseado no elemento nativo <dialog>. */
export function ConfirmDialog({ open, title, description, confirmLabel, tone = "primary", onConfirm, onClose }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-md rounded-3xl border bg-card p-0 text-card-foreground shadow-card backdrop:bg-foreground/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{description}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className={tone === "danger" ? "bg-danger hover:bg-danger/90 active:bg-danger/85" : undefined}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
