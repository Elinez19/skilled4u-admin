"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Headset,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
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

type TicketFilter = "all" | "pending" | "in_progress" | "completed";

interface SupportTicket {
  id: string;
  ticketCode: string;
  requesterName: string;
  requesterRole: "Client" | "Artisan Pro";
  subject: string;
  city: string;
  priority: "High" | "Normal";
  status: "pending" | "in_progress" | "completed";
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
    subject: "Bachs.io Escrow Receipt Confirmation for Booking #S4U-8710",
    city: "Lagos",
    priority: "Normal",
    status: "completed",
    updatedAt: "Yesterday",
  },
];

export default function AdminSupportPage() {
  const [items, setItems] = React.useState<SupportTicket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = React.useState<TicketFilter>("all");
  const [search, setSearch] = React.useState("");

  function closeTicket(id: string) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t))
    );
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
        headline="Support & SLA Concierge."
        highlightWords={["Support", "SLA", "Concierge."]}
        subtitle="Assist clients and verified artisans across Abuja & Lagos with dispatch rescheduling, KYC uploads, and escrow payout inquiries."
        primaryCta={{
          label: "Disputes Arbitration",
          href: "/admin/disputes",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Public FAQs",
          href: "/faqs",
          variant: "secondary",
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

        <div className="mt-4">
          <AdminDataTable
            title="Live Support & Concierge Queue"
            subtitle="Respond to artisan NUBAN updates and customer booking inquiries."
            badge={`${filtered.length} Showing`}
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
                      Action
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
                        {tkt.status !== "completed" ? (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            onClick={() => closeTicket(tkt.id)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Mark Resolved</span>
                          </CtaButton>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 font-display text-[11px] font-extrabold text-brand-700 border border-brand-200">
                            <CheckCircle2 className="h-3 w-3 text-accent-success" />
                            <span>Closed</span>
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
    </div>
  );
}

