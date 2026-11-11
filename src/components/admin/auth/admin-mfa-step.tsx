"use client";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminMfaStepProps {
  otp: string;
  setOtp: (otp: string) => void;
  trustDevice?: boolean;
  setTrustDevice?: (trust: boolean) => void;
  loading: boolean;
  resendingOtp: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResendOtp: () => void;
}

export function AdminMfaStep({
  otp,
  setOtp,
  trustDevice = true,
  setTrustDevice,
  loading,
  resendingOtp,
  error,
  onSubmit,
  onBack,
  onResendOtp,
}: AdminMfaStepProps) {
  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-3.5">
      <AdminTextField
        label="6-Digit Security Code"
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
        required
      />

      {setTrustDevice && (
        <label className="flex items-center gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/60 px-3 py-2.5 text-xs font-semibold text-brand-950 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="h-4 w-4 rounded border-brand-300 text-brand-700 focus:ring-accent-sky cursor-pointer"
          />
          <span>Trust this device</span>
        </label>
      )}

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
          disabled={loading || otp.length !== 6}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Security Code...</span>
            </>
          ) : (
            <>
              <span>Verify &amp; Sign In</span>
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
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={resendingOtp}
            onClick={onResendOtp}
            className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-950 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${resendingOtp ? "animate-spin" : ""}`}
            />
            <span>
              {resendingOtp ? "Sending..." : "Resend 6-digit code"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

