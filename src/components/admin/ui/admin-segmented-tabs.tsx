"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AdminTabOption<T extends string = string> {
  readonly id: T;
  readonly label: string;
  readonly count?: number;
}

export interface AdminSegmentedTabsProps<T extends string = string> {
  options: ReadonlyArray<AdminTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  layoutId: string;
  className?: string;
}

/**
 * Reusable Dark-Ink Segmented Pill Switcher
 * Modeled after GoodStuffCatalogSection & FaqsCatalogSection with Framer Motion layoutId.
 */
export function AdminSegmentedTabs<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  layoutId,
  className,
}: AdminSegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "surface-slab-ink inline-flex flex-wrap items-center gap-1 rounded-2xl sm:rounded-pill border-2 border-brand-700/80 p-1 shadow-gloss-float",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative isolate inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 sm:px-4 sm:py-2 font-display text-xs font-extrabold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
              isActive
                ? "text-ink-on-blue"
                : "text-ink-on-blue-muted hover:text-ink-on-blue"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={motionTokens.spring.snappy}
                className="cta-surface-primary absolute inset-0 -z-10 rounded-pill"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 capitalize">{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "relative z-10 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-pill px-1.5 font-display text-[10px] font-extrabold",
                  isActive
                    ? "bg-brand-950/60 text-accent-gold"
                    : "bg-brand-900 text-accent-sky"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

