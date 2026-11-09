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
}

export function Reveal({
  children,
  delay = 0,
  y = 40,
  once = true,
  amount = "some",
  ...props
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
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

export function ScaleSlab({
  children,
  ...props
}: HTMLMotionProps<"section">) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.section
      variants={prefersReducedMotion ? undefined : scaleSlabVariants}
      initial={prefersReducedMotion ? { opacity: 1 } : "hidden"}
      whileInView={prefersReducedMotion ? { opacity: 1 } : "visible"}
      viewport={{ once: true, amount: "some" }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

