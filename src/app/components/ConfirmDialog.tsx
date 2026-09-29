// src/components/ConfirmDialog.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaExclamationTriangle } from "react-icons/fa";

type Variant = "danger" | "primary";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

type ConfirmFn = (opts: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    opts: ConfirmOptions;
  } | null>(null);

  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    const normalized: ConfirmOptions =
      typeof opts === "string" ? { message: opts } : opts;
    setState({ open: true, opts: normalized });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  };

  // Escape + scroll lock
  useEffect(() => {
    if (!state?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [state?.open]);

  const opts = state?.opts;
  const isDanger = (opts?.variant || "danger") === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state?.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => close(false)}
            aria-hidden
          />

          <div
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isDanger
                    ? "bg-red-500/10 text-red-500"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <FaExclamationTriangle />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {opts?.title || (isDanger ? "Are you sure?" : "Confirm")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  {opts?.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted active:scale-[0.98] transition"
              >
                {opts?.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium active:scale-[0.98] transition ${
                  isDanger
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:opacity-90"
                }`}
              >
                {opts?.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
