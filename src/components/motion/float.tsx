"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";

export interface FloatProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  rotateDeg?: number;
  className?: string;
}

export function Float({
  children,
  amplitude = 7,
  duration = 5,
  delay = 0,
  rotateDeg = 0,
  className,
}: FloatProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      style={{ rotate: rotateDeg }}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              y: [0, -amplitude, 0],
            }
      }
      transition={{
        duration,
        delay,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({
  children,
  strength = 0.18,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    setPos({
      x: Math.max(-7, Math.min(7, offsetX * strength)),
      y: Math.max(-7, Math.min(7, offsetY * strength)),
    });
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={motionTokens.spring.snappy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

