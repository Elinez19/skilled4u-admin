import * as React from "react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { cn } from "@/lib/utils";

export interface AdminDataTableProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  headerAction?: React.ReactNode;
  bulkActions?: React.ReactNode;
  selectedCount?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Glossy 3D Admin Table Card Container
 */
export function AdminDataTable({
  title,
  subtitle,
  badge,
  headerAction,
  bulkActions,
  selectedCount = 0,
  children,
  className,
}: AdminDataTableProps) {
  return (
    <div className={cn("surface-gloss-card overflow-hidden", className)}>
      {(title || subtitle || headerAction || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-surface-frost bg-surface-pearl/70 px-4 sm:px-5 py-3.5 sm:py-4">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {title && (
                <h2 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-brand-950">
                  {title}
                </h2>
              )}
              {badge && (
                <PillBadge tone="sky" className="px-2.5 py-0.5 text-[11px]">
                  {badge}
                </PillBadge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-medium text-ink-secondary">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-200/90 bg-brand-50/80 px-4 sm:px-5 py-2.5 transition-all">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            <span className="font-display text-xs font-extrabold text-brand-950">
              {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>
          {bulkActions && (
            <div className="flex flex-wrap items-center gap-2">{bulkActions}</div>
          )}
        </div>
      )}

      <div className="no-scrollbar relative w-full overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminTable({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full caption-bottom text-left text-xs sm:text-[13px]",
        className
      )}
      {...props}
    />
  );
}

export function AdminTableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b-2 border-surface-frost bg-surface-mist/85",
        className
      )}
      {...props}
    />
  );
}

export function AdminTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-surface-frost", className)}
      {...props}
    />
  );
}

export interface AdminTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

export function AdminTableRow({
  className,
  isSelected,
  ...props
}: AdminTableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-surface-pearl/90",
        isSelected && "bg-brand-50/70 hover:bg-brand-50/90",
        className
      )}
      {...props}
    />
  );
}

export interface AdminCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

export const AdminCheckbox = React.forwardRef<
  HTMLInputElement,
  AdminCheckboxProps
>(({ className, indeterminate, checked, ...props }, ref) => {
  const internalRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const el = internalRef.current;
    if (el) {
      el.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={(node) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      }}
      checked={checked}
      className={cn(
        "h-4 w-4 rounded border-brand-300 text-brand-600 accent-brand-600 focus:ring-2 focus:ring-brand-500/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
AdminCheckbox.displayName = "AdminCheckbox";

export function AdminTableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-9 px-3 sm:px-4 align-middle font-display text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-brand-800 whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

export function AdminTableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-3 sm:px-4 py-2.5 sm:py-3 align-middle text-ink-primary",
        className
      )}
      {...props}
    />
  );
}

export interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * Reusable Tokenized Empty State with OffsetRing Emblem
 */
export function AdminEmptyState({
  title,
  description,
  icon,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <OffsetRing size="sm" faceTone="ink">
        {icon}
      </OffsetRing>
      <h3 className="mt-4 font-display text-base sm:text-lg font-extrabold text-brand-950">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-xs sm:text-sm font-medium text-ink-secondary">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

