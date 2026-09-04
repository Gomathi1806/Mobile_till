import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import { BUSINESS } from "@/lib/catalog";
import { getDb, invoices, invoiceLines } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LinePayload = {
  name: string;
  qty: number;
  rate: number;
  unit: string;
};

type ApiResult = {
  ok: boolean;
  invoiceId: string | null;
  dbError: string | null;
  blobUrl: string | null;
  blobError: string | null;
  emailId: string | null;
  emailError: string | null;
};

function jsonError(
  message: string,
  status = 400,
): NextResponse<ApiResult> {
  return NextResponse.json(
    {
      ok: false,
      invoiceId: null,
      dbError: message,
      blobUrl: null,
      blobError: null,
      emailId: null,
      emailError: null,
    },
    { status },
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResult>> {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const log = (event: string, extra: Record<string, unknown> = {}) => {
    console.log(
      JSON.stringify({
        requestId,
        route: "/api/invoice",
        event,
        ms: Date.now() - startedAt,
        ...extra,
      }),
    );
  };

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch (e) {
    log("error.formdata", { message: (e as Error).message });
    return jsonError("Invalid form data");
  }

  const file = fd.get("pdf");
  const invoiceNumber = (fd.get("invoiceNumber") as string | null) ?? "INV";
  const invoiceDate = (fd.get("invoiceDate") as string | null) ?? new Date().toISOString().slice(0, 10);
  const customerEmail = (fd.get("customerEmail") as string | null) ?? "";
  const customerName = (fd.get("customerName") as string | null) ?? "";
  const customerAddress = (fd.get("customerAddress") as string | null) ?? "";
  const totalStr = (fd.get("total") as string | null) ?? "";
  const totalNumeric = (fd.get("totalNumeric") as string | null) ?? "0";
  const linesJson = (fd.get("linesJson") as string | null) ?? "[]";

  if (!(file instanceof Blob)) {
    log("error.missing_file");
    return jsonError("Missing pdf file");
  }

  let lines: LinePayload[];
  try {
    const parsed = JSON.parse(linesJson);
    if (!Array.isArray(parsed)) throw new Error("linesJson must be an array");
    lines = parsed;
  } catch (e) {
    log("error.parse_lines", { message: (e as Error).message });
    return jsonError("Invalid line items JSON");
  }

  const filename = `${invoiceNumber}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const totalDecimal = Number(totalNumeric);
  if (!Number.isFinite(totalDecimal)) {
    return jsonError("Invalid total");
  }

  log("received", {
    invoiceNumber,
    bytes: buffer.byteLength,
    lineCount: lines.length,
    hasEmail: !!customerEmail.trim(),
  });

  // 1) Record in Postgres FIRST — it's the source of truth for reports and
  //    reconciliation. Blob + email are backups that can fail without losing
  //    the transaction record.
  let invoiceId: string | null = null;
  let dbError: string | null = null;
  try {
    const db = getDb();
    const [row] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        invoiceDate,
        customerName: customerName.trim() || null,
        customerEmail: customerEmail.trim() || null,
        customerAddress: customerAddress.trim() || null,
        total: totalDecimal.toFixed(2),
      })
      .returning({ id: invoices.id });
    invoiceId = row.id;

    if (lines.length > 0) {
      await db.insert(invoiceLines).values(
        lines.map((l, i) => ({
          invoiceId: row.id,
          itemName: l.name,
          quantity: l.qty.toFixed(3),
          unit: l.unit,
          rate: l.rate.toFixed(2),
          amount: (l.qty * l.rate).toFixed(2),
          lineNumber: i + 1,
        })),
      );
    }
    log("db.inserted", { invoiceId, lineCount: lines.length });
  } catch (e) {
    dbError = e instanceof Error ? e.message : "DB insert failed";
    log("db.error", { message: dbError });
    // Don't hard-fail — still try Blob + email so the cashier isn't blocked.
  }

  // 2) Blob upload — best-effort backup of the PDF.
  let blobUrl: string | null = null;
  let blobError: string | null = null;
  let blobPathname: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await put(`invoices/${filename}`, buffer, {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: true,
      });
      blobUrl = result.url;
      blobPathname = result.pathname;
      log("blob.uploaded", { pathname: blobPathname });
      // Update the DB row with the blob URL so reports can link out to it.
      if (invoiceId) {
        try {
          const db = getDb();
          const { eq } = await import("drizzle-orm");
          await db
            .update(invoices)
            .set({ blobUrl, blobPathname })
            .where(eq(invoices.id, invoiceId));
        } catch (e) {
          log("db.update_blob_url_error", { message: (e as Error).message });
        }
      }
    } catch (e) {
      blobError = e instanceof Error ? e.message : "Blob upload failed";
      log("blob.error", { message: blobError });
    }
  } else {
    blobError = "BLOB_READ_WRITE_TOKEN not set — skipping upload";
    log("blob.skipped");
  }

  // 3) Email — only if a customer email was provided.
  let emailId: string | null = null;
  let emailError: string | null = null;

  const trimmedEmail = customerEmail.trim();
  if (trimmedEmail) {
    if (!process.env.RESEND_API_KEY) {
      emailError = "RESEND_API_KEY not set — skipping email";
      log("email.skipped");
    } else {
      const from =
        process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from: `${BUSINESS.name} <${from}>`,
          to: trimmedEmail,
          subject: `Invoice ${invoiceNumber} from ${BUSINESS.name}`,
          text: [
            `Hi ${customerName || "there"},`,
            ``,
            `Please find attached your invoice ${invoiceNumber}${totalStr ? ` for ${totalStr}` : ""}.`,
            ``,
            `Thank you for your business.`,
            ``,
            `${BUSINESS.name}`,
            `${BUSINESS.addressLine1}, ${BUSINESS.addressLine2}`,
            `${BUSINESS.phone}`,
          ].join("\n"),
          attachments: [
            {
              filename,
              content: buffer,
            },
          ],
        });
        if (error) {
          emailError = error.message ?? "Email send failed";
          log("email.error", { message: emailError });
        } else {
          emailId = data?.id ?? null;
          log("email.sent", { emailId });
        }
      } catch (e) {
        emailError = e instanceof Error ? e.message : "Email send failed";
        log("email.exception", { message: emailError });
      }
    }
  }

  log("done", {
    invoiceId,
    blobOk: !!blobUrl,
    emailOk: !!emailId,
    dbOk: !!invoiceId,
  });
  return NextResponse.json({
    ok: !!invoiceId,
    invoiceId,
    dbError,
    blobUrl,
    blobError,
    emailId,
    emailError,
  });
}
