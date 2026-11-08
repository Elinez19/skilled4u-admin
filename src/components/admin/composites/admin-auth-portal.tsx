"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
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
import { motionTokens } from "@/lib/motion";
import { authClient } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

/**
 * Dedicated Standalone Admin Login Page (No Frontend Navbar or Footer)
 */
export function AdminAuthPortal() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@skilled4u.ng");
  const [password, setPassword] = React.useState("Admin@2026");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOauthNotice(null);

    try {
      const { error: signInErr } = await authClient.signIn.email({
        email,
        password,
      });
      if (signInErr) {
        setError(
          signInErr.message ||
            "Invalid credentials. Please verify your administrator email and password."
        );
        setLoading(false);
        return;
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

  function handleGoogleOAuthClick() {
    setError(null);
    setOauthNotice(
      "Google OAuth sign-in is currently in UI preview mode. Please sign in using your administrator credentials below."
    );
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
                Admin Portal
              </PillBadge>
            </Reveal>

            <AnimatedText
              as="h1"
              text="Skilled4U Admin Portal"
              highlightWords={["Operations", "Command."]}
              highlightClassName="text-accent-sky"
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.02] tracking-tight text-ink-on-blue drop-shadow-sm"
            />

            <Reveal delay={0.14}>
              <p className="max-w-md text-xs sm:text-sm font-semibold leading-relaxed text-ink-on-blue-muted">
                Sign in to manage customer, artisan, and administrator accounts,
                coordinate service bookings and dispatches, resolve disputes,
                moderate reviews, and oversee platform payouts.
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
                    Sign In to Admin Portal
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-ink-secondary">
                    Enter your admin credentials to access skilled4u admin portal.
                  </p>
                </div>

                {/* Google OAuth Button (UI Only) */}
                <div className="space-y-3">
                  <motion.button
                    type="button"
                    onClick={handleGoogleOAuthClick}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={motionTokens.spring.snappy}
                    className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-3 rounded-pill border-2 border-brand-100 bg-surface-porcelain px-4 sm:px-5 font-display text-xs sm:text-sm font-extrabold text-brand-950 shadow-gloss-card transition-all hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-gloss-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky cursor-pointer select-none"
                    aria-label="Sign in with Google (UI only)"
                  >
                    <GoogleIcon className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
                    <span>Sign in with Google</span>
                  </motion.button>

                  {oauthNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-xl border-2 border-brand-200 bg-brand-50/90 p-3 text-xs font-bold text-brand-900 shadow-xs"
                    >
                      <Info className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
                      <span className="leading-snug">{oauthNotice}</span>
                    </motion.div>
                  )}

                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-brand-100" />
                    </div>
                    <span className="relative rounded-pill border border-brand-100/80 bg-surface-porcelain px-3 py-0.5 font-sans text-[11px] font-bold uppercase tracking-wider text-ink-muted shadow-xs">
                      Or sign in with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <AdminTextField
                    label="Email Address"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (oauthNotice) setOauthNotice(null);
                    }}
                    placeholder="admin@skilled4u.ng"
                    leadingIcon={<Mail className="h-4 w-4" />}
                    required
                  />

                  <AdminTextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (oauthNotice) setOauthNotice(null);
                    }}
                    placeholder="••••••••"
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
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Admin Portal</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </CtaButton>
                  </div>
                </form>

                <div className="border-t border-surface-frost pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScaleSlab>
    </div>
  );
}
