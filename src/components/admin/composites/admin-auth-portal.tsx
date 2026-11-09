"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { AnimatedText } from "@/components/motion/animated-text";
import { Float } from "@/components/motion/float";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";

type AuthStep = "credentials" | "mfa" | "change_password";

/**
 * Dedicated Standalone Admin Login Page
 * Enforces:
 * 1. Email & Password Authentication (No Google OAuth for Admins)
 * 2. Mandatory 6-Digit Email OTP Step-Up Verification on Every Admin Login
 * 3. Forced First-Login Password Rotation when `mustChangePassword === true`
 */
export function AdminAuthPortal() {
  const router = useRouter();
  const [step, setStep] = React.useState<AuthStep>("credentials");
  const [email, setEmail] = React.useState("elijahndenwa88@gmail.com");
  const [password, setPassword] = React.useState("Admin@2026");
  const [otp, setOtp] = React.useState("");
  const [mfaChallengeToken, setMfaChallengeToken] = React.useState<string>("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [resendingOtp, setResendingOtp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = React.useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = React.useState("/admin");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    const cb = params.get("callbackUrl");
    if (cb && cb.startsWith("/admin") && !cb.startsWith("//")) {
      setCallbackUrl(cb);
    }
    if (reason === "timeout") {
      setTimeoutNotice(
        "Your session expired due to inactivity. Please sign in again to continue."
      );
    } else if (reason === "unauthorized") {
      setTimeoutNotice(
        "Please sign in with an Administrator account to access the console."
      );
    }
  }, []);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    setTimeoutNotice(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          portal: "admin",
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          payload.error ||
            "Invalid credentials. Please verify your administrator email and password."
        );
        setLoading(false);
        return;
      }

      if (payload?.data?.mfaRequired && payload?.data?.mfaChallengeToken) {
        setMfaChallengeToken(payload.data.mfaChallengeToken);
        setOtp("");
        setStep("mfa");
        setStatusMessage(
          payload.data.message ||
            `We sent a 6-digit security code to ${normalizedEmail}.`
        );
        setLoading(false);
        return;
      }

      router.push(callbackUrl || "/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication request failed"
      );
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "admin-mfa",
          email: normalizedEmail,
          otp: otp.trim(),
          mfaChallengeToken,
          portal: "admin",
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          payload.error ||
            "Invalid or expired 6-digit security code. Please check your email and try again."
        );
        setLoading(false);
        return;
      }

      if (payload?.data?.mustChangePassword) {
        setStep("change_password");
        setStatusMessage(
          "First-time administrator sign-in detected. Please set a new personal password to activate your console access."
        );
        setLoading(false);
        return;
      }

      router.push(callbackUrl || "/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "OTP verification failed"
      );
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setResendingOtp(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: normalizedEmail,
          type: "sign-in",
          portal: "admin",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Could not resend OTP code.");
      } else {
        setStatusMessage(
          `A fresh 6-digit verification code was sent to ${normalizedEmail}.`
        );
      }
    } catch {
      setError("Failed to resend 6-digit verification code.");
    } finally {
      setResendingOtp(false);
    }
  }

  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Your new administrator password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: password,
          newPassword,
          revokeOtherSessions: true,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Failed to update administrator password.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl || "/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Password update request failed"
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-pearl text-ink-primary p-4 sm:p-6 lg:p-10">
      <ScaleSlab className="surface-slab-blue relative mx-auto w-full max-w-slab overflow-hidden rounded-slab">
        {/* Custom 3D Glossy Background Asset */}
        <div className="pointer-events-none absolute inset-0 select-none opacity-55">
          <Image
            src="/images/landing/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="1400px"
            className="object-cover object-center"
          />
        </div>

        <div
          className="contrast-halo-blue pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <ToolPattern tone="on-blue" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 lg:px-10 py-8 sm:py-11 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left 6 Cols: Brand Identity, Security Narrative & OffsetRing Motifs */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <Reveal className="flex flex-wrap items-center gap-2.5">
              <Link href="/admin" className="group focus:outline-none">
                <BrandLogo tone="on-blue" size="md" />
              </Link>
              <PillBadge
                tone="porcelain"
                icon="shield"
                className="px-3 py-1 text-xs"
              >
                Admin Portal · 2-Step MFA
              </PillBadge>
            </Reveal>

            <AnimatedText
              as="h1"
              text="Skilled4U Admin Portal."
              highlightWords={["Admin", "Portal"]}
              highlightClassName="text-accent-sky"
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.02] tracking-tight text-ink-on-blue drop-shadow-sm"
            />

            <Reveal delay={0.14}>
              <p className="max-w-md text-xs sm:text-sm font-semibold leading-relaxed text-ink-on-blue-muted">
                Protected by mandatory 2-step Email OTP verification, role-scoped
                RBAC permissions, AES-256-GCM KYC encryption, and automatic
                30-minute idle session timeouts.
              </p>
            </Reveal>

            <Reveal
              delay={0.22}
              className="pt-1 flex flex-wrap items-center gap-4"
            >
              <Float amplitude={5} duration={4.6}>
                <OffsetRing size="sm" faceTone="ink">
                  <ShieldCheck className="h-4 w-4 text-accent-gold" />
                </OffsetRing>
              </Float>
              <Float amplitude={6} duration={5.2} delay={0.25}>
                <OffsetRing size="sm" faceTone="porcelain">
                  <Users className="h-4 w-4 text-brand-600" />
                </OffsetRing>
              </Float>
              <Float amplitude={5} duration={4.9} delay={0.45}>
                <OffsetRing size="sm" faceTone="ink">
                  <Lock className="h-4 w-4 text-accent-sky" />
                </OffsetRing>
              </Float>
            </Reveal>
          </div>

          {/* Right 6 Cols: Glossy Porcelain Login / MFA / Password Rotation Card */}
          <div className="lg:col-span-6">
            <div className="surface-gloss-card relative overflow-hidden p-5 sm:p-7 shadow-gloss-float">
              <div className="pointer-events-none absolute inset-0 select-none opacity-25">
                <Image
                  src="/images/landing/pearl-bg.jpg"
                  alt=""
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-brand-950">
                      {step === "credentials" && "Sign In to Admin Portal"}
                      {step === "mfa" && "Step 2: Verify 6-Digit Email OTP"}
                      {step === "change_password" &&
                        "Step 3: Rotate Temporary Password"}
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-ink-secondary">
                      {step === "credentials" &&
                        "Enter your administrator email and password to receive a 6-digit security code."}
                      {step === "mfa" &&
                        "Enter the 6-digit verification code sent to your administrator inbox."}
                      {step === "change_password" &&
                        "Set a new personal password (min 8 characters) to complete first-time setup."}
                    </p>
                  </div>
                </div>

                {timeoutNotice && (
                  <div className="flex items-start gap-2 rounded-xl border-2 border-accent-gold/50 bg-brand-50/90 p-3 text-xs font-bold text-brand-950">
                    <Clock className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
                    <span>{timeoutNotice}</span>
                  </div>
                )}

                {statusMessage && (
                  <div className="flex items-start gap-2 rounded-xl border-2 border-brand-200 bg-brand-50/90 p-3 text-xs font-bold text-brand-950">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {step === "credentials" && (
                  <form
                    onSubmit={handleCredentialsSubmit}
                    className="space-y-3.5"
                  >
                    <AdminTextField
                      label="Administrator Email Address"
                      type="email"
                      value={email}
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@skilled4u.ng"
                      leadingIcon={<Mail className="h-4 w-4" />}
                      required
                    />

                    <AdminTextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      leadingIcon={<KeyRound className="h-4 w-4" />}
                      trailingIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-sky cursor-pointer"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue to 6-Digit OTP</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </CtaButton>
                    </div>
                  </form>
                )}

                {step === "mfa" && (
                  <form onSubmit={handleMfaSubmit} className="space-y-3.5">
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
                          onClick={() => {
                            setStep("credentials");
                            setError(null);
                            setStatusMessage(null);
                          }}
                          className="inline-flex items-center gap-1 text-ink-secondary hover:text-brand-900 cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          disabled={resendingOtp}
                          onClick={handleResendOtp}
                          className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-950 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              resendingOtp ? "animate-spin" : ""
                            }`}
                          />
                          <span>
                            {resendingOtp ? "Sending..." : "Resend 6-digit code"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {step === "change_password" && (
                  <form
                    onSubmit={handleChangePasswordSubmit}
                    className="space-y-3.5"
                  >
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
                )}
              </div>
            </div>
          </div>
        </div>
      </ScaleSlab>
    </div>
  );
}
