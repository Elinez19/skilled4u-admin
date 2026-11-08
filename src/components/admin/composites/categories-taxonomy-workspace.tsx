"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Layers, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resolveCategoryArtwork } from "@/components/admin/composites/overview-dashboard";
import { AdminEmptyState } from "@/components/admin/ui/admin-data-table";
import {
  AdminSearchInput,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { CategoryRow } from "@/db/schema";
import { cardHoverMotion } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";

export function CategoriesTaxonomyWorkspace({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<CategoryRow[]>(initialCategories);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState("15000");
  const [subServices, setSubServices] = React.useState(
    "Solar Panel Cleaning, Inverter Battery Check, Surge Protection"
  );
  const [saving, setSaving] = React.useState(false);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          basePrice: Number(basePrice),
          subServices,
          isPopular: true,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => [...prev, data]);
        setTitle("");
        setDescription("");
        setModalOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = items.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      (cat.description || "").toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-2 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Mobile App Taxonomy & Pricing"
        eyebrowIcon="shield"
        headline="Service Categories & Pricing."
        highlightWords={["Categories", "Pricing."]}
        subtitle="Manage the official Skilled4U service catalog, sub-service tags, and base inspection pricing synced with the mobile app."
        primaryCta={{
          label: "Add Service Category",
          onClick: () => setModalOpen(true),
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Public Services Grid",
          href: "/#services",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Top Search & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PillBadge
              tone="porcelain"
              icon="dot"
              className="px-3 py-1 text-xs"
            >
              {filtered.length} Marketplace Categories
            </PillBadge>
            <PillBadge
              tone="sky"
              className="hidden sm:inline-flex px-3 py-1 text-xs"
            >
              Synced via /api/v1/categories
            </PillBadge>
          </div>

          <div className="flex items-center gap-2.5">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search category or slug..."
            />
          </div>
        </div>

        {/* 3-Column Glossy Category Cards Grid */}
        {filtered.length === 0 ? (
          <div className="mt-5 surface-gloss-card">
            <AdminEmptyState
              title="No Service Categories Found"
              description="Add a new marketplace category or clear your search filter."
              icon={<Layers className="h-5 w-5 text-accent-sky" />}
              action={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Service Category</span>
                </CtaButton>
              }
            />
          </div>
        ) : (
          <Stagger className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cat) => (
              <StaggerItem key={cat.id}>
                <motion.article
                  variants={cardHoverMotion}
                  initial="rest"
                  whileHover="hover"
                  className="surface-gloss-card flex h-full flex-col justify-between p-4 sm:p-5"
                >
                  <div>
                    {/* 3D Artwork Frame using existing landing assets */}
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
        )}
      </AdminWorkspaceSlab>

      {/* Create Category Modal */}
      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eyebrow="Catalog Expansion"
        title="Create Marketplace Category"
        description="Adds a new service category to Neon PostgreSQL and immediately exposes it to the skilled4U mobile app via `/api/v1/categories`."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <AdminTextField
            label="Category Title"
            placeholder="e.g. Solar & Renewable Energy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <AdminTextField
            label="Category Description"
            placeholder="Rooftop solar arrays, lithium battery banks, and hybrid inverters."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <AdminTextField
            label="Recommended Base Price (NGN)"
            type="number"
            min={1000}
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />

          <AdminTextField
            label="Sub-Services (comma separated)"
            value={subServices}
            onChange={(e) => setSubServices(e.target.value)}
            hint="Each comma-separated item becomes a bookable sub-service chip in the mobile app."
            required
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-surface-frost">
            <CtaButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </CtaButton>
            <CtaButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Category"}
            </CtaButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

