"use client";

import * as React from "react";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  tone?: "on-blue" | "on-light";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standalone 3D Glossy Brand Squircle Mark (matches the favicon `src/app/icon.svg`)
 */
export function BrandLogoMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const uid = React.useId().replace(/:/g, "");
  const gradId = `skilled4uBrandGrad-${uid}`;
  const sheenId = `skilled4uSheen-${uid}`;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105",
        size === "lg"
          ? "h-12 w-12"
          : size === "sm"
            ? "h-9 w-9"
            : "h-11 w-11",
        className
      )}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className="h-full w-full overflow-visible drop-shadow-md"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="30"
            y1="4"
            x2="30"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={tokens.colors.brand[400]} />
            <stop offset="48%" stopColor={tokens.colors.brand[600]} />
            <stop offset="100%" stopColor={tokens.colors.brand[700]} />
          </linearGradient>
          <linearGradient
            id={sheenId}
            x1="8"
            y1="6"
            x2="52"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={tokens.colors.surface.porcelain}
              stopOpacity="0.42"
            />
            <stop
              offset="100%"
              stopColor={tokens.colors.surface.porcelain}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Main Glossy Brand Squircle */}
        <rect
          x="4"
          y="4"
          width="52"
          height="52"
          rx="15"
          fill={`url(#${gradId})`}
          stroke={tokens.colors.surface.porcelain}
          strokeWidth="2.5"
        />

        {/* Top Specular Gloss Highlight */}
        <path
          d="M19 6.5H41C47.9036 6.5 53.5 12.0964 53.5 19V22C42 26 20 26 6.5 22V19C6.5 12.0964 12.0964 6.5 19 6.5Z"
          fill={`url(#${sheenId})`}
        />

        {/* Centered Wrench Icon (24x24 scaled 1.25x around 30,30) */}
        <g transform="translate(15, 15) scale(1.25)">
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            stroke={tokens.colors.surface.porcelain}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Signature Sky-Blue Status Badge Dot */}
        <circle
          cx="51"
          cy="51"
          r="7.5"
          fill={tokens.colors.accent.sky}
          stroke={tokens.colors.surface.porcelain}
          strokeWidth="3"
        />
      </svg>
    </span>
  );
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
      <BrandLogoMark size={size} />
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

