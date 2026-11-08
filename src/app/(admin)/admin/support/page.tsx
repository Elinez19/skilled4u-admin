"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Headset,
  MessageSquare,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
  AdminTextareaField,
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

type TicketFilter = "all" | "pending" | "in_progress" | "completed";
type TicketStatus = "pending" | "in_progress" | "completed";
type RequesterRole = "Client" | "Artisan Pro";
type TicketPriority = "High" | "Normal";

interface SupportTicket {
  id: string;
  ticketCode: string;
  requesterName: string;
  requesterRole: RequesterRole;
  subject: string;
  city: string;
  priority: TicketPriority;
  status: TicketStatus;
  updatedAt: string;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tkt_1",
    ticketCode: "SUP-4102",
    requesterName: "Emeka Okafor",
    requesterRole: "Artisan Pro",
    subject: "Update NUBAN Settlement Bank Account to Zenith Bank",
    city: "Lagos",
    priority: "High",
    status: "pending",
    updatedAt: "14 mins ago",
  },
  {
    id: "tkt_2",
    ticketCode: "SUP-4098",
    requesterName: "Amina Bello",
    requesterRole: "Client",
    subject: "Reschedule A.C Gas Refill Dispatch Window in Wuse II",
    city: "Abuja",
    priority: "Normal",
    status: "in_progress",
    updatedAt: "1 hour ago",
  },
  {
    id: "tkt_3",
    ticketCode: "SUP-4085",
    requesterName: "Toluwalase Adeyemi",
    requesterRole: "Client",
    subject:
      "Payment Receipt & Escrow Release Confirmation for Booking #S4U-8710",
    city: "Lagos",
    priority: "Normal",
    status: "completed",
    updatedAt: "Yesterday",
  },
];

const ROLE_OPTIONS = [
  { id: "Client", label: "Customer / Client" },
  { id: "Artisan Pro", label: "Artisan Pro" },
] as const;

const PRIORITY_OPTIONS = [
  { id: "High", label: "High Priority" },
  { id: "Normal", label: "Normal SLA" },
] as const;

const TICKET_STATUS_OPTIONS = [
  { id: "pending", label: "Open / Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Resolved" },
] as const;

export default function AdminSupportPage() {
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<SupportTicket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = React.useState<TicketFilter>("all");
  const [search, setSearch] = React.useState("");

  // Inline Form State
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingCode, setEditingCode] = React.useState<string | null>(null);
  const [requesterName, setRequesterName] = React.useState("");
  const [requesterRole, setRequesterRole] =
    React.useState<RequesterRole>("Client");
  const [city, setCity] = React.useState("Abuja");
  const [priority, setPriority] = React.useState<TicketPriority>("Normal");
  const [status, setStatus] = React.useState<TicketStatus>("pending");
  const [subject, setSubject] = React.useState("");
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
    setRequesterName("");
    setRequesterRole("Client");
    setCity("Abuja");
    setPriority("Normal");
    setStatus("pending");
    setSubject("");
  }

  function loadTicketIntoForm(tkt: SupportTicket) {
    setEditingId(tkt.id);
    setEditingCode(tkt.ticketCode);
    setRequesterName(tkt.requesterName);
    setRequesterRole(tkt.requesterRole);
    setCity(tkt.city);
    setPriority(tkt.priority);
    setStatus(tkt.status);
    setSubject(tkt.subject);
    scrollToForm();
  }

  function handleSaveTicket(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setItems((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                requesterName,
                requesterRole,
                city,
                priority,
                status,
                subject,
                updatedAt: "Just now",
              }
            : t
        )
      );
      notifySaved(`Updated ticket ${editingCode || editingId}`);
      resetForm();
    } else {
      const code = `SUP-${Math.floor(4105 + Math.random() * 890)}`;
      const newTicket: SupportTicket = {
        id: `tkt_${Date.now()}`,
        ticketCode: code,
        requesterName,
        requesterRole,
        city,
        priority,
        status,
        subject,
        updatedAt: "Just now",
      };
      setItems((prev) => [newTicket, ...prev]);
      notifySaved(`Created support ticket ${code}`);
      resetForm();
    }
  }

  function updateTicketStatus(id: string, nextStatus: TicketStatus) {
    setItems((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: nextStatus, updatedAt: "Just now" } : t
      )
    );
    notifySaved(`Ticket marked ${nextStatus.replace("_", " ")}`);
  }

  function togglePriority(id: string) {
    setItems((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              priority: t.priority === "High" ? "Normal" : "High",
              updatedAt: "Just now",
            }
          : t
      )
    );
    notifySaved("Ticket priority updated");
  }

  function deleteTicket(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
    notifySaved("Support ticket deleted");
  }

  const openTickets = items.filter((t) => t.status !== "completed").length;

  const tabOptions: ReadonlyArray<AdminTabOption<TicketFilter>> = [
    { id: "all", label: "All Tickets", count: items.length },
    {
      id: "pending",
      label: "Open",
      count: items.filter((t) => t.status === "pending").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: items.filter((t) => t.status === "in_progress").length,
    },
    {
      id: "completed",
      label: "Resolved",
      count: items.filter((t) => t.status === "completed").length,
    },
  ];

  const filtered = items.filter((t) => {
    const matchesStatus = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.ticketCode.toLowerCase().includes(q) ||
      t.requesterName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customer & Artisan Helpdesk"
        eyebrowIcon="dot"
        headline="Support & Helpdesk Management."
        highlightWords={["Support", "Helpdesk", "Management."]}
        subtitle="Log, edit, and manage customer and artisan helpdesk tickets using the inline form below, or use the table three-dots action menu to resolve inquiries."
        primaryCta={{
          label: "Log Support Ticket",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Disputes & Claims",
          href: "/admin/disputes",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Active Support Tickets"
              value={`${openTickets}`}
              numericValue={openTickets}
              badgeText="Live Abuja & Lagos concierge"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Headset className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Median First Response"
              value="4m 12s"
              badgeText="Within 15-min priority SLA"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<Clock className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Resolution Satisfaction"
              value="99.1%"
              badgeText="Verified pro & client support"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Manage Support Tickets */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline Support Helpdesk Form"
            title={
              editingId
                ? `Edit & Manage Ticket ${editingCode || editingId}`
                : "Log, Edit & Manage Support Ticket"
            }
            description="Create a new helpdesk ticket for a customer or artisan, or select any row from the table menu below to edit details, priority, and resolution status."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Ticket ${editingCode || ""}`}
            onResetToCreate={resetForm}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminTextField
                  label="Requester Full Name"
                  placeholder="e.g. Amina Bello"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="City / Dispatch Zone"
                  placeholder="Abuja or Lagos"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <AdminSelectPills
                  label="Requester Role"
                  options={ROLE_OPTIONS}
                  value={requesterRole}
                  onChange={setRequesterRole}
                  columns={2}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AdminSelectPills
                  label="Ticket Priority"
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={setPriority}
                  columns={2}
                />
                <AdminSelectPills
                  label="Ticket Resolution Status"
                  options={TICKET_STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  columns={3}
                />
              </div>

              <AdminTextareaField
                label="Inquiry Subject & Support Notes"
                placeholder="Describe the customer or artisan support request, booking reference, or account update..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                rows={2}
                required
              />

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
                <CtaButton type="submit" variant="primary" size="sm">
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Update Support Ticket</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Support Ticket</span>
                    </>
                  )}
                </CtaButton>
              </div>
            </form>
          </AdminInlineForm>
        </div>

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter support tickets"
            layoutId="support-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search ticket code, requester, or subject..."
          />
        </div>

        {/* Support Table with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          <AdminDataTable
            title="Live Support & Helpdesk Queue"
            subtitle="Respond to artisan account updates, customer booking questions, and use the three-dots menu to edit or resolve tickets."
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
                <span>Log Ticket</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Support Tickets Found"
                description="All customer and artisan support tickets have been resolved."
                icon={<MessageSquare className="h-5 w-5 text-accent-sky" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Ticket Code</AdminTableHead>
                    <AdminTableHead>Requester</AdminTableHead>
                    <AdminTableHead>Subject</AdminTableHead>
                    <AdminTableHead>Priority</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((tkt) => (
                    <AdminTableRow key={tkt.id}>
                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-mono text-xs font-extrabold text-brand-700">
                          {tkt.ticketCode}
                        </div>
                        <div className="text-[10px] font-semibold text-ink-muted">
                          {tkt.updatedAt}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {tkt.requesterName}
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600">
                          {tkt.requesterRole} · {tkt.city}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="max-w-[280px]">
                        <div className="truncate font-display text-xs font-extrabold text-brand-950">
                          {tkt.subject}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <PillBadge
                          tone={tkt.priority === "High" ? "blue" : "sky"}
                          className="px-2.5 py-0.5 text-[10px]"
                        >
                          {tkt.priority}
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={tkt.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Ticket ${tkt.ticketCode}`}
                          ariaLabel={`Actions for ticket ${tkt.ticketCode}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit Ticket in Form",
                              description: "Update subject, role, or priority",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadTicketIntoForm(tkt),
                            },
                            {
                              id: "in-progress",
                              label: "Mark In Progress",
                              description: "Assign to concierge agent",
                              icon: <Play className="h-3.5 w-3.5" />,
                              disabled: tkt.status === "in_progress",
                              onClick: () =>
                                updateTicketStatus(tkt.id, "in_progress"),
                            },
                            {
                              id: "resolve",
                              label: "Mark Resolved & Close",
                              description: "Complete helpdesk inquiry",
                              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                              disabled: tkt.status === "completed",
                              onClick: () =>
                                updateTicketStatus(tkt.id, "completed"),
                            },
                            {
                              id: "priority",
                              label:
                                tkt.priority === "High"
                                  ? "Set Normal Priority"
                                  : "Escalate to High Priority",
                              description: "Adjust SLA response tier",
                              icon: <AlertTriangle className="h-3.5 w-3.5" />,
                              onClick: () => togglePriority(tkt.id),
                            },
                            {
                              id: "reopen",
                              label: "Reopen Ticket",
                              description: "Return to open queue",
                              icon: <RotateCcw className="h-3.5 w-3.5" />,
                              disabled: tkt.status === "pending",
                              onClick: () =>
                                updateTicketStatus(tkt.id, "pending"),
                            },
                            {
                              id: "delete",
                              label: "Delete Ticket",
                              description: "Remove ticket from queue",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              onClick: () => deleteTicket(tkt.id),
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
