"use client";

import * as React from "react";
import { Wrench } from "lucide-react";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  tone?: "on-blue" | "on-light";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogo({
  tone = "on-blue",
  size = "md",
  className,
}: BrandLogoProps) {
  const isOnBlue = tone === "on-blue";

  return (
    <div
      className={cn(
        "inline-flex items-center select-none",
        size === "sm" ? "gap-2.5" : "gap-3",
        className
      )}
    >
      <span
        className={cn(
          "relative grid place-items-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-105",
          size === "lg"
            ? "h-12 w-12"
            : size === "sm"
              ? "h-9 w-9 rounded-xl"
              : "h-11 w-11",
          isOnBlue
            ? "bg-surface-porcelain text-brand-600 border-surface-porcelain shadow-gloss-card"
            : "cta-surface-primary text-ink-on-blue"
        )}
      >
        <Wrench
          className={cn(
            size === "lg"
              ? "h-6 w-6"
              : size === "sm"
                ? "h-4 w-4"
                : "h-5 w-5"
          )}
        />
        <span
          className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-surface-porcelain bg-accent-sky"
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          size === "lg"
            ? "text-3xl"
            : size === "sm"
              ? "text-xl"
              : "text-2xl",
          isOnBlue ? "text-ink-on-blue" : "text-brand-950"
        )}
      >
        skilled
        <span className={isOnBlue ? "text-accent-sky" : "text-brand-600"}>
          4U
        </span>
      </span>
    </div>
  );
}

/**
 * Giant Eatly-inspired Footer Wordmark with Offset Outline Layers & Glossy Fade
 */
export function GiantWordmark({
  text = "skilled4U",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full select-none overflow-hidden pt-8 pb-2",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 260"
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={text}
      >
        <defs>
          <linearGradient id="wordmarkGlossFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tokens.colors.surface.porcelain} stopOpacity="0.98" />
            <stop offset="58%" stopColor={tokens.colors.brand[100]} stopOpacity="0.88" />
            <stop offset="100%" stopColor={tokens.colors.brand[400]} stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Offset Outline Layer 1 (Sky Blue) */}
        <text
          x="48%"
          y="210"
          textAnchor="middle"
          fill="none"
          stroke={tokens.colors.accent.sky}
          strokeWidth="2.5"
          opacity="0.65"
          transform="translate(-14, -10)"
          className="font-display font-extrabold text-[215px] tracking-tighter"
        >
          {text}
        </text>

        {/* Offset Outline Layer 2 (Gold Accent) */}
        <text
          x="50%"
          y="210"
          textAnchor="middle"
          fill="none"
          stroke={tokens.colors.accent.gold}
          strokeWidth="2"
          opacity="0.55"
          transform="translate(12, 8)"
          className="font-display font-extrabold text-[215px] tracking-tighter"
        >
          {text}
        </text>

        {/* Main Glossy White-to-Blue Gradient Wordmark */}
        <text
          x="50%"
          y="210"
          textAnchor="middle"
          fill="url(#wordmarkGlossFill)"
          className="font-display font-extrabold text-[215px] tracking-tighter"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

