"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, Pencil, Plus, Sparkles } from "lucide-react";
import { resolveCategoryArtwork } from "@/components/admin/composites/overview-dashboard";
import { AdminActionMenu } from "@/components/admin/ui/admin-action-menu";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { CategoryRow } from "@/db/schema";
import { cardHoverMotion } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";

export interface CategoryCardsGridProps {
  categories: CategoryRow[];
  onEditCategory: (cat: CategoryRow) => void;
  onAddServiceForCategory: (cat: CategoryRow) => void;
  onToggleCategoryActive: (cat: CategoryRow) => void;
}

export function CategoryCardsGrid({
  categories,
  onEditCategory,
  onAddServiceForCategory,
  onToggleCategoryActive,
}: CategoryCardsGridProps) {
  if (categories.length === 0) return null;

  return (
    <Stagger className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <StaggerItem key={cat.id}>
          <motion.article
            variants={cardHoverMotion}
            initial="rest"
            whileHover="hover"
            className="surface-gloss-card flex h-full flex-col justify-between p-4 sm:p-5"
          >
            <div>
              {/* 3D Artwork Frame */}
              <div className="relative h-36 w-full overflow-hidden rounded-2xl border-2 border-brand-100 bg-surface-mist">
                <Image
                  src={resolveCategoryArtwork(cat.slug || cat.title)}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-contain p-3"
                />
                <div className="absolute top-2.5 left-2.5">
                  <AdminStatusPill
                    status={cat.isActive ? "active" : "hidden"}
                  />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <AdminActionMenu
                    label={`Manage ${cat.title}`}
                    ariaLabel={`Card actions for ${cat.title}`}
                    items={[
                      {
                        id: "card-edit",
                        label: "Edit Category in Form",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        variant: "primary",
                        onClick: () => onEditCategory(cat),
                      },
                      {
                        id: "card-add-srv",
                        label: "Add Bookable Service",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => onAddServiceForCategory(cat),
                      },
                      {
                        id: "card-toggle",
                        label: cat.isActive
                          ? "Hide Category"
                          : "Publish Category",
                        icon: <Eye className="h-3.5 w-3.5" />,
                        onClick: () => onToggleCategoryActive(cat),
                      },
                    ]}
                  />
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="cta-surface-primary inline-flex items-center gap-1 rounded-pill px-3 py-1 font-display text-[11px] font-extrabold">
                    <Sparkles className="h-3 w-3 text-accent-gold" />
                    <span>Base: {formatCurrency(cat.basePrice)}</span>
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="mt-4 font-display text-base sm:text-lg font-extrabold tracking-tight text-brand-950">
                {cat.title}
              </h3>
              <p className="mt-1 text-xs sm:text-[13px] font-medium leading-relaxed text-ink-secondary">
                {cat.description}
              </p>

              {/* Sub-Service Chips */}
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {(cat.subServices || []).map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1 rounded-pill border border-brand-100 bg-brand-50 px-2.5 py-0.5 font-display text-[11px] font-bold text-brand-700"
                  >
                    <CheckCircle2
                      className="h-3 w-3 text-brand-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{sub}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-surface-frost flex items-center justify-between gap-2 text-[11px]">
              <span className="font-mono font-bold text-ink-muted truncate">
                /{cat.slug}
              </span>
              <PillBadge
                tone="sky"
                className="px-2.5 py-0.5 text-[10px] shrink-0"
              >
                {(cat.subServices || []).length} Sub-Services
              </PillBadge>
            </div>
          </motion.article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

