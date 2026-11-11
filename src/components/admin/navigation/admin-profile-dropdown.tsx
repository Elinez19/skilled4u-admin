"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ADMIN_PROFILE_SHORTCUTS, getInitials } from "./constants";
import type { EffectiveAdminUser } from "@/hooks/admin/use-admin-dropdowns";

export interface AdminProfileDropdownProps {
  profileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  profileRef: React.RefObject<HTMLDivElement | null>;
  effectiveUser: EffectiveAdminUser;
  showAvatarImage: boolean;
  onImageError: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

export function AdminProfileDropdown({
  profileOpen,
  onToggle,
  onClose,
  profileRef,
  effectiveUser,
  showAvatarImage,
  onImageError,
  onSignOut,
  isSigningOut = false,
}: AdminProfileDropdownProps) {
  return (
    <div ref={profileRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle user profile menu"
        aria-expanded={profileOpen}
        aria-haspopup="menu"
        className={cn(
          "group relative flex items-center gap-2 rounded-pill border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
          profileOpen
            ? "border-brand-500 bg-brand-50/90 shadow-gloss-card-hover"
            : "border-brand-100 bg-surface-porcelain/90 hover:border-brand-300 hover:bg-surface-porcelain shadow-gloss-card",
          "p-1 sm:pr-2.5"
        )}
      >
        {/* Avatar Badge with Offset Crescents and Online Status */}
        <div className="relative isolate grid h-8 w-8 shrink-0 place-items-center rounded-pill">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 translate-x-[-1.5px] translate-y-[1.5px] rounded-pill bg-accent-gold"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 translate-x-[-3px] translate-y-[3px] rounded-pill bg-accent-sky"
          />
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-pill border border-surface-porcelain bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-ink-on-blue shadow-inner">
            {showAvatarImage && effectiveUser.image ? (
              <Image
                src={effectiveUser.image}
                alt={effectiveUser.name}
                width={32}
                height={32}
                unoptimized
                onError={onImageError}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-[11px] font-extrabold tracking-tight">
                {getInitials(effectiveUser.name)}
              </span>
            )}
          </div>
          {/* Live Active Status Indicator Dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center"
            aria-hidden="true"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full border border-surface-porcelain bg-accent-success" />
          </span>
        </div>

        {/* User Name & Role (Visible on sm+ screens) */}
        <div className="hidden sm:block text-left min-w-0 max-w-[90px] md:max-w-[120px] lg:max-w-[140px]">
          <p className="truncate font-display text-xs font-extrabold text-brand-950 leading-tight">
            {effectiveUser.name}
          </p>
          <p className="truncate text-[10px] font-semibold text-brand-600 leading-tight">
            {effectiveUser.roleTitle}
          </p>
        </div>

        {/* Animated Chevron Down */}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-brand-600 transition-transform duration-200 shrink-0",
            profileOpen && "rotate-180 text-brand-700"
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            role="menu"
            aria-label="User profile dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: motionTokens.duration.fast }}
            className="surface-gloss-card absolute right-0 top-full mt-2 w-80 sm:w-84 p-3.5 z-50 rounded-2xl border-2 border-brand-200 shadow-gloss-float space-y-3"
          >
            {/* Top Specular Gloss Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[image:var(--gloss-sheen-white)] opacity-70"
            />

            {/* Admin Identity Card */}
            <div className="relative z-10 rounded-2xl border border-brand-100 bg-surface-pearl/90 p-3 shadow-gloss-card space-y-2.5">
              <div className="flex items-center gap-3">
                {/* Large Avatar with Signature Offset Rings */}
                <div className="relative isolate grid h-12 w-12 shrink-0 place-items-center rounded-pill">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 translate-x-[-2px] translate-y-[2px] rounded-pill bg-accent-gold"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-20 translate-x-[-4px] translate-y-[4px] rounded-pill bg-accent-sky"
                  />
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-pill border-2 border-surface-porcelain bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-ink-on-blue shadow-inner">
                    {showAvatarImage && effectiveUser.image ? (
                      <Image
                        src={effectiveUser.image}
                        alt={effectiveUser.name}
                        width={48}
                        height={48}
                        unoptimized
                        onError={onImageError}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-sm font-extrabold tracking-tight">
                        {getInitials(effectiveUser.name)}
                      </span>
                    )}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-porcelain bg-accent-success"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display text-sm font-extrabold text-brand-950">
                      {effectiveUser.name}
                    </p>
                    <ShieldCheck
                      className="h-3.5 w-3.5 text-brand-600 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="truncate text-xs font-semibold text-ink-secondary">
                    {effectiveUser.email}
                  </p>
                  <p className="truncate text-[10px] font-semibold text-brand-600">
                    {effectiveUser.roleTitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-brand-100">
                <PillBadge
                  tone="sky"
                  icon="dot"
                  className="px-2 py-0.5 text-[9px]"
                >
                  Admin Portal
                </PillBadge>
                <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2 py-0.5 font-display text-[9px] font-extrabold text-accent-success border border-brand-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-success animate-pulse" />
                  Active Session
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2 py-0.5 font-display text-[9px] font-extrabold text-brand-700 border border-brand-100">
                  <Lock className="h-2.5 w-2.5 text-accent-gold" />
                  Escrow Admin
                </span>
              </div>
            </div>

            {/* Quick Admin Navigation Shortcuts */}
            <div className="relative z-10 space-y-1">
              <p className="px-2 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                Portal Menu
              </p>
              {ADMIN_PROFILE_SHORTCUTS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={onClose}
                  className="group flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors hover:bg-surface-pearl text-brand-950"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-brand-100 bg-surface-porcelain text-brand-600 shadow-sm group-hover:border-brand-200 group-hover:bg-brand-50">
                      <item.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-xs font-extrabold text-brand-950 group-hover:text-brand-700">
                        {item.label}
                      </p>
                      <p className="truncate text-[10px] font-semibold text-ink-secondary">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-brand-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>

            {/* Sliding Idle Timeout & Security Badge */}
            <div className="relative z-10 rounded-xl border border-brand-100 bg-surface-pearl/60 p-2 flex items-center justify-between text-[10px] font-semibold text-ink-secondary">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="h-3 w-3 text-accent-gold shrink-0" />
                <span className="truncate">
                  Auto-lock after 30m idle inactivity
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold text-accent-success uppercase">
                Guarded
              </span>
            </div>

            {/* Sign Out Action */}
            <div className="relative z-10 pt-1 border-t border-brand-100">
              <button
                type="button"
                role="menuitem"
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                onClick={() => {
                  // Keep the menu open so the inline progress state stays visible
                  onSignOut();
                }}
                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-brand-200 bg-surface-porcelain px-3 py-2 text-xs font-extrabold text-brand-950 transition-all hover:border-brand-600 hover:bg-brand-600 hover:text-ink-on-blue shadow-gloss-card cursor-pointer disabled:cursor-wait disabled:border-brand-600 disabled:bg-brand-600 disabled:text-ink-on-blue"
              >
                <div className="flex items-center gap-2">
                  {isSigningOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-on-blue" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5 text-brand-600 group-hover:text-ink-on-blue transition-colors" />
                  )}
                  <span aria-live="polite">
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </span>
                </div>
                {!isSigningOut && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand-400 group-hover:text-ink-on-blue group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

