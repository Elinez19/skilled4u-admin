import * as React from "react";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { AbujaCoverageMap } from "@/components/landing/composites/abuja-coverage-map";
import { ArtisanMarqueeCard } from "@/components/landing/composites/artisan-marquee-card";
import {
  ArtisanHeroSection,
  HowItWorksSection,
} from "@/components/landing/composites/artisan-page-sections";
import {
  FaqSection,
  HeroSection,
  ServicesGridSection,
} from "@/components/landing/composites/hero-and-sections";
import {
  LandingFooter,
  LandingNavbar,
} from "@/components/landing/composites/navigation";
import {
  FannedPhonesShowcase,
  PhoneShowcaseSection,
} from "@/components/landing/composites/phone-showcase";
import { RoadJourneySection } from "@/components/landing/composites/road-journey";
import { TestimonialCarouselSection } from "@/components/landing/composites/testimonial-carousel";
import {
  AudienceGridSection,
  WhatsNewSection,
} from "@/components/landing/composites/whats-new-grid";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { landingContent } from "@/content/landing";

export default function DesignSystemShowcasePage() {
  return (
    <div className="min-h-screen bg-surface-pearl text-ink-primary pb-16">
      <LandingNavbar />

      {/* Section A: Token & Component Library Specimen */}
      <SectionSlab tone="pearl" className="mt-2">
        <SectionHeader
          eyebrow={
            <PillBadge tone="porcelain" icon="dot">
              Gate 2 Preview · Design System &amp; Reusable Components
            </PillBadge>
          }
          headline="Vibrant Electric Blue & Glossy Porcelain"
          highlightWords={["Electric", "Blue", "Porcelain"]}
          subtitle="Every colour, shadow, surface, button, and animation below is powered strictly by custom tokens in globals.css, tokens.ts, and motion.ts."
        />

        {/* 1. Strictly 2 CTA Buttons Showcase */}
        <div className="mt-14 surface-gloss-card p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <PillBadge tone="sky">Strictly 2 CTA Button Variants</PillBadge>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-brand-950">
                Primary (Glossy Blue) &amp; Secondary (Glossy White)
              </h3>
              <p className="mt-1.5 text-base font-medium text-ink-secondary">
                Big, bold, high-contrast text, specular top highlight, and Framer Motion sheen sweep.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <CtaButton variant="primary" size="lg" leadingIcon="apple">
                Primary CTA · App Store
              </CtaButton>
              <CtaButton variant="secondary" size="lg" leadingIcon="play">
                Secondary CTA · Play Store
              </CtaButton>
            </div>
          </div>
        </div>

        {/* 2. OffsetRing Motif & Brand Logo */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="surface-gloss-card p-8 sm:p-10 space-y-6">
            <PillBadge tone="sky">Brand Identity &amp; Pills</PillBadge>
            <div className="flex flex-wrap items-center gap-6">
              <BrandLogo tone="on-light" size="lg" />
              <PillBadge tone="porcelain" icon="dot">
                Verified Artisans · Fast Arrival
              </PillBadge>
              <PillBadge tone="blue" icon="pin">
                15+ Abuja Areas
              </PillBadge>
            </div>
          </div>

          <div className="surface-slab-ink rounded-card p-8 sm:p-10 text-ink-on-blue">
            <PillBadge tone="porcelain" icon="pin">
              OffsetRing Motif · Abuja Bubbles
            </PillBadge>
            <div className="mt-6 flex flex-wrap items-center justify-around gap-6">
              <OffsetRing size="lg" faceTone="ink">
                Wuse II
              </OffsetRing>
              <OffsetRing size="md" faceTone="ink">
                Maitama
              </OffsetRing>
              <OffsetRing size="lg" faceTone="ink">
                Gwarinpa
              </OffsetRing>
            </div>
          </div>
        </div>

        {/* 3. Big Bold Glossy Artisan Card Sample */}
        <div className="mt-8 surface-gloss-card p-8 sm:p-10">
          <PillBadge tone="sky">Big Bold Glossy Cards</PillBadge>
          <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-brand-950">
            Tilted Artisan Marquee Cards (Hover to Lift &amp; Straighten)
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {landingContent.hero.marqueeCards.slice(0, 3).map((item) => (
              <ArtisanMarqueeCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </SectionSlab>

      {/* Full Reusable Section Components Preview */}
      <HeroSection />
      <ArtisanHeroSection />
      <HowItWorksSection />
      <PhoneShowcaseSection />
      <ServicesGridSection />
      <AbujaCoverageMap />
      <RoadJourneySection />
      <TestimonialCarouselSection />
      <FannedPhonesShowcase />
      <WhatsNewSection />
      <AudienceGridSection />
      <FaqSection />
      <LandingFooter />
    </div>
  );
}

