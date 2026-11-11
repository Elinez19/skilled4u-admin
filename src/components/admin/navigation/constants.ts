import {
  CreditCard,
  Scale,
  Settings,
  Users,
} from "lucide-react";
import type {
  AdminAlertItem,
  AdminNavItem,
  AdminProfileShortcut,
} from "./types";

export const ADMIN_NAV_ITEMS: ReadonlyArray<AdminNavItem> = [
  {
    label: "Overview",
    subtitle: "Admin portal overview",
    href: "/admin",
    icon: "overview",
  },
  {
    label: "UserManagement",
    subtitle: "Customers, artisans & admins",
    href: "/admin/user-management",
    icon: "user-management",
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
  
] as const;

export const ADMIN_PROFILE_SHORTCUTS: ReadonlyArray<AdminProfileShortcut> = [
  {
    label: "Platform Settings",
    subtitle: "Policies, dispute rules & fees",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "User Management",
    subtitle: "Customers, artisans & admin team",
    href: "/admin/user-management",
    icon: Users,
  },
  {
    label: "Financials & Escrow",
    subtitle: "Payouts, 90/10 split & ledger",
    href: "/admin/financials",
    icon: CreditCard,
  },
  {
    label: "Dispute Center",
    subtitle: "Arbitration & customer claims",
    href: "/admin/disputes",
    icon: Scale,
  },
] as const;

export const LIVE_ALERTS: ReadonlyArray<AdminAlertItem> = [
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

export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const ADMIN_WARNING_THRESHOLD_MS = 28 * 60 * 1000; // Warn at 28 minutes (2m before timeout)

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

export function resolveActiveNavItem(pathname: string | null): AdminNavItem {
  return (
    ADMIN_NAV_ITEMS.find((item) => isAdminLinkActive(pathname, item.href)) ??
    ADMIN_NAV_ITEMS[0]
  );
}

export function getInitials(name?: string | null): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

