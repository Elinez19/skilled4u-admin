"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { AnimatedText } from "@/components/motion/animated-text";
import { Float } from "@/components/motion/float";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";
import { type AuthStep, useAdminAuth } from "@/hooks/admin/use-admin-auth";
import { AdminCredentialsStep } from "./admin-credentials-step";
import { AdminMfaStep } from "./admin-mfa-step";
import { AdminPasswordChangeStep } from "./admin-password-change-step";
import { AdminForgotPasswordStep } from "./admin-forgot-password-step";
import { AdminResetPasswordStep } from "./admin-reset-password-step";

export interface AdminAuthPortalProps {
  initialStep?: AuthStep;
  initialToken?: string;
  initialEmail?: string;
}

/**
 * Dedicated Standalone Admin Login Page
 * Enforces:
 * 1. Email & Password Authentication (No Google OAuth for Admins)
 * 2. 6-Digit Email OTP Verification on New Devices (with 30-day Trusted Browser memory)
 * 3. Forced First-Login Password Rotation when `mustChangePassword === true`
 * 4. Self-Service Forgot Password & Secure Reset Password Flow
 */
export function AdminAuthPortal({
  initialStep,
  initialToken,
  initialEmail,
}: AdminAuthPortalProps = {}) {
  const {
    step,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    trustDevice,
    setTrustDevice,
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
    statusMessage,
    timeoutNotice,
    handleCredentialsSubmit,
    handleMfaSubmit,
    handleResendOtp,
    handleChangePasswordSubmit,
    handleForgotPasswordSubmit,
    handleResetPasswordSubmit,
    handleResendResetOtp,
    goToForgotPassword,
    goToResetPassword,
    resetToCredentials,
  } = useAdminAuth({
    initialStep,
    initialToken,
    initialEmail,
  });

  return (
    <div className="surface-viewport-gloss-pearl min-h-screen px-3 sm:px-5 lg:px-7 py-5 sm:py-8 flex items-center justify-center">
      <ScaleSlab priority className="surface-slab-blue relative mx-auto w-full max-w-slab overflow-hidden rounded-slab shadow-gloss-float">
        {/* Background Atmosphere Texture */}
        <div className="pointer-events-none absolute inset-0 select-none opacity-20">
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
            <Reveal priority className="flex flex-wrap items-center gap-2.5">
              <Link href="/admin" className="group focus:outline-none">
                <BrandLogo tone="on-blue" size="md" />
              </Link>
              <PillBadge
                tone="porcelain"
                icon="shield"
                className="px-3 py-1 text-xs"
              >
                {step === "forgot_password"
                  ? "Password Recovery"
                  : step === "reset_password"
                  ? "Security Reset"
                  : "Admin Login"}
              </PillBadge>
            </Reveal>

            <AnimatedText
              priority
              as="h1"
              text="Skilled4U Admin Portal."
              highlightWords={["Admin", "Portal"]}
              highlightClassName="text-accent-sky"
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.02] tracking-tight text-ink-on-blue drop-shadow-sm"
            />

            <Reveal priority delay={0.14}>
              <p className="max-w-md text-xs sm:text-sm font-semibold leading-relaxed text-ink-on-blue-muted">
                Manage artisans and customers. View bookings and support requests.
              </p>
            </Reveal>

            <Reveal
              priority
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

          {/* Right 6 Cols: Glossy Porcelain Login / MFA / Password Reset Card */}
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
                      {step === "forgot_password" && "Forgot Password"}
                      {step === "reset_password" && "Reset Your Password"}
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-ink-secondary">
                      {step === "credentials" &&
                        "Enter your administrator email and password to sign in to the console."}
                      {step === "mfa" &&
                        "Enter the 6-digit verification code sent to your administrator inbox."}
                      {step === "change_password" &&
                        "Set a new personal password (min 8 characters) to complete first-time setup."}
                      {step === "forgot_password" &&
                        "Enter your registered email address and we'll send you a password reset code."}
                      {step === "reset_password" &&
                        "Enter your verification code and choose a new secure password."}
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
                  <AdminCredentialsStep
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    loading={loading}
                    error={error}
                    onSubmit={handleCredentialsSubmit}
                    onForgotPassword={goToForgotPassword}
                  />
                )}

                {step === "mfa" && (
                  <AdminMfaStep
                    otp={otp}
                    setOtp={setOtp}
                    trustDevice={trustDevice}
                    setTrustDevice={setTrustDevice}
                    loading={loading}
                    resendingOtp={resendingOtp}
                    error={error}
                    onSubmit={handleMfaSubmit}
                    onBack={resetToCredentials}
                    onResendOtp={handleResendOtp}
                  />
                )}

                {step === "change_password" && (
                  <AdminPasswordChangeStep
                    currentPassword={password}
                    setCurrentPassword={setPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                    showPassword={showPassword}
                    loading={loading}
                    error={error}
                    onSubmit={handleChangePasswordSubmit}
                  />
                )}

                {step === "forgot_password" && (
                  <AdminForgotPasswordStep
                    email={email}
                    setEmail={setEmail}
                    loading={loading}
                    error={error}
                    onSubmit={handleForgotPasswordSubmit}
                    onBack={resetToCredentials}
                    onGoToReset={goToResetPassword}
                  />
                )}

                {step === "reset_password" && (
                  <AdminResetPasswordStep
                    email={email}
                    setEmail={setEmail}
                    otp={otp}
                    setOtp={setOtp}
                    resetToken={resetToken}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    loading={loading}
                    resendingOtp={resendingOtp}
                    error={error}
                    onSubmit={handleResetPasswordSubmit}
                    onBack={resetToCredentials}
                    onResendOtp={handleResendResetOtp}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </ScaleSlab>
    </div>
  );
}
