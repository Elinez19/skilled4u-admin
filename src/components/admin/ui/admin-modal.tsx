"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { motionTokens } from "@/lib/motion";

export interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Reusable Glossy Admin Modal Dialog
 * Features `.surface-glass-dark` backdrop blur, Cobalt Slab header with `ToolPattern`,
 * interactive `OffsetRing` close button, and tokenized porcelain form surface.
 */
export function AdminModal({
  open,
  onOpenChange,
  eyebrow = "Skilled4U Admin Action",
  title,
  description,
  children,
}: AdminModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Tokenized Dark Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-surface-glass-dark backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Surface Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={motionTokens.spring.snappy}
            className="surface-gloss-card relative z-10 w-full max-w-lg overflow-hidden shadow-gloss-float"
          >
            {/* Top Cobalt Slab Header */}
            <div className="surface-slab-blue relative overflow-hidden px-5 sm:px-6 py-4 sm:py-5">
              <ToolPattern tone="on-blue" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <PillBadge
                    tone="porcelain"
                    icon="dot"
                    className="px-3 py-0.5 text-[11px]"
                  >
                    {eyebrow}
                  </PillBadge>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-ink-on-blue">
                    {title}
                  </h2>
                  <p className="text-xs font-medium text-ink-on-blue-muted">
                    {description}
                  </p>
                </div>

                <OffsetRing
                  size="xs"
                  faceTone="ink"
                  interactive
                  onClick={() => onOpenChange(false)}
                  ariaLabel="Close modal"
                  className="shrink-0"
                >
                  <X className="h-3.5 w-3.5 text-accent-gold" />
                </OffsetRing>
              </div>
            </div>

            {/* Modal Form / Content Body */}
            <div className="p-5 sm:p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

