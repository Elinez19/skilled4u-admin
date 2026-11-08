"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const [openOnPath, setOpenOnPath] = React.useState<string | null>(null);
  const mobileOpen = openOnPath === currentPath;
  const headerRef = React.useRef<HTMLElement>(null);

  const closeMobileMenu = React.useCallback(() => {
    setOpenOnPath(null);
  }, []);

  const toggleMobileMenu = React.useCallback(() => {
    setOpenOnPath((prev) => (prev === currentPath ? null : currentPath));
  }, [currentPath]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  const isLinkActive = (href: string, idx: number) => {
    if (pathname?.startsWith("/artisans") || pathname?.startsWith("/vendors")) {
      return href === "/artisans";
    }
    if (pathname?.startsWith("/faqs") || pathname?.startsWith("/faq")) {
      return href === "/faqs";
    }
    if (
      pathname?.startsWith("/blog") ||
      pathname?.startsWith("/whats-new") ||
      pathname?.startsWith("/updates") ||
      pathname?.startsWith("/the-good-stuff") ||
      pathname?.startsWith("/more")
    ) {
      return href === "/blog";
    }
    return idx === 0;
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 px-3 sm:px-5 lg:px-7 pt-3 sm:pt-4"
    >
      {/* Top Navbar Slab */}
      <div className="surface-slab-blue mx-auto max-w-slab rounded-2xl sm:rounded-3xl lg:rounded-pill border border-brand-400/45 px-5 sm:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="group focus:outline-none"
          >
            <BrandLogo tone="on-blue" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-8 font-display text-base font-extrabold"
          >
            {navbar.links.map((link, idx) => {
              const active = isLinkActive(link.href, idx);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={
                    active
                      ? "text-accent-gold transition-colors hover:text-ink-on-blue"
                      : "text-ink-on-blue transition-colors hover:text-accent-sky"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Pair (Strictly our 2 CTA variants) */}
          <div className="hidden lg:flex items-center gap-3">
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
            onClick={toggleMobileMenu}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-menu"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-accent-gold transition-colors hover:text-accent-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sky cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close-icon"
                  initial={{ opacity: 0, rotate: -45, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.85 }}
                  transition={{ duration: motionTokens.duration.fast * 0.6 }}
                  className="grid place-items-center"
                >
                  <X className="h-7 w-7" strokeWidth={2} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu-icon"
                  initial={{ opacity: 0, rotate: 45, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -45, scale: 0.85 }}
                  transition={{ duration: motionTokens.duration.fast * 0.6 }}
                  className="grid place-items-center"
                >
                  <Menu className="h-7 w-7" strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Detached Floating Rounded Mobile Menu Card */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={motionTokens.spring.snappy}
            className="lg:hidden absolute inset-x-3 sm:inset-x-5 top-full mt-2.5 z-50"
          >
            <div className="surface-slab-blue mx-auto max-w-slab rounded-card border border-brand-400/45 px-6 sm:px-8 py-7 sm:py-8">
              <nav
                aria-label="Mobile Primary"
                className="flex flex-col gap-5 sm:gap-6"
              >
                {navbar.links.map((link, idx) => {
                  const active = isLinkActive(link.href, idx);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={
                        active
                          ? "font-display text-lg sm:text-xl font-bold text-accent-gold transition-colors hover:text-ink-on-blue"
                          : "font-display text-lg sm:text-xl font-bold text-ink-on-blue transition-colors hover:text-accent-sky"
                      }
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-7 flex flex-col gap-3.5">
                <CtaButton
                  variant="secondary"
                  size="lg"
                  leadingIcon="apple"
                  href="#download"
                  onClick={closeMobileMenu}
                  className="w-full"
                >
                  {navbar.secondaryCta}
                </CtaButton>
                <CtaButton
                  variant="primary"
                  size="lg"
                  leadingIcon="play"
                  href="#download"
                  onClick={closeMobileMenu}
                  className="w-full"
                >
                  {navbar.primaryCta}
                </CtaButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className="surface-slab-blue relative mx-auto max-w-slab overflow-hidden rounded-slab pt-16 sm:pt-20 px-6 sm:px-12 lg:px-16">
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

