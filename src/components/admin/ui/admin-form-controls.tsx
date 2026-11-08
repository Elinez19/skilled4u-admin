"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Glossy Porcelain Pill Search Input with Tokenized Focus Ring
 */
export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search records...",
  className,
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative w-full max-w-xs sm:max-w-sm", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-600"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-pill border-2 border-brand-100 bg-surface-porcelain pl-9 pr-9 font-sans text-xs sm:text-sm font-semibold text-ink-primary shadow-gloss-card transition-all placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-accent-sky/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-pill bg-surface-mist text-brand-700 hover:bg-brand-100 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export interface AdminTextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
}

/**
 * Reusable Tokenized Form Field (Label + Glossy Porcelain Input + Optional Hint)
 */
export const AdminTextField = React.forwardRef<
  HTMLInputElement,
  AdminTextFieldProps
>(({ label, hint, leadingIcon, className, id, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={inputId}
        className="block font-display text-xs sm:text-[13px] font-extrabold tracking-tight text-brand-950"
      >
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border-2 border-brand-100 bg-surface-porcelain px-3.5 py-2 font-sans text-xs sm:text-sm font-semibold text-ink-primary shadow-gloss-card transition-all placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-accent-sky/40 disabled:cursor-not-allowed disabled:opacity-60",
            leadingIcon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {hint && (
        <p className="text-[11px] font-medium text-ink-secondary">{hint}</p>
      )}
    </div>
  );
});
AdminTextField.displayName = "AdminTextField";

export interface AdminSelectOption<T extends string = string> {
  readonly id: T;
  readonly label: string;
}

export interface AdminSelectPillsProps<T extends string = string> {
  label: string;
  options: ReadonlyArray<AdminSelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/**
 * Tokenized Pill Choice Selector for Modal Forms (e.g. Bachs.io Payment Channels)
 */
export function AdminSelectPills<T extends string = string>({
  label,
  options,
  value,
  onChange,
}: AdminSelectPillsProps<T>) {
  return (
    <div className="space-y-2 text-left">
      <span className="block font-display text-sm font-extrabold tracking-tight text-brand-950">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "rounded-2xl px-3.5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
                active
                  ? "cta-surface-primary text-ink-on-blue"
                  : "cta-surface-secondary text-brand-700 hover:border-brand-400"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

