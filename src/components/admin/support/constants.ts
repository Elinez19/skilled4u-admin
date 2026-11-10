import type { RequesterRole, SupportTicket, TicketPriority, TicketStatus } from "./types";

export const INITIAL_TICKETS: SupportTicket[] = [
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

export const ROLE_OPTIONS: ReadonlyArray<{
  id: RequesterRole;
  label: string;
}> = [
  { id: "Client", label: "Customer / Client" },
  { id: "Artisan Pro", label: "Artisan Pro" },
] as const;

export const PRIORITY_OPTIONS: ReadonlyArray<{
  id: TicketPriority;
  label: string;
}> = [
  { id: "High", label: "High Priority" },
  { id: "Normal", label: "Normal SLA" },
] as const;

export const TICKET_STATUS_OPTIONS: ReadonlyArray<{
  id: TicketStatus;
  label: string;
}> = [
  { id: "pending", label: "Open / Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Resolved" },
] as const;

