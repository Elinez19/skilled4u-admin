"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Admin workspace error:", error);
  }, [error]);

  return (
    <div className="surface-viewport-gloss-pearl min-h-[70vh] px-4 py-8 flex items-center justify-center">
      <div className="surface-gloss-card relative mx-auto w-full max-w-lg overflow-hidden rounded-slab p-6 sm:p-8 shadow-gloss-float text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-brand-950">
            Unable to Load Admin Workspace
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            {error.message ||
              "A server communication or authorization error occurred while loading this section."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-ink-muted/70">
              Digest ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-pill bg-brand-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-pill bg-surface-frost px-4 py-2 text-xs sm:text-sm font-bold text-brand-950 border border-brand-200/50 hover:bg-brand-50 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  );
}

