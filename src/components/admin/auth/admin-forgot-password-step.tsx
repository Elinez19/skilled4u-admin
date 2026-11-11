"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldAlert } from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminForgotPasswordStepProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onGoToReset?: () => void;
}

export function AdminForgotPasswordStep({
  email,
  setEmail,
  loading,
  error,
  onSubmit,
  onBack,
  onGoToReset,
}: AdminForgotPasswordStepProps) {
  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-3.5">
      <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 p-3 text-xs font-semibold leading-relaxed text-brand-950">
        Enter the email address registered with your account. We will send you a 6-digit security code to reset your password.
      </div>

      <AdminTextField
        label="Account Email Address"
        type="email"
        name="forgot_password_email_entry"
        value={email}
        autoComplete="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        leadingIcon={<Mail className="h-4 w-4" />}
        required
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border-2 border-accent-warm bg-surface-mist p-3 text-xs font-bold text-accent-warm-deep">
          <ShieldAlert className="h-4 w-4 shrink-0 text-accent-warm mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-1 space-y-2.5">
        <CtaButton
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Reset Code...</span>
            </>
          ) : (
            <>
              <span>Send Reset Code</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </CtaButton>

        <div className="flex items-center justify-between gap-2 pt-1 text-xs font-bold">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-ink-secondary hover:text-brand-900 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </button>

          {onGoToReset && (
            <button
              type="button"
              onClick={onGoToReset}
              className="text-brand-700 hover:text-brand-950 cursor-pointer"
            >
              Have a code? Reset now
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

