"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface AnimatedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  highlightWords?: readonly string[];
  highlightClassName?: string;
  delay?: number;
  stagger?: number;
  underlineLastWord?: boolean;
}

export function AnimatedText({
  text,
  as: Tag = "h2",
  className,
  highlightWords = [],
  highlightClassName = "text-accent-sky",
  delay = 0,
  stagger = motionTokens.stagger.words,
  underlineLastWord = false,
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");
  const normalizedHighlights = new Set(
    highlightWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/gi, ""))
  );

  return (
    <Tag className={cn("font-display tracking-tight", className)}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: prefersReducedMotion ? 0 : stagger,
              delayChildren: delay,
            },
          },
        }}
        className="inline"
      >
        {words.map((word, index) => {
          const clean = word.toLowerCase().replace(/[^a-z0-9]/gi, "");
          const isHighlighted = normalizedHighlights.has(clean);
          const isLast = index === words.length - 1;

          return (
            <span
              key={`${word}-${index}`}
              className="relative inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.26em] last:mr-0"
            >
              <motion.span
                variants={{
                  hidden: {
                    y: prefersReducedMotion ? "0%" : "112%",
                    opacity: prefersReducedMotion ? 1 : 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                    transition: {
                      duration: motionTokens.duration.base,
                      ease: motionTokens.ease.outExpo,
                    },
                  },
                }}
                className={cn(
                  "inline-block will-change-transform",
                  isHighlighted && highlightClassName
                )}
              >
                {word}
              </motion.span>
              {underlineLastWord && isLast && (
                <ScribbleUnderline className="mt-1" />
              )}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}

export function ScribbleUnderline({
  className,
  strokeColor = tokens.colors.accent.sky,
}: {
  className?: string;
  strokeColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 260 28"
      fill="none"
      preserveAspectRatio="none"
      className={cn("block w-full h-4 overflow-visible", className)}
      aria-hidden="true"
    >
      <motion.path
        d="M6 12 C 78 5, 172 5, 252 10 M46 19 C 110 15, 178 15, 232 22"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: motionTokens.duration.slow,
          delay: 0.35,
          ease: motionTokens.ease.outExpo,
        }}
      />
    </svg>
  );
}

