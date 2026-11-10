/**
 * Re-export facade for backwards compatibility with existing imports.
 * The modular implementation resides in `@/components/admin/overview/`.
 */
export {
  resolveCategoryArtwork,
  OverviewWorkspace as OverviewDashboard,
  OverviewKpiSummary,
  OverviewRecentBookingsTable,
  OverviewPendingKycQueue,
  OverviewCategoriesPreview,
} from "@/components/admin/overview";
export type {
  OverviewDashboardProps,
  OverviewKpiData,
} from "@/components/admin/overview";
