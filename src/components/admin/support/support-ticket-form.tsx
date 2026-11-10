"use client";

import type { RefObject, FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import {
  AdminInlineForm,
  AdminSelectPills,
  AdminTextareaField,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PRIORITY_OPTIONS, ROLE_OPTIONS, TICKET_STATUS_OPTIONS } from "./constants";
import type { RequesterRole, TicketPriority, TicketStatus } from "./types";

export interface SupportTicketFormProps {
  formRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  editingCode: string | null;
  requesterName: string;
  setRequesterName: (name: string) => void;
  requesterRole: RequesterRole;
  setRequesterRole: (role: RequesterRole) => void;
  city: string;
  setCity: (city: string) => void;
  priority: TicketPriority;
  setPriority: (priority: TicketPriority) => void;
  status: TicketStatus;
  setStatus: (status: TicketStatus) => void;
  subject: string;
  setSubject: (subject: string) => void;
  savedMessage: string | null;
  onReset: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function SupportTicketForm({
  formRef,
  open,
  onOpenChange,
  editingId,
  editingCode,
  requesterName,
  setRequesterName,
  requesterRole,
  setRequesterRole,
  city,
  setCity,
  priority,
  setPriority,
  status,
  setStatus,
  subject,
  setSubject,
  savedMessage,
  onReset,
  onSubmit,
}: SupportTicketFormProps) {
  return (
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
        onResetToCreate={onReset}
        open={open}
        onOpenChange={onOpenChange}
        savedMessage={savedMessage}
      >
        <form onSubmit={onSubmit} className="space-y-4">
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
                onClick={onReset}
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
  );
}

