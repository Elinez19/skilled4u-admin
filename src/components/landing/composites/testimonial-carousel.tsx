"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Play } from "lucide-react";
import Image from "next/image";
import { OffsetRing } from "@/components/brand/offset-ring";
import { SectionHeader, SectionSlab } from "@/components/landing/ui/section-slab";
import { landingContent, type TestimonialItem } from "@/content/landing";
import { motionTokens } from "@/lib/motion";

const storyImages = [
  "/images/landing/service-ac.jpg",
  "/images/landing/service-plumbing.svg",
  "/images/landing/service-electrical.svg",
];

function TestimonialCard({
  item,
  index,
}: {
  item: TestimonialItem;
  index: number;
}) {
  const isQuote = item.type === "quote";

  return (
    <motion.article
      initial={{ rotate: item.tiltDeg }}
      whileHover={{ rotate: 0, y: -10, scale: 1.03 }}
      transition={motionTokens.spring.snappy}
      className="relative isolate w-[285px] sm:w-[310px] shrink-0 select-none"
    >
      {/* Offset Stacked Crescent Backing Behind Card (Eatly signature) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 translate-x-[-10px] translate-y-[12px] rounded-[34px] bg-accent-gold"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 translate-x-[-5px] translate-y-[6px] rounded-[34px] bg-brand-500"
      />

      {isQuote ? (
        <div className="flex h-[360px] flex-col justify-between rounded-[34px] border-2 border-brand-700 bg-brand-950 p-7 text-ink-on-blue shadow-gloss-float">
          <p className="text-base sm:text-lg font-medium leading-relaxed text-ink-on-blue-muted">
            &ldquo;{item.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3.5 pt-4 border-t border-brand-800">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 font-display font-extrabold text-sm text-ink-on-blue border-2 border-surface-porcelain">
              {item.authorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="font-display text-base font-extrabold text-ink-on-blue">
                {item.authorName}
              </p>
              <p className="text-xs font-semibold text-accent-gold">
                {item.authorRole}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-[360px] flex-col justify-end overflow-hidden rounded-[34px] border-2 border-surface-porcelain bg-surface-mist p-6 shadow-gloss-float">
          <Image
            src={storyImages[index % storyImages.length]}
            alt={item.storyTitle ?? item.authorName}
            fill
            sizes="320px"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent"
            aria-hidden="true"
          />

          {/* Center Play Button Badge */}
          <div className="absolute inset-0 grid place-items-center">
            <span className="cta-surface-primary grid h-16 w-16 place-items-center rounded-full shadow-gloss-float">
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </span>
          </div>

          <div className="relative z-10 text-ink-on-blue">
            <span className="inline-block rounded-pill bg-accent-sky/20 border border-accent-sky/40 px-3 py-0.5 text-xs font-display font-extrabold text-accent-sky">
              {item.area}
            </span>
            <h3 className="mt-1.5 font-display text-xl font-extrabold">
              {item.storyTitle}
            </h3>
            <p className="text-xs font-semibold text-ink-on-blue-muted">
              {item.storyTrade}
            </p>
          </div>
        </div>
      )}
    </motion.article>
  );
}

export function TestimonialCarouselSection() {
  const { testimonials } = landingContent;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: -1 | 1) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  return (
    <SectionSlab id="reviews" tone="pearl">
      <SectionHeader
        tone="on-light"
        headline={testimonials.headline}
        highlightWords={["Abuja", "Saying"]}
        subtitle={testimonials.subtitle}
      />

      {/* Horizontal Tilted Cards Strip */}
      <div
        ref={scrollRef}
        className="mt-12 flex items-center gap-7 overflow-x-auto px-4 py-8 scrollbar-none"
      >
        {testimonials.items.map((item, idx) => (
          <TestimonialCard key={item.id} item={item} index={idx} />
        ))}
      </div>

      {/* Bottom Controls with Decorative Hearts & OffsetRing Prev/Next Buttons */}
      <div className="mt-4 flex items-center justify-center gap-8">
        <Heart
          className="hidden sm:block h-12 w-12 -rotate-12 text-brand-400 stroke-[1.75]"
          aria-hidden="true"
        />

        <div className="flex items-center gap-5">
          <OffsetRing
            size="md"
            faceTone="ink"
            interactive
            onClick={() => scrollByAmount(-1)}
            ariaLabel="Previous testimonial"
          >
            <ArrowLeft className="h-6 w-6" />
          </OffsetRing>

          <span
            className="h-5 w-5 rounded-full bg-accent-gold"
            aria-hidden="true"
          />

          <OffsetRing
            size="md"
            faceTone="ink"
            interactive
            onClick={() => scrollByAmount(1)}
            ariaLabel="Next testimonial"
          >
            <ArrowRight className="h-6 w-6" />
          </OffsetRing>
        </div>

        <Heart
          className="hidden sm:block h-12 w-12 rotate-12 text-brand-400 stroke-[1.75]"
          aria-hidden="true"
        />
      </div>
    </SectionSlab>
  );
}

