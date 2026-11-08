"use client";

import * as React from "react";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";
import { type SlabTone } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface SectionSlabProps {
  id?: string;
  tone?: SlabTone;
  withPattern?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}

const slabToneClasses: Record<SlabTone, string> = {
  blue: "surface-slab-blue rounded-slab",
  ink: "surface-slab-ink rounded-slab",
  pearl: "surface-slab-pearl rounded-slab border-2 border-surface-frost",
};

/**
 * Full-bleed Eatly-style Rounded Inset Slab Container
 * Guarantees high visual hierarchy and never buries text in background patterns.
 */
export function SectionSlab({
  id,
  tone = "pearl",
  withPattern = true,
  className,
  innerClassName,
  children,
}: SectionSlabProps) {
  return (
    <div id={id} className={cn("px-3 sm:px-5 lg:px-7 py-3 sm:py-4", className)}>
      <ScaleSlab
        className={cn(
          "relative mx-auto max-w-[1400px] overflow-hidden",
          slabToneClasses[tone]
        )}
      >
        {withPattern && (
          <ToolPattern tone={tone === "pearl" ? "on-light" : "on-blue"} />
        )}
        <div
          className={cn(
            "relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 sm:py-24",
            innerClassName
          )}
        >
          {children}
        </div>
      </ScaleSlab>
    </div>
  );
}

export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  headline: string;
  highlightWords?: string[];
  subtitle?: string;
  tone?: "on-blue" | "on-light";
  underlineLastWord?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  headline,
  highlightWords,
  subtitle,
  tone = "on-light",
  underlineLastWord = false,
  className,
}: SectionHeaderProps) {
  const isOnBlue = tone === "on-blue";

  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {eyebrow && <Reveal className="mb-5">{eyebrow}</Reveal>}

      <AnimatedText
        as="h2"
        text={headline}
        highlightWords={highlightWords}
        highlightClassName={isOnBlue ? "text-accent-sky" : "text-brand-600"}
        underlineLastWord={underlineLastWord}
        className={cn(
          "text-4xl sm:text-6xl lg:text-[64px] font-extrabold leading-[0.98] tracking-tight",
          isOnBlue ? "text-ink-on-blue" : "text-brand-950"
        )}
      />

      {subtitle && (
        <Reveal delay={0.14}>
          <p
            className={cn(
              "mx-auto mt-5 max-w-2xl text-base sm:text-xl font-medium leading-relaxed",
              isOnBlue ? "text-ink-on-blue-muted" : "text-ink-secondary"
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

