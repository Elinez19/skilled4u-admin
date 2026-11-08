"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import {
  MobileMenuToggleButton,
  MobileNavigationMenu,
  type NavigationLinkItem,
} from "@/components/landing/composites/mobile-navigation-menu";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { landingContent } from "@/content/landing";

export { LandingFooter } from "@/components/landing/composites/landing-footer";
export {
  MobileMenuToggleButton,
  MobileNavigationMenu,
} from "@/components/landing/composites/mobile-navigation-menu";
export { Preloader } from "@/components/landing/composites/preloader";

function isNavigationLinkActive(
  pathname: string | null,
  href: string,
  index: number
): boolean {
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
  return index === 0;
}

interface DesktopNavigationLinksProps {
  links: ReadonlyArray<NavigationLinkItem>;
  isLinkActive: (href: string, index: number) => boolean;
}

function DesktopNavigationLinks({
  links,
  isLinkActive,
}: DesktopNavigationLinksProps) {
  return (
    <nav
      aria-label="Primary"
      className="hidden lg:flex items-center gap-8 font-display text-base font-extrabold"
    >
      {links.map((link, idx) => {
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
  );
}

interface DesktopNavigationCtasProps {
  primaryCta: string;
  secondaryCta: string;
}

function DesktopNavigationCtas({
  primaryCta,
  secondaryCta,
}: DesktopNavigationCtasProps) {
  return (
    <div className="hidden lg:flex items-center gap-3">
      <CtaButton
        variant="secondary"
        size="md"
        leadingIcon="apple"
        href="#download"
      >
        {secondaryCta}
      </CtaButton>
      <CtaButton
        variant="primary"
        size="md"
        leadingIcon="play"
        href="#download"
      >
        {primaryCta}
      </CtaButton>
    </div>
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

  const checkLinkActive = React.useCallback(
    (href: string, idx: number) => isNavigationLinkActive(pathname, href, idx),
    [pathname]
  );

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

          <DesktopNavigationLinks
            links={navbar.links}
            isLinkActive={checkLinkActive}
          />

          <DesktopNavigationCtas
            primaryCta={navbar.primaryCta}
            secondaryCta={navbar.secondaryCta}
          />

          <MobileMenuToggleButton
            isOpen={mobileOpen}
            onToggle={toggleMobileMenu}
          />
        </div>
      </div>

      {/* Detached Floating Rounded Mobile Menu Card */}
      <MobileNavigationMenu
        isOpen={mobileOpen}
        links={navbar.links}
        primaryCta={navbar.primaryCta}
        secondaryCta={navbar.secondaryCta}
        isLinkActive={checkLinkActive}
        onClose={closeMobileMenu}
      />
    </header>
  );
}
