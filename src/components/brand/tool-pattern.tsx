import * as React from "react";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface ToolPatternProps {
  tone?: "on-blue" | "on-light";
  className?: string;
}

/**
 * Repeating Artisan Craftsmanship Watermark (Replaces Eatly's flame pattern with
 * sculptural wrench/spark/droplet curves, kept strictly at low opacity so text is never buried).
 */
export function ToolPattern({
  tone = "on-blue",
  className,
}: ToolPatternProps) {
  const patternId = React.useId();
  const strokeColor =
    tone === "on-blue"
      ? tokens.colors.surface.porcelain
      : tokens.colors.brand[500];
  const fillOpacity = tone === "on-blue" ? 0.065 : 0.055;

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full select-none",
        className
      )}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="220"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          {/* Sculptural S-curve ribbon (inspired by Eatly's flowing background shapes) */}
          <path
            d="M48 185 C 22 140, 28 85, 68 48 C 46 95, 58 140, 48 185 Z"
            fill={strokeColor}
            fillOpacity={fillOpacity}
          />
          <path
            d="M72 195 C 48 152, 54 102, 92 64 C 72 110, 82 152, 72 195 Z"
            fill={strokeColor}
            fillOpacity={fillOpacity * 0.85}
          />
          {/* Second offset pair */}
          <path
            d="M158 165 C 132 120, 138 65, 178 28 C 156 75, 168 120, 158 165 Z"
            fill={strokeColor}
            fillOpacity={fillOpacity}
          />
          <path
            d="M182 175 C 158 132, 164 82, 202 44 C 182 90, 192 132, 182 175 Z"
            fill={strokeColor}
            fillOpacity={fillOpacity * 0.85}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

