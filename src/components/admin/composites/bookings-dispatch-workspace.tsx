"use client";

import * as React from "react";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  Wrench,
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

const BOOKING_STATUS_OPTIONS = [
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const PAYMENT_STATUS_OPTIONS = [
  { id: "unpaid", label: "Unpaid" },
  { id: "escrowed", label: "Escrowed" },
  { id: "released", label: "Released" },
  { id: "refunded", label: "Refunded" },
] as const;

export function BookingsDispatchWorkspace({
  initialBookings,
}: {
  initialBookings: BookingRow[];
}) {
  const router = useRouter();
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<BookingRow[]>(initialBookings);
  const [statusFilter, setStatusFilter] =
    React.useState<BookingStatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Inline Form State (replaces modal)
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingCode, setEditingCode] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("Amina Bello");
  const [clientEmail, setClientEmail] = React.useState("amina.bello@gmail.com");
  const [clientPhone, setClientPhone] = React.useState("+234 809 332 1104");
  const [address, setAddress] = React.useState(
    "14 Adetokunbo Ademola Crescent, Wuse II, Abuja"
  );
  const [serviceTitle, setServiceTitle] = React.useState(
    "Split AC Gas Refill & Servicing"
  );
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [scheduledDate, setScheduledDate] = React.useState("2026-11-10");
  const [scheduledTime, setScheduledTime] = React.useState("10:30 AM");
  const [agreedAmount, setAgreedAmount] = React.useState("18000");
  const [bookingStatus, setBookingStatus] = React.useState<
    "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  >("pending");
  const [paymentStatus, setPaymentStatus] = React.useState<
    "unpaid" | "escrowed" | "released" | "refunded"
  >("escrowed");
  const [saving, setSaving] = React.useState(false);
  const [savedBanner, setSavedBanner] = React.useState<string | null>(null);

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

  function resetForm() {
    setEditingId(null);
    setEditingCode(null);
    setClientName("Amina Bello");
    setClientEmail("amina.bello@gmail.com");
    setClientPhone("+234 809 332 1104");
    setAddress("14 Adetokunbo Ademola Crescent, Wuse II, Abuja");
    setServiceTitle("Split AC Gas Refill & Servicing");
    setArtisanName("Emeka Okafor");
    setScheduledDate("2026-11-10");
    setScheduledTime("10:30 AM");
    setAgreedAmount("18000");
    setBookingStatus("pending");
    setPaymentStatus("escrowed");
  }

  function loadBookingIntoForm(bk: BookingRow) {
    setEditingId(bk.id);
    setEditingCode(bk.bookingCode);
    setClientName(bk.clientName);
    setClientEmail(bk.clientEmail || "client@skilled4u.ng");
    setClientPhone(bk.clientPhone);
    setAddress(bk.address);
    setServiceTitle(bk.serviceTitle);
    setArtisanName(bk.artisanName);
    setScheduledDate(bk.scheduledDate);
    setScheduledTime(bk.scheduledTime);
    setAgreedAmount(String(bk.agreedAmount));
    setBookingStatus(
      (bk.status as
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled") || "pending"
    );
    setPaymentStatus(
      (bk.paymentStatus as "unpaid" | "escrowed" | "released" | "refunded") ||
        "unpaid"
    );
    scrollToForm();
  }

  async function updateBookingFields(
    id: string,
    patch: { status?: string; paymentStatus?: string }
  ) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((b) => (b.id === id ? data : b)));
        router.refresh();
      } else {
        setItems((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
        );
      }
      notifySaved("Booking dispatch updated");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteBooking(id: string) {
    setItems((prev) => prev.filter((b) => b.id !== id));
    if (editingId === id) resetForm();
    try {
      await fetch(`/api/v1/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      // Optimistically removed
    }
    notifySaved("Booking removed from queue");
  }

  async function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const payload = {
          id: editingId,
          clientName,
          clientEmail,
          clientPhone,
          address,
          serviceTitle,
          artisanName,
          scheduledDate,
          scheduledTime,
          agreedAmount: Number(agreedAmount),
          status: bookingStatus,
          paymentStatus,
        };
        const res = await fetch("/api/v1/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { data } = await res.json();
          setItems((prev) => prev.map((b) => (b.id === editingId ? data : b)));
          router.refresh();
        } else {
          setItems((prev) =>
            prev.map((b) =>
              b.id === editingId ? { ...b, ...payload } : b
            )
          );
        }
        notifySaved(`Updated booking ${editingCode || editingId}`);
        resetForm();
      } else {
        const res = await fetch("/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName,
            clientEmail,
            clientPhone,
            address,
            serviceTitle,
            artisanId: "emeka-okafor",
            artisanName,
            scheduledDate,
            scheduledTime,
            agreedAmount: Number(agreedAmount),
            status: bookingStatus,
            paymentStatus,
          }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setItems((prev) => [data, ...prev]);
          router.refresh();
        } else {
          const fallbackBooking: BookingRow = {
            id: `bk_${Date.now()}`,
            bookingCode: `S4U-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            clientId: null,
            clientName,
            clientEmail,
            clientPhone,
            artisanId: "emeka-okafor",
            artisanName,
            categoryId: null,
            serviceTitle,
            description: serviceTitle,
            status: bookingStatus,
            scheduledDate,
            scheduledTime,
            address,
            agreedAmount: Number(agreedAmount),
            paymentStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setItems((prev) => [fallbackBooking, ...prev]);
        }
        notifySaved(`Dispatched new booking for ${clientName}`);
        resetForm();
      }
    } finally {
      setSaving(false);
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
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Service Scheduling & Live Dispatch"
        eyebrowIcon="pin"
        headline="Bookings & Dispatch Management."
        highlightWords={["Bookings", "Dispatch", "Management."]}
        subtitle="Add, edit, and manage customer service bookings using the inline form below, assign verified artisans, and advance dispatch states from the table action menu."
        primaryCta={{
          label: "New Dispatch Booking",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
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
        {/* Inline Form to Add, Edit & Manage Bookings (replaces modal) */}
        <AdminInlineForm
          formRef={formRef}
          eyebrow="Inline Booking & Dispatch Form"
          title={
            editingId
              ? `Edit & Manage Booking ${editingCode || editingId}`
              : "Create & Manage Service Booking"
          }
          description="Schedule a new customer service request, assign a verified artisan, or edit an existing dispatch selected from the table below."
          isEditing={Boolean(editingId)}
          editingBadgeText={`Booking ${editingCode || ""}`}
          onResetToCreate={resetForm}
          open={formOpen}
          onOpenChange={setFormOpen}
          savedMessage={savedBanner}
        >
          <form onSubmit={handleSaveBooking} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminTextField
                label="Client Full Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
              <AdminTextField
                label="Client Email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
              <AdminTextField
                label="Client Phone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <AdminTextField
                label="Agreed Booking Amount (NGN)"
                type="number"
                min={1000}
                value={agreedAmount}
                onChange={(e) => setAgreedAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminTextField
                label="Service Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <AdminTextField
                label="Scheduled Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
              <AdminTextField
                label="Scheduled Time Window"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AdminSelectPills
                label="Booking Dispatch Status"
                options={BOOKING_STATUS_OPTIONS}
                value={bookingStatus}
                onChange={setBookingStatus}
                columns={5}
              />
              <AdminSelectPills
                label="Escrow Payment Status"
                options={PAYMENT_STATUS_OPTIONS}
                value={paymentStatus}
                onChange={setPaymentStatus}
                columns={4}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-surface-frost">
              {editingId && (
                <CtaButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={resetForm}
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
                    <span>{saving ? "Saving..." : "Update Booking & Dispatch"}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>
                      {saving ? "Dispatching..." : "Create & Dispatch Pro"}
                    </span>
                  </>
                )}
              </CtaButton>
            </div>
          </form>
        </AdminInlineForm>

        {/* Segmented Filter Tabs & Search Input */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
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

        {/* Bookings Data Table with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          <AdminDataTable
            title="Service Bookings & Dispatch Queue"
            subtitle="Monitor active artisan dispatches, client schedules, and use the three-dots menu to edit or advance job states."
            badge={`${filtered.length} Showing`}
            headerAction={
              <CtaButton
                variant="primary"
                size="xs"
                onClick={() => {
                  resetForm();
                  scrollToForm();
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Booking</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Bookings Found"
                description="Create a new dispatch booking in the inline form above or clear your active status filter."
                icon={<CalendarCheck className="h-5 w-5 text-accent-sky" />}
                action={
                  <CtaButton
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      resetForm();
                      scrollToForm();
                    }}
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
                      Actions
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
                        <AdminActionMenu
                          label={`Booking ${bk.bookingCode}`}
                          ariaLabel={`Actions for booking ${bk.bookingCode}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit Booking in Form",
                              description: "Modify schedule, pro, or price",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadBookingIntoForm(bk),
                            },
                            {
                              id: "accept",
                              label: "Accept Dispatch",
                              description: "Confirm artisan assignment",
                              icon: <CalendarCheck className="h-3.5 w-3.5" />,
                              disabled:
                                busyId === bk.id || bk.status === "accepted",
                              onClick: () =>
                                updateBookingFields(bk.id, {
                                  status: "accepted",
                                }),
                            },
                            {
                              id: "in-progress",
                              label: "Mark In Progress",
                              description: "Artisan arrived on-site",
                              icon: <Play className="h-3.5 w-3.5" />,
                              disabled:
                                busyId === bk.id || bk.status === "in_progress",
                              onClick: () =>
                                updateBookingFields(bk.id, {
                                  status: "in_progress",
                                }),
                            },
                            {
                              id: "complete",
                              label: "Complete Job",
                              description: "Finalize service & sign-off",
                              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                              disabled:
                                busyId === bk.id || bk.status === "completed",
                              onClick: () =>
                                updateBookingFields(bk.id, {
                                  status: "completed",
                                }),
                            },
                            {
                              id: "escrow-funded",
                              label: "Mark Escrow Funded",
                              description: "Confirm client escrow deposit",
                              icon: <Lock className="h-3.5 w-3.5" />,
                              disabled:
                                busyId === bk.id ||
                                bk.paymentStatus === "escrowed",
                              onClick: () =>
                                updateBookingFields(bk.id, {
                                  paymentStatus: "escrowed",
                                }),
                            },
                            {
                              id: "cancel",
                              label: "Cancel Booking",
                              description: "Abort dispatch schedule",
                              icon: <XCircle className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              disabled:
                                busyId === bk.id || bk.status === "cancelled",
                              onClick: () =>
                                updateBookingFields(bk.id, {
                                  status: "cancelled",
                                }),
                            },
                            {
                              id: "delete",
                              label: "Delete Booking",
                              description: "Remove booking record",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              onClick: () => deleteBooking(bk.id),
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
        </div>
      </AdminWorkspaceSlab>
    </div>
  );
}
