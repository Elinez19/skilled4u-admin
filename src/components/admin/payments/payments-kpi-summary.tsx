"use client";

import * as React from "react";
import { CreditCard, Lock, TrendingUp } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCurrency } from "@/lib/utils";

export interface PaymentsKpiSummaryProps {
  totalVolume: number;
  heldVolume: number;
  totalFee: number;
  totalTransactionsCount: number;
}

export function PaymentsKpiSummary({
  totalVolume,
  heldVolume,
  totalFee,
  totalTransactionsCount,
}: PaymentsKpiSummaryProps) {
  return (
    <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StaggerItem>
        <AdminKpiCard
          label="Total Gross Volume"
          value={formatCurrency(totalVolume)}
          badgeText={`${totalTransactionsCount} recorded transactions`}
          badgeTone="porcelain"
          badgeIcon="dot"
          ringTone="blue"
          icon={<CreditCard className="h-4 w-4 text-ink-on-blue" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Escrow Locked (In Hold)"
          value={formatCurrency(heldVolume)}
          badgeText="Protected until customer job sign-off"
          badgeTone="sky"
          badgeIcon="shield"
          ringTone="ink"
          icon={<Lock className="h-4 w-4 text-accent-gold" />}
        />
      </StaggerItem>

      <StaggerItem>
        <AdminKpiCard
          label="Platform Commission (10%)"
          value={formatCurrency(totalFee)}
          badgeText="90% settled to verified artisans"
          badgeTone="blue"
          badgeIcon="shield"
          ringTone="ink"
          tone="ink"
          icon={<TrendingUp className="h-4 w-4 text-accent-sky" />}
        />
      </StaggerItem>
    </Stagger>
  );
}

