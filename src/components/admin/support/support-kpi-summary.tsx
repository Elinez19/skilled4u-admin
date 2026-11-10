"use client";

import { Clock, Headset, ShieldCheck } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export interface SupportKpiSummaryProps {
  openTickets: number;
}

export function SupportKpiSummary({ openTickets }: SupportKpiSummaryProps) {
  return (
    <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StaggerItem>
        <AdminKpiCard
          label="Active Support Tickets"
          value={`${openTickets}`}
          numericValue={openTickets}
          badgeText="Live Abuja & Lagos concierge"
          badgeTone="porcelain"
          badgeIcon="dot"
          ringTone="blue"
          icon={<Headset className="h-4 w-4 text-ink-on-blue" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Median First Response"
          value="4m 12s"
          badgeText="Within 15-min priority SLA"
          badgeTone="sky"
          badgeIcon="shield"
          ringTone="ink"
          icon={<Clock className="h-4 w-4 text-accent-gold" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Resolution Satisfaction"
          value="99.1%"
          badgeText="Verified pro & client support"
          badgeTone="blue"
          badgeIcon="shield"
          ringTone="ink"
          tone="ink"
          icon={<ShieldCheck className="h-4 w-4 text-accent-sky" />}
        />
      </StaggerItem>
    </Stagger>
  );
}

