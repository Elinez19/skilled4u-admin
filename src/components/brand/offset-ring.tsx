"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface OffsetRingProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  faceTone?: "ink" | "blue" | "porcelain";
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

const sizeClasses = {
  xs: "h-9 w-9 text-xs",
  sm: "h-11 w-11 text-xs",
  md: "h-16 w-16 text-sm",
  lg: "h-28 w-28 text-lg sm:h-32 sm:w-32 sm:text-xl",
  xl: "h-36 w-36 text-xl sm:h-40 sm:w-40 sm:text-2xl",
} as const;

const faceClasses = {
  ink: "bg-brand-950 text-ink-on-blue border-2 border-brand-700",
  blue: "cta-surface-primary text-ink-on-blue",
  porcelain: "bg-surface-porcelain text-brand-700 border-2 border-brand-200",
} as const;

/**
 * Signature Eatly-inspired Offset Crescent Circle Motif
 * Renders two vibrant offset crescents (Electric Sky + Gold/Blue) behind a circular badge.
 */
export function OffsetRing({
  children,
  size = "lg",
  faceTone = "ink",
  className,
  interactive = false,
  onClick,
  ariaLabel,
}: OffsetRingProps) {
  const Component = interactive ? motion.button : motion.div;

  return (
    <Component
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={interactive ? { scale: 1.07, y: -3 } : { scale: 1.04 }}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      transition={motionTokens.spring.snappy}
      className={cn(
        "relative isolate inline-grid place-items-center rounded-pill font-display font-extrabold tracking-tight select-none",
        interactive && "cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {/* Outer Offset Crescent (Gold / Sky) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 translate-x-[-10%] translate-y-[12%] rounded-pill bg-accent-gold"
      />
      {/* Middle Offset Crescent (Electric Sky / Blue) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 translate-x-[-5%] translate-y-[6%] rounded-pill bg-accent-sky"
      />
      {/* Main Front Disc */}
      <span
        className={cn(
          "grid h-full w-full place-items-center rounded-pill text-center shadow-gloss-float",
          size === "xs" || size === "sm" ? "px-1.5" : "px-3",
          faceClasses[faceTone]
        )}
      >
        {children}
      </span>
    </Component>
  );
}

