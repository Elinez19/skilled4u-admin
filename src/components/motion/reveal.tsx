"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  motionTokens,
  revealUpVariants,
  scaleSlabVariants,
  staggerContainerVariants,
} from "@/lib/motion";

export interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  priority?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  y = 40,
  once = true,
  amount = "some",
  priority = false,
  ...props
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldSkipAnimation = prefersReducedMotion || priority;

  return (
    <motion.div
      initial={shouldSkipAnimation ? false : { opacity: 0, y }}
      animate={priority ? { opacity: 1, y: 0 } : undefined}
      whileInView={priority ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount: priority ? 0 : amount }}
      transition={{
        duration: motionTokens.duration.base,
        delay,
        ease: motionTokens.ease.outExpo,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number | "some" | "all";
}

export function Stagger({
  children,
  stagger = motionTokens.stagger.cards,
  delayChildren = 0.06,
  once = true,
  amount = "some",
  ...props
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainerVariants(
        prefersReducedMotion ? 0 : stagger,
        prefersReducedMotion ? 0 : delayChildren
      )}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once, amount }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={revealUpVariants} {...props}>
      {children}
    </motion.div>
  );
}

export interface ScaleSlabProps extends HTMLMotionProps<"section"> {
  priority?: boolean;
}

export function ScaleSlab({
  children,
  priority = false,
  ...props
}: ScaleSlabProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldSkipInitial = prefersReducedMotion || priority;

  return (
    <motion.section
      variants={prefersReducedMotion ? undefined : scaleSlabVariants}
      initial={shouldSkipInitial ? false : "hidden"}
      animate={priority ? "visible" : undefined}
      whileInView={priority ? undefined : prefersReducedMotion ? { opacity: 1 } : "visible"}
      viewport={{ once: true, amount: 0 }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

