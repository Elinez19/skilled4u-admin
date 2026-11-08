"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { landingContent } from "@/content/landing";
import { motionTokens } from "@/lib/motion";

export interface NavigationLinkItem {
  readonly label: string;
  readonly href: string;
}

export interface MobileMenuToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  controlsId?: string;
}

/**
 * Animated Mobile Hamburger / Close Toggle Button for Landing Navbar
 */
export function MobileMenuToggleButton({
  isOpen,
  onToggle,
  controlsId = "mobile-navigation-menu",
}: MobileMenuToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-accent-gold transition-colors hover:text-accent-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sky cursor-pointer"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
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
  );
}

export interface MobileNavigationMenuProps {
  isOpen: boolean;
  links?: ReadonlyArray<NavigationLinkItem>;
  primaryCta?: string;
  secondaryCta?: string;
  isLinkActive: (href: string, index: number) => boolean;
  onClose: () => void;
}

/**
 * Detached Floating Rounded Mobile Menu Card
 */
export function MobileNavigationMenu({
  isOpen,
  links = landingContent.navbar.links,
  primaryCta = landingContent.navbar.primaryCta,
  secondaryCta = landingContent.navbar.secondaryCta,
  isLinkActive,
  onClose,
}: MobileNavigationMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
              {links.map((link, idx) => {
                const active = isLinkActive(link.href, idx);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
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
                onClick={onClose}
                className="w-full"
              >
                {secondaryCta}
              </CtaButton>
              <CtaButton
                variant="primary"
                size="lg"
                leadingIcon="play"
                href="#download"
                onClick={onClose}
                className="w-full"
              >
                {primaryCta}
              </CtaButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

