"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: React.ReactNode;
  durationSeconds?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  durationSeconds = 36,
  className,
  pauseOnHover = true,
}: MarqueeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        className="flex w-max items-stretch gap-7 py-6"
        animate={
          prefersReducedMotion || isPaused
            ? undefined
            : { x: ["0%", "-50%"] }
        }
        transition={{
          duration: durationSeconds,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="flex items-stretch gap-7">{children}</div>
        <div className="flex items-stretch gap-7" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

