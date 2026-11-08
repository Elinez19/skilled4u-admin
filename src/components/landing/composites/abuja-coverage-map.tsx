"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { OffsetRing } from "@/components/brand/offset-ring";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { CountUp } from "@/components/motion/count-up";
import { Float } from "@/components/motion/float";
import { Reveal } from "@/components/motion/reveal";
import { landingContent } from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { tokens } from "@/lib/tokens";

export function AbujaCoverageMap() {
  const { coverage } = landingContent;
  const dotPatternId = React.useId();

  return (
    <SectionSlab id="coverage" tone="ink" withPattern={false}>
      {/* Dotted Abuja Silhouette Map Background at Bottom (Eatly-inspired) */}
      <svg
        viewBox="0 0 1200 720"
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={dotPatternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="4"
              cy="4"
              r="2.4"
              fill={tokens.colors.accent.sky}
              fillOpacity="0.32"
            />
          </pattern>
        </defs>

        {/* Dotted Abuja Terrain Silhouette */}
        <path
          d="M0 540 L180 510 L270 430 L420 440 L510 490 L690 455 L860 440 L1040 460 L1140 530 L1200 555 V720 H0 Z"
          fill={`url(#${dotPatternId})`}
        />

        {/* Animated Dashed Route Loop Connecting Abuja Neighbourhoods */}
        <motion.path
          d="M210 175 C 360 120, 490 140, 620 155 C 760 170, 880 180, 990 195 C 1060 330, 1030 470, 930 535 C 780 610, 640 595, 535 550 C 410 500, 290 560, 195 520 C 120 410, 145 260, 210 175 Z"
          stroke={tokens.colors.accent.gold}
          strokeWidth="2.5"
          strokeDasharray="9 11"
          initial={{ pathLength: 0, opacity: 0.3 }}
          whileInView={{ pathLength: 1, opacity: 0.85 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: motionTokens.duration.cinematic * 1.4,
            ease: motionTokens.ease.outExpo,
          }}
        />
      </svg>

      {/* Top Row of Abuja Neighbourhood Bubbles */}
      <div className="relative z-10 grid grid-cols-3 place-items-center gap-4 pb-10 sm:pb-14">
        {coverage.topBubbles.map((bubble, idx) => (
          <Float
            key={bubble.id}
            amplitude={8}
            duration={4.8 + idx * 0.6}
            delay={idx * 0.3}
          >
            <OffsetRing
              size={bubble.size === "lg" ? "xl" : "lg"}
              faceTone="ink"
            >
              {bubble.name}
            </OffsetRing>
          </Float>
        ))}
      </div>

      {/* Center High-Contrast Headline Block */}
      <div className="relative z-10 my-4 py-6">
        <SectionHeader
          tone="on-blue"
          eyebrow={
            <PillBadge tone="porcelain" icon="pin">
              {coverage.badge}
            </PillBadge>
          }
          headline={coverage.headline}
          highlightWords={["Abuja", "Nigeria"]}
          subtitle={coverage.subtitle}
        />

        {/* Animated Count-Up Metrics */}
        <Reveal
          delay={0.2}
          className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 rounded-3xl border border-brand-700 bg-brand-900/75 p-5 backdrop-blur-md"
        >
          {coverage.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl sm:text-4xl font-extrabold text-accent-sky">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-ink-on-blue-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </Reveal>
      </div>

      {/* Bottom Row of Abuja Neighbourhood Bubbles */}
      <div className="relative z-10 grid grid-cols-3 place-items-center gap-4 pt-10 sm:pt-14">
        {coverage.bottomBubbles.map((bubble, idx) => (
          <Float
            key={bubble.id}
            amplitude={8}
            duration={5.2 + idx * 0.5}
            delay={0.4 + idx * 0.25}
          >
            <OffsetRing
              size={bubble.size === "lg" ? "xl" : "lg"}
              faceTone="ink"
            >
              {bubble.name}
            </OffsetRing>
          </Float>
        ))}
      </div>

      {/* Coming Soon Footnote ("Lagos and Port Harcourt coming soon.") */}
      <Reveal delay={0.25} className="relative z-10 mt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-brand-600 bg-brand-900/90 px-5 py-2 text-sm font-display font-bold text-accent-sky">
          ✦ {coverage.comingSoonNote}
        </span>
      </Reveal>
    </SectionSlab>
  );
}

