"use client";

import * as React from "react";
import {
  CheckCircle2,
  Landmark,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
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
    permissions: "Full access: Users, Bookings, Financials, Disputes & Settings",
    status: "verified",
    lastActive: "Online now",
  },
  {
    id: "adm_2",
    name: "Funke Oladipo",
    email: "trust@skilled4u.ng",
    roleTitle: "KYC & Dispute Moderator",
    permissions: "Artisan identity verification, dispute claims & review moderation",
    status: "verified",
    lastActive: "18 mins ago",
  },
  {
    id: "adm_3",
    name: "Sadiq Abdullahi",
    email: "dispatch@skilled4u.ng",
    roleTitle: "Dispatch & Support Lead",
    permissions: "Live booking dispatch, schedule updates & customer helpdesk",
    status: "active",
    lastActive: "1 hour ago",
  },
];

export function ArtisansKycWorkspace({
  initialArtisans,
}: {
  initialArtisans: ArtisanRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<ArtisanRow[]>(initialArtisans);
  const [customers, setCustomers] =
    React.useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [admins] = React.useState<AdminRecord[]>(INITIAL_ADMINS);
  const [filter, setFilter] = React.useState<UserViewFilter>("artisans_all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function updateArtisanKyc(id: string, kycStatus: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/artisans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kycStatus }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((a) => (a.id === id ? data : a)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  function toggleCustomerStatus(id: string) {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "pending" : "active" }
          : c
      )
    );
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
    <div className="space-y-2 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customers · Artisans · Administrators"
        eyebrowIcon="shield"
        headline="User Management & Verification Desk."
        highlightWords={["User", "Management", "Verification"]}
        subtitle="Manage customer accounts and booking histories, verify artisan identity and bank payout credentials, and oversee administrator roles and permissions."
        primaryCta={{
          label: "View Bookings Dispatch",
          href: "/admin/bookings",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Public Artisans Directory",
          href: "/artisans",
          variant: "secondary",
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

        {/* Directory Table by Role */}
        <div className="mt-4">
          {filter === "customers" ? (
            <AdminDataTable
              title="Customer Accounts Directory"
              subtitle="Manage registered customers, monitor booking activity, and review account standing."
              badge={`${filteredCustomers.length} Customers`}
            >
              {filteredCustomers.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Customers"
                  description="Try clearing your search query to view all customer accounts."
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
                        Account Action
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
                          <CtaButton
                            variant="secondary"
                            size="xs"
                            onClick={() => toggleCustomerStatus(cust.id)}
                          >
                            {cust.status === "active"
                              ? "Place on Hold"
                              : "Activate Account"}
                          </CtaButton>
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
            >
              {filteredAdmins.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Administrators"
                  description="Try clearing your search query to view all administrator accounts."
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
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          ) : (
            <AdminDataTable
              title="Artisan Verification & Profile Directory"
              subtitle="Review artisan trade credentials, verify identity records, and approve bank payout accounts."
              badge={`${filteredArtisans.length} Showing`}
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
                        Verification Actions
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

                        <AdminTableCell className="text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            {art.kycStatus !== "verified" && (
                              <CtaButton
                                variant="primary"
                                size="xs"
                                disabled={busyId === art.id}
                                onClick={() =>
                                  updateArtisanKyc(art.id, "verified")
                                }
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Approve</span>
                              </CtaButton>
                            )}
                            {art.kycStatus !== "rejected" && (
                              <CtaButton
                                variant="secondary"
                                size="xs"
                                disabled={busyId === art.id}
                                onClick={() =>
                                  updateArtisanKyc(art.id, "rejected")
                                }
                              >
                                <XCircle className="h-3 w-3 text-accent-warm" />
                                <span>Reject</span>
                              </CtaButton>
                            )}
                          </div>
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


