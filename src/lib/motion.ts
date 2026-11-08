import type { Transition, Variants } from "framer-motion";

/**
 * Skilled4U Motion Design System (Framer Motion Tokens)
 * Provides consistent easing curves, spring physics, durations, and variants.
 */

export const motionTokens = {
  ease: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    inOutQuint: [0.83, 0, 0.17, 1] as const,
    outBack: [0.34, 1.56, 0.64, 1] as const,
  },
  spring: {
    soft: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 0.8,
    } satisfies Transition,
    snappy: {
      type: "spring",
      stiffness: 420,
      damping: 30,
      mass: 0.7,
    } satisfies Transition,
    bouncy: {
      type: "spring",
      stiffness: 300,
      damping: 22,
      mass: 0.8,
    } satisfies Transition,
  },
  duration: {
    fast: 0.3,
    base: 0.65,
    slow: 0.95,
    cinematic: 1.35,
  },
  stagger: {
    chars: 0.024,
    words: 0.065,
    cards: 0.11,
  },
  viewport: {
    once: true,
    amount: 0.22,
  },
} as const;

export const revealUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.outExpo,
    },
  },
};

export const scaleSlabVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.965,
    y: 32,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.outExpo,
    },
  },
};

export const staggerContainerVariants = (
  staggerChildren: number = motionTokens.stagger.cards,
  delayChildren = 0.06
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const cardHoverMotion = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -8,
    scale: 1.015,
    transition: motionTokens.spring.snappy,
  },
};

