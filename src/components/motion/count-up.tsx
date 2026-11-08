"use client";

import * as React from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { motionTokens } from "@/lib/motion";

export interface CountUpProps {
  to: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const motionVal = useMotionValue(from);
  const [display, setDisplay] = React.useState<string>(() =>
    from.toLocaleString("en-NG")
  );

  React.useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const controls = animate(motionVal, to, {
      duration,
      ease: motionTokens.ease.outExpo,
      onUpdate(latest) {
        setDisplay(Math.round(latest).toLocaleString("en-NG"));
      },
    });

    return () => controls.stop();
  }, [isInView, prefersReducedMotion, motionVal, to, duration]);

  const renderedValue =
    prefersReducedMotion && isInView ? to.toLocaleString("en-NG") : display;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {renderedValue}
      {suffix}
    </span>
  );
}

