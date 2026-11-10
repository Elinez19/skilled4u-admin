/**
 * Bookings Dispatch Workspace Composite
 * Separates concerns across:
 * - Domain Types: "@/components/admin/bookings/types"
 * - Constants: "@/components/admin/bookings/constants"
 * - Custom Hooks: "@/hooks/admin"
 * - Modular UI: "@/components/admin/bookings/*"
 */

export * from "@/components/admin/bookings/types";
export * from "@/components/admin/bookings/constants";
export * from "@/components/admin/bookings/booking-dispatch-form";
export * from "@/components/admin/bookings/booking-dispatch-table";
export * from "@/components/admin/bookings/bookings-dispatch-workspace";
