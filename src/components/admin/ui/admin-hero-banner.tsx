"use client";

import * as React from "react";
import Image from "next/image";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";
import { type SlabTone } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface AdminHeroCtaConfig {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  trailingArrow?: boolean;
}

export interface AdminHeroBannerProps {
  eyebrow: string;
  eyebrowIcon?: "dot" | "shield" | "pin" | "none";
  headline: string;
  highlightWords?: readonly string[];
  subtitle: string;
  tone?: "blue" | "ink";
  primaryCta?: AdminHeroCtaConfig;
  secondaryCta?: AdminHeroCtaConfig;
  rightSlot?: React.ReactNode;
}

/**
 * Reusable Top Hero Slab for Admin Pages
 * Layers `/images/landing/hero-bg.jpg` with `.contrast-halo-blue` and `ToolPattern`
 * so typography and custom CTAs pop with maximum contrast inside the sidebar layout.
 */
export function AdminHeroBanner({
  eyebrow,
  eyebrowIcon = "shield",
  headline,
  highlightWords,
  subtitle,
  tone = "blue",
  primaryCta,
  secondaryCta,
  rightSlot,
}: AdminHeroBannerProps) {
  return (
    <ScaleSlab
      className={cn(
        "relative w-full overflow-hidden rounded-slab",
        tone === "blue" ? "surface-slab-blue" : "surface-slab-ink"
      )}
    >
      {/* Custom 3D Glossy Porcelain & Cobalt Background Asset */}
      <div className="pointer-events-none absolute inset-0 select-none opacity-55">
        <Image
          src="/images/landing/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="1400px"
          className="object-cover object-center"
        />
      </div>

      {/* High-Contrast Protective Halo so Text is Never Buried */}
      <div
        className="contrast-halo-blue pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <ToolPattern tone="on-blue" />

      <div className="relative z-10 px-5 sm:px-7 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="max-w-2xl text-left">
            <Reveal>
              <PillBadge
                tone="porcelain"
                icon={eyebrowIcon}
                className="px-3 py-1 text-[11px] sm:text-xs"
              >
                {eyebrow}
              </PillBadge>
            </Reveal>

            <div className="mt-2.5">
              <AnimatedText
                as="h1"
                text={headline}
                highlightWords={highlightWords}
                highlightClassName="text-accent-sky"
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-[1.04] tracking-tight text-ink-on-blue drop-shadow-sm"
              />
            </div>

            <Reveal delay={0.14}>
              <p className="mt-2 max-w-xl text-xs sm:text-[13px] font-semibold leading-relaxed text-ink-on-blue-muted">
                {subtitle}
              </p>
            </Reveal>

            {(primaryCta || secondaryCta) && (
              <Reveal
                delay={0.22}
                className="mt-4 flex flex-wrap items-center gap-2.5"
              >
                {primaryCta && (
                  <CtaButton
                    variant={primaryCta.variant ?? "primary"}
                    size="sm"
                    href={primaryCta.href}
                    onClick={primaryCta.onClick}
                    trailingArrow={primaryCta.trailingArrow}
                  >
                    {primaryCta.icon}
                    <span>{primaryCta.label}</span>
                  </CtaButton>
                )}
                {secondaryCta && (
                  <CtaButton
                    variant={secondaryCta.variant ?? "secondary"}
                    size="sm"
                    href={secondaryCta.href}
                    onClick={secondaryCta.onClick}
                    trailingArrow={secondaryCta.trailingArrow}
                  >
                    {secondaryCta.icon}
                    <span>{secondaryCta.label}</span>
                  </CtaButton>
                )}
              </Reveal>
            )}
          </div>

          {rightSlot && (
            <Reveal delay={0.18} className="shrink-0">
              {rightSlot}
            </Reveal>
          )}
        </div>
      </div>
    </ScaleSlab>
  );
}

export interface AdminWorkspaceSlabProps {
  id?: string;
  tone?: SlabTone;
  withPearlAsset?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}

/**
 * Reusable Workspace Slab Container for Admin Views
 * Pairs `.surface-slab-pearl` with `/images/landing/pearl-bg.jpg`, `.contrast-halo-pearl`,
 * and `ToolPattern` for consistent depth across every admin workspace.
 */
export function AdminWorkspaceSlab({
  id,
  tone = "pearl",
  withPearlAsset = true,
  className,
  innerClassName,
  children,
}: AdminWorkspaceSlabProps) {
  const slabClasses: Record<SlabTone, string> = {
    blue: "surface-slab-blue rounded-slab",
    ink: "surface-slab-ink rounded-slab",
    pearl: "surface-slab-pearl rounded-slab border-2 border-surface-frost",
  };

  return (
    <section id={id} className={cn("w-full", className)}>
      <ScaleSlab
        className={cn("relative w-full overflow-hidden", slabClasses[tone])}
      >
        {tone === "pearl" && withPearlAsset && (
          <>
            <div className="pointer-events-none absolute inset-0 select-none opacity-35">
              <Image
                src="/images/landing/pearl-bg.jpg"
                alt=""
                fill
                sizes="1400px"
                className="object-cover object-center"
              />
            </div>
            <div
              className="contrast-halo-pearl pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
          </>
        )}

        <ToolPattern tone={tone === "pearl" ? "on-light" : "on-blue"} />

        <div
          className={cn(
            "relative z-10 px-4 sm:px-5 lg:px-6 py-5 sm:py-6",
            innerClassName
          )}
        >
          {children}
        </div>
      </ScaleSlab>
    </section>
  );
}
