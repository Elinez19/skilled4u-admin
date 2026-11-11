"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, isAdminLinkActive } from "./constants";
import { NavIcon } from "./nav-icon";
import type { AdminSidebarProps } from "./types";

export function AdminSidebar({
  pathname,
  onNavigate,
  onSignOut,
  isSigningOut = false,
  adminName,
  adminRoleTitle,
}: AdminSidebarProps) {
  return (
    <div className="surface-sidebar-gloss-white no-scrollbar relative flex h-full w-full flex-col justify-between overflow-y-auto border-r-2 border-brand-100 px-3.5 py-3.5 text-ink-primary">
      {/* Top Specular Gloss Sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[image:var(--gloss-sheen-blue)] opacity-45"
      />
      <ToolPattern tone="on-light" />

      {/* Top Brand Identity & 9 Navigation Links */}
      <div className="relative z-10 space-y-3">
        {/* Brand Logo + Console Pill */}
        <div className="flex items-center justify-between gap-2 px-1 pb-1 border-b border-brand-100/80">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="group focus:outline-none"
          >
            <BrandLogo tone="on-light" size="sm" />
          </Link>
          <PillBadge
            tone="sky"
            icon="dot"
            className="px-2.5 py-0.5 text-[10px]"
          >
            Admin
          </PillBadge>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-2.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
            Admin Portal
          </p>

          <nav aria-label="Admin Sidebar" className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = isAdminLinkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative isolate flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
                    active
                      ? "text-ink-on-blue"
                      : "text-brand-950 hover:bg-brand-50/90 hover:text-brand-700"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-sidebar-active-pill"
                      transition={motionTokens.spring.snappy}
                      className="cta-surface-primary absolute inset-0 -z-10 rounded-xl"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors",
                      active
                        ? "border-surface-porcelain bg-surface-porcelain text-brand-600 shadow-gloss-card"
                        : "border-brand-100 bg-surface-pearl text-brand-600 shadow-gloss-card group-hover:border-brand-200 group-hover:bg-surface-porcelain"
                    )}
                  >
                    <NavIcon type={item.icon} className="h-3.5 w-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate font-display text-xs font-extrabold leading-tight",
                        active
                          ? "text-ink-on-blue"
                          : "text-brand-950 group-hover:text-brand-700"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>

                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      active
                        ? "text-accent-gold translate-x-0.5"
                        : "text-brand-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Operations Status & Auth Actions */}
      <div className="relative z-10 mt-2 space-y-2 border-t border-brand-100 pt-2.5">
        {/* Glossy Operations Status Card */}
        <div className="rounded-2xl border-2 border-brand-100 bg-surface-pearl/90 p-2.5 shadow-gloss-card space-y-1.5">
          <div className="flex items-center gap-2">
            <OffsetRing size="xs" faceTone="blue" className="h-7 w-7 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-gold" />
            </OffsetRing>
            <div className="min-w-0">
              <p className="truncate font-display text-[11px] font-extrabold text-brand-950 leading-tight">
                {adminName || "Admin Portal Active"}
              </p>
              <p className="truncate text-[10px] font-semibold text-brand-600 leading-tight">
                {adminRoleTitle || "Customers · Artisans · Admins"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2 py-0.5 font-display text-[9px] font-extrabold text-brand-700 border border-brand-100">
              <Users className="h-2.5 w-2.5 text-brand-600" />
              Verified Artisans
            </span>
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2 py-0.5 font-display text-[9px] font-extrabold text-brand-700 border border-brand-100">
              <Lock className="h-2.5 w-2.5 text-accent-gold" />
              Escrow Safe
            </span>
          </div>
        </div>

        {/* Sign Out Action */}
        <CtaButton
          variant="primary"
          size="xs"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="w-full px-2 text-[11px]"
        >
          {isSigningOut ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <LogOut className="h-3 w-3" />
          )}
          <span aria-live="polite">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </span>
        </CtaButton>
      </div>
    </div>
  );
}

