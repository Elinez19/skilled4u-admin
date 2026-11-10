import type { ArtisanRow, UserRow } from "@/db/schema";

export type UserViewFilter =
  | "artisans_all"
  | "artisans_pending"
  | "artisans_verified"
  | "customers"
  | "admins";

export type FormUserGroup = "artisan" | "customer" | "admin";

export type ArtisanKycStatus = "verified" | "pending" | "rejected";
export type CustomerAccountStatus = "active" | "pending";
export type AdminAccountStatus = "verified" | "active";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bookingsCount: number;
  status: CustomerAccountStatus;
  joinedAt: string;
}

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  permissions: string;
  status: AdminAccountStatus;
  lastActive: string;
}

export interface ArtisanUserFormData {
  formGroup: FormUserGroup;
  editingId: string | null;
  name: string;
  email: string;
  phone: string;
  city: string;

  // Artisan fields
  trade: string;
  hourlyRateNumeric: string;
  ninNumber: string;
  bankName: string;
  bankAccountNumber: string;
  kycStatus: ArtisanKycStatus;

  // Customer fields
  bookingsCount: string;
  customerStatus: CustomerAccountStatus;

  // Admin fields
  roleTitle: string;
  permissions: string;
  adminStatus: AdminAccountStatus;
}

