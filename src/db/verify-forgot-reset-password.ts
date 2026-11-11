import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { NextRequest } from "next/server";
import { eq, desc, like } from "drizzle-orm";
import { db } from "./index";
import {
  session as sessionTable,
  user as userTable,
  verification as verificationTable,
} from "./schema";
import { POST as registerPOST } from "../app/api/v1/auth/register/route";
import { POST as loginPOST } from "../app/api/v1/auth/login/route";
import { POST as forgotPasswordPOST } from "../app/api/v1/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "../app/api/v1/auth/reset-password/route";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function run() {
  console.log("=== Testing Forgot Password & Reset Password Suite ===");

  const timestamp = Date.now();
  const testEmail = `pwd-reset-test-${timestamp}@skilled4u.ng`;
  const initialPassword = "OldPassword@2026!";
  const newPassword = "NewStrongPassword@2026!";

  // 1. Create a test customer user
  console.log("1. Creating test user...");
  const regRes = await registerPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Password Reset Tester",
        email: testEmail,
        password: initialPassword,
        role: "client",
      }),
    })
  );
  assert(regRes.status === 201, `User registration failed with status ${regRes.status}`);
  console.log("   [PASS] Test user registered successfully.");

  // 2. Request Forgot Password OTP
  console.log("2. Requesting forgot password OTP...");
  const forgotRes = await forgotPasswordPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        portal: "customer",
        deliveryMethod: "otp",
      }),
    })
  );
  assert(forgotRes.status === 200, `Forgot password POST failed with status ${forgotRes.status}`);
  const forgotBody = await forgotRes.json();
  assert(forgotBody.success === true, "Forgot password response must have success: true");
  console.log("   [PASS] Forgot password OTP requested successfully.");

  // 3. Inspect OTP code from verification table
  console.log("3. Fetching OTP from verification table...");
  const rows = await db
    .select()
    .from(verificationTable)
    .where(like(verificationTable.identifier, `%${testEmail.toLowerCase()}%`))
    .orderBy(desc(verificationTable.createdAt))
    .limit(5);

  let otpCode = "";
  for (const row of rows) {
    const rawVal = row.value.split(":")[0]?.trim() || "";
    if (/^\d{6}$/.test(rawVal)) {
      otpCode = rawVal;
      break;
    }
  }

  assert(Boolean(otpCode), "Expected 6-digit OTP code in verification table");
  console.log(`   [PASS] Found active OTP: ${otpCode}`);

  // 4. Test invalid password (less than 8 characters)
  console.log("4. Testing password policy validation (min 8 characters)...");
  const shortPassRes = await resetPasswordPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otp: otpCode,
        newPassword: "short",
        portal: "customer",
      }),
    })
  );
  assert(shortPassRes.status === 400, "Reset with short password must return 400");
  console.log("   [PASS] Short password correctly rejected.");

  // 5. Test successful password reset with valid OTP
  console.log("5. Testing successful reset with valid OTP...");
  const validResetRes = await resetPasswordPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otp: otpCode,
        newPassword: newPassword,
        portal: "customer",
      }),
    })
  );
  assert(validResetRes.status === 200, `Reset password failed with status ${validResetRes.status}`);
  const resetBody = await validResetRes.json();
  assert(resetBody.success === true, "Reset response must have success: true");
  console.log("   [PASS] Password reset successfully.");

  // 6. Verify login with OLD password fails
  console.log("6. Verifying old password no longer works...");
  const oldLoginRes = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: initialPassword,
        portal: "customer",
      }),
    })
  );
  assert(oldLoginRes.status === 401, "Login with old password must return 401");
  console.log("   [PASS] Old password rejected as expected.");

  // 7. Verify login with NEW password succeeds
  console.log("7. Verifying login with new password...");
  const newLoginRes = await loginPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword,
        portal: "customer",
      }),
    })
  );
  assert(newLoginRes.status === 200, `Login with new password failed with status ${newLoginRes.status}`);
  console.log("   [PASS] Login with new password succeeded.");

  // 8. Test invalid OTP rejection on already-consumed code
  console.log("8. Testing consumed/invalid OTP rejection...");
  const usedOtpRes = await resetPasswordPOST(
    new NextRequest("http://localhost:3000/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otp: otpCode,
        newPassword: "AnotherPassword123!",
        portal: "customer",
      }),
    })
  );
  assert(usedOtpRes.status === 400, "Used OTP must return 400");
  console.log("   [PASS] Used/invalid OTP correctly rejected.");

  // Clean up test user
  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, testEmail))
    .limit(1);
  if (dbUser) {
    await db.delete(sessionTable).where(eq(sessionTable.userId, dbUser.id));
    await db.delete(userTable).where(eq(userTable.id, dbUser.id));
    console.log("Cleaned up test user.");
  }

  console.log("\n=== ALL FORGOT PASSWORD & RESET PASSWORD TESTS PASSED! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
