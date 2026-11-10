export type TicketFilter = "all" | "pending" | "in_progress" | "completed";
export type TicketStatus = "pending" | "in_progress" | "completed";
export type RequesterRole = "Client" | "Artisan Pro";
export type TicketPriority = "High" | "Normal";

export interface SupportTicket {
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

export interface SupportTicketFormData {
  editingId: string | null;
  editingCode: string | null;
  requesterName: string;
  requesterRole: RequesterRole;
  city: string;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
}

