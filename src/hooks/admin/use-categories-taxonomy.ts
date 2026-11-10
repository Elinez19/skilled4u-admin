"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow } from "@/db/schema";
import { buildInitialServices } from "@/components/admin/categories/constants";
import type {
  BookableServiceRecord,
  CategoryFormData,
} from "@/components/admin/categories/types";

export interface UseCategoriesTaxonomyReturn {
  items: CategoryRow[];
  setItems: React.Dispatch<React.SetStateAction<CategoryRow[]>>;
  services: BookableServiceRecord[];
  setServices: React.Dispatch<React.SetStateAction<BookableServiceRecord[]>>;
  saving: boolean;
  savedBanner: string | null;
  notifySaved: (msg: string) => void;
  saveCategoryOrService: (formData: CategoryFormData) => Promise<boolean>;
  toggleCategoryActive: (cat: CategoryRow) => Promise<void>;
  deleteCategory: (id: string, onDeleted?: () => void) => Promise<void>;
  toggleServiceStatus: (id: string) => void;
  deleteService: (id: string, onDeleted?: () => void) => void;
  batchToggleCategoryActive: (ids: string[], nextActive: boolean) => void;
  batchDeleteCategories: (ids: string[]) => void;
  batchDeleteServices: (ids: string[]) => void;
}

export function useCategoriesTaxonomy(
  initialCategories: CategoryRow[]
): UseCategoriesTaxonomyReturn {
  const router = useRouter();
  const [items, setItems] = useState<CategoryRow[]>(initialCategories);
  const [services, setServices] = useState<BookableServiceRecord[]>(() =>
    buildInitialServices(initialCategories)
  );
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = useCallback((msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }, []);

  const saveCategoryOrService = useCallback(
    async (formData: CategoryFormData): Promise<boolean> => {
      setSaving(true);
      try {
        if (formData.formMode === "category") {
          const parsedSubs = formData.subServices
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const isActive = formData.categoryVisibility === "active";

          if (formData.editingId) {
            const res = await fetch("/api/v1/categories", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: formData.editingId,
                title: formData.title,
                description: formData.description,
                basePrice: Number(formData.basePrice),
                subServices: parsedSubs,
                isActive,
              }),
            });
            if (res.ok) {
              const { data } = await res.json();
              setItems((prev) =>
                prev.map((c) => (c.id === formData.editingId ? data : c))
              );
              router.refresh();
            } else {
              setItems((prev) =>
                prev.map((c) =>
                  c.id === formData.editingId
                    ? {
                        ...c,
                        title: formData.title,
                        description: formData.description,
                        basePrice: Number(formData.basePrice),
                        subServices: parsedSubs,
                        isActive,
                      }
                    : c
                )
              );
            }
            notifySaved(`Updated category "${formData.title}"`);
            return true;
          } else {
            const res = await fetch("/api/v1/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                basePrice: Number(formData.basePrice),
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
                  price: Number(formData.basePrice) + idx * 2500,
                  duration: "45 - 60 mins",
                  dispatchSla: "Same-Day",
                  status: isActive ? "active" : "hidden",
                })
              );
              setServices((prev) => [...newServices, ...prev]);
              router.refresh();
            } else {
              const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              const fallbackCat: CategoryRow = {
                id: `cat_${Date.now()}`,
                title: formData.title,
                slug,
                iconName: "wrench",
                iconFamily: "MaterialCommunityIcons",
                description: formData.description,
                subServices: parsedSubs,
                basePrice: Number(formData.basePrice),
                isPopular: true,
                isActive,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setItems((prev) => [...prev, fallbackCat]);
            }
            notifySaved(`Created category "${formData.title}"`);
            return true;
          }
        } else {
          const parentCat =
            items.find((c) => c.id === formData.serviceCategoryId) || items[0];
          const categoryTitle = parentCat
            ? parentCat.title
            : "General Service";
          const resolvedCatId = parentCat ? parentCat.id : "general";

          if (formData.editingId) {
            setServices((prev) =>
              prev.map((srv) =>
                srv.id === formData.editingId
                  ? {
                      ...srv,
                      title: formData.serviceTitle,
                      categoryId: resolvedCatId,
                      categoryTitle,
                      price: Number(formData.servicePrice) || 15000,
                      duration: formData.serviceDuration,
                      dispatchSla: formData.serviceSla,
                      status: formData.serviceStatus,
                    }
                  : srv
              )
            );
            notifySaved(`Updated service "${formData.serviceTitle}"`);
            return true;
          } else {
            const newSrv: BookableServiceRecord = {
              id: `srv_${Date.now()}`,
              title: formData.serviceTitle,
              categoryId: resolvedCatId,
              categoryTitle,
              price: Number(formData.servicePrice) || 15000,
              duration: formData.serviceDuration,
              dispatchSla: formData.serviceSla,
              status: formData.serviceStatus,
            };
            setServices((prev) => [newSrv, ...prev]);

            if (parentCat) {
              const updatedSubs = Array.from(
                new Set([
                  ...(parentCat.subServices || []),
                  formData.serviceTitle,
                ])
              );
              setItems((prev) =>
                prev.map((c) =>
                  c.id === parentCat.id
                    ? { ...c, subServices: updatedSubs }
                    : c
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
            notifySaved(`Added service "${formData.serviceTitle}"`);
            return true;
          }
        }
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [items, notifySaved, router]
  );

  const toggleCategoryActive = useCallback(
    async (cat: CategoryRow) => {
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
      notifySaved(`${cat.title} marked ${nextActive ? "Active" : "Hidden"}`);
    },
    [notifySaved, router]
  );

  const deleteCategory = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setItems((prev) => prev.filter((c) => c.id !== id));
      setServices((prev) => prev.filter((s) => s.categoryId !== id));
      onDeleted?.();
      try {
        await fetch(`/api/v1/categories?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        router.refresh();
      } catch {
        // Optimistically removed
      }
      notifySaved("Category removed from catalog");
    },
    [notifySaved, router]
  );

  const toggleServiceStatus = useCallback(
    (id: string) => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: s.status === "active" ? "hidden" : "active" }
            : s
        )
      );
      notifySaved("Service visibility updated");
    },
    [notifySaved]
  );

  const deleteService = useCallback(
    (id: string, onDeleted?: () => void) => {
      setServices((prev) => prev.filter((s) => s.id !== id));
      onDeleted?.();
      notifySaved("Bookable service removed");
    },
    [notifySaved]
  );

  const batchToggleCategoryActive = useCallback(
    (ids: string[], nextActive: boolean) => {
      setItems((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, isActive: nextActive } : c))
      );
      notifySaved(
        `Marked ${ids.length} category(ies) ${nextActive ? "active" : "hidden"}`
      );
    },
    [notifySaved]
  );

  const batchDeleteCategories = useCallback(
    (ids: string[]) => {
      const count = ids.length;
      setItems((prev) => prev.filter((c) => !ids.includes(c.id)));
      setServices((prev) => prev.filter((s) => !ids.includes(s.categoryId)));
      notifySaved(`Removed ${count} category(ies)`);
    },
    [notifySaved]
  );

  const batchDeleteServices = useCallback(
    (ids: string[]) => {
      const count = ids.length;
      setServices((prev) => prev.filter((s) => !ids.includes(s.id)));
      notifySaved(`Removed ${count} service(s)`);
    },
    [notifySaved]
  );

  return {
    items,
    setItems,
    services,
    setServices,
    saving,
    savedBanner,
    notifySaved,
    saveCategoryOrService,
    toggleCategoryActive,
    deleteCategory,
    toggleServiceStatus,
    deleteService,
    batchToggleCategoryActive,
    batchDeleteCategories,
    batchDeleteServices,
  };
}

