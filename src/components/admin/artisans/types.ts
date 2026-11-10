export type UserViewFilter =
  | "artisans_all"
  | "artisans_pending"
  | "artisans_verified"
  | "customers"
  | "admins";

export type FormUserGroup = "artisan" | "customer" | "admin";

export type ArtisanKycStatus = "verified" | "pending" | "rejected";
export type CustomerAccountStatus = "active" | "pending" | "suspended";
export type AdminAccountStatus = "verified" | "active" | "suspended";
export type AdminScopeOption = "super_admin" | "kyc_moderator" | "dispatch_support";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bookingsCount: number;
  status: CustomerAccountStatus;
  joinedAt: string;
  banned?: boolean;
}

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  permissions: string;
  adminScope: AdminScopeOption;
  status: AdminAccountStatus;
  mustChangePassword?: boolean;
  lastActive: string;
  banned?: boolean;
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
  customerStatus: CustomerAccountStatus;

  // Admin fields
  roleTitle: string;
  permissions: string;
  adminScope: AdminScopeOption;
  adminStatus: AdminAccountStatus;
}
