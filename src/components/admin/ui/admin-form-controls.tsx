"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { motionTokens } from "@/lib/motion";
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
  trailingIcon?: React.ReactNode;
}

/**
 * Reusable Tokenized Form Field (Label + Glossy Porcelain Input + Optional Hint)
 */
export const AdminTextField = React.forwardRef<
  HTMLInputElement,
  AdminTextFieldProps
>(({ label, hint, leadingIcon, trailingIcon, className, id, ...props }, ref) => {
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
            trailingIcon && "pr-10",
            className
          )}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            {trailingIcon}
          </div>
        )}
      </div>
      {hint && (
        <p className="text-[11px] font-medium text-ink-secondary">{hint}</p>
      )}
    </div>
  );
});
AdminTextField.displayName = "AdminTextField";

export interface AdminTextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

/**
 * Reusable Tokenized Textarea Field
 */
export const AdminTextareaField = React.forwardRef<
  HTMLTextAreaElement,
  AdminTextareaFieldProps
>(({ label, hint, className, id, rows = 3, ...props }, ref) => {
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
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={cn(
          "flex w-full rounded-xl border-2 border-brand-100 bg-surface-porcelain px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-ink-primary shadow-gloss-card transition-all placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-accent-sky/40 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      />
      {hint && (
        <p className="text-[11px] font-medium text-ink-secondary">{hint}</p>
      )}
    </div>
  );
});
AdminTextareaField.displayName = "AdminTextareaField";

export interface AdminSelectOption<T extends string = string> {
  readonly id: T;
  readonly label: string;
}

export interface AdminSelectFieldProps<T extends string = string> {
  label: string;
  options: ReadonlyArray<AdminSelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
  hint?: string;
  className?: string;
}

/**
 * Reusable Tokenized Select Dropdown Field
 */
export function AdminSelectField<T extends string = string>({
  label,
  options,
  value,
  onChange,
  hint,
  className,
}: AdminSelectFieldProps<T>) {
  const selectId = React.useId();

  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      <label
        htmlFor={selectId}
        className="block font-display text-xs sm:text-[13px] font-extrabold tracking-tight text-brand-950"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="flex h-10 w-full rounded-xl border-2 border-brand-100 bg-surface-porcelain px-3.5 py-2 font-sans text-xs sm:text-sm font-semibold text-ink-primary shadow-gloss-card transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-accent-sky/40 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <p className="text-[11px] font-medium text-ink-secondary">{hint}</p>
      )}
    </div>
  );
}

export interface AdminSelectPillsProps<T extends string = string> {
  label: string;
  options: ReadonlyArray<AdminSelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4 | 5;
}

/**
 * Tokenized Pill Choice Selector for Forms
 */
export function AdminSelectPills<T extends string = string>({
  label,
  options,
  value,
  onChange,
  columns = 4,
}: AdminSelectPillsProps<T>) {
  const gridColsClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : columns === 5
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="space-y-1.5 text-left">
      <span className="block font-display text-xs sm:text-[13px] font-extrabold tracking-tight text-brand-950">
        {label}
      </span>
      <div className={cn("grid gap-2", gridColsClass)}>
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "rounded-xl px-3 py-2 font-display text-xs font-extrabold tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
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

export interface AdminInlineFormProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  isEditing?: boolean;
  editingBadgeText?: string;
  onResetToCreate?: () => void;
  resetLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  savedMessage?: string | null;
  children: React.ReactNode;
  formRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * Reusable Inline Add / Edit / Manage Form Panel (replaces modal overlays)
 * Renders directly inside the page workspace with Cobalt header slab,
 * Add vs Edit mode indicator, feedback banner, and smooth collapse/expand.
 */
export function AdminInlineForm({
  id = "workspace-inline-form",
  eyebrow = "Add & Manage Record",
  title,
  description,
  isEditing = false,
  editingBadgeText,
  onResetToCreate,
  resetLabel = "Switch to Add New",
  open = true,
  onOpenChange,
  savedMessage,
  children,
  formRef,
  className,
}: AdminInlineFormProps) {
  return (
    <div
      id={id}
      ref={formRef}
      className={cn(
        "surface-gloss-card overflow-hidden border-2 transition-colors scroll-mt-24",
        isEditing ? "border-brand-400" : "border-brand-100",
        className
      )}
    >
      {/* Top Cobalt Slab Header */}
      <div
        className={cn(
          "relative overflow-hidden px-4 sm:px-6 py-4",
          isEditing ? "surface-slab-ink" : "surface-slab-blue"
        )}
      >
        <ToolPattern tone="on-blue" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <PillBadge
                tone={isEditing ? "sky" : "porcelain"}
                icon="dot"
                className="px-2.5 py-0.5 text-[10px]"
              >
                {isEditing
                  ? editingBadgeText || "Editing Selected Record"
                  : eyebrow}
              </PillBadge>

              {isEditing && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain/15 px-2.5 py-0.5 font-display text-[10px] font-extrabold text-accent-gold border border-accent-gold/40">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Edit &amp; Manage Mode</span>
                </span>
              )}

              {savedMessage && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2.5 py-0.5 font-display text-[11px] font-extrabold text-brand-950 shadow-gloss-card">
                  <CheckCircle2 className="h-3 w-3 text-accent-success" />
                  <span>{savedMessage}</span>
                </span>
              )}
            </div>

            <h2 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-ink-on-blue">
              {title}
            </h2>
            <p className="text-xs font-medium text-ink-on-blue-muted max-w-2xl">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isEditing && onResetToCreate && (
              <CtaButton
                type="button"
                variant="secondary"
                size="xs"
                onClick={onResetToCreate}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{resetLabel}</span>
              </CtaButton>
            )}

            {onOpenChange && (
              <CtaButton
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => onOpenChange(!open)}
              >
                {open ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Hide Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Open Form</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </CtaButton>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Inline Form Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: motionTokens.duration.base }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-surface-porcelain/95">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
