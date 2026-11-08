"use client";

import * as React from "react";
import Image from "next/image";
import { ToolPattern } from "@/components/brand/tool-pattern";
import {
  ArtisanMarqueeCard,
  RoadDispatchStrip,
} from "@/components/landing/composites/artisan-marquee-card";
import { ServiceCard } from "@/components/landing/composites/service-card";
import { FaqAccordion } from "@/components/landing/ui/accordion";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { AnimatedText } from "@/components/motion/animated-text";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, ScaleSlab, Stagger, StaggerItem } from "@/components/motion/reveal";
import { landingContent } from "@/content/landing";

/**
 * Section 1: Hero Slab ("Broken Pipe or AC? Fixed in Minutes.")
 * Uses custom 3D glossy background (`hero-bg.jpg`) framed around the perimeter with a
 * dedicated high-contrast center halo so typography and CTAs are never buried.
 */
export function HeroSection() {
  const { hero } = landingContent;

  return (
    <div id="top" className="px-3 sm:px-5 lg:px-7 pt-3 pb-4">
      <ScaleSlab className="surface-slab-blue relative mx-auto max-w-[1400px] overflow-hidden rounded-slab">
        {/* Custom 3D Glossy Porcelain & Cobalt Background Image */}
        <div className="pointer-events-none absolute inset-0 select-none opacity-65">
          <Image
            src="/images/landing/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="1400px"
            className="object-cover object-center"
          />
        </div>

        {/* High-Contrast Protective Halo so Text is Never Buried in Background */}
        <div
          className="contrast-halo-blue pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <ToolPattern tone="on-blue" />

        {/* Center Hero Copy & Strictly 2 Consistent CTA Buttons */}
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-14 sm:pt-20 pb-8 text-center">
          <Reveal>
            <PillBadge tone="porcelain" icon="dot">
              {hero.eyebrow}
            </PillBadge>
          </Reveal>

          <div className="mt-7 space-y-1">
            <AnimatedText
              as="h1"
              text={hero.headlineLine1}
              className="text-5xl sm:text-7xl lg:text-[84px] font-extrabold leading-[0.95] text-ink-on-blue drop-shadow-sm"
            />
            <AnimatedText
              as="h2"
              text={hero.headlineLine2}
              delay={0.14}
              highlightWords={["Minutes."]}
              highlightClassName="text-accent-sky"
              underlineLastWord
              className="text-5xl sm:text-7xl lg:text-[84px] font-extrabold leading-[0.95] text-ink-on-blue drop-shadow-sm"
            />
          </div>

          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-2xl font-semibold leading-relaxed text-ink-on-blue">
              {hero.subtitle}
            </p>
          </Reveal>

          {/* Strictly 2 Consistent CTA Buttons */}
          <Reveal
            id="download"
            delay={0.32}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <CtaButton
              variant="secondary"
              size="lg"
              leadingIcon="apple"
              href="#app-showcase"
            >
              {hero.primaryCta}
            </CtaButton>
            <CtaButton
              variant="primary"
              size="lg"
              leadingIcon="play"
              href="#app-showcase"
            >
              {hero.secondaryCta}
            </CtaButton>
          </Reveal>
        </div>

        {/* Infinite Tilted Artisan Cards Marquee Overlapping the Road Strip */}
        <div className="relative z-20 mt-4 -mb-14">
          <Marquee durationSeconds={38}>
            {hero.marqueeCards.map((item) => (
              <ArtisanMarqueeCard key={item.id} item={item} />
            ))}
          </Marquee>
        </div>

        {/* Bottom Dispatch Road Strip */}
        <RoadDispatchStrip />
      </ScaleSlab>
    </div>
  );
}

/**
 * Section 3: Services Grid ("Every Home & Office Fix Covered")
 */
export function ServicesGridSection() {
  const { services } = landingContent;

  return (
    <SectionSlab id="services" tone="pearl">
      <SectionHeader
        tone="on-light"
        eyebrow={
          <PillBadge tone="porcelain" icon="shield">
            {services.eyebrow}
          </PillBadge>
        }
        headline={services.headline}
        highlightWords={["Home", "Office", "Covered"]}
        subtitle={services.subtitle}
      />

      <Stagger className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        {services.items.map((item) => (
          <StaggerItem key={item.id}>
            <ServiceCard item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </SectionSlab>
  );
}

/**
 * Section 9: FAQ Accordion ("Got Questions ?")
 */
export function FaqSection() {
  const { faqs } = landingContent;

  return (
    <SectionSlab id="faqs" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={faqs.headline}
        highlightWords={["Questions"]}
        subtitle={faqs.subtitle}
      />

      <div className="mt-12">
        <FaqAccordion items={faqs.items} />
      </div>

      <Reveal delay={0.2} className="mt-12 text-center">
        <CtaButton variant="secondary" size="lg" href="#download">
          {faqs.moreCta}
        </CtaButton>
      </Reveal>
    </SectionSlab>
  );
}

