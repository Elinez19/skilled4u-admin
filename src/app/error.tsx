"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-pearl px-4 py-12">
      <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-brand-100 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold text-brand-950">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            An unexpected error occurred while rendering this page.
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
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface-frost px-4 py-2 text-xs font-bold text-brand-950 border border-brand-200/50 hover:bg-brand-50 transition"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

