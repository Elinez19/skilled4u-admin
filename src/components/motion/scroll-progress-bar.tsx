"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export interface ScrollProgressBarProps {
  className?: string;
  height?: number;
}

/**
 * Global Horizontal Scroll Progress Bar
 * Displays an elegant 3px gradient progress line fixed at the top of the viewport,
 * indicating page scroll depth across public landing pages and the admin console.
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ScrollProgressBar({
  className = "",
  height = 3,
}: ScrollProgressBarProps) {
  const isClient = React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  if (!isClient) {
    return null;
  }

  const scaleX = prefersReducedMotion ? scrollYProgress : smoothProgress;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <motion.div
        style={{ scaleX }}
        className={`h-full w-full origin-left bg-gradient-to-r from-brand-600 via-accent-sky to-accent-gold shadow-[0_0_10px_rgba(37,99,235,0.45)] ${className}`}
      />
    </div>
  );
}

