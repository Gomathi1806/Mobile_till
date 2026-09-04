/**
 * Database schema — invoices + line items + a Postgres sequence for
 * sequential invoice numbers.
 *
 * Sequential numbering is what HMRC and every auditor expects: a strictly
 * increasing counter, no gaps that can't be explained. A DB sequence gives us
 * that atomically even under concurrent writes.
 */

import {
  pgTable,
  pgSequence,
  uuid,
  text,
  date,
  timestamp,
  numeric,
  integer,
  index,
} from "drizzle-orm/pg-core";

/** Strictly-increasing counter behind INV-YYYY-000042 style numbers. */
export const invoiceNumberSeq = pgSequence("invoice_number_seq", {
  startWith: 1,
});

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull().unique(),
    invoiceDate: date("invoice_date").notNull(),
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    customerAddress: text("customer_address"),
    /** Grand total (subtotal in a no-VAT world). */
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("£"),
    /** Path inside the (private) Blob store where the PDF lives. */
    blobPathname: text("blob_pathname"),
    /** Full Blob URL. Only used when the store is public; kept nullable so we
     *  can migrate to private storage without a schema change. */
    blobUrl: text("blob_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    // Reports queries hit these two constantly.
    dateIdx: index("invoices_invoice_date_idx").on(t.invoiceDate),
    createdIdx: index("invoices_created_at_idx").on(t.createdAt),
  }),
);

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    // 10.3 gives us 1234567.123 — plenty for kg with milligram-ish precision.
    quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
    unit: text("unit").notNull(),
    rate: numeric("rate", { precision: 12, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    lineNumber: integer("line_number").notNull(),
  },
  (t) => ({
    invoiceIdx: index("invoice_lines_invoice_id_idx").on(t.invoiceId),
  }),
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type NewInvoiceLine = typeof invoiceLines.$inferInsert;
