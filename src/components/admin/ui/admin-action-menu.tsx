"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import Link from "next/link";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AdminActionMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  dividerBefore?: boolean;
}

export interface AdminActionMenuProps {
  items: ReadonlyArray<AdminActionMenuItem>;
  label?: string;
  ariaLabel?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/**
 * Reusable Three-Dots Table Action Button with Glossy Dropdown CTAs
 * Uses a portal with viewport-aware positioning so dropdowns are never clipped
 * inside scrollable or overflow-hidden table containers.
 */
export function AdminActionMenu({
  items,
  label = "Quick Actions",
  ariaLabel = "Open row actions menu",
  orientation = "vertical",
  className,
}: AdminActionMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ top: 0, right: 0 });

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const right = Math.max(12, window.innerWidth - rect.right);
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = Math.min(340, items.length * 44 + 48);

    if (spaceBelow < estimatedHeight && rect.top > spaceBelow) {
      setCoords({
        bottom: Math.max(12, window.innerHeight - rect.top + 6),
        right,
      });
    } else {
      setCoords({
        top: Math.max(12, rect.bottom + 6),
        right,
      });
    }
  }, [items.length]);

  const toggleMenu = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!open) {
        updatePosition();
      }
      setOpen((prev) => !prev);
    },
    [open, updatePosition]
  );

  React.useEffect(() => {
    if (!open) return;

    updatePosition();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [open, updatePosition]);

  const DotsIcon =
    orientation === "horizontal" ? MoreHorizontal : MoreVertical;

  return (
    <div className={cn("inline-flex items-center justify-end", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
          open
            ? "cta-surface-primary border-brand-600 text-ink-on-blue shadow-gloss-card"
            : "border-brand-100 bg-surface-porcelain text-brand-800 shadow-gloss-card hover:border-brand-300 hover:bg-brand-50"
        )}
      >
        <DotsIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                role="menu"
                aria-label={label}
                initial={{ opacity: 0, scale: 0.95, y: coords.bottom ? 6 : -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: coords.bottom ? 4 : -4 }}
                transition={{ duration: motionTokens.duration.fast }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  bottom: coords.bottom,
                  right: coords.right,
                }}
                className="surface-gloss-card z-50 w-56 rounded-2xl border-2 border-brand-200 p-1.5 shadow-gloss-float text-left"
              >
                <div className="px-2.5 py-1 border-b border-brand-100/80 mb-1">
                  <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                    {label}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {items.map((item) => {
                    const variantStyles =
                      item.variant === "primary"
                        ? "text-brand-700 hover:bg-brand-50 font-extrabold"
                        : item.variant === "danger"
                          ? "text-accent-warm-deep hover:bg-surface-mist font-extrabold"
                          : "text-brand-950 hover:bg-surface-pearl font-bold";

                    const content = (
                      <>
                        {item.icon && (
                          <span
                            className={cn(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors",
                              item.variant === "primary"
                                ? "border-brand-200 bg-brand-50 text-brand-600"
                                : item.variant === "danger"
                                  ? "border-accent-warm/40 bg-surface-mist text-accent-warm"
                                  : "border-brand-100 bg-surface-porcelain text-brand-700"
                            )}
                          >
                            {item.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-xs leading-tight">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="truncate text-[10px] font-medium text-ink-secondary">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </>
                    );

                    return (
                      <React.Fragment key={item.id}>
                        {item.dividerBefore && (
                          <div
                            className="my-1 border-t border-brand-100/80"
                             role="separator"
                          />
                        )}
                        {item.href && !item.disabled ? (
                          <Link
                            href={item.href}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors",
                              variantStyles
                            )}
                          >
                            {content}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            role="menuitem"
                            disabled={item.disabled}
                            onClick={() => {
                              if (item.disabled) return;
                              setOpen(false);
                              item.onClick?.();
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                              variantStyles
                            )}
                          >
                            {content}
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

