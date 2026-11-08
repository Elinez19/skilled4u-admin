"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { motionTokens } from "@/lib/motion";
import { tokens, type CtaVariant } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export type CtaIconType = "apple" | "play" | "sparkle" | "none";

export interface CtaButtonProps {
  /**
   * Strictly 2 CTA variants across the entire landing page:
   * - "primary": Big Glossy Electric Blue with pure white text
   * - "secondary": Big Glossy Porcelain White with vibrant electric blue text
   */
  variant?: CtaVariant;
  size?: "md" | "lg";
  leadingIcon?: CtaIconType;
  trailingArrow?: boolean;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}

function AppleStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M16.365 12.633c.015-2.464 2.013-3.653 2.104-3.71-1.148-1.678-2.932-1.908-3.564-1.932-1.508-.154-2.968.899-3.738.899-.77 0-1.946-.879-3.204-.854-1.644.025-3.164.962-4.01 2.437-1.717 2.98-.439 7.386 1.227 9.797.817 1.18 1.787 2.504 3.063 2.457 1.233-.05 1.698-.794 3.188-.794 1.489 0 1.908.794 3.204.769 1.326-.024 2.162-1.201 2.972-2.386.942-1.372 1.328-2.705 1.35-2.773-.03-.013-2.577-.988-2.592-3.91zM13.94 5.388c.676-.822 1.132-1.964 1.007-3.106-.974.04-2.156.65-2.855 1.469-.616.712-1.158 1.878-1.011 2.992 1.087.084 2.183-.534 2.859-1.355z" />
    </svg>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M4 2.8V21.2L14.2 12L4 2.8Z" fill={tokens.colors.brand[400]} />
      <path d="M4 2.8L17.6 9.2L14.2 12L4 2.8Z" fill={tokens.colors.accent.success} />
      <path d="M4 21.2L17.6 14.8L14.2 12L4 21.2Z" fill={tokens.colors.accent.gold} />
      <path
        d="M17.6 9.2L20.6 10.7C21.5 11.2 21.5 12.8 20.6 13.3L17.6 14.8L14.2 12L17.6 9.2Z"
        fill={tokens.colors.accent.sky}
      />
    </svg>
  );
}

export function CtaButton({
  variant = "primary",
  size = "lg",
  leadingIcon = "none",
  trailingArrow = false,
  href,
  onClick,
  children,
  className,
  type = "button",
}: CtaButtonProps) {
  const isPrimary = variant === "primary";

  const content = (
    <>
      {/* Glossy Specular Sheen Sweep on Hover */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-[130%] transition-transform duration-700 ease-out group-hover:translate-x-[130%]",
          isPrimary
            ? "bg-[image:var(--gloss-sheen-white)]"
            : "bg-[image:var(--gloss-sheen-blue)]"
        )}
      />

      {leadingIcon === "apple" && <AppleStoreIcon />}
      {leadingIcon === "play" && <PlayStoreIcon />}
      {leadingIcon === "sparkle" && <Sparkles className="h-5 w-5 shrink-0" />}

      <span className="relative z-10 tracking-tight">{children}</span>

      {trailingArrow && (
        <ArrowRight className="relative z-10 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  const sharedClasses = cn(
    "group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-pill font-display font-extrabold select-none cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-sky",
    size === "lg"
      ? "h-14 px-8 text-base sm:h-15 sm:px-9 sm:text-lg"
      : "h-12 px-6 text-sm sm:text-base",
    isPrimary ? "cta-surface-primary" : "cta-surface-secondary",
    className
  );

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={motionTokens.spring.snappy}
        className={sharedClasses}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={motionTokens.spring.snappy}
      className={sharedClasses}
    >
      {content}
    </motion.button>
  );
}

