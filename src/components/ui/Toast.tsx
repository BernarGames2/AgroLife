import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  message: string;
  tone: "success" | "error";
}

const ToastContext = createContext<(message: string, tone?: ToastItem["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, tone: ToastItem["tone"] = "success") => {
    const id = ++counter.current;
    setItems((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+1rem)]"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "flex max-w-md animate-fade-in items-center gap-2.5 rounded-2xl border bg-card px-4 py-3 text-[15px] font-medium shadow-card",
              t.tone === "error" && "border-danger-border text-danger",
            )}
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-ok" aria-hidden />
            ) : (
              <AlertTriangle className="size-5 shrink-0" aria-hidden />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
