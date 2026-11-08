"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Landmark,
  Pencil,
  Plus,
  Power,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminActionMenu } from "@/components/admin/ui/admin-action-menu";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-data-table";
import {
  AdminInlineForm,
  AdminSearchInput,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { ArtisanRow } from "@/db/schema";

type UserViewFilter =
  | "artisans_all"
  | "artisans_pending"
  | "artisans_verified"
  | "customers"
  | "admins";

type FormUserGroup = "artisan" | "customer" | "admin";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bookingsCount: number;
  status: "active" | "pending";
  joinedAt: string;
}

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  permissions: string;
  status: "active" | "verified";
  lastActive: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
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

const INITIAL_ADMINS: AdminRecord[] = [
  {
    id: "adm_1",
    name: "Elijah Admin",
    email: "admin@skilled4u.ng",
    roleTitle: "Super Administrator",
    permissions:
      "Full access: Users, Bookings, Financials, Disputes & Settings",
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
    status: "active",
    lastActive: "1 hour ago",
  },
];

const USER_GROUP_OPTIONS = [
  { id: "artisan", label: "Artisan Pro" },
  { id: "customer", label: "Customer" },
  { id: "admin", label: "Administrator" },
] as const;

const ARTISAN_KYC_OPTIONS = [
  { id: "verified", label: "Verified KYC" },
  { id: "pending", label: "Pending KYC" },
  { id: "rejected", label: "Rejected KYC" },
] as const;

const CUSTOMER_STATUS_OPTIONS = [
  { id: "active", label: "Active Account" },
  { id: "pending", label: "On Hold / Pending" },
] as const;

const ADMIN_STATUS_OPTIONS = [
  { id: "verified", label: "Verified Admin" },
  { id: "active", label: "Active Staff" },
] as const;

export function ArtisansKycWorkspace({
  initialArtisans,
}: {
  initialArtisans: ArtisanRow[];
}) {
  const router = useRouter();
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<ArtisanRow[]>(initialArtisans);
  const [customers, setCustomers] =
    React.useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [admins, setAdmins] = React.useState<AdminRecord[]>(INITIAL_ADMINS);
  const [filter, setFilter] = React.useState<UserViewFilter>("artisans_all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Inline Form State (replaces modal)
  const [formOpen, setFormOpen] = React.useState(true);
  const [formGroup, setFormGroup] = React.useState<FormUserGroup>("artisan");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [savedBanner, setSavedBanner] = React.useState<string | null>(null);

  // Shared & role-specific form fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+234 803 550 1920");
  const [city, setCity] = React.useState("Abuja (Wuse II)");

  // Artisan-specific fields
  const [trade, setTrade] = React.useState("AC & Refrigeration Specialist");
  const [hourlyRateNumeric, setHourlyRateNumeric] = React.useState("15000");
  const [ninNumber, setNinNumber] = React.useState("48192038471");
  const [bankName, setBankName] = React.useState("Access Bank");
  const [bankAccountNumber, setBankAccountNumber] =
    React.useState("0148291042");
  const [kycStatus, setKycStatus] = React.useState<
    "verified" | "pending" | "rejected"
  >("verified");

  // Customer-specific fields
  const [bookingsCount, setBookingsCount] = React.useState("1");
  const [customerStatus, setCustomerStatus] = React.useState<
    "active" | "pending"
  >("active");

  // Admin-specific fields
  const [roleTitle, setRoleTitle] = React.useState("Operations Coordinator");
  const [permissions, setPermissions] = React.useState(
    "User verification, booking dispatch & escrow support"
  );
  const [adminStatus, setAdminStatus] = React.useState<"verified" | "active">(
    "verified"
  );

  function notifySaved(msg: string) {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }

  function scrollToForm() {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function resetForm(nextGroup?: FormUserGroup) {
    const targetGroup = nextGroup ?? formGroup;
    setEditingId(null);
    setFormGroup(targetGroup);
    setName("");
    setEmail("");
    setPhone("+234 803 550 1920");
    setCity("Abuja (Wuse II)");
    setTrade("AC & Refrigeration Specialist");
    setHourlyRateNumeric("15000");
    setNinNumber("48192038471");
    setBankName("Access Bank");
    setBankAccountNumber("0148291042");
    setKycStatus("verified");
    setBookingsCount("1");
    setCustomerStatus("active");
    setRoleTitle("Operations Coordinator");
    setPermissions("User verification, booking dispatch & escrow support");
    setAdminStatus("verified");
  }

  function loadArtisanIntoForm(art: ArtisanRow) {
    setFormGroup("artisan");
    setEditingId(art.id);
    setName(art.name);
    setEmail(art.email);
    setPhone(art.phone);
    setCity(art.city);
    setTrade(art.trade);
    setHourlyRateNumeric(String(art.hourlyRateNumeric || 15000));
    setNinNumber(art.ninNumber || "48192038471");
    setBankName(art.bankName || "Access Bank");
    setBankAccountNumber(art.bankAccountNumber || "0148291042");
    setKycStatus(
      (art.kycStatus as "verified" | "pending" | "rejected") || "pending"
    );
    scrollToForm();
  }

  function loadCustomerIntoForm(cust: CustomerRecord) {
    setFormGroup("customer");
    setEditingId(cust.id);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setCity(cust.city);
    setBookingsCount(String(cust.bookingsCount));
    setCustomerStatus(cust.status);
    scrollToForm();
  }

  function loadAdminIntoForm(adm: AdminRecord) {
    setFormGroup("admin");
    setEditingId(adm.id);
    setName(adm.name);
    setEmail(adm.email);
    setRoleTitle(adm.roleTitle);
    setPermissions(adm.permissions);
    setAdminStatus(adm.status);
    scrollToForm();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (formGroup === "artisan") {
        const rateNum = Number(hourlyRateNumeric) || 15000;
        const formattedRate = `₦${rateNum.toLocaleString()}`;

        if (editingId) {
          const res = await fetch("/api/v1/artisans", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingId,
              name,
              email,
              phone,
              trade,
              city,
              hourlyRate: formattedRate,
              hourlyRateNumeric: rateNum,
              ninNumber,
              bankName,
              bankAccountNumber,
              kycStatus,
            }),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) =>
              prev.map((a) => (a.id === editingId ? data : a))
            );
            router.refresh();
          } else {
            setItems((prev) =>
              prev.map((a) =>
                a.id === editingId
                  ? {
                      ...a,
                      name,
                      email,
                      phone,
                      trade,
                      city,
                      hourlyRate: formattedRate,
                      hourlyRateNumeric: rateNum,
                      ninNumber,
                      bankName,
                      bankAccountNumber,
                      kycStatus,
                    }
                  : a
              )
            );
          }
          notifySaved(`Updated artisan ${name}`);
          resetForm("artisan");
        } else {
          const res = await fetch("/api/v1/artisans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              phone,
              trade,
              city,
              hourlyRate: formattedRate,
              hourlyRateNumeric: rateNum,
              ninNumber,
              bankName,
              bankAccountNumber,
              kycStatus,
            }),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) => [data, ...prev]);
            router.refresh();
          } else {
            const fallbackArtisan: ArtisanRow = {
              id: `art_${Date.now()}`,
              userId: null,
              name,
              email: email || "pro@skilled4u.ng",
              phone,
              trade,
              categoryId: null,
              serviceKey: "general",
              profileImage: "/images/landing/hero-artisan.png",
              hourlyRate: formattedRate,
              hourlyRateNumeric: rateNum,
              about: `Verified ${trade} pro serving ${city}.`,
              skills: [trade],
              portfolioImages: [],
              rating: 5.0,
              reviewsCount: 1,
              completedJobs: 1,
              distance: "2.0 km",
              city,
              address: city,
              latitude: 9.0765,
              longitude: 7.3986,
              isOnline: true,
              kycStatus,
              ninNumber,
              bankName,
              bankAccountNumber,
              bankAccountName: name,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setItems((prev) => [fallbackArtisan, ...prev]);
          }
          notifySaved(`Added artisan ${name}`);
          resetForm("artisan");
        }
      } else if (formGroup === "customer") {
        if (editingId) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? {
                    ...c,
                    name,
                    email,
                    phone,
                    city,
                    bookingsCount: Number(bookingsCount) || 0,
                    status: customerStatus,
                  }
                : c
            )
          );
          notifySaved(`Updated customer ${name}`);
        } else {
          const newCustomer: CustomerRecord = {
            id: `cust_${Date.now()}`,
            name,
            email,
            phone,
            city,
            bookingsCount: Number(bookingsCount) || 0,
            status: customerStatus,
            joinedAt: "Just now",
          };
          setCustomers((prev) => [newCustomer, ...prev]);
          setFilter("customers");
          notifySaved(`Added customer ${name}`);
        }
        resetForm("customer");
      } else {
        if (editingId) {
          setAdmins((prev) =>
            prev.map((adm) =>
              adm.id === editingId
                ? {
                    ...adm,
                    name,
                    email,
                    roleTitle,
                    permissions,
                    status: adminStatus,
                  }
                : adm
            )
          );
          notifySaved(`Updated admin ${name}`);
        } else {
          const newAdmin: AdminRecord = {
            id: `adm_${Date.now()}`,
            name,
            email,
            roleTitle,
            permissions,
            status: adminStatus,
            lastActive: "Online now",
          };
          setAdmins((prev) => [newAdmin, ...prev]);
          setFilter("admins");
          notifySaved(`Added administrator ${name}`);
        }
        resetForm("admin");
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateArtisanKyc(id: string, nextKycStatus: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/artisans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kycStatus: nextKycStatus }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((a) => (a.id === id ? data : a)));
        router.refresh();
      } else {
        setItems((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, kycStatus: nextKycStatus } : a
          )
        );
      }
      notifySaved(`KYC status set to ${nextKycStatus}`);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleArtisanOnline(art: ArtisanRow) {
    setBusyId(art.id);
    try {
      const nextOnline = !art.isOnline;
      const res = await fetch("/api/v1/artisans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: art.id, isOnline: nextOnline }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((a) => (a.id === art.id ? data : a)));
      } else {
        setItems((prev) =>
          prev.map((a) =>
            a.id === art.id ? { ...a, isOnline: nextOnline } : a
          )
        );
      }
      notifySaved(
        `${art.name} marked ${!art.isOnline ? "Online" : "Offline"}`
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteArtisan(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) resetForm("artisan");
    try {
      await fetch(`/api/v1/artisans?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      // Optimistically removed
    }
    notifySaved("Artisan record removed");
  }

  function toggleCustomerStatus(id: string) {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "pending" : "active" }
          : c
      )
    );
    notifySaved("Customer account status updated");
  }

  function deleteCustomer(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForm("customer");
    notifySaved("Customer account removed");
  }

  function toggleAdminStatus(id: string) {
    setAdmins((prev) =>
      prev.map((adm) =>
        adm.id === id
          ? {
              ...adm,
              status: adm.status === "verified" ? "active" : "verified",
            }
          : adm
      )
    );
    notifySaved("Administrator status updated");
  }

  function deleteAdmin(id: string) {
    setAdmins((prev) => prev.filter((adm) => adm.id !== id));
    if (editingId === id) resetForm("admin");
    notifySaved("Administrator access revoked");
  }

  const counts = React.useMemo(
    () => ({
      all: items.length,
      verified: items.filter((a) => a.kycStatus === "verified").length,
      pending: items.filter((a) => a.kycStatus === "pending").length,
      rejected: items.filter((a) => a.kycStatus === "rejected").length,
    }),
    [items]
  );

  const tabOptions: ReadonlyArray<AdminTabOption<UserViewFilter>> = [
    { id: "artisans_all", label: "Artisans", count: counts.all },
    { id: "artisans_pending", label: "Pending KYC", count: counts.pending },
    { id: "artisans_verified", label: "Verified Pros", count: counts.verified },
    { id: "customers", label: "Customers", count: customers.length },
    { id: "admins", label: "Admins", count: admins.length },
  ];

  const q = search.toLowerCase();

  const filteredArtisans = items.filter((a) => {
    const matchesStatus =
      filter === "artisans_all" ||
      (filter === "artisans_pending" && a.kycStatus === "pending") ||
      (filter === "artisans_verified" && a.kycStatus === "verified");
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.trade.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  );

  const filteredAdmins = admins.filter(
    (adm) =>
      !q ||
      adm.name.toLowerCase().includes(q) ||
      adm.email.toLowerCase().includes(q) ||
      adm.roleTitle.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customers · Artisans · Administrators"
        eyebrowIcon="shield"
        headline="User Management & Verification Desk."
        highlightWords={["User", "Management", "Verification"]}
        subtitle="Add, edit, and manage customer accounts, verify artisan identity and bank payout credentials, and configure administrator roles using the inline form below."
        primaryCta={{
          label: "Add New User",
          onClick: () => {
            resetForm(
              filter === "customers"
                ? "customer"
                : filter === "admins"
                  ? "admin"
                  : "artisan"
            );
            scrollToForm();
          },
          variant: "primary",
          icon: <UserPlus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "View Bookings Dispatch",
          href: "/admin/bookings",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Top 3 KPI Summary Cards across all 3 user groups */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Artisans & Service Pros"
              value={`${counts.all} Pros`}
              badgeText={`${counts.verified} verified · ${counts.pending} awaiting KYC`}
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="blue"
              icon={<Users className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Registered Customers"
              value={`${customers.length} Clients`}
              badgeText="Homeowners & business accounts"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="ink"
              icon={<UserCheck className="h-4 w-4 text-accent-success" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Platform Administrators"
              value={`${admins.length} Admins`}
              badgeText="Operations, KYC & support staff"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Manage Users (Artisans, Customers, Admins) */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline User Management Form"
            title={
              editingId
                ? `Edit & Manage ${
                    formGroup === "artisan"
                      ? "Artisan Pro"
                      : formGroup === "customer"
                        ? "Customer Account"
                        : "Administrator"
                  }: ${name}`
                : "Add, Edit & Manage Platform Users"
            }
            description="Create a new artisan, customer, or administrator account—or select any row from the table menu below to edit and manage credentials inline."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Editing ${formGroup.toUpperCase()}`}
            onResetToCreate={() => resetForm(formGroup)}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <AdminSelectPills
                label="Select User Group"
                options={USER_GROUP_OPTIONS}
                value={formGroup}
                onChange={(val) => {
                  setEditingId(null);
                  setFormGroup(val);
                }}
                columns={3}
              />

              {formGroup === "artisan" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <AdminTextField
                      label="Artisan Full Name"
                      placeholder="e.g. Chukwuma Nwankwo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Email Address"
                      type="email"
                      placeholder="pro@skilled4u.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="City & Dispatch Zone"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <AdminTextField
                      label="Trade / Specialty"
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Hourly Rate (NGN)"
                      type="number"
                      min={1000}
                      value={hourlyRateNumeric}
                      onChange={(e) => setHourlyRateNumeric(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="NIN Verification Number"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Settlement Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="NUBAN Account Number"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      required
                    />
                  </div>

                  <AdminSelectPills
                    label="KYC Verification Status"
                    options={ARTISAN_KYC_OPTIONS}
                    value={kycStatus}
                    onChange={setKycStatus}
                    columns={3}
                  />
                </>
              )}

              {formGroup === "customer" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <AdminTextField
                      label="Customer Full Name"
                      placeholder="e.g. Zainab Lawal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Email Address"
                      type="email"
                      placeholder="customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="City & Neighborhood"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminTextField
                      label="Completed Bookings Count"
                      type="number"
                      min={0}
                      value={bookingsCount}
                      onChange={(e) => setBookingsCount(e.target.value)}
                      required
                    />
                    <AdminSelectPills
                      label="Customer Account Standing"
                      options={CUSTOMER_STATUS_OPTIONS}
                      value={customerStatus}
                      onChange={setCustomerStatus}
                      columns={2}
                    />
                  </div>
                </>
              )}

              {formGroup === "admin" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <AdminTextField
                      label="Administrator Full Name"
                      placeholder="e.g. Kemi Adewale"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Official Email"
                      type="email"
                      placeholder="kemi@skilled4u.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Assigned Role Title"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminTextField
                      label="Management Permissions Scope"
                      value={permissions}
                      onChange={(e) => setPermissions(e.target.value)}
                      required
                    />
                    <AdminSelectPills
                      label="Admin Access Status"
                      options={ADMIN_STATUS_OPTIONS}
                      value={adminStatus}
                      onChange={setAdminStatus}
                      columns={2}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-surface-frost">
                {editingId && (
                  <CtaButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => resetForm(formGroup)}
                  >
                    Cancel Edit
                  </CtaButton>
                )}
                <CtaButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                >
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{saving ? "Saving..." : "Update User Record"}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>
                        {saving
                          ? "Creating..."
                          : `Add ${
                              formGroup === "artisan"
                                ? "Artisan Pro"
                                : formGroup === "customer"
                                  ? "Customer"
                                  : "Administrator"
                            }`}
                      </span>
                    </>
                  )}
                </CtaButton>
              </div>
            </form>
          </AdminInlineForm>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter users by role and verification status"
            layoutId="artisans-kyc-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search customers, artisans, or admins..."
          />
        </div>

        {/* Directory Table by Role with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          {filter === "customers" ? (
            <AdminDataTable
              title="Customer Accounts Directory"
              subtitle="Manage registered customers, monitor booking activity, and use the three-dots menu to edit or update standing."
              badge={`${filteredCustomers.length} Customers`}
              headerAction={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    resetForm("customer");
                    scrollToForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Customer</span>
                </CtaButton>
              }
            >
              {filteredCustomers.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Customers"
                  description="Try clearing your search query or add a new customer using the inline form above."
                  icon={<Users className="h-5 w-5 text-accent-sky" />}
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead>Customer</AdminTableHead>
                      <AdminTableHead>Contact Details</AdminTableHead>
                      <AdminTableHead>Location</AdminTableHead>
                      <AdminTableHead>Bookings</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredCustomers.map((cust) => (
                      <AdminTableRow key={cust.id}>
                        <AdminTableCell className="whitespace-nowrap">
                          <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                            {cust.name}
                          </div>
                          <div className="text-[10px] font-semibold text-ink-muted">
                            Joined {cust.joinedAt}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell className="whitespace-nowrap">
                          <div className="text-xs font-bold text-brand-800">
                            {cust.email}
                          </div>
                          <div className="text-[11px] font-semibold text-ink-secondary">
                            {cust.phone}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell className="font-display text-xs font-bold text-brand-950 whitespace-nowrap">
                          {cust.city}
                        </AdminTableCell>
                        <AdminTableCell className="whitespace-nowrap">
                          <PillBadge
                            tone="sky"
                            className="px-2.5 py-0.5 text-[10px]"
                          >
                            {cust.bookingsCount} Bookings
                          </PillBadge>
                        </AdminTableCell>
                        <AdminTableCell>
                          <AdminStatusPill status={cust.status} />
                        </AdminTableCell>
                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Manage ${cust.name}`}
                            ariaLabel={`Actions for customer ${cust.name}`}
                            items={[
                              {
                                id: "edit",
                                label: "Edit Customer in Form",
                                description: "Load into inline form above",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                onClick: () => loadCustomerIntoForm(cust),
                              },
                              {
                                id: "toggle-status",
                                label:
                                  cust.status === "active"
                                    ? "Place Account on Hold"
                                    : "Activate Account",
                                description: "Toggle customer dispatch access",
                                icon:
                                  cust.status === "active" ? (
                                    <Clock className="h-3.5 w-3.5" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ),
                                onClick: () => toggleCustomerStatus(cust.id),
                              },
                              {
                                id: "delete",
                                label: "Remove Customer",
                                description: "Delete customer record",
                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                variant: "danger",
                                dividerBefore: true,
                                onClick: () => deleteCustomer(cust.id),
                              },
                            ]}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          ) : filter === "admins" ? (
            <AdminDataTable
              title="Administrator Roles & Access Control"
              subtitle="Manage internal admin team members responsible for user verification, dispatch, disputes, and support."
              badge={`${filteredAdmins.length} Admins`}
              headerAction={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    resetForm("admin");
                    scrollToForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Admin</span>
                </CtaButton>
              }
            >
              {filteredAdmins.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Administrators"
                  description="Try clearing your search query or add an administrator in the inline form above."
                  icon={<ShieldCheck className="h-5 w-5 text-accent-sky" />}
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead>Administrator</AdminTableHead>
                      <AdminTableHead>Assigned Role</AdminTableHead>
                      <AdminTableHead>Management Scope</AdminTableHead>
                      <AdminTableHead>Last Activity</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredAdmins.map((adm) => (
                      <AdminTableRow key={adm.id}>
                        <AdminTableCell className="whitespace-nowrap">
                          <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                            {adm.name}
                          </div>
                          <div className="text-[11px] font-semibold text-ink-secondary">
                            {adm.email}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell className="whitespace-nowrap">
                          <PillBadge
                            tone="porcelain"
                            icon="shield"
                            className="px-2.5 py-0.5 text-[10px]"
                          >
                            {adm.roleTitle}
                          </PillBadge>
                        </AdminTableCell>
                        <AdminTableCell className="max-w-[300px]">
                          <p className="truncate text-xs font-medium text-ink-secondary">
                            {adm.permissions}
                          </p>
                        </AdminTableCell>
                        <AdminTableCell className="text-xs font-bold text-brand-700 whitespace-nowrap">
                          {adm.lastActive}
                        </AdminTableCell>
                        <AdminTableCell>
                          <AdminStatusPill status={adm.status} />
                        </AdminTableCell>
                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Manage ${adm.name}`}
                            ariaLabel={`Actions for administrator ${adm.name}`}
                            items={[
                              {
                                id: "edit",
                                label: "Edit Admin in Form",
                                description: "Modify role & permissions scope",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                onClick: () => loadAdminIntoForm(adm),
                              },
                              {
                                id: "toggle-status",
                                label:
                                  adm.status === "verified"
                                    ? "Set Active Staff Status"
                                    : "Mark Verified Admin",
                                description: "Update admin badge level",
                                icon: <ShieldCheck className="h-3.5 w-3.5" />,
                                onClick: () => toggleAdminStatus(adm.id),
                              },
                              {
                                id: "delete",
                                label: "Revoke Admin Access",
                                description: "Remove administrator account",
                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                variant: "danger",
                                dividerBefore: true,
                                onClick: () => deleteAdmin(adm.id),
                              },
                            ]}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          ) : (
            <AdminDataTable
              title="Artisan Verification & Profile Directory"
              subtitle="Review artisan trade credentials, verify identity records, and use the three-dots menu to edit or approve bank payout accounts."
              badge={`${filteredArtisans.length} Showing`}
              headerAction={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    resetForm("artisan");
                    scrollToForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Artisan Pro</span>
                </CtaButton>
              }
            >
              {filteredArtisans.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Artisans"
                  description="Try clearing your search query or switching the user filter tab."
                  icon={<Users className="h-5 w-5 text-accent-sky" />}
                  action={
                    <CtaButton
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        setFilter("artisans_all");
                        setSearch("");
                      }}
                    >
                      Reset Filters
                    </CtaButton>
                  }
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead>Artisan Pro</AdminTableHead>
                      <AdminTableHead>Trade &amp; Rate</AdminTableHead>
                      <AdminTableHead>
                        Identity &amp; Bank Payout Details
                      </AdminTableHead>
                      <AdminTableHead>Rating &amp; Jobs</AdminTableHead>
                      <AdminTableHead>KYC Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredArtisans.map((art) => (
                      <AdminTableRow key={art.id}>
                        <AdminTableCell>
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.profileImage}
                              alt={art.name}
                              className="h-9 w-9 shrink-0 rounded-xl object-cover border-2 border-brand-200 shadow-gloss-card"
                            />
                            <div>
                              <div className="flex items-center gap-1 font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                                <span>{art.name}</span>
                                {art.kycStatus === "verified" && (
                                  <ShieldCheck
                                    className="h-3.5 w-3.5 text-accent-success shrink-0"
                                    aria-label="Verified Artisan"
                                  />
                                )}
                              </div>
                              <div className="text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                                {art.phone} · {art.city}
                              </div>
                            </div>
                          </div>
                        </AdminTableCell>

                        <AdminTableCell>
                          <div className="font-display text-xs font-extrabold text-brand-950">
                            {art.trade}
                          </div>
                          <PillBadge
                            tone="sky"
                            className="mt-1 px-2.5 py-0.5 text-[10px]"
                          >
                            {art.hourlyRate}/hr
                          </PillBadge>
                        </AdminTableCell>

                        <AdminTableCell>
                          <div className="font-mono text-[11px] font-bold text-brand-800 whitespace-nowrap">
                            NIN: {art.ninNumber || "48192038471"}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                            <Landmark className="h-3 w-3 text-brand-600 shrink-0" />
                            <span>
                              {art.bankName || "Access Bank"} ·{" "}
                              {art.bankAccountNumber || "0148291042"}
                            </span>
                          </div>
                        </AdminTableCell>

                        <AdminTableCell>
                          <div className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2.5 py-0.5 font-display text-[11px] font-extrabold text-brand-950 border border-brand-100 shadow-gloss-card whitespace-nowrap">
                            <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                            <span>
                              {art.rating.toFixed(1)} ({art.reviewsCount})
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                            {art.completedJobs} completed jobs
                          </div>
                        </AdminTableCell>

                        <AdminTableCell>
                          <AdminStatusPill status={art.kycStatus} />
                        </AdminTableCell>

                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Manage ${art.name}`}
                            ariaLabel={`Actions for artisan ${art.name}`}
                            items={[
                              {
                                id: "edit",
                                label: "Edit Artisan in Form",
                                description: "Modify profile, rate & NUBAN",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                onClick: () => loadArtisanIntoForm(art),
                              },
                              {
                                id: "approve-kyc",
                                label: "Approve & Verify KYC",
                                description: "Authorize job dispatch & payouts",
                                icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                                disabled:
                                  busyId === art.id ||
                                  art.kycStatus === "verified",
                                onClick: () =>
                                  updateArtisanKyc(art.id, "verified"),
                              },
                              {
                                id: "pending-kyc",
                                label: "Mark KYC Pending",
                                description: "Move to verification review queue",
                                icon: <Clock className="h-3.5 w-3.5" />,
                                disabled:
                                  busyId === art.id ||
                                  art.kycStatus === "pending",
                                onClick: () =>
                                  updateArtisanKyc(art.id, "pending"),
                              },
                              {
                                id: "toggle-online",
                                label: art.isOnline
                                  ? "Set Dispatch Offline"
                                  : "Set Dispatch Online",
                                description: "Toggle live availability status",
                                icon: <Power className="h-3.5 w-3.5" />,
                                disabled: busyId === art.id,
                                onClick: () => toggleArtisanOnline(art),
                              },
                              {
                                id: "reject-kyc",
                                label: "Reject KYC Credentials",
                                description: "Flag NIN or bank mismatch",
                                icon: <XCircle className="h-3.5 w-3.5" />,
                                variant: "danger",
                                dividerBefore: true,
                                disabled:
                                  busyId === art.id ||
                                  art.kycStatus === "rejected",
                                onClick: () =>
                                  updateArtisanKyc(art.id, "rejected"),
                              },
                              {
                                id: "delete",
                                label: "Delete Artisan Record",
                                description: "Remove artisan from directory",
                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                variant: "danger",
                                onClick: () => deleteArtisan(art.id),
                              },
                            ]}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          )}
        </div>
      </AdminWorkspaceSlab>
    </div>
  );
}
