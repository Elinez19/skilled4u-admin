"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaqAccordion } from "@/components/landing/ui/accordion";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { Reveal } from "@/components/motion/reveal";
import { landingContent } from "@/content/landing";
import { useFaqsCatalog } from "@/hooks/landing/use-faqs-catalog";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Dedicated FAQs Page Section ("Got Questions ?")
 * Includes the Segmented Pill Category Switcher ("For Customers" | "For Artisans" | "For Businesses")
 * and the full 12-item Glossy FAQ Accordion matching the reference composition 1:1.
 * Strictly uses Skilled4U design tokens with zero hardcoded values.
 */
export function FaqsCatalogSection() {
  const { faqsPage } = landingContent;
  const { activeCategory, setActiveCategoryId } = useFaqsCatalog({
    categories: faqsPage.categories,
  });

  return (
    <SectionSlab id="faqs" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={faqsPage.headline}
        highlightWords={faqsPage.highlightWords}
        subtitle={faqsPage.subtitle}
      />

      {/* Segmented Audience Pill Switcher */}
      <Reveal delay={0.18} className="mt-10 flex justify-center">
        <div
          role="tablist"
          aria-label="FAQ Audience Categories"
          className="surface-slab-ink inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 rounded-pill border-2 border-brand-800 p-1.5 sm:p-2 shadow-gloss-float"
        >
          {faqsPage.categories.map((category) => {
            const isActive = category.id === activeCategory.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`faq-tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={`faq-panel-${category.id}`}
                onClick={() => setActiveCategoryId(category.id)}
                className={cn(
                  "relative isolate rounded-pill px-6 py-3 sm:px-9 sm:py-3.5 font-display text-sm sm:text-base font-extrabold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
                  isActive
                    ? "text-ink-on-blue"
                    : "text-ink-on-blue-muted hover:text-ink-on-blue"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="faq-active-category-pill"
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

      {/* Categorized FAQ Accordion List */}
      <div
        id={`faq-panel-${activeCategory.id}`}
        role="tabpanel"
        aria-labelledby={`faq-tab-${activeCategory.id}`}
        className="mt-12"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: motionTokens.duration.fast,
              ease: motionTokens.ease.outExpo,
            }}
          >
            <FaqAccordion items={activeCategory.items} />
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionSlab>
  );
}
