"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo, GiantWordmark } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { ScribbleUnderline } from "@/components/motion/animated-text";
import { landingContent } from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { tokens } from "@/lib/tokens";

/**
 * inspired Preloader with Animated Wordmark + Self-Drawing Scribble Underline
 */
export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  const shouldRender = visible && !prefersReducedMotion;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="skilled4u-preloader"
          initial={{ y: "0%" }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.75,
              ease: motionTokens.ease.inOutQuint,
            },
          }}
          className="surface-slab-ink fixed inset-0 z-50 grid place-items-center px-6"
        >
          <ToolPattern tone="on-blue" />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.55,
                ease: motionTokens.ease.outExpo,
              }}
              className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-ink-on-blue"
            >
              skilled<span className="text-accent-sky">4U</span>
            </motion.div>

            <div className="mx-auto mt-3 w-64 sm:w-80">
              <ScribbleUnderline strokeColor={tokens.colors.accent.gold} />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-3 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-accent-sky"
            >
              {landingContent.preloader.tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Eatly-inspired Floating Rounded Cobalt Slab Navbar with Strictly 2 Consistent CTA Buttons
 */
export function LandingNavbar() {
  const { navbar } = landingContent;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-5 lg:px-7 pt-3 sm:pt-4">
      <div className="surface-slab-blue mx-auto max-w-[1400px] rounded-3xl sm:rounded-pill px-5 sm:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <a href="#top" className="group focus:outline-none">
            <BrandLogo tone="on-blue" />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-8 font-display text-base font-extrabold"
          >
            {navbar.links.map((link, idx) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  idx === 0
                    ? "text-accent-gold transition-colors hover:text-ink-on-blue"
                    : "text-ink-on-blue transition-colors hover:text-accent-sky"
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Pair (Strictly our 2 CTA variants) */}
          <div className="hidden sm:flex items-center gap-3">
            <CtaButton
              variant="secondary"
              size="md"
              leadingIcon="apple"
              href="#download"
            >
              {navbar.secondaryCta}
            </CtaButton>
            <CtaButton
              variant="primary"
              size="md"
              leadingIcon="play"
              href="#download"
            >
              {navbar.primaryCta}
            </CtaButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="sm:hidden grid h-11 w-11 place-items-center rounded-2xl bg-surface-porcelain text-brand-700"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={motionTokens.spring.snappy}
              className="overflow-hidden sm:hidden"
            >
              <div className="mt-4 flex flex-col gap-3 border-t border-brand-400/30 pt-4 pb-2">
                {navbar.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-lg font-extrabold text-ink-on-blue py-1"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 grid grid-cols-1 gap-3">
                  <CtaButton
                    variant="secondary"
                    size="md"
                    leadingIcon="apple"
                    href="#download"
                  >
                    {navbar.secondaryCta}
                  </CtaButton>
                  <CtaButton
                    variant="primary"
                    size="md"
                    leadingIcon="play"
                    href="#download"
                  >
                    {navbar.primaryCta}
                  </CtaButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/**
 * Eatly-inspired Rounded Cobalt Slab Footer with OffsetRing Socials & Giant Wordmark
 */
export function LandingFooter() {
  const { footer } = landingContent;

  return (
    <footer className="px-3 sm:px-5 lg:px-7 pt-4 pb-6">
      <div className="surface-slab-blue relative mx-auto max-w-[1400px] overflow-hidden rounded-slab pt-16 sm:pt-20 px-6 sm:px-12 lg:px-16">
        <ToolPattern tone="on-blue" />

        <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + Socials Column */}
          <div className="lg:col-span-5 space-y-6">
            <BrandLogo tone="on-blue" size="lg" />
            <p className="font-display text-base font-bold text-ink-on-blue">
              {footer.socialLabel}
            </p>
            <div className="flex items-center gap-4">
              {["IG", "𝕏", "in"].map((label) => (
                <OffsetRing
                  key={label}
                  size="sm"
                  faceTone="ink"
                  interactive
                  ariaLabel={`Follow Skilled4U on ${label}`}
                >
                  <span className="font-display text-sm font-extrabold">
                    {label}
                  </span>
                </OffsetRing>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-xl font-extrabold text-accent-gold">
              Company
            </h3>
            <ul className="space-y-3 font-display text-base font-bold text-ink-on-blue">
              {footer.companyLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-accent-sky"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-xl font-extrabold text-accent-gold">
              Quick links
            </h3>
            <ul className="space-y-3 font-display text-base font-bold text-ink-on-blue">
              {footer.quickLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-accent-sky"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Desk */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-xl font-extrabold text-accent-gold">
              Help Desk
            </h3>
            <ul className="space-y-3 font-display text-base font-bold text-ink-on-blue">
              <li>{footer.helpDesk.contactLabel}</li>
              <li>
                <a
                  href={`mailto:${footer.helpDesk.email}`}
                  className="transition-colors hover:text-accent-sky"
                >
                  {footer.helpDesk.email}
                </a>
              </li>
              <li>{footer.helpDesk.phone1}</li>
              <li>{footer.helpDesk.phone2}</li>
            </ul>
          </div>
        </div>

        {/* Giant Eatly-Style Outlined Bottom Wordmark */}
        <div className="relative z-10 mt-10">
          <GiantWordmark text={footer.wordmark} />
        </div>
      </div>
    </footer>
  );
}

