"use client";

import * as React from "react";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Wrench,
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
import {
  AdminSearchInput,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import type { BookingRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

type BookingStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed";

export function BookingsDispatchWorkspace({
  initialBookings,
}: {
  initialBookings: BookingRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<BookingRow[]>(initialBookings);
  const [statusFilter, setStatusFilter] =
    React.useState<BookingStatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // New Dispatch Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clientName, setClientName] = React.useState("Amina Bello");
  const [clientPhone, setClientPhone] = React.useState("+234 809 332 1104");
  const [address, setAddress] = React.useState(
    "14 Adetokunbo Ademola Crescent, Wuse II, Abuja"
  );
  const [serviceTitle, setServiceTitle] = React.useState(
    "Split AC Gas Refill & Servicing"
  );
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [agreedAmount, setAgreedAmount] = React.useState("18000");
  const [creating, setCreating] = React.useState(false);

  async function updateBookingStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((b) => (b.id === id ? data : b)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientPhone,
          address,
          serviceTitle,
          artisanId: "emeka-okafor",
          artisanName,
          agreedAmount: Number(agreedAmount),
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => [data, ...prev]);
        setModalOpen(false);
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  const tabOptions: ReadonlyArray<AdminTabOption<BookingStatusFilter>> = [
    { id: "all", label: "All Bookings", count: items.length },
    {
      id: "pending",
      label: "Pending",
      count: items.filter((b) => b.status === "pending").length,
    },
    {
      id: "accepted",
      label: "Accepted",
      count: items.filter((b) => b.status === "accepted").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: items.filter((b) => b.status === "in_progress").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: items.filter((b) => b.status === "completed").length,
    },
  ];

  const filtered = items.filter((b) => {
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;
    const matchesSearch =
      !search ||
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.artisanName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-2 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Service Scheduling & Live Dispatch"
        eyebrowIcon="pin"
        headline="Bookings & Dispatch Management."
        highlightWords={["Bookings", "Dispatch", "Management."]}
        subtitle="Track incoming customer service requests, assign qualified artisans to jobs, manage appointment schedules, and advance bookings from acceptance to completion."
        primaryCta={{
          label: "New Dispatch Booking",
          onClick: () => setModalOpen(true),
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Financials & Escrow",
          href: "/admin/financials",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Segmented Filter Tabs & Search Input */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter bookings by status"
            layoutId="bookings-status-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search booking code, client, or artisan..."
          />
        </div>

        {/* Bookings Data Table */}
        <div className="mt-4">
          <AdminDataTable
            title="Service Bookings & Dispatch Queue"
            subtitle="Monitor active artisan dispatches, client schedules, and job completion states."
            badge={`${filtered.length} Showing`}
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Bookings Found"
                description="Create a new dispatch booking or clear your active status filter."
                icon={<CalendarCheck className="h-5 w-5 text-accent-sky" />}
                action={
                  <CtaButton
                    variant="primary"
                    size="xs"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Dispatch Booking</span>
                  </CtaButton>
                }
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Booking Code</AdminTableHead>
                    <AdminTableHead>Client &amp; Location</AdminTableHead>
                    <AdminTableHead>Service &amp; Artisan</AdminTableHead>
                    <AdminTableHead>Schedule</AdminTableHead>
                    <AdminTableHead>Agreed Price</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Dispatch Action
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((bk) => (
                    <AdminTableRow key={bk.id}>
                      <AdminTableCell className="font-mono text-[11px] font-extrabold text-brand-700 whitespace-nowrap">
                        {bk.bookingCode}
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {bk.clientName}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ink-secondary">
                          <MapPin className="h-3 w-3 text-brand-600 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {bk.address}
                          </span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-display text-xs font-extrabold text-brand-950 max-w-[200px] truncate">
                          {bk.serviceTitle}
                        </div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600">
                          <Wrench className="h-2.5 w-2.5 shrink-0" />
                          <span>Pro: {bk.artisanName}</span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-brand-950">
                          <Calendar className="h-3 w-3 text-brand-600" />
                          <span>{bk.scheduledDate}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ink-secondary">
                          <Clock className="h-3 w-3 text-brand-500" />
                          <span>{bk.scheduledTime}</span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                          {formatCurrency(bk.agreedAmount)}
                        </div>
                        <PillBadge
                          tone="sky"
                          className="mt-0.5 px-2 py-0.5 text-[9px] uppercase"
                        >
                          Escrow: {bk.paymentStatus}
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={bk.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        {bk.status === "pending" && (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            disabled={busyId === bk.id}
                            onClick={() =>
                              updateBookingStatus(bk.id, "accepted")
                            }
                          >
                            Accept Dispatch
                          </CtaButton>
                        )}
                        {bk.status === "accepted" && (
                          <CtaButton
                            variant="secondary"
                            size="xs"
                            disabled={busyId === bk.id}
                            onClick={() =>
                              updateBookingStatus(bk.id, "in_progress")
                            }
                          >
                            Mark In Progress
                          </CtaButton>
                        )}
                        {bk.status === "in_progress" && (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            disabled={busyId === bk.id}
                            onClick={() =>
                              updateBookingStatus(bk.id, "completed")
                            }
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Complete Job</span>
                          </CtaButton>
                        )}
                        {bk.status === "completed" && (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 font-display text-[11px] font-extrabold text-brand-700 border border-brand-200">
                            <CheckCircle2 className="h-3 w-3 text-accent-success" />
                            <span>Completed</span>
                          </span>
                        )}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            )}
          </AdminDataTable>
        </div>
      </AdminWorkspaceSlab>

      {/* New Dispatch Booking Modal */}
      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eyebrow="Service Booking & Dispatch"
        title="Create Service Booking"
        description="Schedule a new customer service request, assign a verified artisan, and set the agreed service fee."
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Client Full Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <AdminTextField
              label="Client Phone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
          </div>

          <AdminTextField
            label="Service Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Requested Service"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
            />
            <AdminTextField
              label="Assigned Artisan Pro"
              value={artisanName}
              onChange={(e) => setArtisanName(e.target.value)}
              required
            />
          </div>

          <AdminTextField
            label="Agreed Booking Amount (NGN)"
            type="number"
            min={1000}
            value={agreedAmount}
            onChange={(e) => setAgreedAmount(e.target.value)}
            required
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-surface-frost">
            <CtaButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </CtaButton>
            <CtaButton type="submit" variant="primary" size="sm" disabled={creating}>
              {creating ? "Dispatching..." : "Create & Dispatch Pro"}
            </CtaButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

