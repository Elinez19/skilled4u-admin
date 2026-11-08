import * as React from "react";
import {
  GoodStuffCatalogSection,
  GoodStuffHeroSection,
} from "@/components/landing/composites/blog-page-sections";
import {
  LandingFooter,
  LandingNavbar,
  Preloader,
} from "@/components/landing/composites/navigation";
import { AudienceGridSection } from "@/components/landing/composites/whats-new-grid";

export default function BlogLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      {/* Entrance Loading Animation */}
      <Preloader />

      {/* Floating Cobalt Slab Navbar ("Blog" Active in Gold) */}
      <LandingNavbar />

      {/* Main "The Good Stuff" Page Sections (1:1 Reference Match) */}
      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* 1. "The Good Stuff" Hero Slab with Sweeping Ribbon & Craftsmanship Watermark */}
        <GoodStuffHeroSection />

        {/* 2. Categorized Blog Catalog Slab ("All" | "Offers" | "Product Update" | "Artisans") + 3-Col Cards + Load More */}
        <GoodStuffCatalogSection />

        {/* 3. "Join Skilled4U Your Way." 3-Column Character Cards */}
        <AudienceGridSection />
      </main>

      {/* Rounded Cobalt Slab Footer + Giant Outlined Wordmark */}
      <LandingFooter />
    </div>
  );
}

