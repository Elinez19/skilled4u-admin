"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Headset, LayoutGrid, Store, Wrench } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { AnimatedText } from "@/components/motion/animated-text";
import { Float } from "@/components/motion/float";
import { Reveal, ScaleSlab, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  type HowItWorksPerkItem,
  type HowItWorksStepItem,
  landingContent,
} from "@/content/landing";
import { cardHoverMotion } from "@/lib/motion";
import { tokens } from "@/lib/tokens";

/**
 * 100% Tokenized Storefront / Workshop Building Illustration for the Artisan Hero Slab
 * Matches the Eatly Vendors hero storefront composition using Skilled4U design tokens.
 */
function ArtisanStorefrontIllustration() {
  return (
    <div className="relative mx-auto mt-2 flex max-w-xl flex-col items-center select-none">
      {/* Center Roofline Emblem Badge Overlapping Between the Two CTA Buttons */}
      <div className="relative z-20 -mb-7">
        <Float amplitude={5} duration={4.6}>
          <OffsetRing size="md" faceTone="ink">
            <Wrench className="h-7 w-7 text-accent-gold" />
          </OffsetRing>
        </Float>
      </div>

      {/* Storefront Building SVG */}
      <svg
        viewBox="0 0 560 270"
        fill="none"
        className="w-full max-w-lg h-auto overflow-visible drop-shadow-2xl"
        aria-hidden="true"
      >
        {/* Top Roof Cornice Bar */}
        <rect
          x="84"
          y="10"
          width="392"
          height="32"
          rx="10"
          fill={tokens.colors.brand[800]}
          stroke={tokens.colors.brand[400]}
          strokeWidth="2.5"
        />
        {/* Corner Accent Lights on Cornice */}
        <circle cx="104" cy="26" r="5" fill={tokens.colors.accent.gold} />
        <circle cx="456" cy="26" r="5" fill={tokens.colors.accent.gold} />

        {/* Striped Awning Slanted Canopy (7 Alternating Panels) */}
        {/* Panel 1 (Left Outer - Brand Blue) */}
        <path
          d="M84 38 L140 38 L124 102 L56 102 Z"
          fill={tokens.colors.brand[600]}
        />
        {/* Panel 2 (Gold) */}
        <path
          d="M140 38 L196 38 L186 102 L124 102 Z"
          fill={tokens.colors.accent.gold}
        />
        {/* Panel 3 (Porcelain) */}
        <path
          d="M196 38 L252 38 L248 102 L186 102 Z"
          fill={tokens.colors.surface.porcelain}
        />
        {/* Panel 4 (Center - Brand Blue) */}
        <path
          d="M252 38 L308 38 L312 102 L248 102 Z"
          fill={tokens.colors.brand[500]}
        />
        {/* Panel 5 (Porcelain) */}
        <path
          d="M308 38 L364 38 L374 102 L312 102 Z"
          fill={tokens.colors.surface.porcelain}
        />
        {/* Panel 6 (Gold) */}
        <path
          d="M364 38 L420 38 L436 102 L374 102 Z"
          fill={tokens.colors.accent.gold}
        />
        {/* Panel 7 (Right Outer - Brand Blue) */}
        <path
          d="M420 38 L476 38 L504 102 L436 102 Z"
          fill={tokens.colors.brand[600]}
        />

        {/* Awning Scalloped Valance Tabs Along Bottom of Canopy */}
        <path
          d="M56 102 H124 V112 C124 126 56 126 56 112 Z"
          fill={tokens.colors.brand[800]}
        />
        <path
          d="M124 102 H186 V112 C186 126 124 126 124 112 Z"
          fill={tokens.colors.accent.warm}
        />
        <path
          d="M186 102 H248 V112 C248 126 186 126 186 112 Z"
          fill={tokens.colors.brand[200]}
        />
        <path
          d="M248 102 H312 V112 C312 126 248 126 248 112 Z"
          fill={tokens.colors.brand[700]}
        />
        <path
          d="M312 102 H374 V112 C374 126 312 126 312 112 Z"
          fill={tokens.colors.brand[200]}
        />
        <path
          d="M374 102 H436 V112 C436 126 374 126 374 112 Z"
          fill={tokens.colors.accent.warm}
        />
        <path
          d="M436 102 H504 V112 C504 126 436 126 436 112 Z"
          fill={tokens.colors.brand[800]}
        />

        {/* Main Workshop Facade Wall */}
        <rect
          x="82"
          y="112"
          width="396"
          height="148"
          fill={tokens.colors.surface.pearl}
          stroke={tokens.colors.brand[200]}
          strokeWidth="3"
        />

        {/* Awning Cast Shadow on Facade */}
        <rect
          x="84"
          y="112"
          width="392"
          height="16"
          fill={tokens.colors.brand[900]}
          fillOpacity="0.16"
        />

        {/* Left Double Entrance Door Frame */}
        <rect
          x="126"
          y="144"
          width="116"
          height="116"
          rx="6"
          fill={tokens.colors.brand[600]}
          stroke={tokens.colors.brand[800]}
          strokeWidth="3"
        />
        {/* Left Door Glass Pane */}
        <rect
          x="134"
          y="152"
          width="46"
          height="104"
          rx="3"
          fill={tokens.colors.brand[950]}
        />
        {/* Right Door Glass Pane */}
        <rect
          x="188"
          y="152"
          width="46"
          height="104"
          rx="3"
          fill={tokens.colors.brand[950]}
        />
        {/* Gold Door Handles */}
        <rect
          x="173"
          y="196"
          width="4"
          height="18"
          rx="2"
          fill={tokens.colors.accent.gold}
        />
        <rect
          x="191"
          y="196"
          width="4"
          height="18"
          rx="2"
          fill={tokens.colors.accent.gold}
        />

        {/* Right Workshop Display Window */}
        <rect
          x="278"
          y="144"
          width="154"
          height="92"
          rx="6"
          fill={tokens.colors.brand[950]}
          stroke={tokens.colors.brand[600]}
          strokeWidth="4"
        />
        {/* Window Center Vertical Divider */}
        <line
          x1="355"
          y1="146"
          x2="355"
          y2="234"
          stroke={tokens.colors.surface.porcelain}
          strokeWidth="3"
        />
        {/* Window Specular Reflection Streaks */}
        <path
          d="M296 220 L324 160 M312 220 L334 174"
          stroke={tokens.colors.accent.sky}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M376 220 L404 160"
          stroke={tokens.colors.accent.sky}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        {/* Window Sill */}
        <rect
          x="270"
          y="234"
          width="170"
          height="8"
          rx="4"
          fill={tokens.colors.brand[300]}
        />

        {/* Ground Base Plinth */}
        <rect
          x="52"
          y="258"
          width="456"
          height="12"
          rx="6"
          fill={tokens.colors.brand[700]}
        />
      </svg>
    </div>
  );
}

/**
 * Step Card Tokenized SVG Illustrations ("store", "dispatch", "orders")
 */
function StepIllustration({
  type,
}: {
  type: HowItWorksStepItem["illustrationType"];
}) {
  if (type === "store") {
    return (
      <svg
        viewBox="0 0 140 140"
        fill="none"
        className="h-28 w-28 overflow-visible"
        aria-hidden="true"
      >
        {/* Floating Storefront Menu / Profile Board */}
        <rect
          x="58"
          y="20"
          width="62"
          height="82"
          rx="10"
          fill={tokens.colors.surface.porcelain}
          stroke={tokens.colors.brand[300]}
          strokeWidth="2.5"
        />
        <rect
          x="66"
          y="30"
          width="46"
          height="10"
          rx="4"
          fill={tokens.colors.brand[600]}
        />
        {/* Checklist rows on board */}
        <circle cx="72" cy="52" r="4" fill={tokens.colors.accent.gold} />
        <rect
          x="80"
          y="49"
          width="30"
          height="6"
          rx="3"
          fill={tokens.colors.brand[200]}
        />
        <circle cx="72" cy="68" r="4" fill={tokens.colors.accent.sky} />
        <rect
          x="80"
          y="65"
          width="26"
          height="6"
          rx="3"
          fill={tokens.colors.brand[200]}
        />
        <circle cx="72" cy="84" r="4" fill={tokens.colors.accent.success} />
        <rect
          x="80"
          y="81"
          width="32"
          height="6"
          rx="3"
          fill={tokens.colors.brand[200]}
        />

        {/* Artisan Character Setting Up Profile */}
        <circle cx="42" cy="56" r="14" fill={tokens.colors.accent.warmDark} />
        {/* Hair / Cap */}
        <path
          d="M28 54 C28 42 56 42 56 54 Z"
          fill={tokens.colors.brand[950]}
        />
        {/* Torso in Brand Shirt */}
        <path
          d="M20 116 C20 88 30 76 44 76 C56 76 64 86 66 116 Z"
          fill={tokens.colors.brand[600]}
        />
        {/* Reaching Arm */}
        <path
          d="M52 86 L74 68"
          stroke={tokens.colors.accent.warmDark}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "dispatch") {
    return (
      <svg
        viewBox="0 0 160 130"
        fill="none"
        className="h-28 w-32 overflow-visible"
        aria-hidden="true"
      >
        {/* Dispatch Box with Skilled4U Gold Emblem */}
        <rect
          x="22"
          y="38"
          width="42"
          height="36"
          rx="8"
          fill={tokens.colors.brand[600]}
          stroke={tokens.colors.surface.porcelain}
          strokeWidth="2.5"
        />
        <circle cx="43" cy="56" r="8" fill={tokens.colors.accent.gold} />
        {/* Scooter Body */}
        <path
          d="M34 76 H104 L118 44 H130 L140 90 H38 C30 90 28 80 34 76 Z"
          fill={tokens.colors.brand[600]}
          stroke={tokens.colors.surface.porcelain}
          strokeWidth="2.5"
        />
        {/* Seat */}
        <path
          d="M62 62 H96 C100 62 102 68 98 74 H62 Z"
          fill={tokens.colors.brand[950]}
        />
        {/* Wheels */}
        <circle cx="48" cy="96" r="16" fill={tokens.colors.brand[950]} />
        <circle cx="48" cy="96" r="7" fill={tokens.colors.brand[200]} />
        <circle cx="128" cy="96" r="16" fill={tokens.colors.brand[950]} />
        <circle cx="128" cy="96" r="7" fill={tokens.colors.brand[200]} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className="h-28 w-28 overflow-visible"
      aria-hidden="true"
    >
      {/* Clipboard Backing */}
      <rect
        x="32"
        y="24"
        width="68"
        height="92"
        rx="12"
        fill={tokens.colors.surface.porcelain}
        stroke={tokens.colors.brand[600]}
        strokeWidth="4"
      />
      {/* Top Clipboard Clip */}
      <rect
        x="52"
        y="16"
        width="28"
        height="14"
        rx="5"
        fill={tokens.colors.brand[700]}
      />
      {/* Star / Order Header Icon */}
      <circle cx="66" cy="48" r="11" fill={tokens.colors.brand[600]} />
      <path
        d="M61 48 L65 52 L72 44"
        stroke={tokens.colors.surface.porcelain}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checklist Lines */}
      <circle cx="48" cy="74" r="4" fill={tokens.colors.accent.gold} />
      <rect
        x="58"
        y="71"
        width="28"
        height="6"
        rx="3"
        fill={tokens.colors.brand[200]}
      />
      <circle cx="48" cy="90" r="4" fill={tokens.colors.accent.gold} />
      <rect
        x="58"
        y="87"
        width="24"
        height="6"
        rx="3"
        fill={tokens.colors.brand[200]}
      />
      {/* Angled Gold Pencil */}
      <g transform="rotate(28 102 82)">
        <rect
          x="96"
          y="50"
          width="12"
          height="52"
          rx="4"
          fill={tokens.colors.accent.gold}
          stroke={tokens.colors.brand[950]}
          strokeWidth="2"
        />
        <path d="M96 102 L102 114 L108 102 Z" fill={tokens.colors.brand[950]} />
      </g>
    </svg>
  );
}

function PerkIcon({ type }: { type: HowItWorksPerkItem["iconType"] }) {
  if (type === "onboarding") {
    return <Store className="h-5 w-5 text-brand-600" aria-hidden="true" />;
  }
  if (type === "dashboard") {
    return <LayoutGrid className="h-5 w-5 text-brand-600" aria-hidden="true" />;
  }
  return <Headset className="h-5 w-5 text-brand-600" aria-hidden="true" />;
}

/**
 * Section 1 (Artisans Page): Dark Ink Hero Slab ("Great Skill Deserves A Crowd.")
 * With 2 Consistent CTA Buttons + Storefront Workshop Building at Bottom Center.
 */
export function ArtisanHeroSection() {
  const { hero } = landingContent.artisanPage;

  return (
    <div id="top" className="px-3 sm:px-5 lg:px-7 pt-3 pb-4">
      <ScaleSlab className="surface-slab-ink relative mx-auto max-w-slab overflow-hidden rounded-slab">
        <ToolPattern tone="on-blue" />

        {/* Center Hero Typography & CTA Pair */}
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-14 sm:pt-20 pb-0 text-center">
          <div className="space-y-1">
            <AnimatedText
              as="h1"
              text={hero.headlineLine1}
              className="text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-none text-ink-on-blue drop-shadow-sm"
            />
            <AnimatedText
              as="h2"
              text={hero.headlineLine2}
              delay={0.14}
              highlightWords={["Crowd."]}
              highlightClassName="text-accent-sky"
              underlineLastWord
              className="text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-none text-ink-on-blue drop-shadow-sm"
            />
          </div>

          <Reveal delay={0.24}>
            <p className="mx-auto mt-6 max-w-xl text-lg sm:text-xl font-semibold leading-relaxed text-ink-on-blue-muted">
              {hero.subtitle}
            </p>
          </Reveal>

          {/* Strictly 2 Consistent CTA Buttons */}
          <Reveal
            id="download"
            delay={0.32}
            className="relative z-20 mt-9 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <CtaButton
              variant="secondary"
              size="lg"
              leadingIcon="apple"
              href="#how-it-works"
            >
              {hero.primaryCta}
            </CtaButton>
            <CtaButton
              variant="primary"
              size="lg"
              leadingIcon="play"
              href="#how-it-works"
            >
              {hero.secondaryCta}
            </CtaButton>
          </Reveal>

          {/* Bottom-Anchored Workshop Storefront Illustration */}
          <Reveal delay={0.38} className="-mb-1">
            <ArtisanStorefrontIllustration />
          </Reveal>
        </div>
      </ScaleSlab>
    </div>
  );
}

/**
 * Section 2 (Artisans Page): "How It Works" (3 Numbered Step Cards + Perks Strip + CTA)
 */
export function HowItWorksSection() {
  const { howItWorks } = landingContent.artisanPage;

  return (
    <SectionSlab id="how-it-works" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={howItWorks.headline}
        highlightWords={["Works"]}
        subtitle={howItWorks.subtitle}
      />

      {/* 3 Step Cards Grid with Overlapping Top Number Pills & Dashed Connectors */}
      <div className="relative mt-16">
        {/* Desktop Curved Dashed Connector Arrows Between Step 01 -> 02 -> 03 */}
        <svg
          viewBox="0 0 1200 120"
          fill="none"
          className="pointer-events-none absolute top-1/2 left-0 z-0 hidden h-28 w-full -translate-y-1/2 lg:block"
          aria-hidden="true"
        >
          <path
            d="M350 70 Q 400 40, 450 70"
            stroke={tokens.colors.brand[300]}
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <path
            d="M750 70 Q 800 95, 850 70"
            stroke={tokens.colors.brand[300]}
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>

        <Stagger className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-9">
          {howItWorks.steps.map((step) => (
            <StaggerItem key={step.id} className="relative pt-6">
              <motion.article
                variants={cardHoverMotion}
                initial="rest"
                whileHover="hover"
                className="surface-gloss-card relative flex h-full flex-col items-center px-7 pt-12 pb-10 text-center"
              >
                {/* Overlapping Top Number Badge (01, 02, 03) */}
                <span className="absolute -top-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-pill border-2 border-brand-100 bg-surface-porcelain font-display text-lg font-extrabold text-brand-600 shadow-gloss-card">
                  {step.stepNumber}
                </span>

                {/* Circular Illustration Halo */}
                <div className="grid h-40 w-40 place-items-center rounded-pill border-2 border-brand-100 bg-surface-mist">
                  <StepIllustration type={step.illustrationType} />
                </div>

                {/* Step Title & Description */}
                <h3 className="mt-7 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-950">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-base font-medium leading-relaxed text-ink-secondary">
                  {step.description}
                </p>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* Horizontal Perks Strip ("Quick Onboarding · Easy Job Management · 24/7 Partner Support") */}
      <Reveal
        delay={0.18}
        className="mt-14 border-t border-surface-frost pt-10"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 sm:gap-14">
          {howItWorks.perks.map((perk) => (
            <div key={perk.id} className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-pill border-2 border-brand-100 bg-brand-50 shadow-gloss-card">
                <PerkIcon type={perk.iconType} />
              </span>
              <span className="font-display text-base sm:text-lg font-extrabold text-brand-950">
                {perk.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Bottom Centered Primary CTA Button ("Become a Partner ->") */}
      <Reveal delay={0.25} className="mt-10 text-center">
        <CtaButton
          variant="primary"
          size="lg"
          trailingArrow
          href={howItWorks.ctaHref}
        >
          {howItWorks.ctaLabel}
        </CtaButton>
      </Reveal>
    </SectionSlab>
  );
}

