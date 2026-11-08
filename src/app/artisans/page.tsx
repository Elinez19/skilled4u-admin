import * as React from "react";
import { AbujaCoverageMap } from "@/components/landing/composites/abuja-coverage-map";
import {
  ArtisanHeroSection,
  HowItWorksSection,
} from "@/components/landing/composites/artisan-page-sections";
import { FaqSection } from "@/components/landing/composites/hero-and-sections";
import {
  LandingFooter,
  LandingNavbar,
  Preloader,
} from "@/components/landing/composites/navigation";
import {
  AudienceGridSection,
  WhatsNewSection,
} from "@/components/landing/composites/whats-new-grid";
import { landingContent } from "@/content/landing";

export default function ArtisansLandingPage() {
  const { coverage, faqs } = landingContent.artisanPage;

  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      {/* Entrance Loading Animation */}
      <Preloader />

      {/* Floating Cobalt Slab Navbar ("Artisans" Active in Gold) */}
      <LandingNavbar />

      {/* Main Artisans / Vendors Page Sections (1:1 Reference Match) */}
      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* 1. Dark Ink Hero Slab + Storefront Workshop Building */}
        <ArtisanHeroSection />

        {/* 2. "How It Works" 3 Numbered Step Cards + Perks Strip + Primary CTA */}
        <HowItWorksSection />

        {/* 3. "Reach More Ready Customers" Dotted Map + 6 OffsetRing Bubbles */}
        <AbujaCoverageMap
          badge={coverage.badge}
          headline={coverage.headline}
          highlightWords={coverage.highlightWords}
          subtitle={coverage.subtitle}
          showStats={false}
          showComingSoon={false}
        />

        {/* 4. "Got Questions ?" Big Glossy FAQ Accordion */}
        <FaqSection
          headline={faqs.headline}
          subtitle={faqs.subtitle}
          moreCta={faqs.moreCta}
          items={faqs.items}
        />

        {/* 5. "What's New on Skilled4U" 3-Column Feature Slab */}
        <WhatsNewSection />

        {/* 6. "Join Skilled4U Your Way." 3-Column Character Cards */}
        <AudienceGridSection />
      </main>

      {/* Rounded Cobalt Slab Footer + Giant Outlined Wordmark */}
      <LandingFooter />
    </div>
  );
}

