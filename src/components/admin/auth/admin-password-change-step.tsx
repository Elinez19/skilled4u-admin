"use client";

import * as React from "react";
import { ArrowRight, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminPasswordChangeStepProps {
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (p: string) => void;
  showPassword: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminPasswordChangeStep({
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showPassword,
  loading,
  error,
  onSubmit,
}: AdminPasswordChangeStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <AdminTextField
        label="New Personal Password (Min 8 Characters)"
        type={showPassword ? "text" : "password"}
        value={newPassword}
        autoComplete="new-password"
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new strong password"
        leadingIcon={<Lock className="h-4 w-4" />}
        required
      />

      <AdminTextField
        label="Confirm New Password"
        type={showPassword ? "text" : "password"}
        value={confirmNewPassword}
        autoComplete="new-password"
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        placeholder="Re-enter new password"
        leadingIcon={<KeyRound className="h-4 w-4" />}
        required
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border-2 border-accent-warm bg-surface-mist p-3 text-xs font-bold text-accent-warm-deep">
          <ShieldAlert className="h-4 w-4 shrink-0 text-accent-warm mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-1">
        <CtaButton
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Save New Password &amp; Enter Console</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </CtaButton>
      </div>
    </form>
  );
}

