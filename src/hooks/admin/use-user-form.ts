"use client";

import { useCallback, useRef, useState } from "react";
import type { ArtisanRow } from "@/db/schema";
import { DEFAULT_USER_FORM_DATA } from "@/components/admin/artisans/constants";
import type {
  AdminRecord,
  ArtisanKycStatus,
  ArtisanUserFormData,
  CustomerAccountStatus,
  CustomerRecord,
  FormUserGroup,
} from "@/components/admin/artisans/types";

export interface UseUserFormReturn {
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  formData: ArtisanUserFormData;
  updateField: <K extends keyof ArtisanUserFormData>(
    field: K,
    value: ArtisanUserFormData[K]
  ) => void;
  setFormGroup: (group: FormUserGroup) => void;
  scrollToForm: () => void;
  resetForm: (nextGroup?: FormUserGroup) => void;
  loadArtisanIntoForm: (a: ArtisanRow) => void;
  loadCustomerIntoForm: (c: CustomerRecord) => void;
  loadAdminIntoForm: (adm: AdminRecord) => void;
}

export function useUserForm(): UseUserFormReturn {
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [formData, setFormData] = useState<ArtisanUserFormData>(
    DEFAULT_USER_FORM_DATA
  );

  const updateField = useCallback(
    <K extends keyof ArtisanUserFormData>(
      field: K,
      value: ArtisanUserFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setFormGroup = useCallback(
    (group: FormUserGroup) => {
      updateField("formGroup", group);
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
    (nextGroup?: FormUserGroup) => {
      const target = nextGroup ?? formData.formGroup;
      setFormData({
        ...DEFAULT_USER_FORM_DATA,
        formGroup: target,
      });
    },
    [formData.formGroup]
  );

  const loadArtisanIntoForm = useCallback(
    (a: ArtisanRow) => {
      setFormData({
        ...DEFAULT_USER_FORM_DATA,
        formGroup: "artisan",
        editingId: a.id,
        name: a.name,
        email: a.email || "",
        phone: a.phone,
        city: a.city,
        trade: a.trade,
        hourlyRateNumeric: String(a.hourlyRateNumeric || 15000),
        ninNumber: a.ninNumber || "48192038471",
        bankName: a.bankName || "Access Bank",
        bankAccountNumber: a.bankAccountNumber || "0148291042",
        kycStatus: (a.kycStatus as ArtisanKycStatus) || "verified",
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  const loadCustomerIntoForm = useCallback(
    (c: CustomerRecord) => {
      setFormData({
        ...DEFAULT_USER_FORM_DATA,
        formGroup: "customer",
        editingId: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        customerStatus: c.status as CustomerAccountStatus,
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  const loadAdminIntoForm = useCallback(
    (adm: AdminRecord) => {
      setFormData({
        ...DEFAULT_USER_FORM_DATA,
        formGroup: "admin",
        editingId: adm.id,
        name: adm.name,
        email: adm.email,
        phone: adm.phone || "+234 803 550 1920",
        password: "",
        roleTitle: adm.roleTitle,
        permissions: adm.permissions,
        adminScope: adm.adminScope || "dispatch_support",
        adminStatus: adm.status,
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  return {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setFormGroup,
    scrollToForm,
    resetForm,
    loadArtisanIntoForm,
    loadCustomerIntoForm,
    loadAdminIntoForm,
  };
}

