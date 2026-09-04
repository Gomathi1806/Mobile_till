/**
 * Lazy Drizzle client for Neon Postgres.
 *
 * Why lazy? `neon(process.env.DATABASE_URL!)` at module top-level THROWS when
 * DATABASE_URL is unset, which happens during `next build` on a fresh clone
 * or before the Marketplace integration provisions env vars. Making the
 * client lazy means the failure only surfaces at runtime, on the first
 * actual query — by which point the env var must exist or the request would
 * fail anyway.
 *
 * We use a plain `let` cache rather than a Proxy wrapper — Proxies break
 * introspection by libraries (Auth.js checks adapter method existence by
 * property access, which a Proxy intercepts and derails).
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — the Neon integration must be installed on " +
        "this Vercel project. Run `vercel env pull` locally to fetch it.",
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

let cached: Db | null = null;

export function getDb(): Db {
  if (!cached) cached = createDb();
  return cached;
}

// Re-export the schema tables + sequence for ergonomic imports.
export { invoices, invoiceLines, invoiceNumberSeq } from "./schema";
export type { Invoice, NewInvoice, InvoiceLine, NewInvoiceLine } from "./schema";
