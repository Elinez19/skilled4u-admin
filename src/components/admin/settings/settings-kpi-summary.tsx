"use client";

import { Lock, Settings, Users } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export interface SettingsKpiSummaryProps {
  artisanSharePercent: string;
  platformFeePercent: string;
  dispatchRadiusKm: string;
  disputeWindowHours: string;
}

export function SettingsKpiSummary({
  artisanSharePercent,
  platformFeePercent,
  dispatchRadiusKm,
  disputeWindowHours,
}: SettingsKpiSummaryProps) {
  return (
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
  );
}

