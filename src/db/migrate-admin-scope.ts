import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { sql } from "drizzle-orm";
import { db } from "./index";
import { user } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Migrating admin_scope and admin_audit_logs...");

  // 1. Add column if not exists
  await db.execute(
    sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "admin_scope" text;`
  );

  // 2. Create audit log table if not exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
      "id" text PRIMARY KEY,
      "actor_id" text REFERENCES "user"("id") ON DELETE SET NULL,
      "actor_email" text NOT NULL,
      "action" text NOT NULL,
      "target_user_id" text,
      "target_user_email" text,
      "target_role" text,
      "details" jsonb,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  // 3. Backfill existing admins
  const adminUsers = await db
    .select()
    .from(user)
    .where(eq(user.role, "admin"));

  console.log(`Found ${adminUsers.length} admin accounts to inspect.`);

  for (const adm of adminUsers) {
    if (!adm.adminScope) {
      let resolved = "super_admin";
      const title = (adm.adminRoleTitle || "").toLowerCase();
      const perms = (adm.adminPermissions || "").toLowerCase();

      if (
        title.includes("kyc") ||
        title.includes("trust") ||
        title.includes("moderator") ||
        perms.includes("kyc")
      ) {
        resolved = "kyc_moderator";
      } else if (
        title.includes("dispatch") ||
        title.includes("support") ||
        title.includes("helpdesk")
      ) {
        resolved = "dispatch_support";
      }

      await db
        .update(user)
        .set({ adminScope: resolved })
        .where(eq(user.id, adm.id));

      console.log(`Backfilled admin ${adm.email} (${adm.adminRoleTitle}) -> adminScope = ${resolved}`);
    }
  }

  console.log("Migration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
