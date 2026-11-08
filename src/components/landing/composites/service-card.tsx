"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { type ServiceCategoryItem } from "@/content/landing";
import { cardHoverMotion } from "@/lib/motion";

export function ServiceCard({ item }: { item: ServiceCategoryItem }) {
  return (
    <motion.article
      variants={cardHoverMotion}
      initial="rest"
      whileHover="hover"
      className="surface-gloss-card flex flex-col justify-between p-6 sm:p-8"
    >
      <div>
        {/* Big Glossy 3D Artwork Header */}
        <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-surface-mist border-2 border-brand-100">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain p-3"
          />
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-porcelain/95 px-3.5 py-1.5 text-xs font-display font-extrabold text-brand-700 border border-brand-100 shadow-gloss-card">
              <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              {item.etaBadge}
            </span>
          </div>
          <div className="absolute bottom-3.5 right-3.5">
            <span className="cta-surface-primary inline-flex items-center rounded-pill px-4 py-1.5 text-xs sm:text-sm font-display font-extrabold">
              {item.startingPrice}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="mt-6 font-display text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
          {item.title}
        </h3>
        <p className="mt-2.5 text-base font-medium leading-relaxed text-ink-secondary">
          {item.description}
        </p>

        {/* Popular Sub-Service Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {item.popularTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3.5 py-1.5 text-xs font-display font-bold text-brand-700 border border-brand-100"
            >
              <CheckCircle2
                className="h-3.5 w-3.5 text-brand-600"
                aria-hidden="true"
              />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Consistent Secondary CTA */}
      <div className="mt-7 pt-5 border-t border-surface-frost">
        <CtaButton
          variant="secondary"
          size="md"
          href="#download"
          trailingArrow
          className="w-full"
        >
          Book {item.title.split(" ")[0]} Pro
        </CtaButton>
      </div>
    </motion.article>
  );
}

