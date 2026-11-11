"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminResetPasswordStepProps {
  email: string;
  setEmail: (email: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  resetToken?: string;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  resendingOtp?: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResendOtp?: () => void;
}

export function AdminResetPasswordStep({
  email,
  setEmail,
  otp,
  setOtp,
  resetToken,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showPassword,
  setShowPassword,
  loading,
  resendingOtp,
  error,
  onSubmit,
  onBack,
  onResendOtp,
}: AdminResetPasswordStepProps) {
  const hasToken = Boolean(resetToken && resetToken.trim().length > 0);

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-3.5">
      {hasToken ? (
        <div className="flex items-center gap-2 rounded-xl border border-brand-200/80 bg-brand-50/60 p-3 text-xs font-semibold text-brand-950">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-emerald" />
          <span>Reset security token recognized from email link.</span>
        </div>
      ) : (
        <>
          <AdminTextField
            label="Email Address"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            leadingIcon={<Mail className="h-4 w-4" />}
            required
          />

          <AdminTextField
            label="6-Digit Reset Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            autoComplete="one-time-code"
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="123456"
            leadingIcon={<ShieldCheck className="h-4 w-4" />}
            hint="Enter the 6-digit code received in your email"
            required
          />
        </>
      )}

      <AdminTextField
        label="New Password (Min 8 Characters)"
        type={showPassword ? "text" : "password"}
        value={newPassword}
        autoComplete="new-password"
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new strong password"
        leadingIcon={<Lock className="h-4 w-4" />}
        trailingIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-sky cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
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

      <div className="pt-1 space-y-2.5">
        <CtaButton
          type="submit"
          variant="primary"
          size="md"
          disabled={
            loading ||
            (!hasToken && (!email.trim() || otp.length !== 6)) ||
            newPassword.length < 8 ||
            newPassword !== confirmNewPassword
          }
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <span>Reset Password &amp; Sign In</span>
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

          {!hasToken && onResendOtp && (
            <button
              type="button"
              disabled={resendingOtp || !email.trim()}
              onClick={onResendOtp}
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-950 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${resendingOtp ? "animate-spin" : ""}`}
              />
              <span>{resendingOtp ? "Sending..." : "Resend 6-digit code"}</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

