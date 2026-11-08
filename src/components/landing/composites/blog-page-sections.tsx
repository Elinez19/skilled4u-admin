"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { ToolPattern } from "@/components/brand/tool-pattern";
import {
  WhatsNewCard,
  WhatsNewVisual,
} from "@/components/landing/composites/whats-new-grid";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { SectionSlab } from "@/components/landing/ui/section-slab";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";
import {
  type BlogCategoryId,
  landingContent,
  type WhatsNewItem,
} from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Section 1 (Blog / Updates Page): "The Good Stuff" Hero Slab
 * Features the repeating ToolPattern watermark + the signature sweeping S-curve ribbon
 * across the Cobalt Slab with centered high-contrast typography.
 */
export function GoodStuffHeroSection() {
  const { hero } = landingContent.blogPage;

  return (
    <div id="top" className="px-3 sm:px-5 lg:px-7 pt-3 pb-2">
      <ScaleSlab className="surface-slab-blue relative mx-auto max-w-slab overflow-hidden rounded-slab">
        <ToolPattern tone="on-blue" />

        {/* Large Sweeping Sculptural Ribbon Curve (1:1 Reference Hero Backdrop) */}
        <svg
          viewBox="0 0 1400 420"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          aria-hidden="true"
        >
          <path
            d="M-80 260 C 180 430, 460 440, 660 220 C 850 10, 1080 -30, 1480 280"
            stroke={tokens.colors.surface.porcelain}
            strokeWidth="44"
            strokeOpacity="0.075"
            strokeLinecap="round"
          />
        </svg>

        {/* Protective Contrast Halo so Typography Remains 100% Crisp */}
        <div
          className="contrast-halo-blue pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />

        {/* Centered Hero Headline & Subtitle */}
        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 lg:py-32 text-center">
          <AnimatedText
            as="h1"
            text={hero.headline}
            highlightWords={hero.highlightWords}
            highlightClassName="text-accent-sky"
            className="text-5xl sm:text-7xl lg:text-[82px] font-extrabold leading-[0.96] tracking-tight text-ink-on-blue drop-shadow-sm"
          />

          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-base sm:text-xl font-medium leading-relaxed text-ink-on-blue-muted">
              {hero.subtitle}
            </p>
          </Reveal>
        </div>
      </ScaleSlab>
    </div>
  );
}

/**
 * Section 2 (Blog / Updates Page): Categorized "The Good Stuff" Catalog Slab
 * Includes the 4-Tab Segmented Pill Switcher ("All" | "Offers" | "Product Update" | "Artisans"),
 * the 3-Column Article Cards Grid, the "Load More" Pill Button, and an Interactive Story Modal.
 */
export function GoodStuffCatalogSection() {
  const { blogPage } = landingContent;
  const [activeCategoryId, setActiveCategoryId] =
    React.useState<BlogCategoryId>("all");
  const [showAll, setShowAll] = React.useState(false);
  const [selectedArticle, setSelectedArticle] =
    React.useState<WhatsNewItem | null>(null);

  const filteredItems = React.useMemo(() => {
    if (activeCategoryId === "all") {
      return blogPage.items;
    }
    return blogPage.items.filter(
      (item) => item.categoryId === activeCategoryId
    );
  }, [activeCategoryId, blogPage.items]);

  const visibleItems =
    activeCategoryId === "all" && !showAll
      ? filteredItems.slice(0, 3)
      : filteredItems;

  return (
    <>
      <SectionSlab
        id="the-good-stuff"
        tone="blue"
        innerClassName="py-12 sm:py-16 lg:py-20"
      >
        {/* Top 4-Tab Segmented Pill Bar ("All" | "Offers" | "Product Update" | "Artisans") */}
        <Reveal className="flex justify-center">
          <div
            role="tablist"
            aria-label="Article Categories"
            className="surface-slab-ink mx-auto grid w-full max-w-4xl grid-cols-2 sm:grid-cols-4 items-center gap-1.5 rounded-3xl sm:rounded-pill border-2 border-brand-700/75 p-1.5 sm:p-2 shadow-gloss-float"
          >
            {blogPage.categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  id={`blog-tab-${category.id}`}
                  aria-selected={isActive}
                  aria-controls="blog-catalog-panel"
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setShowAll(false);
                  }}
                  className={cn(
                    "relative isolate rounded-pill px-5 py-3 sm:px-7 sm:py-3.5 font-display text-sm sm:text-base font-extrabold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
                    isActive
                      ? "text-ink-on-blue"
                      : "text-ink-on-blue-muted hover:text-ink-on-blue"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="good-stuff-active-category-pill"
                      transition={motionTokens.spring.snappy}
                      className="cta-surface-primary absolute inset-0 -z-10 rounded-pill"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{category.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* 3-Column Article Cards Grid */}
        <div
          id="blog-catalog-panel"
          role="tabpanel"
          aria-labelledby={`blog-tab-${activeCategoryId}`}
          className="mt-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategoryId}-${showAll ? "all" : "initial"}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: motionTokens.duration.fast,
                ease: motionTokens.ease.outExpo,
              }}
              className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
            >
              {visibleItems.map((item) => (
                <WhatsNewCard
                  key={item.id}
                  item={item}
                  ctaLabel={blogPage.cardCta}
                  onSelect={(article) => setSelectedArticle(article)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Centered "Load More" Pill Button (1:1 Reference Match) */}
        <Reveal delay={0.18} className="mt-12 text-center">
          <motion.button
            type="button"
            onClick={() => {
              if (activeCategoryId !== "all") {
                setActiveCategoryId("all");
                setShowAll(true);
              } else {
                setShowAll((prev) => !prev);
              }
            }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={motionTokens.spring.snappy}
            className="surface-slab-ink inline-flex items-center justify-center rounded-pill border-2 border-brand-400/40 px-9 py-3.5 font-display text-sm sm:text-base font-extrabold text-ink-on-blue shadow-gloss-float transition-colors hover:border-accent-sky cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky"
          >
            {activeCategoryId === "all" && showAll
              ? blogPage.showLessCta
              : blogPage.loadMoreCta}
          </motion.button>
        </Reveal>
      </SectionSlab>

      {/* Interactive Story Reader Modal when "Read More" is Clicked */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            key="blog-story-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-brand-950/80 p-4 sm:p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={motionTokens.spring.snappy}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-article-title"
              className="surface-slab-ink relative w-full max-w-2xl overflow-hidden rounded-slab border-2 border-brand-400/40 p-6 sm:p-8 text-ink-on-blue shadow-gloss-float"
            >
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close story"
                className="absolute top-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-pill border border-brand-600 bg-brand-900 text-ink-on-blue transition-colors hover:border-accent-sky cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <WhatsNewVisual type={selectedArticle.visualType} />

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="font-display text-sm font-extrabold text-accent-gold">
                  {selectedArticle.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-700 bg-brand-950 px-3.5 py-1 font-display text-xs font-bold text-ink-on-blue-muted">
                  <Clock className="h-3.5 w-3.5 text-accent-sky" />
                  <span>{selectedArticle.readTime}</span>
                </span>
              </div>

              <h2
                id="modal-article-title"
                className="mt-3 font-display text-2xl sm:text-3xl font-extrabold leading-tight text-ink-on-blue"
              >
                {selectedArticle.title}
              </h2>

              <div className="mt-4 space-y-3 text-base font-medium leading-relaxed text-ink-on-blue-muted">
                <p>{selectedArticle.description}</p>
                {selectedArticle.fullStory.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                <CtaButton
                  variant="secondary"
                  size="md"
                  onClick={() => setSelectedArticle(null)}
                >
                  Close
                </CtaButton>
                <CtaButton
                  variant="primary"
                  size="md"
                  href="#join"
                  trailingArrow
                  onClick={() => setSelectedArticle(null)}
                >
                  Get the Skilled4U App
                </CtaButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

