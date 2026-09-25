"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";

type Toast = { id: number; message: string; tone: "default" | "success" | "error"; action?: { label: string; onClick: () => void } };
type ShowToast = (t: Omit<Toast, "id" | "tone"> & { tone?: Toast["tone"]; duration?: number }) => void;

const ToastContext = createContext<ShowToast>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback<ShowToast>(
    ({ duration = 5000, tone = "default", ...t }) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, tone, ...t }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-5 top-5 z-50 flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink shadow-lg shadow-black/20"
          >
            {t.tone === "success" && <Icon name="check" className="text-accent" />}
            {t.tone === "error" && <Icon name="alert" className="text-accent" />}
            <span className="min-w-0 flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="rounded-md px-2 py-1 font-mono text-xs font-medium text-accent hover:bg-surface-2"
              >
                {t.action.label}
              </button>
            )}
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-muted hover:text-ink">
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
