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
import { DISPUTE_STATUS_OPTIONS } from "./constants";
import type { DisputeStatus } from "./types";

export interface DisputeCaseFormProps {
  formRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  editingCaseCode: string | null;
  bookingCode: string;
  setBookingCode: (code: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
  artisanName: string;
  setArtisanName: (name: string) => void;
  serviceTitle: string;
  setServiceTitle: (title: string) => void;
  escrowAmount: string;
  setEscrowAmount: (amt: string) => void;
  status: DisputeStatus;
  setStatus: (status: DisputeStatus) => void;
  reason: string;
  setReason: (reason: string) => void;
  savedMessage: string | null;
  onReset: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function DisputeCaseForm({
  formRef,
  open,
  onOpenChange,
  editingId,
  editingCaseCode,
  bookingCode,
  setBookingCode,
  clientName,
  setClientName,
  artisanName,
  setArtisanName,
  serviceTitle,
  setServiceTitle,
  escrowAmount,
  setEscrowAmount,
  status,
  setStatus,
  reason,
  setReason,
  savedMessage,
  onReset,
  onSubmit,
}: DisputeCaseFormProps) {
  return (
    <div className="mt-6">
      <AdminInlineForm
        formRef={formRef}
        eyebrow="Inline Dispute Arbitration Form"
        title={
          editingId
            ? `Edit & Arbitrate Case ${editingCaseCode || editingId}`
            : "Open, Edit & Arbitrate Dispute Case"
        }
        description="Log a new customer or artisan claim, freeze escrow funds during investigation, or select any row from the table menu below to edit arbitration findings."
        isEditing={Boolean(editingId)}
        editingBadgeText={`Case ${editingCaseCode || ""}`}
        onResetToCreate={onReset}
        open={open}
        onOpenChange={onOpenChange}
        savedMessage={savedMessage}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <AdminTextField
              label="Booking Reference"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              required
            />
            <AdminTextField
              label="Client Full Name"
              placeholder="e.g. Chidinma Nwosu"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <AdminTextField
              label="Assigned Artisan Pro"
              value={artisanName}
              onChange={(e) => setArtisanName(e.target.value)}
              required
            />
            <AdminTextField
              label="Service Title"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
            />
            <AdminTextField
              label="Frozen Escrow (NGN)"
              type="number"
              min={1000}
              value={escrowAmount}
              onChange={(e) => setEscrowAmount(e.target.value)}
              required
            />
          </div>

          <AdminSelectPills
            label="Arbitration & Escrow State"
            options={DISPUTE_STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            columns={3}
          />

          <AdminTextareaField
            label="Claim Reason & Arbitration Notes"
            placeholder="Document the customer complaint, artisan inspection evidence, and settlement decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
                  <span>Save Arbitration Decision</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Open Dispute &amp; Hold Escrow</span>
                </>
              )}
            </CtaButton>
          </div>
        </form>
      </AdminInlineForm>
    </div>
  );
}

