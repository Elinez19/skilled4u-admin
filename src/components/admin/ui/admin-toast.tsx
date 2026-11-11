"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

// Fallback global event bridge for components mounted outside or within the provider
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
const listeners = new Set<ToastListener>();

export const adminToast = {
  success: (title: string, description?: string) => {
    listeners.forEach((l) => l({ type: "success", title, description }));
  },
  error: (title: string, description?: string) => {
    listeners.forEach((l) => l({ type: "error", title, description }));
  },
  warning: (title: string, description?: string) => {
    listeners.forEach((l) => l({ type: "warning", title, description }));
  },
  info: (title: string, description?: string) => {
    listeners.forEach((l) => l({ type: "info", title, description }));
  },
};

export function AdminToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = "toast-" + Math.random().toString(36).slice(2, 9);
      const newToast: ToastItem = { id, type, title, description, duration };
      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  React.useEffect(() => {
    const handleGlobalToast: ToastListener = (item) => {
      showToast(item);
    };
    listeners.add(handleGlobalToast);
    return () => {
      listeners.delete(handleGlobalToast);
    };
  }, [showToast]);

  const success = React.useCallback(
    (title: string, description?: string) =>
      showToast({ type: "success", title, description }),
    [showToast]
  );
  const error = React.useCallback(
    (title: string, description?: string) =>
      showToast({ type: "error", title, description }),
    [showToast]
  );
  const warning = React.useCallback(
    (title: string, description?: string) =>
      showToast({ type: "warning", title, description }),
    [showToast]
  );
  const info = React.useCallback(
    (title: string, description?: string) =>
      showToast({ type: "info", title, description }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, warning, info, dismissToast }}
    >
      {children}
      <div
        role="region"
        aria-label="Admin notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="sync">
          {toasts.map((t) => {
            const isSuccess = t.type === "success";
            const isError = t.type === "error";
            const isWarning = t.type === "warning";

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-2xl border-2 p-3.5 shadow-gloss-elevated backdrop-blur-md transition-all",
                  isSuccess &&
                    "border-accent-success/40 bg-white/95 text-brand-950 shadow-brand-900/10",
                  isError &&
                    "border-accent-error/40 bg-white/95 text-brand-950 shadow-accent-error/10",
                  isWarning &&
                    "border-accent-warm/40 bg-white/95 text-brand-950 shadow-accent-warm/10",
                  !isSuccess &&
                    !isError &&
                    !isWarning &&
                    "border-brand-200 bg-white/95 text-brand-950 shadow-brand-900/10"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && (
                    <div className="grid h-6 w-6 place-items-center rounded-pill bg-emerald-50 text-accent-success">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                  {isError && (
                    <div className="grid h-6 w-6 place-items-center rounded-pill bg-rose-50 text-accent-error">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  {isWarning && (
                    <div className="grid h-6 w-6 place-items-center rounded-pill bg-amber-50 text-accent-warm">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                  {!isSuccess && !isError && !isWarning && (
                    <div className="grid h-6 w-6 place-items-center rounded-pill bg-blue-50 text-accent-sky">
                      <Info className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-0.5 min-w-0 pr-1">
                  <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950 truncate">
                    {t.title}
                  </div>
                  {t.description && (
                    <p className="text-[11px] sm:text-xs font-semibold text-ink-secondary leading-snug">
                      {t.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-pill p-1 text-ink-muted hover:bg-surface-mist hover:text-brand-900 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return adminToast;
  }
  return context;
}

