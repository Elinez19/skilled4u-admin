"use client";

import { CalendarCheck, Lock, TrendingUp, Users } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCurrency } from "@/lib/utils";
import type { OverviewKpiData } from "./types";

export interface OverviewKpiSummaryProps {
  kpis: OverviewKpiData;
}

export function OverviewKpiSummary({ kpis }: OverviewKpiSummaryProps) {
  return (
    <Stagger className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <AdminKpiCard
          label="Gross Booking Volume"
          value={formatCurrency(kpis.totalGmv)}
          badgeText={`${formatCurrency(kpis.totalCommission)} platform commission (10%)`}
          badgeTone="porcelain"
          badgeIcon="dot"
          ringTone="blue"
          icon={<TrendingUp className="h-4 w-4 text-ink-on-blue" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Escrow Funds on Hold"
          value={formatCurrency(kpis.escrowHeldAmount)}
          badgeText="Awaiting customer job completion sign-off"
          badgeTone="sky"
          badgeIcon="shield"
          ringTone="ink"
          icon={<Lock className="h-4 w-4 text-accent-gold" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Total Service Bookings"
          value={`${kpis.totalBookingsCount}`}
          numericValue={kpis.totalBookingsCount}
          badgeText={`Across ${kpis.categoriesCount} service categories`}
          badgeTone="sky"
          badgeIcon="pin"
          ringTone="porcelain"
          icon={<CalendarCheck className="h-4 w-4 text-brand-600" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Users & Artisan KYC"
          value={`${kpis.verifiedArtisansCount} Verified`}
          badgeText={`${kpis.pendingKycArtisansCount} artisans pending verification`}
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

