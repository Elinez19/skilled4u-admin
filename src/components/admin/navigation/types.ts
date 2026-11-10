import type * as React from "react";

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

export interface AdminUserProfile {
  readonly id?: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly image?: string | null;
  readonly role?: string | null;
  readonly adminRoleTitle?: string | null;
  readonly adminPermissions?: string | null;
}

export interface AdminDashboardNavbarProps {
  pathname: string | null;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onSignOut: () => void;
  adminUser?: AdminUserProfile | null;
}

export interface AdminSidebarProps {
  pathname: string | null;
  onNavigate?: () => void;
  onSignOut: () => void;
  adminName?: string;
  adminRoleTitle?: string;
}

export interface AdminAlertItem {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly href: string;
}

export interface AdminProfileShortcut {
  readonly label: string;
  readonly subtitle: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

