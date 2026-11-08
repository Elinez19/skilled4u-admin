import * as React from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillBadgeProps {
  children: React.ReactNode;
  tone?: "porcelain" | "blue" | "sky";
  icon?: "pin" | "shield" | "dot" | "none";
  className?: string;
}

export function PillBadge({
  children,
  tone = "porcelain",
  icon = "none",
  className,
}: PillBadgeProps) {
  const toneClasses = {
    porcelain:
      "bg-surface-porcelain text-brand-700 border-2 border-brand-100 shadow-gloss-card",
    blue: "cta-surface-primary text-ink-on-blue",
    sky: "bg-brand-50 text-brand-700 border-2 border-brand-200",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-5 py-2 text-xs sm:text-sm font-display font-extrabold tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {icon === "dot" && (
        <span
          className="h-2.5 w-2.5 rounded-pill bg-accent-success animate-pulse"
          aria-hidden="true"
        />
      )}
      {icon === "pin" && (
        <MapPin className="h-4 w-4 text-brand-600 shrink-0" aria-hidden="true" />
      )}
      {icon === "shield" && (
        <ShieldCheck
          className="h-4 w-4 text-brand-600 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}

