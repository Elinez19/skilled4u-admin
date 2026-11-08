"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import { OffsetRing } from "@/components/brand/offset-ring";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { Float } from "@/components/motion/float";
import { Reveal } from "@/components/motion/reveal";
import {
  type FloatingNotificationItem,
  landingContent,
} from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

function NotificationBanner({ item }: { item: FloatingNotificationItem }) {
  const toneClasses = {
    blue: "cta-surface-primary text-ink-on-blue",
    ink: "bg-brand-950 text-ink-on-blue border-2 border-brand-700 shadow-gloss-float",
    sapphire:
      "bg-brand-800 text-ink-on-blue border-2 border-brand-500 shadow-gloss-float",
  } as const;

  const positionClasses = {
    "top-left": "lg:-left-56 lg:top-10",
    "bottom-left": "lg:-left-52 lg:top-44",
    "top-right": "lg:-right-56 lg:top-14",
    "bottom-right": "lg:-right-52 lg:top-48",
  } as const;

  return (
    <Float
      rotateDeg={item.tiltDeg}
      amplitude={7}
      duration={5.2}
      className={cn(
        "relative lg:absolute z-20 w-full max-w-[330px]",
        positionClasses[item.position]
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3.5 rounded-3xl p-4 sm:p-5",
          toneClasses[item.tone]
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <OffsetRing size="sm" faceTone="ink" className="shrink-0">
            {item.iconType === "scooter" && <Wrench className="h-4 w-4" />}
            {item.iconType === "gift" && <Gift className="h-4 w-4" />}
            {item.iconType === "tag" && <Sparkles className="h-4 w-4" />}
            {item.iconType === "check" && <CheckCircle2 className="h-4 w-4" />}
          </OffsetRing>
          <div className="min-w-0">
            <p className="font-display text-base sm:text-lg font-extrabold leading-tight truncate">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-on-blue-muted truncate">
              {item.subtitle}
            </p>
          </div>
        </div>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-950/50 text-accent-gold"
          aria-hidden="true"
        >
          <X className="h-4 w-4" />
        </span>
      </div>
    </Float>
  );
}

/**
 * Coded High-Resolution iPhone 16 Pro Mockup showing Skilled4U Abuja App Feed
 */
export function PhoneScreenMockup({
  variant = "home",
  className,
}: {
  variant?: "home" | "search" | "pro-store";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[310px] sm:w-[345px] rounded-[50px] border-[10px] border-brand-950 bg-surface-porcelain p-3.5 shadow-gloss-float ring-4 ring-brand-200",
        className
      )}
    >
      {/* Dynamic Island */}
      <div
        className="mx-auto mb-3 h-7 w-28 rounded-pill bg-brand-950"
        aria-hidden="true"
      />

      {variant === "home" && (
        <div className="space-y-3.5 text-left">
          {/* App Location Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-ink-on-blue font-display font-extrabold text-xs">
                AK
              </div>
              <div>
                <p className="font-display text-xs font-extrabold text-brand-950">
                  Home ▾
                </p>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-ink-secondary">
                  <MapPin className="h-3 w-3 text-brand-600" />
                  14 Adetokunbo Ademola, Wuse II
                </p>
              </div>
            </div>
            <MessageCircle className="h-5 w-5 text-brand-600" />
          </div>

          {/* Glossy Promo Banner inside Phone */}
          <div className="cta-surface-primary rounded-2xl p-3.5 text-ink-on-blue">
            <span className="inline-block rounded-pill bg-accent-gold px-2.5 py-0.5 text-[10px] font-display font-extrabold text-brand-950">
              FIRST FIX FREE INSPECTION
            </span>
            <p className="mt-1.5 font-display text-base font-extrabold leading-tight">
              20% OFF AC &amp; PLUMBING THIS WEEK
            </p>
            <p className="mt-0.5 text-[11px] text-ink-on-blue-muted">
              Verified Abuja Technicians · 20 Min Arrival
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 rounded-pill bg-surface-mist px-3.5 py-2.5 border border-surface-frost text-xs font-semibold text-ink-secondary">
            <Search className="h-3.5 w-3.5 text-brand-600" />
            Search plumbers, AC, electrical...
          </div>

          {/* Recent Bookings Row */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-display text-xs font-extrabold text-brand-950">
                Recent Bookings ⏱
              </span>
              <span className="text-[11px] font-bold text-brand-600">
                View All
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {landingContent.hero.marqueeCards.slice(0, 2).map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-brand-100 bg-surface-pearl p-2"
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-xl bg-surface-porcelain">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="140px"
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="mt-1.5 font-display text-[11px] font-extrabold text-brand-950 truncate">
                    {card.title}
                  </p>
                  <p className="text-[11px] font-extrabold text-brand-600">
                    {card.price}
                  </p>
                  <div className="mt-1.5 flex items-center justify-center gap-1 rounded-pill bg-brand-50 py-1 text-[10px] font-bold text-brand-700">
                    <RotateCcw className="h-2.5 w-2.5" /> Rebook
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Favourites */}
          <div>
            <p className="font-display text-xs font-extrabold text-brand-950 px-1 mb-1.5">
              Your Favourites ♥
            </p>
            <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-brand-100 bg-surface-mist">
              <Image
                src="/images/landing/service-ac.jpg"
                alt="AC Servicing"
                fill
                sizes="300px"
                className="object-cover"
              />
              <div className="absolute right-2.5 bottom-2.5 flex flex-col items-end gap-1">
                <span className="cta-surface-primary rounded-pill px-2.5 py-0.5 text-[10px] font-extrabold">
                  Free Inspection
                </span>
                <span className="rounded-pill bg-brand-950/90 px-2.5 py-0.5 text-[10px] font-bold text-ink-on-blue">
                  20 Min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === "search" && (
        <div className="space-y-4 text-left py-1">
          <div className="flex items-center gap-2 rounded-pill bg-surface-mist px-3.5 py-2.5 border border-surface-frost text-xs font-semibold text-ink-secondary">
            <Search className="h-3.5 w-3.5 text-brand-600" />
            Search for artisans or services
          </div>
          <div>
            <p className="font-display text-xs font-extrabold text-brand-950 mb-2">
              Recent Keywords ⏱
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["AC Gas Refill", "Pipe Leak", "Inverter", "Wardrobe", "Cleaning"].map(
                (kw) => (
                  <span
                    key={kw}
                    className="rounded-pill bg-brand-50 border border-brand-100 px-3 py-1 text-[11px] font-bold text-brand-700"
                  >
                    {kw}
                  </span>
                )
              )}
            </div>
          </div>
          <div>
            <p className="font-display text-xs font-extrabold text-brand-950 mb-2">
              Suggested for you ✦
            </p>
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-brand-100 bg-surface-mist">
              <Image
                src="/images/landing/service-plumbing.svg"
                alt="Suggested Plumbing"
                fill
                sizes="280px"
                className="object-contain p-3"
              />
            </div>
          </div>
        </div>
      )}

      {variant === "pro-store" && (
        <div className="space-y-3.5 text-left">
          <div className="surface-slab-blue rounded-3xl p-4 text-ink-on-blue">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-extrabold">
                CoolBreeze AC Hub
              </p>
              <div className="flex gap-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-porcelain/20">
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-porcelain/20">
                  <Search className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5 overflow-hidden">
              <span className="rounded-pill bg-surface-porcelain px-3 py-1 text-[10px] font-extrabold text-brand-700">
                Split AC
              </span>
              <span className="rounded-pill bg-surface-porcelain/15 px-3 py-1 text-[10px] font-bold text-ink-on-blue">
                Gas Refill
              </span>
              <span className="rounded-pill bg-surface-porcelain/15 px-3 py-1 text-[10px] font-bold text-ink-on-blue">
                Ducts
              </span>
            </div>
          </div>

          {landingContent.hero.marqueeCards.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-surface-pearl p-2.5"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-porcelain">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-extrabold text-brand-950 truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-ink-secondary truncate">
                  {item.provider} · {item.area}
                </p>
                <p className="mt-1 font-display text-xs font-extrabold text-brand-600">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Section 2: "An App For Every Home" (Pearl Slab with Phone + 4 Floating Banners + 2 CTAs)
 */
export function PhoneShowcaseSection() {
  const { appShowcase } = landingContent;

  return (
    <SectionSlab id="app-showcase" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={appShowcase.headline}
        highlightWords={["Every", "Home"]}
        subtitle={appShowcase.subtitle}
      />

      {/* Center Phone + 4 Floating Tilted Notification Banners */}
      <div className="relative mx-auto mt-14 flex max-w-4xl flex-col items-center">
        <div className="relative flex flex-col items-center gap-4 lg:block">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:contents">
            {appShowcase.notifications.map((notif) => (
              <NotificationBanner key={notif.id} item={notif} />
            ))}
          </div>

          <Reveal className="mt-4 lg:mt-0">
            <PhoneScreenMockup variant="home" />
          </Reveal>
        </div>

        {/* Strictly 2 Consistent CTA Buttons Below Phone */}
        <Reveal
          delay={0.2}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <CtaButton variant="primary" size="lg" leadingIcon="apple" href="#download">
            {appShowcase.primaryCta}
          </CtaButton>
          <CtaButton variant="secondary" size="lg" leadingIcon="play" href="#download">
            {appShowcase.secondaryCta}
          </CtaButton>
        </Reveal>

        <Reveal delay={0.28}>
          <p className="mt-5 font-display text-base sm:text-lg font-bold text-brand-600">
            {appShowcase.promoLine}
          </p>
        </Reveal>
      </div>
    </SectionSlab>
  );
}

/**
 * Section 7: "Everything You Need To Book Better" (Cobalt Slab + 3 Fanned Phones)
 */
export function FannedPhonesShowcase() {
  const { everythingYouNeed } = landingContent;

  return (
    <SectionSlab
      id="features"
      tone="blue"
      innerClassName="pb-0 sm:pb-0 overflow-hidden"
    >
      <SectionHeader
        tone="on-blue"
        headline={everythingYouNeed.headline}
        highlightWords={["Book", "Better"]}
      />

      {/* Feature Chips */}
      <Reveal
        delay={0.14}
        className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2.5"
      >
        {everythingYouNeed.chips.map((chip) => (
          <PillBadge key={chip} tone="porcelain" icon="shield">
            {chip}
          </PillBadge>
        ))}
      </Reveal>

      {/* Strictly 2 Consistent CTA Buttons */}
      <Reveal
        delay={0.2}
        className="mt-9 flex flex-wrap items-center justify-center gap-4"
      >
        <CtaButton variant="secondary" size="lg" leadingIcon="apple" href="#download">
          {everythingYouNeed.primaryCta}
        </CtaButton>
        <CtaButton variant="primary" size="lg" leadingIcon="play" href="#download">
          {everythingYouNeed.secondaryCta}
        </CtaButton>
      </Reveal>

      <Reveal delay={0.25} className="text-center">
        <p className="mt-4 font-display text-base sm:text-lg font-bold text-accent-sky">
          {everythingYouNeed.promoLine}
        </p>
      </Reveal>

      {/* 3 Fanned Phones Rising from Bottom (Eatly-inspired) */}
      <div className="relative mx-auto mt-12 flex max-w-5xl items-end justify-center pt-6">
        {/* Left Tilted Phone */}
        <motion.div
          initial={{ rotate: 0, y: 80, opacity: 0 }}
          whileInView={{ rotate: -10, y: 36, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.outExpo,
          }}
          className="hidden md:block -mr-14 z-10"
        >
          <PhoneScreenMockup variant="search" />
        </motion.div>

        {/* Center Front Phone */}
        <motion.div
          initial={{ y: 70, opacity: 0 }}
          whileInView={{ y: 12, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: motionTokens.duration.slow,
            delay: 0.08,
            ease: motionTokens.ease.outExpo,
          }}
          className="relative z-20"
        >
          <PhoneScreenMockup variant="home" />
        </motion.div>

        {/* Right Tilted Phone */}
        <motion.div
          initial={{ rotate: 0, y: 80, opacity: 0 }}
          whileInView={{ rotate: 10, y: 36, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: motionTokens.duration.slow,
            delay: 0.14,
            ease: motionTokens.ease.outExpo,
          }}
          className="hidden md:block -ml-14 z-10"
        >
          <PhoneScreenMockup variant="pro-store" />
        </motion.div>
      </div>
    </SectionSlab>
  );
}

