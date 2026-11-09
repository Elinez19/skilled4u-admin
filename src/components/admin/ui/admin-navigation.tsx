"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  Headset,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { authClient } from "@/lib/auth-client";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AdminNavIconType =
  | "overview"
  | "bookings"
  | "categories"
  | "disputes"
  | "financials"
  | "reviews"
  | "settings"
  | "support"
  | "user-management";

export interface AdminNavItem {
  readonly label: string;
  readonly subtitle: string;
  readonly href: string;
  readonly icon: AdminNavIconType;
}

export const ADMIN_NAV_ITEMS: ReadonlyArray<AdminNavItem> = [
  {
    label: "Overview",
    subtitle: "Marketplace summary & activity",
    href: "/admin",
    icon: "overview",
  },
  {
    label: "Bookings",
    subtitle: "Manage bookings & dispatch",
    href: "/admin/bookings",
    icon: "bookings",
  },
  {
    label: "Categories",
    subtitle: "Service catalog & pricing",
    href: "/admin/categories",
    icon: "categories",
  },
  {
    label: "Disputes",
    subtitle: "Claims & escrow resolution",
    href: "/admin/disputes",
    icon: "disputes",
  },
  {
    label: "Financials",
    subtitle: "Payouts, fees & escrow ledger",
    href: "/admin/financials",
    icon: "financials",
  },
  {
    label: "Reviews",
    subtitle: "Customer ratings & moderation",
    href: "/admin/reviews",
    icon: "reviews",
  },
  {
    label: "Settings",
    subtitle: "Policies, fees & preferences",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    label: "Support",
    subtitle: "Customer & artisan helpdesk",
    href: "/admin/support",
    icon: "support",
  },
  {
    label: "UserManagement",
    subtitle: "Customers, artisans & admins",
    href: "/admin/user-management",
    icon: "user-management",
  },
] as const;

function NavIcon({
  type,
  className,
}: {
  type: AdminNavItem["icon"];
  className?: string;
}) {
  const iconClass = cn("h-4 w-4 shrink-0", className);
  switch (type) {
    case "overview":
      return <LayoutDashboard className={iconClass} />;
    case "bookings":
      return <CalendarCheck className={iconClass} />;
    case "categories":
      return <Layers className={iconClass} />;
    case "disputes":
      return <Scale className={iconClass} />;
    case "financials":
      return <CreditCard className={iconClass} />;
    case "reviews":
      return <Star className={iconClass} />;
    case "settings":
      return <Settings className={iconClass} />;
    case "support":
      return <Headset className={iconClass} />;
    case "user-management":
      return <Users className={iconClass} />;
  }
}

export function isAdminLinkActive(
  pathname: string | null,
  href: string
): boolean {
  if (!pathname) return href === "/admin";
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (href === "/admin/financials") {
    return (
      pathname.startsWith("/admin/financials") ||
      pathname.startsWith("/admin/payments")
    );
  }
  if (href === "/admin/user-management") {
    return (
      pathname.startsWith("/admin/user-management") ||
      pathname.startsWith("/admin/artisans")
    );
  }
  return pathname.startsWith(href);
}

function resolveActiveNavItem(pathname: string | null): AdminNavItem {
  return (
    ADMIN_NAV_ITEMS.find((item) => isAdminLinkActive(pathname, item.href)) ??
    ADMIN_NAV_ITEMS[0]
  );
}

interface SidebarContentProps {
  pathname: string | null;
  onNavigate?: () => void;
  onSignOut: () => void;
}

function SidebarContent({
  pathname,
  onNavigate,
  onSignOut,
}: SidebarContentProps) {
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
              <p className="font-display text-[11px] font-extrabold text-brand-950 leading-tight">
                Admin Portal Active
              </p>
              <p className="truncate text-[10px] font-semibold text-brand-600 leading-tight">
                Customers · Artisans · Admins
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
          className="w-full px-2 text-[11px]"
        >
          <LogOut className="h-3 w-3" />
          <span>Sign Out</span>
        </CtaButton>
      </div>
    </div>
  );
}

interface AdminDashboardNavbarProps {
  pathname: string | null;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onSignOut: () => void;
}

const LIVE_ALERTS = [
  {
    id: "alert-escrow",
    title: "Artisan Payout Settlement Ready",
    detail: "Completed A.C servicing job verified and ready for payout release.",
    href: "/admin/financials",
  },
  {
    id: "alert-kyc",
    title: "User & Artisan Verification",
    detail: "New artisan identity and payout credentials awaiting review.",
    href: "/admin/user-management",
  },
  {
    id: "alert-dispute",
    title: "Dispute Resolution Queue",
    detail: "Review open customer service claims and payment hold requests.",
    href: "/admin/disputes",
  },
] as const;

/**
 * Custom Glossy White Admin Dashboard Navbar
 * Sticky top command bar with dynamic module breadcrumbs, quick command search across
 * all 9 modules, live escrow status pill, notifications popover, and custom CTAs.
 */
export function AdminDashboardNavbar({
  pathname,
  mobileOpen,
  onToggleMobile,
  onSignOut,
}: AdminDashboardNavbarProps) {
  const router = useRouter();
  const activeItem = resolveActiveNavItem(pathname);
  const [query, setQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const alertsRef = React.useRef<HTMLDivElement>(null);

  const matchingModules = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_NAV_ITEMS;
    return ADMIN_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target as Node)
      ) {
        setAlertsOpen(false);
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

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
                <span>Admin Console</span>
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
          <div
            ref={searchRef}
            className="relative hidden md:block w-60 lg:w-72 xl:w-80"
          >
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-brand-600"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matchingModules.length > 0) {
                    router.push(matchingModules[0].href);
                    setSearchFocused(false);
                    setQuery("");
                  }
                }}
                placeholder="Jump to module (e.g. Financials, Disputes)..."
                aria-label="Quick jump to dashboard module"
                className="w-full rounded-pill border-2 border-brand-100 bg-surface-pearl/90 pl-9 pr-12 py-1.5 font-sans text-xs font-semibold text-brand-950 placeholder:text-ink-muted shadow-gloss-card transition-colors focus:border-brand-400 focus:bg-surface-porcelain focus:outline-none"
              />
              <span className="pointer-events-none absolute right-2.5 rounded-pill border border-brand-200 bg-surface-porcelain px-2 py-0.5 font-mono text-[10px] font-bold text-brand-700">
                Go
              </span>
            </div>

            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: motionTokens.duration.fast }}
                  className="surface-gloss-card no-scrollbar absolute inset-x-0 top-full mt-2 max-h-64 overflow-y-auto p-2 z-50 border-2 border-brand-200"
                >
                  <p className="px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                    Dashboard Modules ({matchingModules.length})
                  </p>
                  {matchingModules.length === 0 ? (
                    <p className="px-2.5 py-2 text-xs font-semibold text-ink-secondary">
                      No matching module found.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {matchingModules.map((mod) => {
                        const isCurrent = isAdminLinkActive(pathname, mod.href);
                        return (
                          <Link
                            key={mod.href}
                            href={mod.href}
                            onClick={() => {
                              setSearchFocused(false);
                              setQuery("");
                            }}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors",
                              isCurrent
                                ? "bg-brand-50 text-brand-700 font-extrabold"
                                : "text-brand-950 hover:bg-surface-pearl"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-brand-100 bg-surface-porcelain text-brand-600">
                                <NavIcon
                                  type={mod.icon}
                                  className="h-3.5 w-3.5"
                                />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-display text-xs font-extrabold">
                                  {mod.label}
                                </p>
                                <p className="truncate text-[10px] font-semibold text-ink-secondary">
                                  {mod.subtitle}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Live Escrow Badge + Alerts Popover + Strictly 2 Custom CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <PillBadge
              tone="sky"
              icon="dot"
              className="hidden 2xl:inline-flex px-3 py-1 text-[11px]"
            >
              90/10 Escrow Active
            </PillBadge>

            {/* Notifications Popover Trigger */}
            <div ref={alertsRef} className="relative">
              <button
                type="button"
                onClick={() => setAlertsOpen((prev) => !prev)}
                aria-label="View live operations alerts"
                className="relative grid h-8 w-8 place-items-center rounded-pill border-2 border-brand-100 bg-surface-porcelain text-brand-700 shadow-gloss-card transition-transform hover:scale-105 cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5" />
                <span
                  className="absolute -top-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-pill bg-brand-600 font-display text-[9px] font-extrabold text-ink-on-blue"
                  aria-hidden="true"
                >
                  {LIVE_ALERTS.length}
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
                        Live Operations Feed
                      </span>
                      <PillBadge
                        tone="sky"
                        icon="dot"
                        className="px-2 py-0.5 text-[10px]"
                      >
                        {LIVE_ALERTS.length} New
                      </PillBadge>
                    </div>
                    <div className="space-y-1.5">
                      {LIVE_ALERTS.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setAlertsOpen(false)}
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

            <CtaButton
              variant="primary"
              size="xs"
              onClick={onSignOut}
              className="px-2.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </CtaButton>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Dedicated Admin Sidebar Shell with Custom Glossy White Sidebar & Custom Dashboard Navbar
 * Provides a sticky full-height sidebar on desktop (`lg:w-64`) and a slide-over
 * sidebar drawer on mobile devices, paired with the custom dashboard navbar & workspace.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname ?? "";
  const [openOnPath, setOpenOnPath] = React.useState<string | null>(null);
  const mobileOpen = openOnPath === currentPath;

  const closeMobileSidebar = React.useCallback(() => {
    setOpenOnPath(null);
  }, []);

  const toggleMobileSidebar = React.useCallback(() => {
    setOpenOnPath((prev) => (prev === currentPath ? null : currentPath));
  }, [currentPath]);

  const handleSignOut = React.useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      closeMobileSidebar();
      router.push("/login");
      router.refresh();
    }
  }, [closeMobileSidebar, router]);

  return (
    <div className="no-scrollbar min-h-screen flex bg-surface-pearl text-ink-primary">
      {/* Desktop Sticky Sidebar (Premium Glossy White, No Scrollbars) */}
      <aside className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarContent pathname={pathname} onSignOut={handleSignOut} />
        </div>
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionTokens.duration.fast }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-surface-glass-dark backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={motionTokens.spring.snappy}
              className="relative z-10 h-full w-72 max-w-[85vw] overflow-hidden"
            >
              <SidebarContent
                pathname={pathname}
                onNavigate={closeMobileSidebar}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Right Main Column with Custom Dashboard Navbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminDashboardNavbar
          pathname={pathname}
          mobileOpen={mobileOpen}
          onToggleMobile={toggleMobileSidebar}
          onSignOut={handleSignOut}
        />

        {/* Main Admin Content Area */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-2.5 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
