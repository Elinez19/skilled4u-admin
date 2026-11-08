"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ToolPattern } from "@/components/brand/tool-pattern";
import { ScribbleUnderline } from "@/components/motion/animated-text";
import { landingContent } from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { tokens } from "@/lib/tokens";

/**
 * Inspired Preloader with Animated Wordmark + Self-Drawing Scribble Underline
 */
export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  const shouldRender = visible && !prefersReducedMotion;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="skilled4u-preloader"
          initial={{ y: "0%" }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.75,
              ease: motionTokens.ease.inOutQuint,
            },
          }}
          className="surface-slab-ink fixed inset-0 z-50 grid place-items-center px-6"
        >
          <ToolPattern tone="on-blue" />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.55,
                ease: motionTokens.ease.outExpo,
              }}
              className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-ink-on-blue"
            >
              skilled<span className="text-accent-sky">4U</span>
            </motion.div>

            <div className="mx-auto mt-3 w-64 sm:w-80">
              <ScribbleUnderline strokeColor={tokens.colors.accent.gold} />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-3 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-accent-sky"
            >
              {landingContent.preloader.tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

