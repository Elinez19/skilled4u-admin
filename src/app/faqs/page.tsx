import * as React from "react";
import { FaqsCatalogSection } from "@/components/landing/composites/faqs-page-sections";
import {
  LandingFooter,
  LandingNavbar,
  Preloader,
} from "@/components/landing/composites/navigation";
import {
  AudienceGridSection,
  WhatsNewSection,
} from "@/components/landing/composites/whats-new-grid";

export default function FaqsLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      {/* Entrance Loading Animation */}
      <Preloader />

      {/* Floating Cobalt Slab Navbar ("FAQs" Active in Gold) */}
      <LandingNavbar />

      {/* Main FAQs Page Sections (1:1 Reference Match) */}
      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* 1. "Got Questions ?" Categorized Pill Tabs + 12-Item Glossy FAQ Accordion */}
        <FaqsCatalogSection />

        {/* 2. "What's New on Skilled4U" 3-Column Feature Slab */}
        <WhatsNewSection />

        {/* 3. "Join Skilled4U Your Way." 3-Column Character Cards */}
        <AudienceGridSection />
      </main>

      {/* Rounded Cobalt Slab Footer + Giant Outlined Wordmark */}
      <LandingFooter />
    </div>
  );
}

