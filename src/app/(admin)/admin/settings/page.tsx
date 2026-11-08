"use client";

import * as React from "react";
import {
  CheckCircle2,
  Lock,
  Save,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export default function AdminSettingsPage() {
  const [platformFeePercent, setPlatformFeePercent] = React.useState("10");
  const [artisanSharePercent, setArtisanSharePercent] = React.useState("90");
  const [dispatchRadiusKm, setDispatchRadiusKm] = React.useState("15");
  const [disputeWindowHours, setDisputeWindowHours] = React.useState("48");
  const [supportEmail, setSupportEmail] = React.useState("support@skilled4u.ng");
  const [supportPhone, setSupportPhone] = React.useState("+234 800 754 5533");
  const [saved, setSaved] = React.useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Platform Governance & Operations"
        eyebrowIcon="shield"
        headline="Marketplace Settings & Policies."
        highlightWords={["Settings", "Policies."]}
        subtitle="Manage user verification rules for customers, artisans, and admins, configure booking dispatch limits, set dispute resolution windows, and update support channels."
        primaryCta={{
          label: "Manage Users",
          href: "/admin/user-management",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "View Financials",
          href: "/admin/financials",
          variant: "secondary",
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Booking Commission Split"
              value={`${artisanSharePercent}% / ${platformFeePercent}%`}
              badgeText="Artisan payout vs Platform service fee"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Lock className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Service Dispatch Radius"
              value={`${dispatchRadiusKm} km`}
              badgeText="Maximum artisan assignment distance"
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="ink"
              icon={<Settings className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="User & Dispute Governance"
              value={`${disputeWindowHours}h Window`}
              badgeText="Mandatory KYC & customer protection"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<Users className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        <form
          onSubmit={handleSave}
          className="mt-6 surface-gloss-card p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-surface-frost pb-4">
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-950">
                Marketplace Operations &amp; Policy Settings
              </h2>
              <p className="text-xs font-medium text-ink-secondary">
                Configure how bookings, payouts, disputes, user verification, and
                customer support operate across the platform.
              </p>
            </div>
            {saved ? (
              <PillBadge tone="sky" icon="dot" className="px-3 py-1 text-xs">
                Settings Saved
              </PillBadge>
            ) : (
              <PillBadge tone="porcelain" className="px-3 py-1 text-xs">
                Active Marketplace Rules
              </PillBadge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminTextField
              label="Artisan Earnings Share (%)"
              type="number"
              value={artisanSharePercent}
              onChange={(e) => setArtisanSharePercent(e.target.value)}
              required
            />
            <AdminTextField
              label="Platform Service Fee (%)"
              type="number"
              value={platformFeePercent}
              onChange={(e) => setPlatformFeePercent(e.target.value)}
              required
            />
            <AdminTextField
              label="Max Dispatch Radius (km)"
              type="number"
              value={dispatchRadiusKm}
              onChange={(e) => setDispatchRadiusKm(e.target.value)}
              required
            />
            <AdminTextField
              label="Dispute Claim Window (Hours)"
              type="number"
              value={disputeWindowHours}
              onChange={(e) => setDisputeWindowHours(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Customer & Artisan Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
            <AdminTextField
              label="Support & Dispatch Hotline"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-frost">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-secondary">
              <ShieldCheck className="h-4 w-4 text-accent-success shrink-0" />
              <span>
                Artisan identity &amp; bank account verification required before
                job dispatch and payout
              </span>
            </div>

            <CtaButton type="submit" variant="primary" size="sm">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </CtaButton>
          </div>
        </form>
      </AdminWorkspaceSlab>
    </div>
  );
}


