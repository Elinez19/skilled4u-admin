"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { cn } from "@/lib/utils";

export type ModalVariant = "primary" | "warning" | "danger" | "success";

export interface AdminDialogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}

export function AdminDialogModal({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  variant = "primary",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmLoading = false,
  confirmDisabled = false,
  children,
}: AdminDialogModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !confirmLoading) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, confirmLoading, onOpenChange]);

  if (!mounted) return null;

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="h-5 w-5 text-accent-error" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-accent-warm" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-accent-success" />;
      default:
        return <Sparkles className="h-5 w-5 text-brand-600" />;
    }
  };

  const getToneBadge = (): "porcelain" | "blue" | "sky" => {
    switch (variant) {
      case "danger":
      case "warning":
      case "success":
        return "porcelain";
      default:
        return "sky";
    }
  };

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!confirmLoading) onOpenChange(false);
            }}
            className="fixed inset-0 bg-brand-950/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border-2 border-brand-200 bg-surface-porcelain shadow-gloss-elevated text-left"
          >
            {/* Header Area */}
            <div className="relative border-b border-surface-frost p-5 sm:p-6 bg-white/70">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2",
                      variant === "danger" &&
                        "border-accent-error/30 bg-rose-50/80",
                      variant === "warning" &&
                        "border-accent-warm/30 bg-amber-50/80",
                      variant === "success" &&
                        "border-accent-success/30 bg-emerald-50/80",
                      variant === "primary" &&
                        "border-brand-200 bg-brand-50/80"
                    )}
                  >
                    {renderIcon()}
                  </div>

                  <div className="space-y-1">
                    {eyebrow && (
                      <PillBadge
                        tone={getToneBadge()}
                        icon="shield"
                        className="px-2.5 py-0.5 text-[10px]"
                      >
                        {eyebrow}
                      </PillBadge>
                    )}
                    <h2
                      id="admin-dialog-title"
                      className="font-display text-base sm:text-lg font-extrabold tracking-tight text-brand-950"
                    >
                      {title}
                    </h2>
                    {description && (
                      <p className="text-xs sm:text-sm font-semibold text-ink-secondary">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!confirmLoading) onOpenChange(false);
                  }}
                  disabled={confirmLoading}
                  aria-label="Close dialog"
                  className="rounded-pill p-1.5 text-ink-muted hover:bg-surface-mist hover:text-brand-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {children && (
              <div className="p-5 sm:p-6 text-xs sm:text-sm space-y-4 text-ink-primary max-h-[65vh] overflow-y-auto">
                {children}
              </div>
            )}

            {/* Modal Footer CTA Bar */}
            <div className="flex items-center justify-end gap-3 border-t border-surface-frost bg-surface-mist/60 px-5 py-4 sm:px-6">
              <CtaButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={confirmLoading}
              >
                {cancelLabel}
              </CtaButton>

              {onConfirm && (
                <CtaButton
                  type="button"
                  variant={variant === "danger" ? "secondary" : "primary"}
                  size="sm"
                  onClick={onConfirm}
                  disabled={confirmDisabled || confirmLoading}
                  className={cn(
                    variant === "danger" &&
                      "bg-accent-error text-white hover:bg-accent-error/90 border-transparent shadow-gloss-card",
                    variant === "warning" &&
                      "bg-accent-warm text-brand-950 hover:bg-accent-warm/90 border-accent-warm/60 shadow-gloss-card",
                    variant === "success" &&
                      "bg-accent-success text-white hover:bg-accent-success/90 border-transparent shadow-gloss-card"
                  )}
                >
                  {confirmLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  )}
                  <span>{confirmLabel}</span>
                </CtaButton>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
