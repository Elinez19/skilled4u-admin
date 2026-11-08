"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Sparkles, TrendingUp, Wrench } from "lucide-react";
import Image from "next/image";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  type AudienceItem,
  landingContent,
  type WhatsNewItem,
} from "@/content/landing";
import { cardHoverMotion } from "@/lib/motion";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * 100% Tokenized 3D-Styled Card Illustrations for "What's New" & "The Good Stuff"
 * Zero hardcoded hex values; strictly powered by Skilled4U design tokens.
 */
export function WhatsNewVisual({
  type,
}: {
  type: WhatsNewItem["visualType"];
}) {
  if (type === "reward") {
    return (
      <div className="relative flex h-56 sm:h-60 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 p-5 select-none">
        {/* Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-65"
          style={{ background: tokens.gradients.slabBlue }}
          aria-hidden="true"
        />

        {/* Floating 3D Embossed Gold Naira Coins */}
        <div className="relative z-10 flex w-full max-w-xs items-center justify-between px-2 -mt-6">
          {/* Top-Left Large Tilted Coin */}
          <div className="grid h-20 w-20 -rotate-12 place-items-center rounded-full border-4 border-surface-porcelain/80 bg-accent-gold shadow-gloss-float ring-4 ring-accent-warm">
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-accent-warm bg-accent-gold font-display text-3xl font-extrabold text-accent-warmDeep">
              ₦
            </div>
          </div>

          {/* Center Coin Behind Banner */}
          <div className="grid h-22 w-22 translate-y-3 place-items-center rounded-full border-4 border-surface-porcelain/90 bg-accent-gold shadow-gloss-float ring-4 ring-accent-warm">
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-accent-warm bg-accent-gold font-display text-3xl font-extrabold text-accent-warmDeep">
              ₦
            </div>
          </div>

          {/* Right Tilted Coin */}
          <div className="grid h-18 w-18 rotate-12 translate-y-1 place-items-center rounded-full border-4 border-surface-porcelain/80 bg-accent-gold shadow-gloss-float ring-4 ring-accent-warm">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-accent-warm bg-accent-gold font-display text-2xl font-extrabold text-accent-warmDeep">
              ₦
            </div>
          </div>
        </div>

        {/* Foreground Tilted Dark Glossy Notification Banner (1:1 Reference Match) */}
        <div className="relative z-20 -mt-5 w-full max-w-[290px] -rotate-6 rounded-2xl border-2 border-brand-400/50 bg-brand-950/95 px-4 py-3 shadow-gloss-float">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-600 bg-brand-900 text-accent-sky">
              <Clock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-gold" />
                <p className="truncate font-display text-xs sm:text-sm font-extrabold text-ink-on-blue">
                  First Booking Reward
                </p>
              </div>
              <p className="mt-0.5 truncate text-[11px] font-medium text-ink-on-blue-muted">
                ₦2,000 has been added to your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "phones") {
    return (
      <div className="relative flex h-56 sm:h-60 w-full items-end justify-center gap-3 overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 px-4 pt-6 select-none">
        {/* Ambient Radial Cobalt Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: tokens.gradients.slabBlue }}
          aria-hidden="true"
        />

        {/* Left Angled Smartphone Mockup (App Home Screen) */}
        <div className="relative z-10 h-48 w-36 sm:w-40 -rotate-8 translate-y-3 rounded-t-3xl border-4 border-brand-950 bg-surface-porcelain p-2.5 text-brand-950 shadow-gloss-float">
          {/* Dynamic Island Notch */}
          <div className="mx-auto h-2.5 w-12 rounded-pill bg-brand-950" />
          {/* Location Header */}
          <div className="mt-2 flex items-center justify-between text-[9px] font-display font-extrabold text-brand-700">
            <span>Wuse II, Abuja</span>
            <span className="rounded-pill bg-brand-100 px-1.5 py-0.5 text-[8px] text-brand-700">
              20m
            </span>
          </div>
          {/* Promo Banner Inside Phone */}
          <div className="cta-surface-primary mt-1.5 rounded-xl p-2 text-left">
            <span className="block font-display text-[8px] font-extrabold uppercase tracking-wider text-accent-gold">
              Promo Offer
            </span>
            <span className="mt-0.5 block font-display text-[10px] font-extrabold leading-tight text-ink-on-blue">
              20% Off Split AC &amp; Plumbing
            </span>
          </div>
          {/* 2x2 Mini Service Grid */}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-brand-100 bg-surface-pearl p-1.5">
              <div className="h-2 w-6 rounded-pill bg-brand-500" />
              <p className="mt-1 font-display text-[8px] font-extrabold text-brand-950">
                AC Fix
              </p>
            </div>
            <div className="rounded-lg border border-brand-100 bg-surface-pearl p-1.5">
              <div className="h-2 w-6 rounded-pill bg-accent-gold" />
              <p className="mt-1 font-display text-[8px] font-extrabold text-brand-950">
                Plumbing
              </p>
            </div>
          </div>
        </div>

        {/* Right Angled Smartphone Mockup (Workshop Services Screen) */}
        <div className="relative z-20 h-48 w-36 sm:w-40 rotate-8 translate-y-2 rounded-t-3xl border-4 border-brand-950 bg-surface-porcelain p-2.5 text-brand-950 shadow-gloss-float">
          {/* Dynamic Island Notch */}
          <div className="mx-auto h-2.5 w-12 rounded-pill bg-brand-950" />
          {/* Workshop Header */}
          <div className="mt-2 rounded-xl bg-brand-800 px-2 py-1.5 text-ink-on-blue">
            <p className="font-display text-[9px] font-extrabold">
              CoolBreeze Tech
            </p>
            <p className="text-[8px] text-accent-gold">★ 4.9 · Verified Pro</p>
          </div>
          {/* Service Rows */}
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-surface-pearl px-2 py-1">
              <div>
                <p className="font-display text-[8px] font-extrabold text-brand-950">
                  AC Gas Refill
                </p>
                <p className="font-display text-[8px] font-bold text-brand-600">
                  ₦14,000
                </p>
              </div>
              <span className="rounded-pill bg-brand-600 px-1.5 py-0.5 font-display text-[7px] font-extrabold text-ink-on-blue">
                Book
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-surface-pearl px-2 py-1">
              <div>
                <p className="font-display text-[8px] font-extrabold text-brand-950">
                  Pipe Leak Fix
                </p>
                <p className="font-display text-[8px] font-bold text-brand-600">
                  ₦15,000
                </p>
              </div>
              <span className="rounded-pill bg-brand-600 px-1.5 py-0.5 font-display text-[7px] font-extrabold text-ink-on-blue">
                Book
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "emblem") {
    return (
      <div className="relative flex h-56 sm:h-60 w-full items-center justify-center overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 p-5 select-none">
        {/* Architectural Wall Panel Lines */}
        <div
          className="pointer-events-none absolute inset-0 flex justify-around opacity-20"
          aria-hidden="true"
        >
          <div className="h-full w-px bg-brand-400" />
          <div className="h-full w-px bg-brand-400" />
          <div className="h-full w-px bg-brand-400" />
          <div className="h-full w-px bg-brand-400" />
        </div>

        {/* Neon Golden Backlight Halo */}
        <div
          className="pointer-events-none absolute h-44 w-44 rounded-full bg-accent-gold/25 blur-2xl"
          aria-hidden="true"
        />

        {/* Circular Illuminated Guild Emblem SVG (1:1 Reference Match) */}
        <svg
          viewBox="0 0 220 200"
          fill="none"
          className="relative z-10 h-44 w-48 overflow-visible drop-shadow-2xl"
          aria-hidden="true"
        >
          {/* Outer Neon Gold Ring */}
          <circle
            cx="110"
            cy="96"
            r="74"
            fill={tokens.colors.brand[900]}
            stroke={tokens.colors.accent.gold}
            strokeWidth="5"
          />
          {/* Inner Sky Accent Ring */}
          <circle
            cx="110"
            cy="96"
            r="64"
            fill={tokens.colors.brand[950]}
            stroke={tokens.colors.accent.sky}
            strokeWidth="2"
            strokeOpacity="0.65"
          />

          {/* Left & Right Stylized Master Artisans Holding Tools Over Central Crest */}
          {/* Left Artisan Silhouette */}
          <circle cx="82" cy="64" r="10" fill={tokens.colors.accent.gold} />
          <path
            d="M66 112 C66 86 74 76 86 76 C94 76 98 84 100 112 Z"
            fill={tokens.colors.brand[600]}
            stroke={tokens.colors.accent.gold}
            strokeWidth="2"
          />
          {/* Right Artisan Silhouette */}
          <circle cx="138" cy="64" r="10" fill={tokens.colors.accent.gold} />
          <path
            d="M120 112 C122 84 126 76 134 76 C146 76 154 86 154 112 Z"
            fill={tokens.colors.brand[600]}
            stroke={tokens.colors.accent.gold}
            strokeWidth="2"
          />

          {/* Crossed Gold Wrench & Spanner Above Central Workshop Cauldron/Anvil */}
          <path
            d="M88 54 L110 88 M132 54 L110 88"
            stroke={tokens.colors.surface.porcelain}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Central Workshop Crest Basin */}
          <path
            d="M84 94 H136 L128 124 H92 Z"
            fill={tokens.colors.brand[800]}
            stroke={tokens.colors.accent.gold}
            strokeWidth="3"
          />

          {/* Bottom Neon Plaque Banner ("ABUJA PROS GUILD") */}
          <rect
            x="24"
            y="132"
            width="172"
            height="30"
            rx="8"
            fill={tokens.colors.brand[950]}
            stroke={tokens.colors.accent.gold}
            strokeWidth="3"
          />
          <text
            x="110"
            y="152"
            textAnchor="middle"
            fill={tokens.colors.accent.gold}
            className="font-display text-[13px] font-extrabold tracking-widest"
          >
            ABUJA PROS GUILD
          </text>
        </svg>
      </div>
    );
  }

  if (type === "referral") {
    return (
      <div className="relative flex h-56 sm:h-60 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 p-6 select-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: tokens.gradients.slabBlue }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-card border-2 border-surface-porcelain/70 bg-accent-sky px-5 py-3 font-display text-3xl font-extrabold text-brand-950 shadow-gloss-float -rotate-6">
            -20%
          </div>
          <div className="rounded-card border-2 border-accent-gold bg-brand-900 px-5 py-3 font-display text-xl font-extrabold text-ink-on-blue shadow-gloss-float rotate-6">
            Split AC Refill
          </div>
        </div>
        <div className="relative z-20 mt-4 rounded-pill border border-brand-400/50 bg-brand-950/90 px-4 py-2 font-display text-xs font-extrabold text-accent-gold shadow-gloss-float">
          Cool Homes Across Wuse II &amp; Maitama
        </div>
      </div>
    );
  }

  if (type === "tracking") {
    return (
      <div className="relative flex h-56 sm:h-60 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 p-6 select-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: tokens.gradients.slabBlue }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-accent-sky bg-brand-900 text-accent-sky shadow-gloss-float">
            <MapPin className="h-8 w-8" />
          </span>
          <div className="rounded-2xl border-2 border-brand-400/50 bg-brand-950/95 px-4 py-3 shadow-gloss-float">
            <p className="font-display text-sm font-extrabold text-ink-on-blue">
              Live GPS Dispatch
            </p>
            <p className="text-xs font-semibold text-accent-gold">
              Emeka · 18 Mins Away
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-56 sm:h-60 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-950 p-6 select-none">
      <div
        className="pointer-events-none absolute inset-0 opacity-65"
        style={{ background: tokens.gradients.slabBlue }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-accent-gold bg-brand-900 text-accent-gold shadow-gloss-float">
          <TrendingUp className="h-8 w-8" />
        </span>
        <div className="rounded-2xl border-2 border-brand-400/50 bg-brand-950/95 px-4 py-3 shadow-gloss-float">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-accent-sky" />
            <p className="font-display text-sm font-extrabold text-ink-on-blue">
              3x Monthly Bookings
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-on-blue-muted">
            CoolBreeze Tech · Wuse II
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable 1:1 Reference Blog / What's New Card
 * Includes inset rounded top illustration, Category + Read Time badge row,
 * bold title, excerpt, and full-width bottom "Read More" CTA button.
 */
export function WhatsNewCard({
  item,
  ctaLabel = "Read More",
  ctaHref,
  onSelect,
}: {
  item: WhatsNewItem;
  ctaLabel?: string;
  ctaHref?: string;
  onSelect?: (item: WhatsNewItem) => void;
}) {
  return (
    <motion.article
      variants={cardHoverMotion}
      initial="rest"
      whileHover="hover"
      className="flex h-full flex-col justify-between overflow-hidden rounded-card border-2 border-brand-400/35 bg-brand-900/65 p-3.5 sm:p-4 text-ink-on-blue shadow-gloss-float"
    >
      <div>
        {/* Top Inset Rounded Visual Stage */}
        <WhatsNewVisual type={item.visualType} />

        {/* Category + Read Time Pill Row */}
        <div className="mt-5 flex items-center justify-between gap-2 px-2">
          <span className="font-display text-xs sm:text-sm font-extrabold text-accent-gold">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-700 bg-brand-950/90 px-3 py-1 font-display text-xs font-bold text-ink-on-blue-muted">
            <Clock className="h-3.5 w-3.5 text-accent-sky" aria-hidden="true" />
            <span>{item.readTime}</span>
          </span>
        </div>

        {/* Card Headline & Description */}
        <div className="mt-3 px-2">
          <h3 className="font-display text-xl sm:text-2xl font-extrabold leading-snug text-ink-on-blue">
            {item.title}
          </h3>
          <p className="mt-2.5 text-sm sm:text-base font-medium leading-relaxed text-ink-on-blue-muted line-clamp-3">
            {item.description}
          </p>
        </div>
      </div>

      {/* Full-Width Bottom Read More Pill Button (1:1 Reference Match) */}
      <div className="mt-6 px-2 pb-1">
        <CtaButton
          variant="primary"
          size="md"
          href={onSelect ? undefined : ctaHref}
          onClick={onSelect ? () => onSelect(item) : undefined}
          className="w-full"
        >
          {ctaLabel}
        </CtaButton>
      </div>
    </motion.article>
  );
}

/**
 * Section 8: "What's New on Skilled4U" (Eatly-inspired 3-column news cards inside Cobalt Slab)
 */
export function WhatsNewSection() {
  const { whatsNew } = landingContent;

  return (
    <SectionSlab tone="blue">
      <SectionHeader
        tone="on-blue"
        headline={whatsNew.headline}
        highlightWords={["New", "Skilled4U"]}
        subtitle={whatsNew.subtitle}
      />

      <Stagger className="mt-14 grid grid-cols-1 gap-7 lg:grid-cols-3">
        {whatsNew.items.map((item) => (
          <StaggerItem key={item.id}>
            <WhatsNewCard
              item={item}
              ctaLabel={whatsNew.cardCta}
              ctaHref={whatsNew.moreHref}
            />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.2} className="mt-12 text-center">
        <CtaButton variant="secondary" size="lg" href={whatsNew.moreHref}>
          {whatsNew.moreCta}
        </CtaButton>
      </Reveal>
    </SectionSlab>
  );
}

function AudienceCard({ item }: { item: AudienceItem }) {
  const bottomSlabClasses = {
    blue: "surface-slab-blue",
    ink: "surface-slab-ink",
    sapphire: "bg-brand-800 text-ink-on-blue shadow-gloss-slab",
  } as const;

  return (
    <motion.article
      variants={cardHoverMotion}
      initial="rest"
      whileHover="hover"
      className="surface-gloss-card flex h-full flex-col overflow-hidden p-0"
    >
      {/* Top 3D Character Portrait */}
      <div className="relative h-80 w-full overflow-hidden bg-surface-mist">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
        />
      </div>

      {/* Overlapping Rounded Colour Slab at Bottom (Eatly-inspired) */}
      <div
        className={cn(
          "relative z-10 -mt-8 flex flex-1 flex-col justify-between rounded-card p-8 sm:p-9 text-ink-on-blue",
          bottomSlabClasses[item.slabTone]
        )}
      >
        <div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold">
            {item.title}
          </h3>
          <p className="mt-3.5 text-base sm:text-lg font-medium leading-relaxed text-ink-on-blue-muted">
            {item.description}
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <CtaButton
            variant={item.ctaVariant}
            size="md"
            href={item.ctaHref}
            trailingArrow
          >
            {item.ctaLabel}
          </CtaButton>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Section 9: "Join Skilled4U Your Way." (3 Big Character Cards)
 */
export function AudienceGridSection() {
  const { joinYourWay } = landingContent;

  return (
    <SectionSlab id="join" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={joinYourWay.headline}
        highlightWords={["Skilled4U", "Way."]}
        subtitle={joinYourWay.subtitle}
      />

      <Stagger className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {joinYourWay.items.map((item) => (
          <StaggerItem key={item.id}>
            <AudienceCard item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </SectionSlab>
  );
}
