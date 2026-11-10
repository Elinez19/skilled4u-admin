"use client";

import Image from "next/image";
import Link from "next/link";
import { Layers, Wrench } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { Reveal } from "@/components/motion/reveal";
import type { CategoryRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { resolveCategoryArtwork } from "./helpers";

export interface OverviewCategoriesPreviewProps {
  categories: CategoryRow[];
}

export function OverviewCategoriesPreview({
  categories,
}: OverviewCategoriesPreviewProps) {
  return (
    <Reveal delay={0.15} className="mt-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <OffsetRing size="xs" faceTone="blue">
            <Layers className="h-3.5 w-3.5 text-ink-on-blue" />
          </OffsetRing>
          <div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-950">
              Active Marketplace Categories
            </h2>
            <p className="text-xs font-medium text-ink-secondary">
              Synced directly with the skilled4U customer &amp; artisan apps.
            </p>
          </div>
        </div>
        <CtaButton
          variant="secondary"
          size="xs"
          href="/admin/categories"
          trailingArrow
        >
          Manage Categories
        </CtaButton>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {categories.slice(0, 3).map((cat) => (
          <Link
            key={cat.id}
            href="/admin/categories"
            className="surface-gloss-card group flex items-center gap-3 p-3 sm:p-3.5 transition-transform hover:-translate-y-1 min-w-0"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-brand-100 bg-surface-mist">
              <Image
                src={resolveCategoryArtwork(cat.slug || cat.title)}
                alt={cat.title}
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-display text-xs sm:text-sm font-extrabold text-brand-950 group-hover:text-brand-600">
                  {cat.title}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary truncate">
                {(cat.subServices || []).length} sub-services active
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-brand-700 border border-brand-100">
                <Wrench className="h-2.5 w-2.5 text-brand-600" />
                <span>From {formatCurrency(cat.basePrice)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

