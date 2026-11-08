"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Gift, Star, Wrench } from "lucide-react";
import Image from "next/image";
import { type ArtisanMarqueeItem } from "@/content/landing";
import { motionTokens } from "@/lib/motion";

export function ArtisanMarqueeCard({ item }: { item: ArtisanMarqueeItem }) {
  return (
    <motion.article
      initial={{ rotate: item.tiltDeg }}
      whileHover={{
        rotate: 0,
        y: -12,
        scale: 1.03,
      }}
      transition={motionTokens.spring.snappy}
      className="surface-gloss-card relative flex w-[320px] sm:w-[355px] shrink-0 flex-col p-4 sm:p-5 select-none cursor-pointer"
    >
      {/* Top Visual Artwork Frame with Stacked Badges (Eatly-inspired) */}
      <div className="relative h-52 w-full overflow-hidden rounded-3xl bg-surface-mist border-2 border-brand-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="360px"
          className="object-cover"
        />

        {/* Stacked Top-Right Badges ("Free Inspection" + "20 Min") */}
        <div className="absolute right-3 bottom-3 flex flex-col items-end gap-1.5">
          <span className="cta-surface-primary inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1 text-xs font-display font-extrabold">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            {item.badgeText}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-950/90 px-3.5 py-1 text-xs font-display font-bold text-ink-on-blue border border-brand-400/30">
            <Clock className="h-3.5 w-3.5 text-accent-sky" aria-hidden="true" />
            {item.eta}
          </span>
        </div>
      </div>

      {/* Bottom White Glossy Info Area */}
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-extrabold text-brand-950 truncate">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm font-semibold text-ink-secondary truncate">
            {item.provider} · {item.area}
          </p>
        </div>
        <span className="font-display text-xl font-extrabold text-brand-600 shrink-0">
          {item.price}
        </span>
      </div>

      {/* Footer Meta Row */}
      <div className="mt-5 flex items-center justify-between border-t border-surface-frost pt-3.5 px-1 text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink-secondary">
          <Wrench className="h-4 w-4 text-brand-500" aria-hidden="true" />
          {item.fromFee}
        </span>
        <span className="inline-flex items-center gap-1.5 font-display font-extrabold text-brand-950">
          <Star
            className="h-4 w-4 fill-accent-gold text-accent-gold"
            aria-hidden="true"
          />
          {item.rating}({item.reviews})
        </span>
      </div>
    </motion.article>
  );
}

/**
 * Eatly-inspired Dashed Road Track Strip underneath the Hero Marquee Cards
 */
export function RoadDispatchStrip() {
  return (
    <div
      className="road-strip-surface relative h-24 w-full overflow-hidden flex items-center"
      aria-hidden="true"
    >
      <div className="w-full border-t-4 border-dashed border-accent-gold/80" />
    </div>
  );
}

