import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import { BUSINESS } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiResult = {
  ok: boolean;
  blobUrl: string | null;
  blobError: string | null;
  emailId: string | null;
  emailError: string | null;
};

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
    return NextResponse.json(
      {
        ok: false,
        blobUrl: null,
        blobError: "Invalid form data",
        emailId: null,
        emailError: null,
      },
      { status: 400 },
    );
  }

  const file = fd.get("pdf");
  const invoiceNumber = (fd.get("invoiceNumber") as string | null) ?? "INV";
  const customerEmail = (fd.get("customerEmail") as string | null) ?? "";
  const customerName = (fd.get("customerName") as string | null) ?? "Customer";
  const total = (fd.get("total") as string | null) ?? "";

  if (!(file instanceof Blob)) {
    log("error.missing_file");
    return NextResponse.json(
      {
        ok: false,
        blobUrl: null,
        blobError: "Missing pdf file",
        emailId: null,
        emailError: null,
      },
      { status: 400 },
    );
  }

  const filename = `${invoiceNumber}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  log("received", { invoiceNumber, bytes: buffer.byteLength, hasEmail: !!customerEmail.trim() });

  let blobUrl: string | null = null;
  let blobError: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await put(`invoices/${filename}`, buffer, {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: true,
      });
      blobUrl = result.url;
      log("blob.uploaded");
    } catch (e) {
      blobError = e instanceof Error ? e.message : "Blob upload failed";
      log("blob.error", { message: blobError });
    }
  } else {
    blobError = "BLOB_READ_WRITE_TOKEN not set — skipping upload";
    log("blob.skipped");
  }

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
            `Please find attached your invoice ${invoiceNumber}${total ? ` for ${total}` : ""}.`,
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

  log("done", { blobOk: !!blobUrl, emailOk: !!emailId });
  return NextResponse.json({
    ok: true,
    blobUrl,
    blobError,
    emailId,
    emailError,
  });
}
