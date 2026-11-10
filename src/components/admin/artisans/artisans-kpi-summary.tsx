"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, UserCheck, Users } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export interface ArtisansKpiSummaryProps {
  counts: {
    all: number;
    verified: number;
    pending: number;
    rejected: number;
  };
  customersCount?: number;
  adminsCount?: number;
}

export function ArtisansKpiSummary({
  counts,
  customersCount = 0,
  adminsCount = 0,
}: ArtisansKpiSummaryProps) {
  return (
    <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
      <StaggerItem>
        <AdminKpiCard
          label="Registered Artisans"
          value={`${counts.all} Pros`}
          badgeText={`${counts.verified} verified · ${counts.pending} awaiting KYC`}
          badgeTone="sky"
          badgeIcon="pin"
          ringTone="blue"
          icon={<Users className="h-4 w-4 text-ink-on-blue" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Registered Customers"
          value={`${customersCount} Clients`}
          badgeText="Homeowners & business accounts"
          badgeTone="porcelain"
          badgeIcon="dot"
          ringTone="ink"
          icon={<UserCheck className="h-4 w-4 text-accent-success" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Platform Administrators"
          value={`${adminsCount} Admins`}
          badgeText="Operations, KYC & support staff"
          badgeTone="blue"
          badgeIcon="shield"
          ringTone="ink"
          tone="ink"
          icon={<ShieldCheck className="h-4 w-4 text-accent-gold" />}
        />
      </StaggerItem>
    </Stagger>
  );
}
