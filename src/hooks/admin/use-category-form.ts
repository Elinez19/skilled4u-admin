"use client";

import { useCallback, useRef, useState } from "react";
import type { CategoryRow } from "@/db/schema";
import { DEFAULT_CATEGORY_FORM } from "@/components/admin/categories/constants";
import type {
  BookableServiceRecord,
  CategoryFormData,
  DispatchSla,
  FormEntityMode,
  VisibilityStatus,
} from "@/components/admin/categories/types";

export interface UseCategoryFormReturn {
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  formData: CategoryFormData;
  updateField: <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K]
  ) => void;
  setFormMode: (mode: FormEntityMode) => void;
  scrollToForm: () => void;
  resetForm: (nextMode?: FormEntityMode, defaultCategoryId?: string) => void;
  loadCategoryIntoForm: (cat: CategoryRow) => void;
  loadServiceIntoForm: (srv: BookableServiceRecord) => void;
  startAddServiceForCategory: (cat: CategoryRow) => void;
}

export function useCategoryForm(
  initialDefaultCategoryId: string = ""
): UseCategoryFormReturn {
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [formData, setFormData] = useState<CategoryFormData>(() => ({
    ...DEFAULT_CATEGORY_FORM,
    serviceCategoryId: initialDefaultCategoryId,
  }));

  const updateField = useCallback(
    <K extends keyof CategoryFormData>(
      field: K,
      value: CategoryFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setFormMode = useCallback(
    (mode: FormEntityMode) => {
      updateField("formMode", mode);
    },
    [updateField]
  );

  const scrollToForm = useCallback(() => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const resetForm = useCallback(
    (nextMode?: FormEntityMode, defaultCategoryId?: string) => {
      const targetMode = nextMode ?? formData.formMode;
      setFormData({
        ...DEFAULT_CATEGORY_FORM,
        formMode: targetMode,
        serviceCategoryId:
          defaultCategoryId ?? formData.serviceCategoryId,
      });
    },
    [formData.formMode, formData.serviceCategoryId]
  );

  const loadCategoryIntoForm = useCallback(
    (cat: CategoryRow) => {
      setFormData({
        ...DEFAULT_CATEGORY_FORM,
        formMode: "category",
        editingId: cat.id,
        title: cat.title,
        description: cat.description || "",
        basePrice: String(cat.basePrice),
        subServices: (cat.subServices || []).join(", "),
        categoryVisibility: cat.isActive ? "active" : "hidden",
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  const loadServiceIntoForm = useCallback(
    (srv: BookableServiceRecord) => {
      setFormData({
        ...DEFAULT_CATEGORY_FORM,
        formMode: "service",
        editingId: srv.id,
        serviceTitle: srv.title,
        serviceCategoryId: srv.categoryId,
        servicePrice: String(srv.price),
        serviceDuration: srv.duration,
        serviceSla: srv.dispatchSla,
        serviceStatus: srv.status,
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  const startAddServiceForCategory = useCallback(
    (cat: CategoryRow) => {
      resetForm("service", cat.id);
      updateField("servicePrice", String(cat.basePrice));
      scrollToForm();
    },
    [resetForm, updateField, scrollToForm]
  );

  return {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setFormMode,
    scrollToForm,
    resetForm,
    loadCategoryIntoForm,
    loadServiceIntoForm,
    startAddServiceForCategory,
  };
}

