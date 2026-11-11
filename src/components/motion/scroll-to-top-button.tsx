"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

function useIsScrolledPast(threshold: number): boolean {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    window.addEventListener("scroll", onStoreChange, { passive: true });
    return () => window.removeEventListener("scroll", onStoreChange);
  }, []);

  const getSnapshot = React.useCallback(
    () => window.scrollY > threshold,
    [threshold]
  );

  const getServerSnapshot = () => false;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Global Scroll to Top Button
 * Displays Skilled4U's signature glossy OffsetRing button at the bottom-right
 * once the user scrolls past the threshold (default: 320px).
 */
export function ScrollToTopButton({
  threshold = 320,
  className = "",
}: ScrollToTopButtonProps) {
  const visible = useIsScrolledPast(threshold);
  const prefersReducedMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={motionTokens.spring.snappy}
          className={cn(
            "fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 print:hidden",
            className
          )}
        >
          <OffsetRing
            size="sm"
            faceTone="blue"
            interactive
            onClick={scrollToTop}
            ariaLabel="Scroll back to top"
            className="shadow-gloss-float"
          >
            <ArrowUp className="h-4 w-4 text-ink-on-blue stroke-[2.5]" />
          </OffsetRing>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
