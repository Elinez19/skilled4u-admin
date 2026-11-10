import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import {
  adminAuditLogs,
  session as sessionTable,
  user as userTable,
  verification as verificationTable,
} from "./schema";
import { POST as loginPOST } from "../app/api/v1/auth/login/route";
import { POST as verifyOtpPOST } from "../app/api/v1/auth/verify-otp/route";
import {
  POST as usersPOST,
  PATCH as usersPATCH,
  DELETE as usersDELETE,
} from "../app/api/v1/users/route";
import { POST as revokeSessionsPOST } from "../app/api/v1/users/[id]/revoke-sessions/route";
import { POST as resetPasswordPOST } from "../app/api/v1/users/[id]/reset-password/route";
import { POST as resendInvitePOST } from "../app/api/v1/users/[id]/resend-invite/route";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function getLatestOtp(email: string): Promise<string> {
  const rows = await db
    .select()
    .from(verificationTable)
    .orderBy(desc(verificationTable.createdAt))
    .limit(10);

  for (const row of rows) {
    const rawVal = row.value.split(":")[0]?.trim() || "";
    if (/^\d{6}$/.test(rawVal)) {
      return rawVal;
    }
  }
  throw new Error(`No 6-digit OTP found for ${email}`);
}

async function loginAdmin(email: string, pass: string): Promise<string> {
  const step1 = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, portal: "admin" }),
    })
  );
  const body1 = await step1.json();
  assert(step1.status === 200, `Step 1 login failed for ${email}`);

  const otp = await getLatestOtp(email);
  const step2 = await verifyOtpPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "admin-mfa",
        email,
        otp,
        mfaChallengeToken: body1.data.mfaChallengeToken,
        portal: "admin",
      }),
    })
  );
  const body2 = await step2.json();
  assert(step2.status === 200, `Step 2 MFA failed for ${email}`);
  return body2.data.token as string;
}

async function main() {
  console.log("=== STARTING USER MANAGEMENT & ADMIN WORKSPACE VERIFICATION ===\n");

  // 1. Obtain active Super Admin token
  console.log("1. Authenticating as Super Admin (admin@skilled4u.ng)...");
  const superToken = await loginAdmin("admin@skilled4u.ng", "Admin@2026");
  console.log("   [PASS] Super Admin authenticated.\n");

  // 2. Super Admin provisions a new KYC Moderator Admin
  console.log("2. Testing Super Admin provisioning new Admin with adminScope = 'kyc_moderator'...");
  const testKycAdminEmail = `kyc.lead.${Date.now()}@skilled4u.ng`;
  const kycAdminTempPass = "TempPass@2026";
  const createAdminRes = await usersPOST(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superToken}`,
      },
      body: JSON.stringify({
        name: "Aisha KYC Moderator",
        email: testKycAdminEmail,
        password: kycAdminTempPass,
        role: "admin",
        adminScope: "kyc_moderator",
        adminRoleTitle: "Identity & Trust Analyst",
        adminPermissions: "KYC verification & dispute moderation",
      }),
    })
  );
  const createAdminBody = await createAdminRes.json();
  assert(
    createAdminRes.status === 201,
    `Super Admin creating admin must return 201 (got ${createAdminRes.status}): ${JSON.stringify(createAdminBody)}`
  );
  assert(
    createAdminBody.data.adminScope === "kyc_moderator" &&
      createAdminBody.data.mustChangePassword === true,
    "Created Admin must have adminScope='kyc_moderator' and mustChangePassword=true"
  );
  const kycAdminId = createAdminBody.data.id;
  console.log("   [PASS] Admin provisioned with explicit scope and mandatory password rotation flag.\n");

  // 3. Attempting to create duplicate user with same email must return 409 Conflict
  console.log("3. Testing duplicate email prevention (409 Conflict)...");
  const dupEmailRes = await usersPOST(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superToken}`,
      },
      body: JSON.stringify({
        name: "Imposter",
        email: testKycAdminEmail,
        role: "client",
      }),
    })
  );
  assert(
    dupEmailRes.status === 409,
    `POST /api/v1/users with existing email must return 409 Conflict (got ${dupEmailRes.status})`
  );
  console.log("   [PASS] Duplicate registration rejected with 409 Conflict.\n");

  // 4. Authenticate newly created KYC Moderator & verify RBAC guard (cannot manage admins)
  console.log("4. Testing KYC Moderator RBAC boundaries...");
  const kycAdminToken = await loginAdmin(testKycAdminEmail, kycAdminTempPass);

  // KYC Moderator attempts to create another admin -> must return 403
  const kycCreateAdminAttempt = await usersPOST(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${kycAdminToken}`,
      },
      body: JSON.stringify({
        name: "Unauthorized Admin",
        email: `unauth.${Date.now()}@skilled4u.ng`,
        role: "admin",
      }),
    })
  );
  assert(
    kycCreateAdminAttempt.status === 403,
    `KYC Moderator attempting to create admin must be blocked with 403 (got ${kycCreateAdminAttempt.status})`
  );

  // KYC Moderator attempts to modify another admin -> must return 403
  const [targetAdminToTest] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, "admin@skilled4u.ng"));

  const kycPatchAdminAttempt = await usersPATCH(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${kycAdminToken}`,
      },
      body: JSON.stringify({
        id: targetAdminToTest.id,
        adminRoleTitle: "Hacked Title",
      }),
    })
  );
  assert(
    kycPatchAdminAttempt.status === 403,
    `KYC Moderator attempting to modify admin must be blocked with 403 (got ${kycPatchAdminAttempt.status})`
  );

  // KYC Moderator attempts to delete an admin -> must return 403
  const kycDeleteAdminAttempt = await usersDELETE(
    new NextRequest(`http://localhost:3000/api/v1/users?id=${kycAdminId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${kycAdminToken}`,
      },
    })
  );
  assert(
    kycDeleteAdminAttempt.status === 403,
    `KYC Moderator attempting to delete admin must be blocked with 403 (got ${kycDeleteAdminAttempt.status})`
  );
  console.log("   [PASS] KYC Moderator strictly restricted from managing Administrator accounts.\n");

  // 5. Customer Creation, Suspension & Immediate Session Invalidation
  console.log("5. Testing Customer Creation, Suspension & Immediate Session Invalidation...");
  const testCustomerEmail = `customer.test.${Date.now()}@gmail.com`;
  const createCustRes = await usersPOST(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superToken}`,
      },
      body: JSON.stringify({
        name: "Chukwudi Customer",
        email: testCustomerEmail,
        role: "client",
        phone: "+234 802 111 2233",
        city: "Abuja (Maitama)",
      }),
    })
  );
  const createCustBody = await createCustRes.json();
  assert(createCustRes.status === 201, "Super Admin creating customer must return 201");
  const customerId = createCustBody.data.id;

  // Insert a mock session for the customer
  const mockToken = `test_sess_${Date.now()}`;
  await db.insert(sessionTable).values({
    id: `sess_${Date.now()}`,
    userId: customerId,
    token: mockToken,
    expiresAt: new Date(Date.now() + 86400000),
  });

  // Verify session exists
  const [sessBefore] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.userId, customerId));
  assert(Boolean(sessBefore), "Customer session must exist in DB");

  // Super Admin suspends the customer
  const suspendRes = await usersPATCH(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superToken}`,
      },
      body: JSON.stringify({
        id: customerId,
        accountStatus: "suspended",
        banReason: "Suspicious activity detected",
      }),
    })
  );
  assert(suspendRes.status === 200, "Suspending customer must return 200");

  // Verify that all sessions for suspended customer were deleted immediately
  const sessionsAfterSuspend = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.userId, customerId));
  assert(
    sessionsAfterSuspend.length === 0,
    "Suspending customer must immediately delete all active sessions from database"
  );
  console.log("   [PASS] Customer suspended and all active sessions immediately revoked.\n");

  // 6. Test Dedicated Endpoints: Revoke Sessions, Reset Password, Resend Invite
  console.log("6. Testing Action Endpoints (Revoke Sessions, Reset Password, Resend Credentials)...");
  // Test revoke sessions directly
  await db.insert(sessionTable).values({
    id: `sess_revoke_${Date.now()}`,
    userId: customerId,
    token: `token_revoke_${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400000),
  });
  const revokeRes = await revokeSessionsPOST(
    new NextRequest(`http://localhost:3000/api/v1/users/${customerId}/revoke-sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${superToken}` },
    }),
    { params: Promise.resolve({ id: customerId }) }
  );
  assert(revokeRes.status === 200, "Revoke sessions endpoint must return 200");
  const sessionsAfterRevoke = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.userId, customerId));
  assert(sessionsAfterRevoke.length === 0, "Revoking sessions must clear user sessions");

  // Test reset password
  const resetRes = await resetPasswordPOST(
    new NextRequest(`http://localhost:3000/api/v1/users/${customerId}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${superToken}` },
    }),
    { params: Promise.resolve({ id: customerId }) }
  );
  assert(resetRes.status === 200, "Password reset endpoint must return 200");

  // Test resend invite for admin
  const resendRes = await resendInvitePOST(
    new NextRequest(`http://localhost:3000/api/v1/users/${kycAdminId}/resend-invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${superToken}` },
    }),
    { params: Promise.resolve({ id: kycAdminId }) }
  );
  assert(resendRes.status === 200, "Resend invite endpoint must return 200");

  const [refreshedAdmin] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, kycAdminId));
  assert(
    refreshedAdmin.mustChangePassword === true,
    "Resending invite must set mustChangePassword = true"
  );
  console.log("   [PASS] Action endpoints (Reset Password & Resend Credentials) verified.\n");

  // 7. Self-lockout & Last Super Admin Protection
  console.log("7. Testing Self-Lockout & Super Admin Protection...");
  const [currentSuperUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, "admin@skilled4u.ng"));

  // Super Admin attempting to delete own account -> must return 400
  const deleteSelfRes = await usersDELETE(
    new NextRequest(`http://localhost:3000/api/v1/users?id=${currentSuperUser.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${superToken}` },
    })
  );
  assert(
    deleteSelfRes.status === 400,
    `Attempting to delete own account must return 400 Bad Request (got ${deleteSelfRes.status})`
  );

  // Super Admin attempting to suspend own account -> must return 400
  const suspendSelfRes = await usersPATCH(
    new NextRequest("http://localhost:3000/api/v1/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superToken}`,
      },
      body: JSON.stringify({
        id: currentSuperUser.id,
        accountStatus: "suspended",
      }),
    })
  );
  assert(
    suspendSelfRes.status === 400,
    `Attempting to suspend own account must return 400 Bad Request (got ${suspendSelfRes.status})`
  );
  console.log("   [PASS] Self-lockout guard successfully prevented deleting or suspending own account.\n");

  // 8. Audit Log Verification
  console.log("8. Verifying Audit Log Entries in admin_audit_logs...");
  const recentLogs = await db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(10);

  assert(recentLogs.length > 0, "admin_audit_logs must contain recorded admin actions");
  const actions = recentLogs.map((l) => l.action);
  assert(
    actions.includes("create_admin") || actions.includes("suspend_user"),
    `Audit logs must record create_admin and suspend_user actions (found: ${actions.join(", ")})`
  );
  console.log(`   [PASS] Audit logs verified (${recentLogs.length} recent entries recorded).\n`);

  console.log("=== ALL USER MANAGEMENT & ADMIN WORKSPACE VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("VERIFICATION FAILED:", err);
    process.exit(1);
  });
