"use client";

import * as React from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { useAdminDropdowns } from "@/hooks/admin/use-admin-dropdowns";
import { useAdminSearch } from "@/hooks/admin/use-admin-search";
import { AdminAlertsPopover } from "./admin-alerts-popover";
import { AdminCommandSearch } from "./admin-command-search";
import { AdminProfileDropdown } from "./admin-profile-dropdown";
import { resolveActiveNavItem } from "./constants";
import { NavIcon } from "./nav-icon";
import type { AdminDashboardNavbarProps } from "./types";

/**
 * Custom Glossy White Admin Dashboard Navbar
 * Sticky top command bar with dynamic module breadcrumbs, quick command search across
 * all 9 modules, live escrow status pill, notifications popover, and user profile avatar with dropdown.
 */
export function AdminDashboardNavbar({
  pathname,
  mobileOpen,
  onToggleMobile,
  onSignOut,
  isSigningOut = false,
  adminUser,
}: AdminDashboardNavbarProps) {
  const activeItem = resolveActiveNavItem(pathname);

  const {
    query,
    setQuery,
    searchFocused,
    setSearchFocused,
    searchRef,
    matchingModules,
    handleKeyDown,
    selectModule,
  } = useAdminSearch();

  const {
    alertsOpen,
    toggleAlerts,
    closeAlerts,
    alertsRef,
    profileOpen,
    toggleProfile,
    closeProfile,
    profileRef,
    effectiveUser,
    showAvatarImage,
    handleImageError,
  } = useAdminDropdowns({
    pathname,
    adminUser,
    searchRef,
    onCloseSearch: () => setSearchFocused(false),
  });

  return (
    <header className="sticky top-0 z-30 px-2.5 sm:px-4 lg:px-5 pt-2.5 sm:pt-3">
      <div className="surface-navbar-gloss-white relative mx-auto max-w-[1600px] rounded-2xl sm:rounded-3xl border-2 border-brand-100 px-3.5 sm:px-5 py-2.5">
        {/* Top Specular Gloss Sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden rounded-2xl sm:rounded-3xl"
        >
          <div className="h-16 w-full bg-[image:var(--gloss-sheen-white)] opacity-60" />
          <ToolPattern tone="on-light" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Left: Mobile Drawer Button + Active Module Emblem & Breadcrumb */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleMobile}
              aria-label="Toggle admin sidebar"
              className="cta-surface-primary grid h-9 w-9 shrink-0 place-items-center rounded-xl lg:hidden cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            <OffsetRing
              size="xs"
              faceTone="blue"
              className="hidden sm:inline-grid h-9 w-9 shrink-0"
            >
              <NavIcon
                type={activeItem.icon}
                className="h-4 w-4 text-ink-on-blue"
              />
            </OffsetRing>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-display font-extrabold uppercase tracking-wider text-brand-600">
                <span>Admin Portal</span>
                <ChevronRight
                  className="h-3 w-3 text-brand-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate text-brand-800">
                  {activeItem.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-sm sm:text-base font-extrabold tracking-tight text-brand-950">
                  {activeItem.label}
                </h2>
                <span className="hidden md:inline-block text-xs font-semibold text-ink-secondary truncate">
                  · {activeItem.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Quick Module Command Search */}
          <AdminCommandSearch
            query={query}
            onQueryChange={setQuery}
            searchFocused={searchFocused}
            onFocus={() => setSearchFocused(true)}
            searchRef={searchRef}
            matchingModules={matchingModules}
            onSelectModule={selectModule}
            onKeyDown={handleKeyDown}
            pathname={pathname}
          />

          {/* Right: Live Escrow Badge + Alerts Popover + User Profile Avatar Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <PillBadge
              tone="sky"
              icon="dot"
              className="hidden 2xl:inline-flex px-3 py-1 text-[11px]"
            >
              90/10 Escrow Active
            </PillBadge>

            {/* Notifications Popover */}
            <AdminAlertsPopover
              alertsOpen={alertsOpen}
              onToggle={toggleAlerts}
              onClose={closeAlerts}
              alertsRef={alertsRef}
            />

            {/* User Profile Avatar with Dropdown */}
            <AdminProfileDropdown
              profileOpen={profileOpen}
              onToggle={toggleProfile}
              onClose={closeProfile}
              profileRef={profileRef}
              effectiveUser={effectiveUser}
              showAvatarImage={showAvatarImage}
              onImageError={handleImageError}
              onSignOut={onSignOut}
              isSigningOut={isSigningOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

