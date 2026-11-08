"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { OffsetRing } from "@/components/brand/offset-ring";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { CountUp } from "@/components/motion/count-up";
import { cardHoverMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AdminKpiCardProps {
  label: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  badgeText: string;
  badgeTone?: "porcelain" | "blue" | "sky";
  badgeIcon?: "dot" | "shield" | "pin" | "none";
  icon: React.ReactNode;
  ringTone?: "ink" | "blue" | "porcelain";
  tone?: "gloss" | "ink";
  className?: string;
}

/**
 * Reusable Glossy 3D Admin KPI Card
 * Combines `surface-gloss-card` or `surface-slab-ink` with `OffsetRing`,
 * `PillBadge`, and `cardHoverMotion`.
 */
export function AdminKpiCard({
  label,
  value,
  numericValue,
  prefix = "",
  suffix = "",
  badgeText,
  badgeTone = "sky",
  badgeIcon = "none",
  icon,
  ringTone = "ink",
  tone = "gloss",
  className,
}: AdminKpiCardProps) {
  const isInk = tone === "ink";

  return (
    <motion.article
      variants={cardHoverMotion}
      initial="rest"
      whileHover="hover"
      className={cn(
        "relative flex h-full min-w-0 flex-col justify-between overflow-hidden p-4 sm:p-4.5",
        isInk
          ? "surface-slab-ink rounded-card border-2 border-brand-700"
          : "surface-gloss-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "font-display text-xs font-extrabold tracking-tight leading-snug",
              isInk ? "text-ink-on-blue-muted" : "text-ink-secondary"
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              "font-display text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight leading-tight break-words",
              isInk ? "text-ink-on-blue" : "text-brand-950"
            )}
          >
            {typeof numericValue === "number" ? (
              <CountUp to={numericValue} prefix={prefix} suffix={suffix} />
            ) : (
              value
            )}
          </div>
        </div>

        <OffsetRing size="xs" faceTone={ringTone} className="shrink-0">
          {icon}
        </OffsetRing>
      </div>

      <div
        className={cn(
          "mt-3.5 pt-2.5 border-t flex items-center justify-between gap-2 min-w-0",
          isInk ? "border-brand-800" : "border-surface-frost"
        )}
      >
        <PillBadge
          tone={badgeTone}
          icon={badgeIcon}
          className="px-2.5 py-1 text-[11px] max-w-full truncate"
        >
          {badgeText}
        </PillBadge>
      </div>
    </motion.article>
  );
}

