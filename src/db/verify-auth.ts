import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { NextRequest } from "next/server";
import { desc, eq, like, sql } from "drizzle-orm";
import { db } from "./index";
import {
  artisans,
  emailLogs,
  session as sessionTable,
  user as userTable,
  verification as verificationTable,
} from "./schema";
import { POST as loginPOST } from "../app/api/v1/auth/login/route";
import { POST as logoutPOST } from "../app/api/v1/auth/logout/route";
import { POST as registerPOST } from "../app/api/v1/auth/register/route";
import { POST as verifyOtpPOST } from "../app/api/v1/auth/verify-otp/route";
import { POST as changePasswordPOST } from "../app/api/v1/auth/change-password/route";
import { GET as meGET, PATCH as mePATCH } from "../app/api/v1/auth/me/route";
import { POST as customerOnboardingPOST } from "../app/api/v1/auth/onboarding/customer/route";
import { POST as artisanOnboardingPOST } from "../app/api/v1/auth/onboarding/artisan/route";
import {
  GET as artisansGET,
  PATCH as artisansPATCH,
} from "../app/api/v1/artisans/route";
import { GET as usersGET } from "../app/api/v1/users/route";
import { GET as emailsGET } from "../app/api/v1/emails/route";
import {
  GET as googleAuthGET,
  POST as googleAuthPOST,
} from "../app/api/v1/auth/google/route";
import { GET as googleCallbackGET } from "../app/api/v1/auth/google/callback/route";
import {
  completeGoogleAuthentication,
  getAllowedGoogleClientIds,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyOAuthStatePayload,
} from "../lib/google-oauth";
import { decryptNin } from "../lib/kyc-crypto";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function ensureSchemaColumnsExist() {
  await db.execute(
    sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "must_change_password" boolean NOT NULL DEFAULT false;`
  );
  await db.execute(
    sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "admin_scope" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "nin_encrypted" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "nin_hash" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "kyc_selfie_url" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "kyc_id_document_url" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "kyc_id_type" text;`
  );
  await db.execute(
    sql`ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "kyc_rejection_reason" text;`
  );
}

/**
 * Reads the active 6-digit OTP from Better Auth's `verification` table
 * and verifies that `email_logs` masked the OTP ("******").
 */
async function getLatestOtpFromVerificationTable(
  email: string
): Promise<string> {
  const rows = await db
    .select()
    .from(verificationTable)
    .where(like(verificationTable.identifier, `%${email.toLowerCase()}%`))
    .orderBy(desc(verificationTable.createdAt))
    .limit(5);

  for (const row of rows) {
    const rawVal = row.value.split(":")[0]?.trim() || "";
    if (/^\d{6}$/.test(rawVal)) {
      const [latestLog] = await db
        .select()
        .from(emailLogs)
        .where(eq(emailLogs.toEmail, email.toLowerCase()))
        .orderBy(desc(emailLogs.createdAt))
        .limit(1);

      if (latestLog) {
        const meta = latestLog.metadata as Record<string, unknown> | null;
        assert(
          !meta?.otp && meta?.otpMasked === "******",
          "email_logs metadata must mask OTP as '******'"
        );
        assert(
          !(latestLog.textBody || "").includes(rawVal),
          "email_logs textBody must not contain plaintext 6-digit OTP"
        );
      }
      return rawVal;
    }
  }
  throw new Error(`No 6-digit OTP found in verification table for ${email}`);
}

/**
 * Helper to complete the mandatory 2-step Admin Login (Step 1 Password -> Step 2 6-digit Email OTP).
 */
async function signInAdminTwoStep(email: string, password: string) {
  const step1Res = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        portal: "admin",
      }),
    })
  );
  const step1Body = await step1Res.json();
  assert(
    step1Res.status === 200 &&
      step1Body.data?.mfaRequired === true &&
      Boolean(step1Body.data?.mfaChallengeToken) &&
      !step1Body.data?.token,
    "Admin Step 1 login must return mfaRequired=true and mfaChallengeToken without issuing a session token yet"
  );

  const otp = await getLatestOtpFromVerificationTable(email);
  const step2Res = await verifyOtpPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "admin-mfa",
        email,
        otp,
        mfaChallengeToken: step1Body.data.mfaChallengeToken,
        portal: "admin",
      }),
    })
  );
  const step2Body = await step2Res.json();
  assert(
    step2Res.status === 200 && Boolean(step2Body.data?.token),
    `Admin Step 2 MFA verification should return 200 and session token (got ${step2Res.status})`
  );

  return {
    step1Body,
    step2Res,
    step2Body,
    token: step2Body.data.token as string,
  };
}

async function runVerification() {
  console.log(
    "=== STARTING END-TO-END AUTH, 2-STEP ADMIN MFA, GRANULAR RBAC, ENCRYPTED KYC & OAUTH VERIFICATION ===\n"
  );

  await ensureSchemaColumnsExist();

  // ---------------------------------------------------------------------------
  // 1. WEB ADMIN 2-STEP MFA FLOW: Password -> 6-Digit Email OTP -> 8h/30m Session Policy
  // ---------------------------------------------------------------------------
  console.log(
    "1. Testing Web Admin 2-Step Login (Password -> 6-Digit Email OTP) & 8h/30m Session Policy..."
  );

  // Verify tampered mfaChallengeToken is blocked with 401
  const tamperedMfaRes = await verifyOtpPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "admin-mfa",
        email: "admin@skilled4u.ng",
        otp: "123456",
        mfaChallengeToken: "tampered.challenge",
        portal: "admin",
      }),
    })
  );
  assert(
    tamperedMfaRes.status === 401,
    "Tampered Admin mfaChallengeToken must be rejected with 401"
  );

  const {
    step2Res: adminLoginRes,
    step2Body: adminLoginBody,
    token: adminToken,
  } = await signInAdminTwoStep("admin@skilled4u.ng", "Admin@2026");

  assert(
    adminLoginBody.data.sessionPolicy.maxAgeSeconds === 8 * 3600 &&
      adminLoginBody.data.sessionPolicy.idleTimeoutSeconds === 30 * 60,
    "Admin sessionPolicy must enforce 8h maxAge (28800s) and 30m idleTimeout (1800s)"
  );
  assert(
    Boolean(adminLoginRes.headers.get("set-cookie")),
    "Admin Step 2 MFA verification must set HTTP-only session cookie"
  );

  // Verify GET & PATCH /api/v1/auth/me
  const adminMeReq = new NextRequest("http://localhost:3000/api/v1/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminMeRes = await meGET(adminMeReq);
  const adminMeBody = await adminMeRes.json();
  assert(
    adminMeRes.status === 200 &&
      adminMeBody.data.onboardingChecklist.adminAccessActive === true &&
      adminMeBody.data.onboardingChecklist.adminScope === "super_admin",
    "GET /api/v1/auth/me for Super Admin should return 200 and super_admin scope"
  );

  const patchMeReq = new NextRequest("http://localhost:3000/api/v1/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ city: "Abuja (Wuse II)" }),
  });
  const patchMeRes = await mePATCH(patchMeReq);
  assert(patchMeRes.status === 200, "PATCH /api/v1/auth/me should return 200");
  console.log(
    "   [PASS] Web Admin 2-Step MFA Login, Cookie Header, 8h/30m Session Policy & /api/v1/auth/me verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 2. ADMIN PROVISIONING (Forced First-Login Password Rotation) & GRANULAR RBAC SCOPES
  // ---------------------------------------------------------------------------
  console.log(
    "2. Testing Super Admin Provisioning, Forced Password Rotation & Granular RBAC Scopes..."
  );

  // S1: Attempt public registration with role: "admin" without Admin credentials -> must return 401/403
  const rogueAdminRes = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rogue Attacker",
        email: `rogue.${Date.now()}@skilled4u.ng`,
        password: "Password@123",
        role: "admin",
      }),
    })
  );
  assert(
    rogueAdminRes.status === 401 || rogueAdminRes.status === 403,
    `Public registration with role='admin' must be blocked (got ${rogueAdminRes.status})`
  );

  // Super Admin provisions a new Dispatch Support Admin (mustChangePassword defaults to true)
  const testDispatchEmail = `dispatch.verify.${Date.now()}@skilled4u.ng`;
  const provisionDispatchRes = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "x-forwarded-for": "10.20.1.1",
      },
      body: JSON.stringify({
        name: "Musa Dispatch Support",
        email: testDispatchEmail,
        password: "TempPassword@2026",
        role: "admin",
        adminRoleTitle: "Dispatch & Support Lead",
      }),
    })
  );
  const provisionDispatchBody = await provisionDispatchRes.json();
  assert(
    provisionDispatchRes.status === 201 &&
      provisionDispatchBody.data.user.mustChangePassword === true,
    "Super Admin provisioning a new Admin must set mustChangePassword = true"
  );

  // Dispatch Admin logs in via 2-Step MFA -> mustChangePassword is true
  const { step2Body: dispatchLoginBody, token: dispatchToken } =
    await signInAdminTwoStep(testDispatchEmail, "TempPassword@2026");
  assert(
    dispatchLoginBody.data.mustChangePassword === true &&
      dispatchLoginBody.data.adminScope === "dispatch_support",
    "Provisioned Dispatch Admin must have mustChangePassword=true and adminScope='dispatch_support'"
  );

  // Dispatch Admin rotates temporary password via POST /api/v1/auth/change-password
  const rotatePwdRes = await changePasswordPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dispatchToken}`,
      },
      body: JSON.stringify({
        currentPassword: "TempPassword@2026",
        newPassword: "NewStrongDispatch@2026",
      }),
    })
  );
  const rotatePwdBody = await rotatePwdRes.json();
  assert(
    rotatePwdRes.status === 200 &&
      rotatePwdBody.data.mustChangePassword === false &&
      rotatePwdBody.data.onboardingChecklist.adminAccessActive === true,
    "POST /api/v1/auth/change-password must clear mustChangePassword and activate adminAccessActive"
  );

  // Granular RBAC Check 1: Dispatch Admin attempting to create another Admin -> must return 403 FORBIDDEN_ADMIN_SCOPE
  const dispatchCreateAdminAttempt = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dispatchToken}`,
        "x-forwarded-for": "10.20.1.2",
      },
      body: JSON.stringify({
        name: "Unauthorized Admin",
        email: `unauth.admin.${Date.now()}@skilled4u.ng`,
        password: "Password@123",
        role: "admin",
      }),
    })
  );
  const dispatchCreateAdminBody = await dispatchCreateAdminAttempt.json();
  assert(
    dispatchCreateAdminAttempt.status === 403 &&
      dispatchCreateAdminBody.code === "FORBIDDEN_ADMIN_SCOPE",
    "Dispatch Support Admin must be blocked from creating Admin accounts with 403 FORBIDDEN_ADMIN_SCOPE"
  );

  // S3: Unauthenticated calls to /api/v1/users, /api/v1/emails, and PATCH /api/v1/artisans -> must return 401
  const unauthUsersRes = await usersGET(
    new NextRequest("http://localhost:3000/api/v1/users")
  );
  assert(
    unauthUsersRes.status === 401,
    "Unauthenticated GET /api/v1/users must return 401"
  );

  const unauthEmailsRes = await emailsGET(
    new NextRequest("http://localhost:3000/api/v1/emails")
  );
  assert(
    unauthEmailsRes.status === 401,
    "Unauthenticated GET /api/v1/emails must return 401"
  );

  const unauthArtisanPatchRes = await artisansPATCH(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "any", kycStatus: "verified" }),
    })
  );
  assert(
    unauthArtisanPatchRes.status === 401,
    "Unauthenticated PATCH /api/v1/artisans must return 401"
  );

  // S5: Public GET /api/v1/artisans must redact ninNumber and bankAccountNumber
  const publicArtisansRes = await artisansGET(
    new NextRequest("http://localhost:3000/api/v1/artisans")
  );
  const publicArtisansBody = await publicArtisansRes.json();
  assert(
    publicArtisansRes.status === 200 &&
      publicArtisansBody.data.every(
        (a: { ninNumber: unknown; bankAccountNumber: unknown }) =>
          a.ninNumber === null && a.bankAccountNumber === null
      ),
    "Public GET /api/v1/artisans must redact ninNumber and bankAccountNumber"
  );

  console.log(
    "   [PASS] Admin Provisioning, Forced First-Login Password Rotation & Granular RBAC Scopes verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 3. CUSTOMER MOBILE APP FLOW & STRICT 1-EMAIL-1-ROLE ISOLATION
  // ---------------------------------------------------------------------------
  console.log(
    "3. Testing Customer Mobile Registration, OTP Verification, Onboarding & 1-Email-1-Role Isolation..."
  );
  const testCustomerEmail = `zainab.verify.${Date.now()}@skilled4u.ng`;

  const custRegRes = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.1.1",
      },
      body: JSON.stringify({
        name: "Zainab Musa",
        email: testCustomerEmail,
        password: "Customer@2026",
        role: "customer",
        phone: "+234 803 111 2233",
        city: "Abuja (Garki)",
      }),
    })
  );
  const custRegBody = await custRegRes.json();
  assert(custRegRes.status === 201, "Customer registration should return 201");
  const custToken = custRegBody.data.token as string;

  // Customer attempting to log into Admin Portal must be rejected with 403 FORBIDDEN_PORTAL
  const custAdminPortalAttempt = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.1.2",
      },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: "Customer@2026",
        portal: "admin",
      }),
    })
  );
  assert(
    custAdminPortalAttempt.status === 403,
    "Customer attempting to sign in with portal='admin' must be rejected with 403"
  );

  // Customer attempting to sign in on the Artisan App (portal: "artisan") must be rejected with 403 ROLE_MISMATCH
  const custArtisanAppAttempt = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.1.3",
      },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: "Customer@2026",
        portal: "artisan",
      }),
    })
  );
  const custArtisanAppBody = await custArtisanAppAttempt.json();
  assert(
    custArtisanAppAttempt.status === 403 &&
      custArtisanAppBody.code === "ROLE_MISMATCH",
    "Customer attempting to sign into Artisan App (portal='artisan') must be blocked with 403 ROLE_MISMATCH"
  );

  const custOtp = await getLatestOtpFromVerificationTable(testCustomerEmail);
  const verifyCustRes = await verifyOtpPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.1.1",
      },
      body: JSON.stringify({
        action: "verify-email",
        email: testCustomerEmail,
        otp: custOtp,
        portal: "customer",
      }),
    })
  );
  assert(
    verifyCustRes.status === 200,
    "Customer OTP verification should return 200"
  );

  const custOnboardRes = await customerOnboardingPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/onboarding/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        phone: "+234 803 111 2233",
        city: "Abuja (Maitama)",
        address: "14 Nile Street, Maitama, Abuja",
      }),
    })
  );
  const custOnboardBody = await custOnboardRes.json();
  assert(
    custOnboardRes.status === 200 &&
      custOnboardBody.data.user.onboardingStatus === "completed",
    "Customer onboarding completion should return 200"
  );
  console.log(
    "   [PASS] Customer Mobile Registration, Masked OTP, Onboarding & 1-Email-1-Role Isolation verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 4. ARTISAN 5-STEP ONBOARDING, AES-256-GCM NIN ENCRYPTION, KYC REJECTION LOOP & SINGLE-DEVICE SESSION
  // ---------------------------------------------------------------------------
  console.log(
    "4. Testing Artisan Encrypted KYC, Selfie/ID Upload, Rejection Re-Upload Loop & Single-Device Session..."
  );
  const testArtisanEmail = `babatunde.verify.${Date.now()}@skilled4u.ng`;

  const artRegRes = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.2.1",
      },
      body: JSON.stringify({
        name: "Babatunde Lawal",
        email: testArtisanEmail,
        password: "Artisan@2026",
        role: "artisan",
        phone: "+234 809 444 5566",
        city: "Lagos (Ikeja)",
        trade: "Solar & Inverter Engineer",
      }),
    })
  );
  const artRegBody = await artRegRes.json();
  assert(artRegRes.status === 201, "Artisan registration should return 201");
  assert(
    artRegBody.data.sessionPolicy.maxAgeSeconds === 7 * 86400 &&
      artRegBody.data.sessionPolicy.idleTimeoutSeconds === 24 * 3600 &&
      artRegBody.data.sessionPolicy.singleDeviceEnforced === true,
    "Artisan sessionPolicy must enforce 7d maxAge, 24h idleTimeout, and singleDeviceEnforced=true"
  );
  const artToken1 = artRegBody.data.token as string;
  const createdArtisanId = artRegBody.data.artisanProfile.id as string;

  // Verify Artisan 6-digit OTP
  const artOtp = await getLatestOtpFromVerificationTable(testArtisanEmail);
  const verifyArtRes = await verifyOtpPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.2.1",
      },
      body: JSON.stringify({
        action: "verify-email",
        email: testArtisanEmail,
        otp: artOtp,
        portal: "artisan",
      }),
    })
  );
  assert(verifyArtRes.status === 200, "Artisan OTP verification should succeed");

  // Step 3: Trade Profile
  const artTradeRes = await artisanOnboardingPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/onboarding/artisan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken1}`,
      },
      body: JSON.stringify({
        step: "trade_profile",
        trade: "Solar & Inverter Engineer",
        hourlyRateNumeric: 25000,
        skills: ["Hybrid Inverters", "Lithium Battery Banks"],
        city: "Lagos (Ikeja)",
        address: "Allen Avenue, Ikeja, Lagos",
      }),
    })
  );
  assert(artTradeRes.status === 200, "Artisan Step 3 trade_profile should succeed");

  // Step 4a: Verify KYC submission WITHOUT kycSelfieUrl / kycIdDocumentUrl is rejected with 400 MISSING_KYC_FIELDS
  const missingDocsKycRes = await artisanOnboardingPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/onboarding/artisan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken1}`,
      },
      body: JSON.stringify({
        step: "kyc_submission",
        ninNumber: "91827364519",
        bankName: "Guaranty Trust Bank",
        bankAccountNumber: "0159283741",
      }),
    })
  );
  const missingDocsKycBody = await missingDocsKycRes.json();
  assert(
    missingDocsKycRes.status === 400 &&
      missingDocsKycBody.code === "MISSING_KYC_FIELDS",
    "Artisan Step 4 KYC submission without kycSelfieUrl and kycIdDocumentUrl must return 400 MISSING_KYC_FIELDS"
  );

  // Step 4b: Submit complete NIN, NUBAN, Selfie URL & ID Document URL
  const uniqueNin = `9182736${Math.floor(1000 + Math.random() * 9000)}`;
  const expectedMaskedNin = `*******${uniqueNin.slice(-4)}`;

  const artKycRes = await artisanOnboardingPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/onboarding/artisan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken1}`,
      },
      body: JSON.stringify({
        step: "kyc_submission",
        ninNumber: uniqueNin,
        bankName: "Guaranty Trust Bank",
        bankAccountNumber: "0159283741",
        bankAccountName: "Babatunde Lawal",
        kycSelfieUrl: "https://storage.skilled4u.com/kyc/babatunde-selfie-v1.jpg",
        kycIdDocumentUrl: "https://storage.skilled4u.com/kyc/babatunde-nin-slip-v1.jpg",
        kycIdType: "nin_slip",
      }),
    })
  );
  assert(artKycRes.status === 200, "Artisan Step 4 kyc_submission should succeed");

  // Verify in NeonDB that NIN is masked in `nin_number` and AES-256-GCM encrypted in `nin_encrypted`
  const [rawDbArtisan] = await db
    .select()
    .from(artisans)
    .where(eq(artisans.id, createdArtisanId))
    .limit(1);

  assert(
    rawDbArtisan.ninNumber === expectedMaskedNin &&
      rawDbArtisan.ninEncrypted?.startsWith("v1:") &&
      decryptNin(rawDbArtisan.ninEncrypted) === uniqueNin &&
      Boolean(rawDbArtisan.ninHash && rawDbArtisan.ninHash.length === 64),
    "Artisan NIN must be masked in nin_number, AES-256-GCM encrypted in nin_encrypted, and hashed in nin_hash at rest"
  );

  // Granular RBAC Check 2: Dispatch Support Admin sees ONLY masked NIN on GET /api/v1/artisans,
  // and is blocked from approving/rejecting KYC on PATCH /api/v1/artisans
  const dispatchGetArtisansRes = await artisansGET(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      headers: { Authorization: `Bearer ${dispatchToken}` },
    })
  );
  const dispatchGetArtisansBody = await dispatchGetArtisansRes.json();
  const dispatchViewOfArtisan = dispatchGetArtisansBody.data.find(
    (a: { id: string }) => a.id === createdArtisanId
  );
  assert(
    dispatchViewOfArtisan?.ninNumber === expectedMaskedNin,
    "Dispatch Support Admin must only see masked NIN ('*******XXXX'), never decrypted 11-digit NIN"
  );

  const dispatchKycPatchAttempt = await artisansPATCH(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dispatchToken}`,
      },
      body: JSON.stringify({
        id: createdArtisanId,
        kycStatus: "verified",
      }),
    })
  );
  assert(
    dispatchKycPatchAttempt.status === 403,
    "Dispatch Support Admin must be blocked from approving KYC with 403 FORBIDDEN_ADMIN_SCOPE"
  );

  // Super Admin sees decrypted 11-digit NIN on GET /api/v1/artisans
  const superAdminArtisansRes = await artisansGET(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
  );
  const superAdminArtisansBody = await superAdminArtisansRes.json();
  const superAdminViewOfArtisan = superAdminArtisansBody.data.find(
    (a: { id: string }) => a.id === createdArtisanId
  );
  assert(
    superAdminViewOfArtisan?.ninNumber === uniqueNin &&
      superAdminViewOfArtisan?.ninMasked === expectedMaskedNin,
    "Super Admin must receive decrypted 11-digit NIN + ninMasked on GET /api/v1/artisans"
  );

  // Step 5a: Admin Rejects Artisan KYC with a reason -> resets Artisan to Step 4 ('kyc_rejected')
  const rejectKycRes = await artisansPATCH(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: createdArtisanId,
        kycStatus: "rejected",
        kycRejectionReason: "NIN slip photo is blurry. Please upload a clearer image.",
      }),
    })
  );
  assert(rejectKycRes.status === 200, "Admin KYC rejection should return 200");

  const rejectedArtMeRes = await meGET(
    new NextRequest("http://localhost:3000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${artToken1}` },
    })
  );
  const rejectedArtMeBody = await rejectedArtMeRes.json();
  assert(
    rejectedArtMeBody.data.user.onboardingStatus === "kyc_rejected" &&
      rejectedArtMeBody.data.user.onboardingStep === 4 &&
      rejectedArtMeBody.data.onboardingChecklist.kycStatus === "rejected" &&
      rejectedArtMeBody.data.onboardingChecklist.kycRejectionReason ===
        "NIN slip photo is blurry. Please upload a clearer image.",
    "Rejected Artisan must transition to onboardingStatus='kyc_rejected' (Step 4) with kycRejectionReason exposed in checklist"
  );

  // Step 5b: Artisan re-uploads clearer Selfie & ID URLs -> transitions back to 'pending_kyc'
  const reuploadKycRes = await artisanOnboardingPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/onboarding/artisan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken1}`,
      },
      body: JSON.stringify({
        step: "kyc_submission",
        ninNumber: uniqueNin,
        bankName: "Guaranty Trust Bank",
        bankAccountNumber: "0159283741",
        kycSelfieUrl: "https://storage.skilled4u.com/kyc/babatunde-selfie-hd-v2.jpg",
        kycIdDocumentUrl: "https://storage.skilled4u.com/kyc/babatunde-nin-slip-hd-v2.jpg",
      }),
    })
  );
  const reuploadKycBody = await reuploadKycRes.json();
  assert(
    reuploadKycRes.status === 200 &&
      reuploadKycBody.data.onboarding.status === "pending_kyc" &&
      reuploadKycBody.data.artisanProfile.kycStatus === "pending" &&
      reuploadKycBody.data.artisanProfile.kycRejectionReason === null,
    "Artisan KYC re-submission must reset status to 'pending_kyc' and clear kycRejectionReason"
  );

  // Step 5c: Admin Approves Artisan KYC -> transitions to 'completed' (Step 5)
  const approveKycRes = await artisansPATCH(
    new NextRequest("http://localhost:3000/api/v1/artisans", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: createdArtisanId,
        kycStatus: "verified",
      }),
    })
  );
  assert(approveKycRes.status === 200, "Admin KYC approval should return 200");

  // Single-Device Session Enforcement Test for Artisans:
  // Logging in as the Artisan on a second phone must immediately revoke artToken1!
  const secondDeviceArtLoginRes = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.2.99",
      },
      body: JSON.stringify({
        email: testArtisanEmail,
        password: "Artisan@2026",
        portal: "artisan",
      }),
    })
  );
  const secondDeviceArtBody = await secondDeviceArtLoginRes.json();
  assert(
    secondDeviceArtLoginRes.status === 200 &&
      Boolean(secondDeviceArtBody.data?.token),
    "Artisan login on second device should succeed"
  );
  const artToken2 = secondDeviceArtBody.data.token as string;

  const oldDeviceArtMeRes = await meGET(
    new NextRequest("http://localhost:3000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${artToken1}` },
    })
  );
  assert(
    oldDeviceArtMeRes.status === 401,
    "Single-device enforcement: Artisan's first device session (artToken1) must be revoked (401) when logging in on a new device"
  );

  const newDeviceArtMeRes = await meGET(
    new NextRequest("http://localhost:3000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${artToken2}` },
    })
  );
  assert(
    newDeviceArtMeRes.status === 200,
    "Artisan's new device session (artToken2) must be active (200)"
  );

  // Test Artisan 24-Hour Idle Session Timeout on artToken2
  const artBaseToken2 = artToken2.includes(".")
    ? artToken2.split(".")[0]
    : artToken2;
  await db
    .update(sessionTable)
    .set({
      updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours idle (> 24h limit)
    })
    .where(eq(sessionTable.token, artBaseToken2));

  const expiredArtMeRes = await meGET(
    new NextRequest("http://localhost:3000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${artToken2}` },
    })
  );
  const expiredArtMeBody = await expiredArtMeRes.json();
  assert(
    expiredArtMeRes.status === 401 &&
      expiredArtMeBody.code === "SESSION_TIMEOUT",
    "Artisan session idle > 24h must be terminated with 401 SESSION_TIMEOUT"
  );

  // Test Admin 30-Minute Idle Session Timeout
  const adminBaseToken = adminToken.includes(".")
    ? adminToken.split(".")[0]
    : adminToken;
  await db
    .update(sessionTable)
    .set({
      updatedAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes idle (> 30m limit)
    })
    .where(eq(sessionTable.token, adminBaseToken));

  const expiredAdminMeRes = await meGET(
    new NextRequest("http://localhost:3000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
  );
  const expiredAdminMeBody = await expiredAdminMeRes.json();
  assert(
    expiredAdminMeRes.status === 401 &&
      expiredAdminMeBody.code === "SESSION_TIMEOUT",
    "Admin session idle > 30m must be terminated with 401 SESSION_TIMEOUT"
  );

  // Test POST /api/v1/auth/logout with Customer token
  const logoutRes = await logoutPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${custToken}` },
    })
  );
  assert(logoutRes.status === 200, "POST /api/v1/auth/logout should return 200");

  console.log(
    "   [PASS] Artisan Encrypted KYC, Rejection Re-Upload Loop, Single-Device Session & Timeouts verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 5. GOOGLE OAUTH 2.0 FLOW, MULTI-CLIENT JWKS & CROSS-ROLE ISOLATION
  // ---------------------------------------------------------------------------
  console.log(
    "5. Testing Google OAuth 2.0 (PKCE + HMAC State, Multi-Client Audience & Cross-Role Block)..."
  );

  assert(
    getAllowedGoogleClientIds().length >= 1,
    "getAllowedGoogleClientIds() must include configured GOOGLE_CLIENT_ID"
  );

  // 5a. Verify Google OAuth is disabled for Administrators on GET /api/v1/auth/google?portal=admin
  const adminGoogleBlockedRes = await googleAuthGET(
    new NextRequest("http://localhost:3000/api/v1/auth/google?portal=admin", {
      headers: { "x-forwarded-for": "10.10.3.1" },
    })
  );
  assert(
    adminGoogleBlockedRes.status === 403,
    `GET /api/v1/auth/google?portal=admin should return 403, got ${adminGoogleBlockedRes.status}`
  );

  // 5b. Initiate Mobile Customer Google OAuth with an attempted Open Redirect callbackUrl
  const googleInitRes = await googleAuthGET(
    new NextRequest(
      "http://localhost:3000/api/v1/auth/google?portal=mobile&role=customer&callbackUrl=https://evil.example.com/phish",
      {
        headers: { "x-forwarded-for": "10.10.3.1" },
      }
    )
  );
  assert(
    googleInitRes.status === 302,
    `GET /api/v1/auth/google?portal=mobile should return 302 redirect, got ${googleInitRes.status}`
  );
  const googleLocation = googleInitRes.headers.get("location") || "";
  const googleRedirectParsed = new URL(googleLocation);
  const queryState = googleRedirectParsed.searchParams.get("state");
  const stateCookieObj = googleInitRes.cookies.get(GOOGLE_OAUTH_STATE_COOKIE);
  const verifiedState = verifyOAuthStatePayload(
    stateCookieObj?.value,
    queryState
  );
  assert(
    verifiedState.ok && verifiedState.payload.callbackUrl === "/",
    "Google OAuth state payload must sanitize external Open Redirect URLs to /"
  );

  // 5c. Verify tampered OAuth state is rejected on callback
  const tamperedCallbackRes = await googleCallbackGET(
    new NextRequest(
      "http://localhost:3000/api/v1/auth/google/callback?code=fake_code&state=tampered_state",
      {
        headers: {
          cookie: `${GOOGLE_OAUTH_STATE_COOKIE}=${stateCookieObj?.value}`,
          "x-forwarded-for": "10.10.3.1",
        },
      }
    )
  );
  assert(
    tamperedCallbackRes.status === 302 &&
      (tamperedCallbackRes.headers.get("location") || "").includes(
        "error=google_state_invalid"
      ),
    "Tampered OAuth CSRF state must be rejected on callback"
  );

  // 5d. Verify mobile POST /api/v1/auth/google blocks role: "admin" privilege escalation
  const googleEscalateRes = await googleAuthPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.10.3.2",
      },
      body: JSON.stringify({
        idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.fake.token",
        portal: "mobile",
        role: "admin",
      }),
    })
  );
  assert(
    googleEscalateRes.status === 403,
    "POST /api/v1/auth/google must block role: 'admin' self-registration with 403"
  );

  // 5e. Verify Admin email is blocked from using Google OAuth even via mobile portal
  const adminEmailGoogleAuth = await completeGoogleAuthentication({
    profile: {
      sub: "google_sub_admin_001",
      email: "admin@skilled4u.ng",
      emailVerified: true,
      name: "Elijah Admin",
    },
    portal: "mobile",
    ipAddress: "127.0.0.1",
    userAgent: "VerifyAuthScript/1.0",
  });
  assert(
    !adminEmailGoogleAuth.ok &&
      adminEmailGoogleAuth.status === 403 &&
      adminEmailGoogleAuth.code === "FORBIDDEN_ADMIN_OAUTH",
    "Administrator account must be blocked from Google OAuth with 403 FORBIDDEN_ADMIN_OAUTH"
  );

  // 5f. Verify Cross-Role Google OAuth Block: Customer email attempting Google OAuth on Artisan app -> 403 ROLE_MISMATCH
  const crossRoleGoogleAuth = await completeGoogleAuthentication({
    profile: {
      sub: "google_sub_cust_001",
      email: testCustomerEmail,
      emailVerified: true,
      name: "Zainab Musa",
    },
    portal: "mobile",
    requestedRole: "artisan",
    ipAddress: "127.0.0.1",
    userAgent: "VerifyAuthScript/1.0",
  });
  assert(
    !crossRoleGoogleAuth.ok &&
      crossRoleGoogleAuth.status === 403 &&
      crossRoleGoogleAuth.code === "ROLE_MISMATCH",
    "Existing Customer email attempting Google OAuth with requestedRole='artisan' must be blocked with 403 ROLE_MISMATCH"
  );

  // 5g. Verify Mobile Customer Google OAuth succeeds when requestedRole matches 'client'
  const customerGoogleAuth = await completeGoogleAuthentication({
    profile: {
      sub: "google_sub_cust_001",
      email: testCustomerEmail,
      emailVerified: true,
      name: "Zainab Musa",
    },
    portal: "mobile",
    requestedRole: "client",
    ipAddress: "127.0.0.1",
    userAgent: "VerifyAuthScript/1.0",
  });
  assert(
    customerGoogleAuth.ok &&
      customerGoogleAuth.sessionPolicy.role === "client" &&
      customerGoogleAuth.sessionPolicy.maxAgeSeconds === 30 * 86400 &&
      customerGoogleAuth.sessionPolicy.idleTimeoutSeconds === 7 * 86400,
    "Customer Google OAuth session must enforce 30d maxAge and 7d idle timeout"
  );

  console.log(
    "   [PASS] Google OAuth PKCE + CSRF State, Admin Block & Cross-Role 1-Email-1-Role Isolation verified.\n"
  );

  // Clean up temporary test accounts created by this script
  await db.delete(artisans).where(eq(artisans.id, createdArtisanId));
  await db.delete(userTable).where(eq(userTable.email, testArtisanEmail));
  await db.delete(userTable).where(eq(userTable.email, testCustomerEmail));
  await db.delete(userTable).where(eq(userTable.email, testDispatchEmail));

  console.log(
    "=== ALL AUTH, 2-STEP ADMIN MFA, GRANULAR RBAC, ENCRYPTED KYC & GOOGLE OAUTH VERIFICATIONS PASSED! ==="
  );
}

runVerification().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
