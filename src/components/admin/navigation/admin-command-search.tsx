"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { isAdminLinkActive } from "./constants";
import { NavIcon } from "./nav-icon";
import type { AdminNavItem } from "./types";

export interface AdminCommandSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchFocused: boolean;
  onFocus: () => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
  matchingModules: ReadonlyArray<AdminNavItem>;
  onSelectModule: (href: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  pathname: string | null;
}

export function AdminCommandSearch({
  query,
  onQueryChange,
  searchFocused,
  onFocus,
  searchRef,
  matchingModules,
  onSelectModule,
  onKeyDown,
  pathname,
}: AdminCommandSearchProps) {
  return (
    <div ref={searchRef} className="relative hidden md:block w-60 lg:w-72 xl:w-80">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-brand-600"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onFocus={onFocus}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to module (e.g. Financials, Disputes)..."
          aria-label="Quick jump to dashboard module"
          className="w-full rounded-pill border-2 border-brand-100 bg-surface-pearl/90 pl-9 pr-12 py-1.5 font-sans text-xs font-semibold text-brand-950 placeholder:text-ink-muted shadow-gloss-card transition-colors focus:border-brand-400 focus:bg-surface-porcelain focus:outline-none"
        />
        <span className="pointer-events-none absolute right-2.5 rounded-pill border border-brand-200 bg-surface-porcelain px-2 py-0.5 font-mono text-[10px] font-bold text-brand-700">
          Go
        </span>
      </div>

      <AnimatePresence>
        {searchFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: motionTokens.duration.fast }}
            className="surface-gloss-card no-scrollbar absolute inset-x-0 top-full mt-2 max-h-64 overflow-y-auto p-2 z-50 border-2 border-brand-200"
          >
            <p className="px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
              Dashboard Modules ({matchingModules.length})
            </p>
            {matchingModules.length === 0 ? (
              <p className="px-2.5 py-2 text-xs font-semibold text-ink-secondary">
                No matching module found.
              </p>
            ) : (
              <div className="space-y-1">
                {matchingModules.map((mod) => {
                  const isCurrent = isAdminLinkActive(pathname, mod.href);
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => onSelectModule(mod.href)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors",
                        isCurrent
                          ? "bg-brand-50 text-brand-700 font-extrabold"
                          : "text-brand-950 hover:bg-surface-pearl"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-brand-100 bg-surface-porcelain text-brand-600">
                          <NavIcon
                            type={mod.icon}
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-xs font-extrabold">
                            {mod.label}
                          </p>
                          <p className="truncate text-[10px] font-semibold text-ink-secondary">
                            {mod.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

