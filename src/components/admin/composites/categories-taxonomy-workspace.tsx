"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resolveCategoryArtwork } from "@/components/admin/composites/overview-dashboard";
import { AdminActionMenu } from "@/components/admin/ui/admin-action-menu";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-data-table";
import {
  AdminInlineForm,
  AdminSearchInput,
  AdminSelectField,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { CategoryRow } from "@/db/schema";
import { cardHoverMotion } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";

type CatalogTab = "all" | "categories" | "services";
type FormEntityMode = "category" | "service";

interface BookableServiceRecord {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  price: number;
  duration: string;
  dispatchSla: "Express 30m" | "Same-Day" | "Scheduled";
  status: "active" | "hidden";
}

const FORM_ENTITY_OPTIONS = [
  { id: "category", label: "Service Category" },
  { id: "service", label: "Bookable Service" },
] as const;

const VISIBILITY_OPTIONS = [
  { id: "active", label: "Active in Catalog" },
  { id: "hidden", label: "Hidden / Draft" },
] as const;

const SLA_OPTIONS = [
  { id: "Express 30m", label: "Express 30m" },
  { id: "Same-Day", label: "Same-Day" },
  { id: "Scheduled", label: "Scheduled" },
] as const;

function buildInitialServices(
  categories: CategoryRow[]
): BookableServiceRecord[] {
  const list: BookableServiceRecord[] = [];
  categories.forEach((cat, cIdx) => {
    const subs =
      cat.subServices && cat.subServices.length > 0
        ? cat.subServices
        : [`${cat.title} Inspection & Servicing`];
    subs.forEach((sub, sIdx) => {
      list.push({
        id: `srv_${cat.id}_${sIdx}`,
        title: sub,
        categoryId: cat.id,
        categoryTitle: cat.title,
        price: cat.basePrice + sIdx * 2500,
        duration: sIdx % 2 === 0 ? "45 - 60 mins" : "60 - 90 mins",
        dispatchSla:
          (cIdx + sIdx) % 3 === 0
            ? "Express 30m"
            : (cIdx + sIdx) % 2 === 0
              ? "Same-Day"
              : "Scheduled",
        status: cat.isActive ? "active" : "hidden",
      });
    });
  });
  return list;
}

export function CategoriesTaxonomyWorkspace({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<CategoryRow[]>(initialCategories);
  const [services, setServices] = React.useState<BookableServiceRecord[]>(() =>
    buildInitialServices(initialCategories)
  );
  const [tab, setTab] = React.useState<CatalogTab>("all");
  const [search, setSearch] = React.useState("");

  // Inline Form State (replaces modal)
  const [formOpen, setFormOpen] = React.useState(true);
  const [formMode, setFormMode] = React.useState<FormEntityMode>("category");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [savedBanner, setSavedBanner] = React.useState<string | null>(null);

  // Category Form Fields
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState("15000");
  const [subServices, setSubServices] = React.useState(
    "Solar Panel Cleaning, Inverter Battery Check, Surge Protection"
  );
  const [categoryVisibility, setCategoryVisibility] = React.useState<
    "active" | "hidden"
  >("active");

  // Bookable Service Form Fields
  const [serviceTitle, setServiceTitle] = React.useState("");
  const [serviceCategoryId, setServiceCategoryId] = React.useState(
    initialCategories[0]?.id || ""
  );
  const [servicePrice, setServicePrice] = React.useState("18000");
  const [serviceDuration, setServiceDuration] =
    React.useState("45 - 60 mins");
  const [serviceSla, setServiceSla] = React.useState<
    "Express 30m" | "Same-Day" | "Scheduled"
  >("Express 30m");
  const [serviceStatus, setServiceStatus] = React.useState<
    "active" | "hidden"
  >("active");

  function notifySaved(msg: string) {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }

  function scrollToForm() {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function resetForm(nextMode?: FormEntityMode) {
    const targetMode = nextMode ?? formMode;
    setFormMode(targetMode);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setBasePrice("15000");
    setSubServices(
      "Solar Panel Cleaning, Inverter Battery Check, Surge Protection"
    );
    setCategoryVisibility("active");
    setServiceTitle("");
    setServiceCategoryId(items[0]?.id || "");
    setServicePrice("18000");
    setServiceDuration("45 - 60 mins");
    setServiceSla("Express 30m");
    setServiceStatus("active");
  }

  function loadCategoryIntoForm(cat: CategoryRow) {
    setFormMode("category");
    setEditingId(cat.id);
    setTitle(cat.title);
    setDescription(cat.description || "");
    setBasePrice(String(cat.basePrice));
    setSubServices((cat.subServices || []).join(", "));
    setCategoryVisibility(cat.isActive ? "active" : "hidden");
    scrollToForm();
  }

  function loadServiceIntoForm(srv: BookableServiceRecord) {
    setFormMode("service");
    setEditingId(srv.id);
    setServiceTitle(srv.title);
    setServiceCategoryId(srv.categoryId);
    setServicePrice(String(srv.price));
    setServiceDuration(srv.duration);
    setServiceSla(srv.dispatchSla);
    setServiceStatus(srv.status);
    scrollToForm();
  }

  function startAddServiceForCategory(cat: CategoryRow) {
    resetForm("service");
    setServiceCategoryId(cat.id);
    setServicePrice(String(cat.basePrice));
    scrollToForm();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (formMode === "category") {
        const parsedSubs = subServices
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const isActive = categoryVisibility === "active";

        if (editingId) {
          const res = await fetch("/api/v1/categories", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingId,
              title,
              description,
              basePrice: Number(basePrice),
              subServices: parsedSubs,
              isActive,
            }),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) =>
              prev.map((c) => (c.id === editingId ? data : c))
            );
            router.refresh();
          } else {
            setItems((prev) =>
              prev.map((c) =>
                c.id === editingId
                  ? {
                      ...c,
                      title,
                      description,
                      basePrice: Number(basePrice),
                      subServices: parsedSubs,
                      isActive,
                    }
                  : c
              )
            );
          }
          notifySaved(`Updated category "${title}"`);
          resetForm("category");
        } else {
          const res = await fetch("/api/v1/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              basePrice: Number(basePrice),
              subServices: parsedSubs,
              isPopular: true,
              isActive,
            }),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) => [...prev, data]);
            const newServices: BookableServiceRecord[] = parsedSubs.map(
              (sub, idx) => ({
                id: `srv_${data.id}_${idx}_${Date.now()}`,
                title: sub,
                categoryId: data.id,
                categoryTitle: data.title,
                price: Number(basePrice) + idx * 2500,
                duration: "45 - 60 mins",
                dispatchSla: "Same-Day",
                status: isActive ? "active" : "hidden",
              })
            );
            setServices((prev) => [...newServices, ...prev]);
            router.refresh();
          } else {
            const slug = title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            const fallbackCat: CategoryRow = {
              id: `cat_${Date.now()}`,
              title,
              slug,
              iconName: "wrench",
              iconFamily: "MaterialCommunityIcons",
              description,
              subServices: parsedSubs,
              basePrice: Number(basePrice),
              isPopular: true,
              isActive,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setItems((prev) => [...prev, fallbackCat]);
          }
          notifySaved(`Created category "${title}"`);
          resetForm("category");
        }
      } else {
        const parentCat =
          items.find((c) => c.id === serviceCategoryId) || items[0];
        const categoryTitle = parentCat ? parentCat.title : "General Service";
        const resolvedCatId = parentCat ? parentCat.id : "general";

        if (editingId) {
          setServices((prev) =>
            prev.map((srv) =>
              srv.id === editingId
                ? {
                    ...srv,
                    title: serviceTitle,
                    categoryId: resolvedCatId,
                    categoryTitle,
                    price: Number(servicePrice) || 15000,
                    duration: serviceDuration,
                    dispatchSla: serviceSla,
                    status: serviceStatus,
                  }
                : srv
            )
          );
          notifySaved(`Updated service "${serviceTitle}"`);
          resetForm("service");
        } else {
          const newSrv: BookableServiceRecord = {
            id: `srv_${Date.now()}`,
            title: serviceTitle,
            categoryId: resolvedCatId,
            categoryTitle,
            price: Number(servicePrice) || 15000,
            duration: serviceDuration,
            dispatchSla: serviceSla,
            status: serviceStatus,
          };
          setServices((prev) => [newSrv, ...prev]);

          if (parentCat) {
            const updatedSubs = Array.from(
              new Set([...(parentCat.subServices || []), serviceTitle])
            );
            setItems((prev) =>
              prev.map((c) =>
                c.id === parentCat.id ? { ...c, subServices: updatedSubs } : c
              )
            );
            await fetch("/api/v1/categories", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: parentCat.id,
                subServices: updatedSubs,
              }),
            }).catch(() => {});
          }
          notifySaved(`Added service "${serviceTitle}"`);
          resetForm("service");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategoryActive(cat: CategoryRow) {
    const nextActive = !cat.isActive;
    setItems((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextActive } : c))
    );
    try {
      await fetch("/api/v1/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, isActive: nextActive }),
      });
      router.refresh();
    } catch {
      // Optimistically updated
    }
    notifySaved(
      `${cat.title} marked ${nextActive ? "Active" : "Hidden"}`
    );
  }

  async function deleteCategory(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id));
    setServices((prev) => prev.filter((s) => s.categoryId !== id));
    if (editingId === id) resetForm("category");
    try {
      await fetch(`/api/v1/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      // Optimistically removed
    }
    notifySaved("Category removed from catalog");
  }

  function toggleServiceStatus(id: string) {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "hidden" : "active" }
          : s
      )
    );
    notifySaved("Service visibility updated");
  }

  function deleteService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) resetForm("service");
    notifySaved("Bookable service removed");
  }

  const q = search.toLowerCase();

  const filteredCategories = items.filter((cat) => {
    if (!q) return true;
    return (
      cat.title.toLowerCase().includes(q) ||
      (cat.description || "").toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  });

  const filteredServices = services.filter((srv) => {
    if (!q) return true;
    return (
      srv.title.toLowerCase().includes(q) ||
      srv.categoryTitle.toLowerCase().includes(q) ||
      srv.dispatchSla.toLowerCase().includes(q)
    );
  });

  const tabOptions: ReadonlyArray<AdminTabOption<CatalogTab>> = [
    {
      id: "all",
      label: "All Categories & Services",
      count: items.length + services.length,
    },
    { id: "categories", label: "Categories", count: items.length },
    { id: "services", label: "Bookable Services", count: services.length },
  ];

  const categorySelectOptions = React.useMemo(
    () =>
      items.map((c) => ({
        id: c.id,
        label: c.title,
      })),
    [items]
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Service Catalog & Pricing Management"
        eyebrowIcon="shield"
        headline="Service Categories & Pricing."
        highlightWords={["Categories", "Pricing."]}
        subtitle="Add, edit, and manage marketplace service categories and individual bookable services using the inline form below, or use the table three-dots action menu."
        primaryCta={{
          label: "Add Service Category",
          onClick: () => {
            resetForm("category");
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Add Bookable Service",
          onClick: () => {
            resetForm("service");
            scrollToForm();
          },
          variant: "secondary",
          icon: <Wrench className="h-4 w-4" />,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Inline Form to Add, Edit, and Manage Categories & Bookable Services */}
        <AdminInlineForm
          formRef={formRef}
          eyebrow="Inline Catalog & Service Form"
          title={
            editingId
              ? `Edit & Manage ${
                  formMode === "category"
                    ? `Category: ${title}`
                    : `Service: ${serviceTitle}`
                }`
              : "Add, Edit & Manage Categories and Services"
          }
          description="Switch between Service Category and Bookable Service below to create or update catalog offerings, base rates, and sub-services inline."
          isEditing={Boolean(editingId)}
          editingBadgeText={`Editing ${formMode.toUpperCase()}`}
          onResetToCreate={() => resetForm(formMode)}
          open={formOpen}
          onOpenChange={setFormOpen}
          savedMessage={savedBanner}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <AdminSelectPills
              label="Catalog Record Type"
              options={FORM_ENTITY_OPTIONS}
              value={formMode}
              onChange={(next) => resetForm(next)}
              columns={2}
            />

            {formMode === "category" ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AdminTextField
                    label="Category Title"
                    placeholder="e.g. Solar & Renewable Energy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                  <AdminSelectPills
                    label="Catalog Visibility"
                    options={VISIBILITY_OPTIONS}
                    value={categoryVisibility}
                    onChange={setCategoryVisibility}
                    columns={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminTextField
                    label="Category Description"
                    placeholder="Rooftop solar arrays, lithium battery banks, and hybrid inverters."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <AdminTextField
                    label="Bookable Sub-Services (comma separated)"
                    value={subServices}
                    onChange={(e) => setSubServices(e.target.value)}
                    hint="Each comma-separated item becomes a bookable sub-service in the marketplace."
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AdminTextField
                    label="Bookable Service Title"
                    placeholder="e.g. Split AC Gas Refill & Coil Wash"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    required
                  />
                  <AdminSelectField
                    label="Parent Category"
                    options={
                      categorySelectOptions.length > 0
                        ? categorySelectOptions
                        : [{ id: "general", label: "General Services" }]
                    }
                    value={serviceCategoryId}
                    onChange={setServiceCategoryId}
                  />
                  <AdminTextField
                    label="Standard Service Rate (NGN)"
                    type="number"
                    min={1000}
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    required
                  />
                  <AdminTextField
                    label="Estimated Job Duration"
                    placeholder="e.g. 45 - 60 mins"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminSelectPills
                    label="Dispatch SLA Tier"
                    options={SLA_OPTIONS}
                    value={serviceSla}
                    onChange={setServiceSla}
                    columns={3}
                  />
                  <AdminSelectPills
                    label="Service Availability"
                    options={VISIBILITY_OPTIONS}
                    value={serviceStatus}
                    onChange={setServiceStatus}
                    columns={2}
                  />
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-surface-frost">
              {editingId && (
                <CtaButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => resetForm(formMode)}
                >
                  Cancel Edit
                </CtaButton>
              )}
              <CtaButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving}
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {saving
                        ? "Saving..."
                        : `Update ${
                            formMode === "category" ? "Category" : "Service"
                          }`}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>
                      {saving
                        ? "Creating..."
                        : `Create ${
                            formMode === "category"
                              ? "Service Category"
                              : "Bookable Service"
                          }`}
                    </span>
                  </>
                )}
              </CtaButton>
            </div>
          </form>
        </AdminInlineForm>

        {/* Segmented Filter Tabs & Search Bar */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={tab}
            onChange={setTab}
            ariaLabel="Filter categories and bookable services"
            layoutId="categories-services-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search category, service, or slug..."
          />
        </div>

        {/* Service Categories Table with Three-Dots Action Button & Dropdown CTAs */}
        {(tab === "all" || tab === "categories") && (
          <div className="mt-4">
            <AdminDataTable
              title="Service Categories Directory"
              subtitle="Manage marketplace service categories, starting prices, and bookable sub-service offerings."
              badge={`${filteredCategories.length} Categories`}
              headerAction={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    resetForm("category");
                    scrollToForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Category</span>
                </CtaButton>
              }
            >
              {filteredCategories.length === 0 ? (
                <AdminEmptyState
                  title="No Service Categories Found"
                  description="Add a new marketplace category using the inline form above or clear your search filter."
                  icon={<Layers className="h-5 w-5 text-accent-sky" />}
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead>Category &amp; Slug</AdminTableHead>
                      <AdminTableHead>Description</AdminTableHead>
                      <AdminTableHead>Bookable Sub-Services</AdminTableHead>
                      <AdminTableHead>Base Price</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredCategories.map((cat) => (
                      <AdminTableRow key={cat.id}>
                        <AdminTableCell className="whitespace-nowrap">
                          <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                            {cat.title}
                          </div>
                          <div className="font-mono text-[10px] font-semibold text-ink-muted">
                            /{cat.slug}
                          </div>
                        </AdminTableCell>

                        <AdminTableCell className="max-w-[260px]">
                          <p className="truncate text-xs font-medium text-ink-secondary">
                            {cat.description}
                          </p>
                        </AdminTableCell>

                        <AdminTableCell>
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {(cat.subServices || []).slice(0, 3).map((sub) => (
                              <span
                                key={sub}
                                className="inline-flex items-center gap-1 rounded-pill border border-brand-100 bg-brand-50 px-2 py-0.5 font-display text-[10px] font-bold text-brand-700"
                              >
                                {sub}
                              </span>
                            ))}
                            {(cat.subServices || []).length > 3 && (
                              <PillBadge
                                tone="sky"
                                className="px-2 py-0.5 text-[10px]"
                              >
                                +{(cat.subServices || []).length - 3} more
                              </PillBadge>
                            )}
                          </div>
                        </AdminTableCell>

                        <AdminTableCell className="font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                          {formatCurrency(cat.basePrice)}
                        </AdminTableCell>

                        <AdminTableCell>
                          <AdminStatusPill
                            status={cat.isActive ? "active" : "hidden"}
                          />
                        </AdminTableCell>

                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Manage ${cat.title}`}
                            ariaLabel={`Actions for category ${cat.title}`}
                            items={[
                              {
                                id: "edit-cat",
                                label: "Edit Category in Form",
                                description: "Modify title, base rate & subs",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                onClick: () => loadCategoryIntoForm(cat),
                              },
                              {
                                id: "add-srv",
                                label: "Add Bookable Service",
                                description: `Add a service under ${cat.title}`,
                                icon: <Plus className="h-3.5 w-3.5" />,
                                onClick: () => startAddServiceForCategory(cat),
                              },
                              {
                                id: "toggle-active",
                                label: cat.isActive
                                  ? "Hide Category"
                                  : "Publish Category",
                                description: "Toggle visibility in customer app",
                                icon: cat.isActive ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                ),
                                onClick: () => toggleCategoryActive(cat),
                              },
                              {
                                id: "delete-cat",
                                label: "Delete Category",
                                description: "Remove category from catalog",
                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                variant: "danger",
                                dividerBefore: true,
                                onClick: () => deleteCategory(cat.id),
                              },
                            ]}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          </div>
        )}

        {/* Bookable Services Table with Three-Dots Action Button & Dropdown CTAs */}
        {(tab === "all" || tab === "services") && (
          <div className="mt-5">
            <AdminDataTable
              title="Bookable Services & Standard Pricing Ledger"
              subtitle="Manage individual customer-bookable services, estimated job durations, and dispatch SLA tiers."
              badge={`${filteredServices.length} Services`}
              headerAction={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    resetForm("service");
                    scrollToForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Service</span>
                </CtaButton>
              }
            >
              {filteredServices.length === 0 ? (
                <AdminEmptyState
                  title="No Matching Services"
                  description="Create a bookable service using the inline form above or clear your search filter."
                  icon={<Wrench className="h-5 w-5 text-accent-sky" />}
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead>Service Title</AdminTableHead>
                      <AdminTableHead>Parent Category</AdminTableHead>
                      <AdminTableHead>Duration &amp; SLA</AdminTableHead>
                      <AdminTableHead>Standard Rate</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredServices.map((srv) => (
                      <AdminTableRow key={srv.id}>
                        <AdminTableCell>
                          <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                            {srv.title}
                          </div>
                        </AdminTableCell>

                        <AdminTableCell className="whitespace-nowrap">
                          <PillBadge
                            tone="porcelain"
                            className="px-2.5 py-0.5 text-[10px]"
                          >
                            {srv.categoryTitle}
                          </PillBadge>
                        </AdminTableCell>

                        <AdminTableCell className="whitespace-nowrap">
                          <div className="text-xs font-bold text-brand-800">
                            {srv.duration}
                          </div>
                          <div className="text-[10px] font-semibold text-ink-secondary">
                            SLA: {srv.dispatchSla}
                          </div>
                        </AdminTableCell>

                        <AdminTableCell className="font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                          {formatCurrency(srv.price)}
                        </AdminTableCell>

                        <AdminTableCell>
                          <AdminStatusPill status={srv.status} />
                        </AdminTableCell>

                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Service: ${srv.title}`}
                            ariaLabel={`Actions for service ${srv.title}`}
                            items={[
                              {
                                id: "edit-srv",
                                label: "Edit Service in Form",
                                description: "Update pricing, SLA & category",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                onClick: () => loadServiceIntoForm(srv),
                              },
                              {
                                id: "toggle-srv",
                                label:
                                  srv.status === "active"
                                    ? "Hide Service"
                                    : "Activate Service",
                                description: "Toggle availability for booking",
                                icon:
                                  srv.status === "active" ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ),
                                onClick: () => toggleServiceStatus(srv.id),
                              },
                              {
                                id: "delete-srv",
                                label: "Delete Service",
                                description: "Remove bookable service",
                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                variant: "danger",
                                dividerBefore: true,
                                onClick: () => deleteService(srv.id),
                              },
                            ]}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              )}
            </AdminDataTable>
          </div>
        )}

        {/* 3-Column Glossy Category Cards Grid */}
        {filteredCategories.length > 0 && (
          <Stagger className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat) => (
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
                              onClick: () => loadCategoryIntoForm(cat),
                            },
                            {
                              id: "card-add-srv",
                              label: "Add Bookable Service",
                              icon: <Plus className="h-3.5 w-3.5" />,
                              onClick: () => startAddServiceForCategory(cat),
                            },
                            {
                              id: "card-toggle",
                              label: cat.isActive
                                ? "Hide Category"
                                : "Publish Category",
                              icon: <Eye className="h-3.5 w-3.5" />,
                              onClick: () => toggleCategoryActive(cat),
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
        )}
      </AdminWorkspaceSlab>
    </div>
  );
}
