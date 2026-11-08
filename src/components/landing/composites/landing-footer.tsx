"use client";

import * as React from "react";
import { BrandLogo, GiantWordmark } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { landingContent } from "@/content/landing";

const SOCIAL_BADGE_LABELS = ["IG", "𝕏", "in"] as const;

interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
}

interface FooterLinkColumnProps {
  title: string;
  links: ReadonlyArray<FooterLinkItem>;
}

function FooterBrandColumn({ socialLabel }: { socialLabel: string }) {
  return (
    <div className="lg:col-span-5 space-y-6">
      <BrandLogo tone="on-blue" size="lg" />
      <p className="font-display text-base font-bold text-ink-on-blue">
        {socialLabel}
      </p>
      <div className="flex items-center gap-4">
        {SOCIAL_BADGE_LABELS.map((label) => (
          <OffsetRing
            key={label}
            size="sm"
            faceTone="ink"
            interactive
            ariaLabel={`Follow Skilled4U on ${label}`}
          >
            <span className="font-display text-sm font-extrabold">{label}</span>
          </OffsetRing>
        ))}
      </div>
    </div>
  );
}

function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <h3 className="font-display text-xl font-extrabold text-accent-gold">
        {title}
      </h3>
      <ul className="space-y-3 font-display text-base font-bold text-ink-on-blue">
        {links.map((item) => (
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
  );
}

function FooterHelpDeskColumn({
  helpDesk,
}: {
  helpDesk: typeof landingContent.footer.helpDesk;
}) {
  return (
    <div className="lg:col-span-3 space-y-4">
      <h3 className="font-display text-xl font-extrabold text-accent-gold">
        Help Desk
      </h3>
      <ul className="space-y-3 font-display text-base font-bold text-ink-on-blue">
        <li>{helpDesk.contactLabel}</li>
        <li>
          <a
            href={`mailto:${helpDesk.email}`}
            className="transition-colors hover:text-accent-sky"
          >
            {helpDesk.email}
          </a>
        </li>
        <li>{helpDesk.phone1}</li>
        <li>{helpDesk.phone2}</li>
      </ul>
    </div>
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
          <FooterBrandColumn socialLabel={footer.socialLabel} />
          <FooterLinkColumn title="Company" links={footer.companyLinks} />
          <FooterLinkColumn title="Quick links" links={footer.quickLinks} />
          <FooterHelpDeskColumn helpDesk={footer.helpDesk} />
        </div>

        {/* Giant Eatly-Style Outlined Bottom Wordmark */}
        <div className="relative z-10 mt-10">
          <GiantWordmark text={footer.wordmark} />
        </div>
      </div>
    </footer>
  );
}

