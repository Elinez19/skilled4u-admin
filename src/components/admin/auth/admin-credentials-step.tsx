"use client";

import * as React from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";

export interface AdminCredentialsStepProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword?: () => void;
}

export function AdminCredentialsStep({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  onSubmit,
  onForgotPassword,
}: AdminCredentialsStepProps) {
  const [fieldsUnlocked, setFieldsUnlocked] = React.useState(false);

  React.useEffect(() => {
    setEmail("");
    setPassword("");
  }, [setEmail, setPassword]);

  const unlockFields = React.useCallback(() => {
    if (!fieldsUnlocked) {
      setFieldsUnlocked(true);
    }
  }, [fieldsUnlocked]);

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-3.5">
      {/* Hidden decoy inputs to prevent browser password managers from auto-filling */}
      <input
        type="text"
        name="prevent_autofill_email"
        autoComplete="username"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <input
        type="password"
        name="prevent_autofill_password"
        autoComplete="current-password"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <AdminTextField
        label="Administrator Email Address"
        type="email"
        name="admin_portal_email_entry"
        value={email}
        readOnly={!fieldsUnlocked}
        onFocus={unlockFields}
        onPointerDown={unlockFields}
        autoComplete="off"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        leadingIcon={<Mail className="h-4 w-4" />}
        required
      />

      <AdminTextField
        label="Password"
        type={showPassword ? "text" : "password"}
        name="admin_portal_password_entry"
        value={password}
        readOnly={!fieldsUnlocked}
        onFocus={unlockFields}
        onPointerDown={unlockFields}
        autoComplete="new-password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        leadingIcon={<KeyRound className="h-4 w-4" />}
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

      {onForgotPassword && (
        <div className="flex justify-end -mt-1 pb-0.5">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-bold text-brand-700 hover:text-brand-950 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      )}

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
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Login to portal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </CtaButton>
      </div>
    </form>
  );
}

