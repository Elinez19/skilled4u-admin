"use client";

import * as React from "react";
import { AdminInlineForm } from "@/components/admin/ui/admin-form-controls";
export * from "./admin-dialog-modal";

export interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Inline Form Wrapper (replaces legacy modal overlay with inline workspace form)
 */
export function AdminModal({
  open,
  onOpenChange,
  eyebrow = "Skilled4U Admin Form",
  title,
  description,
  children,
}: AdminModalProps) {
  return (
    <AdminInlineForm
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      {children}
    </AdminInlineForm>
  );
}
