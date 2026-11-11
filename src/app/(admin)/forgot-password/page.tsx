import * as React from "react";
import { Suspense } from "react";
import { AdminAuthPortal } from "@/components/admin/composites/admin-auth-portal";

export const metadata = {
  title: "Forgot Password | Skilled4U Admin",
  description: "Recover access to your Skilled4U account.",
};

async function ForgotPasswordContent({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return (
    <AdminAuthPortal
      initialStep="forgot_password"
      initialEmail={params?.email}
    />
  );
}

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  return (
    <Suspense fallback={<AdminAuthPortal initialStep="forgot_password" />}>
      <ForgotPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
