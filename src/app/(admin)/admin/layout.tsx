import * as React from "react";
import { AdminShell } from "@/components/admin/ui/admin-navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
