import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import { artisans, emailLogs, user as userTable } from "./schema";
import { auth } from "../lib/auth";
import { POST as registerPOST } from "../app/api/v1/auth/register/route";
import { POST as verifyOtpPOST } from "../app/api/v1/auth/verify-otp/route";
import { GET as meGET } from "../app/api/v1/auth/me/route";
import { POST as customerOnboardingPOST } from "../app/api/v1/auth/onboarding/customer/route";
import { POST as artisanOnboardingPOST } from "../app/api/v1/auth/onboarding/artisan/route";
import { PATCH as artisansPATCH } from "../app/api/v1/artisans/route";
import { POST as resendWebhookPOST } from "../app/api/webhooks/resend/route";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function getLatestOtpForEmail(email: string): Promise<string> {
  const rows = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.toEmail, email))
    .orderBy(desc(emailLogs.createdAt))
    .limit(5);

  for (const row of rows) {
    const meta = row.metadata as Record<string, unknown> | null;
    if (meta && typeof meta.otp === "string") {
      return meta.otp;
    }
  }
  throw new Error(`No OTP found in NeonDB email_logs for ${email}`);
}

async function runVerification() {
  console.log(
    "=== STARTING END-TO-END AUTH, ONBOARDING, RESEND & NEONDB VERIFICATION ===\n"
  );

  // ---------------------------------------------------------------------------
  // 1. WEB ADMIN FLOW: Password Sign-In, Bearer Session, & 6-Digit Email OTP
  // ---------------------------------------------------------------------------
  console.log(
    "1. Testing Web Admin Authentication (Password + 6-Digit Resend OTP)..."
  );
  const adminSignIn = await auth.api.signInEmail({
    body: {
      email: "admin@skilled4u.ng",
      password: "Admin@2026",
    },
  });
  assert(
    adminSignIn.token,
    "Admin password sign-in should return a session token"
  );
  assert(
    (adminSignIn.user as { role?: string }).role === "admin",
    "Admin user should have role === 'admin'"
  );

  // Verify /api/v1/auth/me with Bearer token
  const adminMeReq = new NextRequest("http://localhost:3000/api/v1/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminSignIn.token}`,
    },
  });
  const adminMeRes = await meGET(adminMeReq);
  const adminMeBody = await adminMeRes.json();
  assert(
    adminMeRes.status === 200,
    "GET /api/v1/auth/me for Admin should return 200"
  );
  assert(
    adminMeBody.data.onboardingChecklist.adminAccessActive === true,
    "Admin onboardingChecklist.adminAccessActive should be true"
  );

  // Send 6-digit OTP to Admin and sign in with OTP
  const sendAdminOtpReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        email: "admin@skilled4u.ng",
        type: "sign-in",
      }),
    }
  );
  const sendAdminOtpRes = await verifyOtpPOST(sendAdminOtpReq);
  assert(sendAdminOtpRes.status === 200, "Admin OTP send should return 200");
  const adminOtp = await getLatestOtpForEmail("admin@skilled4u.ng");
  assert(
    adminOtp.length === 6,
    `Admin OTP should be 6 digits (got ${adminOtp})`
  );

  const signInAdminOtpReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sign-in",
        email: "admin@skilled4u.ng",
        otp: adminOtp,
      }),
    }
  );
  const signInAdminOtpRes = await verifyOtpPOST(signInAdminOtpReq);
  const signInAdminOtpBody = await signInAdminOtpRes.json();
  assert(
    signInAdminOtpRes.status === 200 && Boolean(signInAdminOtpBody.data?.token),
    "Admin passwordless 6-digit OTP sign-in should succeed and return token"
  );
  console.log(
    "   [PASS] Web Admin Password + 6-Digit Email OTP Sign-In + Bearer Session verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 2. CUSTOMER MOBILE APP FLOW: Register -> Verify 6-Digit OTP -> Complete Onboarding
  // ---------------------------------------------------------------------------
  console.log(
    "2. Testing Customer Mobile App Registration, OTP Verification & Onboarding..."
  );
  const testCustomerEmail = `zainab.verify.${Date.now()}@skilled4u.ng`;

  const custRegReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Zainab Musa",
        email: testCustomerEmail,
        password: "Customer@2026",
        role: "customer",
        phone: "+234 803 111 2233",
        city: "Abuja (Garki)",
      }),
    }
  );
  const custRegRes = await registerPOST(custRegReq);
  const custRegBody = await custRegRes.json();
  assert(custRegRes.status === 201, "Customer registration should return 201");
  assert(
    custRegBody.data.user.role === "client",
    "Customer role should be normalized to 'client'"
  );
  assert(
    custRegBody.data.user.onboardingStatus === "in_progress" &&
      custRegBody.data.user.onboardingStep === 1,
    "New customer should start at onboardingStep 1 ('in_progress')"
  );
  const custToken = custRegBody.data.token as string;
  assert(
    Boolean(custToken),
    "Customer registration should issue a Bearer session token"
  );

  // Retrieve 6-digit verification OTP sent via Resend in NeonDB email_logs
  const custOtp = await getLatestOtpForEmail(testCustomerEmail);
  assert(
    custOtp.length === 6,
    `Customer verification OTP should be 6 digits (got ${custOtp})`
  );

  // Verify Email OTP
  const verifyCustReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify-email",
        email: testCustomerEmail,
        otp: custOtp,
      }),
    }
  );
  const verifyCustRes = await verifyOtpPOST(verifyCustReq);
  const verifyCustBody = await verifyCustRes.json();
  assert(
    verifyCustRes.status === 200,
    "Customer OTP verification should return 200"
  );
  assert(
    verifyCustBody.data.user.emailVerified === true &&
      verifyCustBody.data.user.onboardingStep === 2,
    "Verified customer should have emailVerified=true and onboardingStep=2"
  );

  // Complete Customer Mobile Onboarding using Bearer token
  const custOnboardReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/onboarding/customer",
    {
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
    }
  );
  const custOnboardRes = await customerOnboardingPOST(custOnboardReq);
  const custOnboardBody = await custOnboardRes.json();
  assert(
    custOnboardRes.status === 200,
    "Customer onboarding completion should return 200"
  );
  assert(
    custOnboardBody.data.user.onboardingStatus === "completed" &&
      custOnboardBody.data.user.onboardingStep === 3 &&
      custOnboardBody.data.welcomeEmailSent === true,
    "Completed customer should have onboardingStatus='completed', step=3, and welcomeEmailSent=true"
  );
  console.log(
    "   [PASS] Customer Mobile Registration -> Resend 6-Digit OTP -> Bearer Onboarding verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 3. ARTISAN MOBILE APP FLOW: Register -> OTP -> Trade Profile -> NIN/NUBAN KYC -> Admin Approval
  // ---------------------------------------------------------------------------
  console.log(
    "3. Testing Artisan Mobile Multi-Step Onboarding & Admin KYC Approval..."
  );
  const testArtisanEmail = `babatunde.verify.${Date.now()}@skilled4u.ng`;

  const artRegReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Babatunde Lawal",
        email: testArtisanEmail,
        password: "Artisan@2026",
        role: "artisan",
        phone: "+234 809 444 5566",
        city: "Lagos (Ikeja)",
        trade: "Solar & Inverter Engineer",
      }),
    }
  );
  const artRegRes = await registerPOST(artRegReq);
  const artRegBody = await artRegRes.json();
  assert(artRegRes.status === 201, "Artisan registration should return 201");
  assert(
    artRegBody.data.user.role === "artisan",
    "User role should be 'artisan'"
  );
  assert(
    artRegBody.data.artisanProfile?.userId === artRegBody.data.user.id,
    "Artisan profile in NeonDB should be linked to user.id"
  );
  const artToken = artRegBody.data.token as string;
  const createdArtisanId = artRegBody.data.artisanProfile.id as string;

  // Verify Artisan 6-digit OTP
  const artOtp = await getLatestOtpForEmail(testArtisanEmail);
  const verifyArtReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify-email",
        email: testArtisanEmail,
        otp: artOtp,
      }),
    }
  );
  const verifyArtRes = await verifyOtpPOST(verifyArtReq);
  assert(
    verifyArtRes.status === 200,
    "Artisan email OTP verification should return 200"
  );

  // Step 3: Submit Trade & Rate Profile via Bearer Token
  const artTradeReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/onboarding/artisan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken}`,
      },
      body: JSON.stringify({
        step: "trade_profile",
        trade: "Solar & Inverter Engineer",
        hourlyRateNumeric: 25000,
        skills: [
          "Hybrid Inverters",
          "Lithium Battery Banks",
          "Changeover Panels",
        ],
        city: "Lagos (Ikeja)",
        address: "Allen Avenue, Ikeja, Lagos",
      }),
    }
  );
  const artTradeRes = await artisanOnboardingPOST(artTradeReq);
  const artTradeBody = await artTradeRes.json();
  assert(
    artTradeRes.status === 200,
    "Artisan Step 3 trade_profile should return 200"
  );
  assert(
    artTradeBody.data.onboarding.step === 3 &&
      artTradeBody.data.onboarding.status === "in_progress",
    "Artisan after trade_profile should be at step 3 ('in_progress')"
  );

  // Step 4: Submit NIN & NUBAN Bank KYC via Bearer Token
  const artKycReq = new NextRequest(
    "http://localhost:3000/api/v1/auth/onboarding/artisan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${artToken}`,
      },
      body: JSON.stringify({
        step: "kyc_submission",
        ninNumber: "91827364519",
        bankName: "Guaranty Trust Bank",
        bankAccountNumber: "0159283741",
        bankAccountName: "Babatunde Lawal",
      }),
    }
  );
  const artKycRes = await artisanOnboardingPOST(artKycReq);
  const artKycBody = await artKycRes.json();
  assert(
    artKycRes.status === 200,
    "Artisan Step 4 kyc_submission should return 200"
  );
  assert(
    artKycBody.data.onboarding.step === 4 &&
      artKycBody.data.onboarding.status === "pending_kyc" &&
      artKycBody.data.artisanProfile.kycStatus === "pending",
    "Artisan after KYC submission should be at step 4 ('pending_kyc')"
  );

  // Step 5: Admin Approves Artisan KYC via PATCH /api/v1/artisans
  const approveKycReq = new NextRequest(
    "http://localhost:3000/api/v1/artisans",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: createdArtisanId,
        kycStatus: "verified",
      }),
    }
  );
  const approveKycRes = await artisansPATCH(approveKycReq);
  const approveKycBody = await approveKycRes.json();
  assert(approveKycRes.status === 200, "Admin KYC approval should return 200");
  assert(
    approveKycBody.data.kycStatus === "verified",
    "Artisan kycStatus should be 'verified'"
  );

  // Confirm user table in NeonDB synced to step 5 ('completed') and 'verified'
  const [verifiedArtisanUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, artRegBody.data.user.id))
    .limit(1);
  assert(
    verifiedArtisanUser.onboardingStatus === "completed" &&
      verifiedArtisanUser.onboardingStep === 5 &&
      verifiedArtisanUser.accountStatus === "verified",
    "Artisan user record in NeonDB should be synced to onboardingStatus='completed', step=5, accountStatus='verified'"
  );
  console.log(
    "   [PASS] Artisan Mobile Multi-Step Onboarding (Steps 1..5) + Admin KYC Approval verified.\n"
  );

  // ---------------------------------------------------------------------------
  // 4. RESEND INBOUND EMAIL RECEIVING WEBHOOK VERIFICATION
  // ---------------------------------------------------------------------------
  console.log(
    "4. Testing Resend Inbound Email Receiving Webhook (POST /api/webhooks/resend)..."
  );
  const inboundWebhookReq = new NextRequest(
    "http://localhost:3000/api/webhooks/resend",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email.received",
        created_at: new Date().toISOString(),
        data: {
          email_id: `re_inb_${Date.now()}`,
          from: "amina.bello@gmail.com",
          to: ["support@skilled4u.ng"],
          subject: "Escrow Release Confirmation for Plumbing Job #S4U-2026-8812",
          text: "Hello Skilled4U Support, Emeka completed the plumbing repair in Wuse II. Please release the 90% escrow payout.",
        },
      }),
    }
  );
  const inboundWebhookRes = await resendWebhookPOST(inboundWebhookReq);
  const inboundWebhookBody = await inboundWebhookRes.json();
  assert(
    inboundWebhookRes.status === 200 &&
      inboundWebhookBody.received === true &&
      inboundWebhookBody.direction === "inbound",
    "Resend inbound email webhook should return 200 and store inbound email"
  );

  const [storedInbound] = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.id, inboundWebhookBody.logId))
    .limit(1);
  assert(
    storedInbound &&
      storedInbound.direction === "inbound" &&
      storedInbound.status === "received",
    "Inbound email should be persisted in NeonDB email_logs with direction='inbound' and status='received'"
  );
  console.log(
    "   [PASS] Resend Inbound Email Webhook & NeonDB email_logs persistence verified.\n"
  );

  // Clean up temporary test customer & artisan accounts created by this script
  await db.delete(artisans).where(eq(artisans.id, createdArtisanId));
  await db.delete(userTable).where(eq(userTable.email, testArtisanEmail));
  await db.delete(userTable).where(eq(userTable.email, testCustomerEmail));

  console.log(
    "=== ALL AUTHENTICATION, ONBOARDING, RESEND & NEONDB VERIFICATIONS PASSED! ==="
  );
}

runVerification().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});

