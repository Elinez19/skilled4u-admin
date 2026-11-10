"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import type { ArtisanRow } from "@/db/schema";

export interface OverviewPendingKycQueueProps {
  pendingKycArtisans: ArtisanRow[];
}

export function OverviewPendingKycQueue({
  pendingKycArtisans,
}: OverviewPendingKycQueueProps) {
  return (
    <div className="surface-gloss-card p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-950">
            Pending KYC Queue
          </h2>
          <p className="mt-0.5 text-xs font-medium text-ink-secondary">
            Artisans awaiting NIN &amp; NUBAN verification.
          </p>
        </div>
        <PillBadge tone="sky" className="px-2.5 py-0.5 text-[11px] shrink-0">
          {pendingKycArtisans.length} Pending
        </PillBadge>
      </div>

      {pendingKycArtisans.length === 0 ? (
        <div className="rounded-2xl border-2 border-brand-100 bg-surface-mist p-3.5 flex items-center gap-3">
          <OffsetRing size="xs" faceTone="ink" className="shrink-0">
            <CheckCircle2 className="h-4 w-4 text-accent-success" />
          </OffsetRing>
          <div>
            <p className="font-display text-xs font-extrabold text-brand-950">
              All Artisans Verified!
            </p>
            <p className="text-[11px] font-medium text-ink-secondary">
              Every registered pro has passed NIN &amp; bank checks.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pendingKycArtisans.slice(0, 4).map((art) => (
            <div
              key={art.id}
              className="flex items-center justify-between gap-2.5 rounded-2xl border-2 border-brand-100 bg-surface-porcelain p-2.5 shadow-gloss-card"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.profileImage}
                  alt={art.name}
                  className="h-9 w-9 shrink-0 rounded-xl object-cover border-2 border-brand-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xs font-extrabold text-brand-950">
                    {art.name}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-ink-secondary">
                    {art.trade} · NIN: {art.ninNumber || "Submitted"}
                  </p>
                </div>
              </div>
              <CtaButton
                variant="secondary"
                size="xs"
                href="/admin/artisans"
                className="shrink-0"
              >
                Review
              </CtaButton>
            </div>
          ))}
        </div>
      )}

      {/* Dark Ink Verification Checklist Slab */}
      <div className="surface-slab-ink rounded-2xl border-2 border-brand-700 p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent-gold shrink-0" />
          <span className="font-display text-xs font-extrabold text-ink-on-blue">
            User &amp; Role Management Guide
          </span>
        </div>
        <p className="text-[11px] font-medium leading-relaxed text-ink-on-blue-muted">
          Verify artisan identity and bank payout accounts, review customer
          booking activity, and manage administrator roles from the user
          management desk.
        </p>
        <div className="pt-0.5">
          <CtaButton
            variant="primary"
            size="xs"
            href="/admin/user-management"
            trailingArrow
            className="w-full"
          >
            Open User Management Desk
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

