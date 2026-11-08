"use client";

import * as React from "react";
import {
  CheckCircle2,
  Database,
  Lock,
  Save,
  Settings,
  ShieldCheck,
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
  const [supportEmail, setSupportEmail] = React.useState("ops@skilled4u.ng");
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://skilled4u.ng/api/webhooks/bachs"
  );
  const [saved, setSaved] = React.useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Platform Governance & Escrow Rules"
        eyebrowIcon="shield"
        headline="Marketplace Settings & Config."
        highlightWords={["Settings", "Config."]}
        subtitle="Configure the 90/10 Bachs.io escrow commission split, Abuja & Lagos dispatch radius thresholds, and Neon PostgreSQL webhook endpoints."
        primaryCta={{
          label: "View Financials",
          href: "/admin/financials",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "UserManagement",
          href: "/admin/user-management",
          variant: "secondary",
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Escrow Commission Split"
              value={`${artisanSharePercent}% / ${platformFeePercent}%`}
              badgeText="Artisan payout vs Platform fee"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Lock className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Active Dispatch Radius"
              value={`${dispatchRadiusKm} km`}
              badgeText="Abuja FCT & Lagos Metro"
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="ink"
              icon={<Settings className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Database & Auth Engine"
              value="Neon + BetterAuth"
              badgeText="Drizzle ORM schema synced"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<Database className="h-4 w-4 text-accent-sky" />}
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
                Core Marketplace Parameters
              </h2>
              <p className="text-xs font-medium text-ink-secondary">
                Changes apply immediately to new mobile app bookings and escrow
                checkouts.
              </p>
            </div>
            {saved ? (
              <PillBadge tone="sky" icon="dot" className="px-3 py-1 text-xs">
                Configuration Saved
              </PillBadge>
            ) : (
              <PillBadge tone="porcelain" className="px-3 py-1 text-xs">
                Production Environment
              </PillBadge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminTextField
              label="Artisan Escrow Share (%)"
              type="number"
              value={artisanSharePercent}
              onChange={(e) => setArtisanSharePercent(e.target.value)}
              required
            />
            <AdminTextField
              label="Platform Commission (%)"
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Operations Escalation Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
            <AdminTextField
              label="Bachs.io Signed Webhook Endpoint"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-frost">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-secondary">
              <ShieldCheck className="h-4 w-4 text-accent-success shrink-0" />
              <span>NIN &amp; NUBAN KYC verification enforced before payout</span>
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
                  <span>Save Configuration</span>
                </>
              )}
            </CtaButton>
          </div>
        </form>
      </AdminWorkspaceSlab>
    </div>
  );
}

