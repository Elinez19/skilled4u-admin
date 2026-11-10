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
import { MODERATION_STATUS_OPTIONS, RATING_OPTIONS } from "./constants";
import type { RatingString, ReviewModerationStatus } from "./types";

export interface ReviewModerationFormProps {
  formRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  clientName: string;
  setClientName: (name: string) => void;
  artisanName: string;
  setArtisanName: (name: string) => void;
  serviceTitle: string;
  setServiceTitle: (title: string) => void;
  rating: RatingString;
  setRating: (rating: RatingString) => void;
  status: ReviewModerationStatus;
  setStatus: (status: ReviewModerationStatus) => void;
  comment: string;
  setComment: (comment: string) => void;
  savedMessage: string | null;
  onReset: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function ReviewModerationForm({
  formRef,
  open,
  onOpenChange,
  editingId,
  clientName,
  setClientName,
  artisanName,
  setArtisanName,
  serviceTitle,
  setServiceTitle,
  rating,
  setRating,
  status,
  setStatus,
  comment,
  setComment,
  savedMessage,
  onReset,
  onSubmit,
}: ReviewModerationFormProps) {
  return (
    <div className="mt-6">
      <AdminInlineForm
        formRef={formRef}
        eyebrow="Inline Review & Rating Form"
        title={
          editingId
            ? `Edit & Moderate Review by ${clientName}`
            : "Add, Edit & Moderate Customer Review"
        }
        description="Log a verified customer review after job completion, or select any review from the table menu below to edit its rating, comment, or publication status."
        isEditing={Boolean(editingId)}
        editingBadgeText="Editing Review"
        onResetToCreate={onReset}
        open={open}
        onOpenChange={onOpenChange}
        savedMessage={savedMessage}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminTextField
              label="Client Full Name"
              placeholder="e.g. Chidinma Nwosu"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <AdminTextField
              label="Reviewed Artisan Pro"
              value={artisanName}
              onChange={(e) => setArtisanName(e.target.value)}
              required
            />
            <AdminTextField
              label="Completed Service Title"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminSelectPills
              label="Star Rating"
              options={RATING_OPTIONS}
              value={rating}
              onChange={setRating}
              columns={5}
            />
            <AdminSelectPills
              label="Moderation Status"
              options={MODERATION_STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
              columns={3}
            />
          </div>

          <AdminTextareaField
            label="Customer Review Comment"
            placeholder="Describe artisan punctuality, workmanship quality, and service outcome..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
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
                  <span>Save Review Changes</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add &amp; Save Review</span>
                </>
              )}
            </CtaButton>
          </div>
        </form>
      </AdminInlineForm>
    </div>
  );
}

