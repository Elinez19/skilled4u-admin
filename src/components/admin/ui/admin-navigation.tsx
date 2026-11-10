/**
 * Admin Navigation & Shell Architecture
 * Separates concerns across:
 * - Domain Types: "@/components/admin/navigation/types"
 * - Constants & Helpers: "@/components/admin/navigation/constants"
 * - Custom Hooks: "@/hooks/admin"
 * - Presentation Components: "@/components/admin/navigation/*"
 */

export * from "@/components/admin/navigation/types";
export * from "@/components/admin/navigation/constants";
export * from "@/components/admin/navigation/nav-icon";
export * from "@/components/admin/navigation/admin-sidebar";
export * from "@/components/admin/navigation/admin-command-search";
export * from "@/components/admin/navigation/admin-alerts-popover";
export * from "@/components/admin/navigation/admin-profile-dropdown";
export * from "@/components/admin/navigation/admin-idle-warning-banner";
export * from "@/components/admin/navigation/admin-dashboard-navbar";
export * from "@/components/admin/navigation/admin-shell";
