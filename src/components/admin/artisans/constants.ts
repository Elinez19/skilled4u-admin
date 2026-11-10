import type {
  AdminRecord,
  AdminScopeOption,
  ArtisanUserFormData,
  CustomerRecord,
} from "./types";

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust_1",
    name: "Amina Bello",
    email: "amina.bello@gmail.com",
    phone: "+234 809 332 1104",
    city: "Abuja (Wuse II)",
    bookingsCount: 8,
    status: "active",
    joinedAt: "Jan 14, 2026",
  },
  {
    id: "cust_2",
    name: "Toluwalase Adeyemi",
    email: "tolu.adeyemi@gmail.com",
    phone: "+234 803 741 9920",
    city: "Lagos (Lekki Phase 1)",
    bookingsCount: 5,
    status: "active",
    joinedAt: "Feb 03, 2026",
  },
  {
    id: "cust_3",
    name: "Chidinma Nwosu",
    email: "chidinma.nwosu@yahoo.com",
    phone: "+234 812 509 4418",
    city: "Abuja (Maitama)",
    bookingsCount: 3,
    status: "active",
    joinedAt: "Mar 19, 2026",
  },
  {
    id: "cust_4",
    name: "Ibrahim Danjuma",
    email: "ibrahim.danjuma@outlook.com",
    phone: "+234 805 612 8830",
    city: "Abuja (Gwarinpa)",
    bookingsCount: 2,
    status: "pending",
    joinedAt: "Oct 28, 2026",
  },
];

export const INITIAL_ADMINS: AdminRecord[] = [
  {
    id: "adm_1",
    name: "Elijah Admin",
    email: "admin@skilled4u.ng",
    roleTitle: "Super Administrator",
    permissions:
      "Full access: Users, Bookings, Financials, Disputes & Settings",
    adminScope: "super_admin",
    status: "verified",
    lastActive: "Online now",
  },
  {
    id: "adm_2",
    name: "Funke Oladipo",
    email: "trust@skilled4u.ng",
    roleTitle: "KYC & Dispute Moderator",
    permissions:
      "Artisan identity verification, dispute claims & review moderation",
    adminScope: "kyc_moderator",
    status: "verified",
    lastActive: "18 mins ago",
  },
  {
    id: "adm_3",
    name: "Sadiq Abdullahi",
    email: "dispatch@skilled4u.ng",
    roleTitle: "Dispatch & Support Lead",
    permissions:
      "Live booking dispatch, schedule updates & customer helpdesk",
    adminScope: "dispatch_support",
    status: "active",
    lastActive: "1 hour ago",
  },
];

export const USER_GROUP_OPTIONS = [
  { id: "artisan", label: "Artisan Pro" },
  { id: "customer", label: "Customer" },
  { id: "admin", label: "Administrator" },
] as const;

export const ARTISAN_KYC_OPTIONS = [
  { id: "verified", label: "Verified KYC" },
  { id: "pending", label: "Pending KYC" },
  { id: "rejected", label: "Rejected KYC" },
] as const;

export const CUSTOMER_STATUS_OPTIONS = [
  { id: "active", label: "Active Account" },
  { id: "pending", label: "On Hold / Pending" },
  { id: "suspended", label: "Suspended" },
] as const;

export const ADMIN_STATUS_OPTIONS = [
  { id: "verified", label: "Verified Admin" },
  { id: "active", label: "Active Staff" },
  { id: "suspended", label: "Suspended / Revoked" },
] as const;

export const ADMIN_SCOPE_OPTIONS = [
  {
    id: "super_admin" as AdminScopeOption,
    label: "Super Admin (Full Access: Users, Roles, KYC, Financials & Settings)",
  },
  {
    id: "kyc_moderator" as AdminScopeOption,
    label: "KYC Moderator (Artisan identity verification, NIN review & Disputes)",
  },
  {
    id: "dispatch_support" as AdminScopeOption,
    label: "Dispatch & Support Lead (Live booking dispatch, schedule & Helpdesk)",
  },
] as const;

export const DEFAULT_USER_FORM_DATA: ArtisanUserFormData = {
  formGroup: "artisan",
  editingId: null,
  name: "",
  email: "",
  phone: "+234 803 550 1920",
  city: "Abuja (Wuse II)",
  trade: "AC & Refrigeration Specialist",
  hourlyRateNumeric: "15000",
  ninNumber: "48192038471",
  bankName: "Access Bank",
  bankAccountNumber: "0148291042",
  kycStatus: "verified",
  customerStatus: "active",
  roleTitle: "Operations Administrator",
  permissions: "User verification, booking dispatch & escrow support",
  adminScope: "dispatch_support",
  adminStatus: "verified",
};
