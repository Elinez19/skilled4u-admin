"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Sparkles } from "lucide-react";
import Image from "next/image";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  type AudienceItem,
  landingContent,
  type WhatsNewItem,
} from "@/content/landing";
import { cardHoverMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

function WhatsNewVisual({ type }: { type: WhatsNewItem["visualType"] }) {
  if (type === "reward") {
    return (
      <div className="relative flex h-56 w-full flex-col items-center justify-center overflow-hidden bg-brand-900 p-6">
        {/* 3D Gold Naira Coins + Reward Banner */}
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 -rotate-12 place-items-center rounded-full border-4 border-surface-porcelain bg-accent-gold font-display text-2xl font-extrabold text-brand-950 shadow-gloss-float">
            ₦
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-surface-porcelain bg-accent-gold font-display text-3xl font-extrabold text-brand-950 shadow-gloss-float">
            ₦
          </div>
          <div className="grid h-16 w-16 rotate-12 place-items-center rounded-full border-4 border-surface-porcelain bg-accent-gold font-display text-2xl font-extrabold text-brand-950 shadow-gloss-float">
            ₦
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-brand-400 bg-brand-950 px-5 py-2.5 text-sm font-display font-extrabold text-ink-on-blue shadow-gloss-float">
          <Sparkles className="h-4 w-4 text-accent-gold" />
          First Booking Reward
        </div>
      </div>
    );
  }

  if (type === "phones") {
    return (
      <div className="relative flex h-56 w-full items-end justify-center gap-3 overflow-hidden bg-brand-900 px-6 pt-6">
        <div className="h-40 w-36 -rotate-6 rounded-t-3xl border-4 border-brand-950 bg-surface-porcelain p-3 shadow-gloss-float">
          <div className="mx-auto h-3 w-12 rounded-pill bg-brand-950" />
          <div className="mt-2.5 h-16 rounded-xl bg-brand-600 p-2 text-[10px] font-display font-extrabold text-ink-on-blue">
            20% OFF AC &amp; PLUMBING
          </div>
        </div>
        <div className="h-40 w-36 rotate-6 rounded-t-3xl border-4 border-brand-950 bg-brand-600 p-3 text-ink-on-blue shadow-gloss-float">
          <div className="mx-auto h-3 w-12 rounded-pill bg-brand-950" />
          <div className="mt-2.5 rounded-xl bg-surface-porcelain p-2 text-[10px] font-display font-extrabold text-brand-700">
            ₦14,000 · Wuse II
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-brand-900 p-6">
      <div className="grid h-36 w-36 place-items-center rounded-full border-4 border-accent-sky bg-brand-950 shadow-gloss-float ring-8 ring-accent-sky/20">
        <div className="text-center">
          <Award className="mx-auto h-11 w-11 text-accent-gold" />
          <span className="mt-1 block font-display text-xs font-extrabold text-accent-sky">
            ABUJA PROS
          </span>
        </div>
      </div>
    </div>
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
            <motion.article
              variants={cardHoverMotion}
              initial="rest"
              whileHover="hover"
              className="flex h-full flex-col overflow-hidden rounded-card border-2 border-brand-400/35 bg-brand-950 shadow-gloss-float"
            >
              <WhatsNewVisual type={item.visualType} />

              <div className="flex flex-1 flex-col justify-between rounded-t-3xl -mt-4 relative z-10 bg-brand-950 p-7 sm:p-8 text-ink-on-blue border-t border-brand-700">
                <div>
                  <span className="font-display text-sm font-extrabold text-accent-gold">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-snug text-ink-on-blue">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base font-medium leading-relaxed text-ink-on-blue-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.article>
          </StaggerItem>
        ))}
      </Stagger>
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
            href="#download"
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

