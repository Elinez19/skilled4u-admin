import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminStatusVariant =
  | "success"
  | "warning"
  | "active"
  | "danger"
  | "neutral";

export interface AdminStatusPillProps {
  status: string;
  variant?: AdminStatusVariant;
  className?: string;
}

export function resolveStatusVariant(status: string): AdminStatusVariant {
  const normalized = status.toLowerCase();
  if (
    normalized === "verified" ||
    normalized === "completed" ||
    normalized === "released" ||
    normalized === "settled" ||
    normalized === "active"
  ) {
    return "success";
  }
  if (
    normalized === "accepted" ||
    normalized === "in_progress" ||
    normalized === "escrowed"
  ) {
    return "active";
  }
  if (
    normalized === "pending" ||
    normalized === "held" ||
    normalized === "initialized" ||
    normalized === "unpaid"
  ) {
    return "warning";
  }
  if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "disputed" ||
    normalized === "failed" ||
    normalized === "hidden"
  ) {
    return "danger";
  }
  return "neutral";
}

const variantClasses: Record<AdminStatusVariant, string> = {
  success:
    "bg-surface-porcelain text-brand-950 border-2 border-accent-success shadow-gloss-card",
  active: "cta-surface-primary text-ink-on-blue",
  warning:
    "bg-surface-porcelain text-brand-950 border-2 border-accent-gold shadow-gloss-card",
  danger:
    "bg-surface-mist text-accent-warm-deep border-2 border-accent-warm",
  neutral:
    "bg-brand-50 text-brand-700 border-2 border-brand-200",
};

/**
 * 100% Tokenized Semantic Status Pill for KYC, Dispatch, and Escrow States
 */
export function AdminStatusPill({
  status,
  variant,
  className,
}: AdminStatusPillProps) {
  const resolved = variant ?? resolveStatusVariant(status);
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-display text-[11px] font-extrabold capitalize tracking-wide whitespace-nowrap select-none",
        variantClasses[resolved],
        className
      )}
    >
      {resolved === "success" && (
        <CheckCircle2
          className="h-3 w-3 shrink-0 text-accent-success"
          aria-hidden="true"
        />
      )}
      {resolved === "active" && (
        <Sparkles
          className="h-3 w-3 shrink-0 text-accent-gold"
          aria-hidden="true"
        />
      )}
      {resolved === "warning" && (
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          {status.toLowerCase() === "held" ? (
            <Lock className="h-3 w-3 shrink-0 text-accent-gold" />
          ) : (
            <Clock className="h-3 w-3 shrink-0 text-accent-gold" />
          )}
        </span>
      )}
      {resolved === "danger" && (
        <ShieldAlert
          className="h-3 w-3 shrink-0 text-accent-warm"
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}

