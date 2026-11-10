import * as React from "react";
import { AdminShell } from "@/components/admin/ui/admin-navigation";
import { requireAdminPage } from "@/lib/auth-guard";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
