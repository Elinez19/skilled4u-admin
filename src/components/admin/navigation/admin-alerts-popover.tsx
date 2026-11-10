"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { motionTokens } from "@/lib/motion";
import { LIVE_ALERTS } from "./constants";
import type { AdminAlertItem } from "./types";

export interface AdminAlertsPopoverProps {
  alertsOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  alertsRef: React.RefObject<HTMLDivElement | null>;
  alerts?: ReadonlyArray<AdminAlertItem>;
}

export function AdminAlertsPopover({
  alertsOpen,
  onToggle,
  onClose,
  alertsRef,
  alerts = LIVE_ALERTS,
}: AdminAlertsPopoverProps) {
  return (
    <div ref={alertsRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="View live operations alerts"
        className="relative grid h-8 w-8 place-items-center rounded-pill border-2 border-brand-100 bg-surface-porcelain text-brand-700 shadow-gloss-card transition-transform hover:scale-105 cursor-pointer"
      >
        <Bell className="h-3.5 w-3.5" />
        <span
          className="absolute -top-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-pill bg-brand-600 font-display text-[9px] font-extrabold text-ink-on-blue"
          aria-hidden="true"
        >
          {alerts.length}
        </span>
      </button>

      <AnimatePresence>
        {alertsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: motionTokens.duration.fast }}
            className="surface-gloss-card absolute right-0 top-full mt-2 w-72 sm:w-80 p-3 z-50 border-2 border-brand-200 space-y-2"
          >
            <div className="flex items-center justify-between border-b border-brand-100 pb-1.5">
              <span className="font-display text-xs font-extrabold text-brand-950">
                Notifications Feed
              </span>
              <PillBadge
                tone="sky"
                icon="dot"
                className="px-2 py-0.5 text-[10px]"
              >
                {alerts.length} New
              </PillBadge>
            </div>
            <div className="space-y-1.5">
              {alerts.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-xl border border-brand-100 bg-surface-pearl/80 p-2 transition-colors hover:bg-brand-50"
                >
                  <p className="font-display text-xs font-extrabold text-brand-950">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary">
                    {item.detail}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

