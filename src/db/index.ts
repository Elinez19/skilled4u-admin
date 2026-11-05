import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_bnVFW46HRuBS@ep-calm-dream-bdk3yjpp-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

