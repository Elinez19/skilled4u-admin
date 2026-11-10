"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminIdleWarningBannerProps {
  idleSecondsRemaining: number | null;
  onStaySignedIn: () => void;
  onSignOut: () => void;
}

export function AdminIdleWarningBanner({
  idleSecondsRemaining,
  onStaySignedIn,
  onSignOut,
}: AdminIdleWarningBannerProps) {
  return (
    <AnimatePresence>
      {idleSecondsRemaining !== null && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mx-auto mt-2.5 w-full max-w-[1600px] px-2.5 sm:px-4 lg:px-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-accent-gold bg-brand-950 px-4 py-2.5 text-xs font-bold text-ink-on-blue shadow-gloss-float">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-gold shrink-0" />
              <span>
                Inactivity Warning: Your administrator session will expire in{" "}
                <strong className="font-mono text-accent-gold">
                  {Math.floor(idleSecondsRemaining / 60)}:
                  {String(idleSecondsRemaining % 60).padStart(2, "0")}
                </strong>
                .
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CtaButton
                variant="secondary"
                size="xs"
                onClick={onStaySignedIn}
              >
                <span>Stay Signed In</span>
              </CtaButton>
              <CtaButton
                variant="primary"
                size="xs"
                onClick={onSignOut}
              >
                <span>Sign Out</span>
              </CtaButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

