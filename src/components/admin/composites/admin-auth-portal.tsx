"use client";

import * as React from "react";
import {
  ArrowRight,
  Database,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminTextField } from "@/components/admin/ui/admin-form-controls";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { BrandLogo } from "@/components/brand/logo";
import { OffsetRing } from "@/components/brand/offset-ring";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { AnimatedText } from "@/components/motion/animated-text";
import { Float } from "@/components/motion/float";
import { Reveal, ScaleSlab } from "@/components/motion/reveal";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

const AUTH_TABS: ReadonlyArray<AdminTabOption<AuthMode>> = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Create Admin Account" },
];

/**
 * Dedicated Standalone Admin Login Page (No Frontend Navbar or Footer)
 */
export function AdminAuthPortal() {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [name, setName] = React.useState("Elijah Admin");
  const [email, setEmail] = React.useState("admin@skilled4u.ng");
  const [password, setPassword] = React.useState("Admin@2026");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpErr } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (signUpErr) {
          setError(signUpErr.message || "Failed to register admin account");
          setLoading(false);
          return;
        }
      } else {
        const { error: signInErr } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInErr) {
          setError(
            signInErr.message ||
              "Invalid credentials. Switch to 'Create Admin Account' if signing in for the first time."
          );
          setLoading(false);
          return;
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication request failed"
      );
    } finally {
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
                Admin Auth Portal
              </PillBadge>
            </Reveal>

            <AnimatedText
              as="h1"
              text="Skilled4U Operations Command."
              highlightWords={["Operations", "Command."]}
              highlightClassName="text-accent-sky"
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.02] tracking-tight text-ink-on-blue drop-shadow-sm"
            />

            <Reveal delay={0.14}>
              <p className="max-w-md text-xs sm:text-sm font-semibold leading-relaxed text-ink-on-blue-muted">
                Secured by Better-Auth &amp; Neon PostgreSQL. Sign in to verify
                Abuja &amp; Lagos artisans, dispatch home fix bookings, and
                release 90/10 Bachs.io escrow payouts.
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
                  <Database className="h-4 w-4 text-brand-600" />
                </OffsetRing>
              </Float>
              <Float amplitude={5} duration={4.9} delay={0.45}>
                <OffsetRing size="sm" faceTone="ink">
                  <Lock className="h-4 w-4 text-accent-sky" />
                </OffsetRing>
              </Float>
            </Reveal>
          </div>

          {/* Right 6 Cols: Glossy Porcelain Login Card */}
          <div className="lg:col-span-6">
            <div className="surface-gloss-card relative overflow-hidden p-5 sm:p-7 shadow-gloss-float">
              {/* Subtle Pearl Background Texture */}
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
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-brand-950">
                    {mode === "signin"
                      ? "Sign In to Console"
                      : "Initialize Admin"}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-ink-secondary">
                    {mode === "signin"
                      ? "Enter your Better-Auth administrator credentials."
                      : "Create your administrator account in Neon PostgreSQL."}
                  </p>
                </div>

                {/* Mode Switcher */}
                <AdminSegmentedTabs
                  options={AUTH_TABS}
                  value={mode}
                  onChange={(nextMode) => {
                    setError(null);
                    setMode(nextMode);
                  }}
                  ariaLabel="Authentication mode"
                  layoutId="admin-auth-mode-pill"
                  className="w-full justify-center"
                />

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === "signup" && (
                    <AdminTextField
                      label="Administrator Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elijah Admin"
                      leadingIcon={<UserCheck className="h-4 w-4" />}
                      required
                    />
                  )}

                  <AdminTextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@skilled4u.ng"
                    leadingIcon={<Mail className="h-4 w-4" />}
                    required
                  />

                  <AdminTextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    leadingIcon={<KeyRound className="h-4 w-4" />}
                    required
                  />

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border-2 border-accent-warm bg-surface-mist p-3 text-xs font-bold text-accent-warm-deep">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-accent-warm" />
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
                          <span>Authenticating...</span>
                        </>
                      ) : mode === "signin" ? (
                        <>
                          <span>Sign In to Admin Console</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <span>Create Admin &amp; Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </CtaButton>
                  </div>
                </form>

                <div className="border-t border-surface-frost pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <CtaButton
                    variant="secondary"
                    size="xs"
                    href="/admin"
                    trailingArrow
                  >
                    Open Admin Dashboard
                  </CtaButton>
                  <CtaButton variant="secondary" size="xs" href="/">
                    Back to Public Site
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScaleSlab>
    </div>
  );
}
