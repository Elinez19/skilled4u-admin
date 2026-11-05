"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2.5 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900">
            skilled<span className="text-emerald-600">4U</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Secured by Better-Auth &amp; Neon PostgreSQL
        </div>
      </div>

      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {mode === "signin"
              ? "Sign in to Admin Portal"
              : "Initialize Admin Account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Manage artisans, KYC approvals, bookings, and Bachs.io escrow payouts."
              : "Create your Better-Auth administrator account stored in Neon PostgreSQL."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elijah Admin"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skilled4u.ng"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating with Better-Auth...
                </>
              ) : mode === "signin" ? (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Create Admin &amp; Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col gap-3 text-center text-xs text-zinc-500">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              {mode === "signin"
                ? "First time? Create your Better-Auth Admin Account →"
                : "Already have an account? Sign In →"}
            </button>

            <Link
              href="/admin"
              className="text-zinc-500 hover:text-zinc-800 underline underline-offset-4"
            >
              Or preview Admin Dashboard directly
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

