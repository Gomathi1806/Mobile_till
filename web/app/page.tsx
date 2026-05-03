"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Minus, Plus, Trash2, FileDown } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProductTiles } from "@/components/product-tiles";
import { CustomItemDialog } from "@/components/custom-item-dialog";
import { UnitSelector } from "@/components/unit-selector";

import { CURRENCY, unitLabel, type CatalogItem, type Unit } from "@/lib/catalog";
import { assetUrl } from "@/lib/asset-url";
import { InvoicePDF, type InvoiceData, type InvoiceLine } from "@/components/invoice-pdf";

type DraftLine = {
  uid: string;
  /** Catalog id if the line came from a tile, otherwise null for custom items. */
  itemId: string | null;
  /** Display name — source of truth for both the UI ticket and the PDF line. */
  name: string;
  /** Emoji or undefined — used as the thumbnail in the receipt list. */
  emoji?: string;
  /** Optional product photo URL; tile uses it, the receipt thumbnail too. */
  image?: string;
  /** Cashier-selected unit. Defaults to the catalog item's defaultUnit. */
  unit: Unit;
  /** Stored as strings so empty + invalid inputs don't get coerced to NaN/0. */
  qty: string;
  rate: string;
};

function makeUid() {
  return Math.random().toString(36).slice(2, 10);
}

function newInvoiceNumber() {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yyyymmdd}-${rnd}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [invoiceNumber] = useState(newInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(todayISO);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  // Load /logo.png once, convert to a data URL. Single source of truth for
  // both the page header and the embedded PDF logo. If the file is missing
  // we leave logoDataUrl undefined and both surfaces show the "FM" fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/logo.png", { cache: "no-cache" });
        if (!res.ok) return; // 404 → silent fallback
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => {
          if (!cancelled) setLogoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        /* silent — fallback is the monogram */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = useMemo(
    () =>
      lines.reduce((s, l) => {
        const q = Number(l.qty) || 0;
        const r = Number(l.rate) || 0;
        return s + q * r;
      }, 0),
    [lines]
  );

  function updateLine(uid: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  }

  function removeLine(uid: string) {
    setLines((prev) => prev.filter((l) => l.uid !== uid));
  }

  /**
   * Tap a catalog tile. POS pattern: if a line already exists for this item
   * AND the cashier hasn't changed its unit, bump qty. Otherwise add a new
   * line at the catalog default unit. (Two lines for the same item but
   * different units is intentional — e.g. 2 kg of brinjal AND 100 g of
   * brinjal can co-exist on one ticket.)
   */
  function addCatalogItem(item: CatalogItem) {
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.itemId === item.id && l.unit === item.defaultUnit,
      );
      if (existing) {
        const nextQty = (Number(existing.qty) || 0) + 1;
        return prev.map((l) =>
          l.uid === existing.uid ? { ...l, qty: String(nextQty) } : l,
        );
      }
      return [
        ...prev,
        {
          uid: makeUid(),
          itemId: item.id,
          name: item.name,
          emoji: item.emoji,
          image: item.image,
          unit: item.defaultUnit,
          qty: "1",
          rate: item.defaultRate != null ? String(item.defaultRate) : "",
        },
      ];
    });
  }

  function addCustomItem(name: string, rate: number, unit: Unit) {
    setLines((prev) => [
      ...prev,
      {
        uid: makeUid(),
        itemId: null,
        name,
        unit,
        qty: "1",
        rate: String(rate),
      },
    ]);
  }

  function bumpQty(uid: string, delta: number) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.uid !== uid) return l;
        const isWeightUnit = l.unit === "kg" || l.unit === "g";
        const minQty = isWeightUnit ? 0 : 1;
        const next = Math.max(minQty, (Number(l.qty) || 0) + delta);
        // For weight units keep up to 3 decimal places; integer units stay whole.
        const formatted = isWeightUnit
          ? String(Math.round(next * 1000) / 1000)
          : String(Math.round(next));
        return { ...l, qty: formatted };
      }),
    );
  }

  const validLines: InvoiceLine[] = lines
    .map((l): InvoiceLine | null => {
      const name = l.name.trim();
      const qty = Number(l.qty);
      const rate = Number(l.rate);
      if (
        !name ||
        !Number.isFinite(qty) ||
        qty <= 0 ||
        !Number.isFinite(rate) ||
        rate < 0
      ) {
        return null;
      }
      return { id: l.uid, name, qty, rate, unit: l.unit };
    })
    .filter((x): x is InvoiceLine => x !== null);

  const canSubmit = validLines.length > 0 && !generating;

  async function handleSubmit() {
    if (!canSubmit) return;
    setGenerating(true);
    const trimmedEmail = customerEmail.trim();

    try {
      const data: InvoiceData = {
        invoiceNumber,
        invoiceDate,
        customerName,
        customerAddress,
        lines: validLines,
        logoDataUrl,
      };

      // 1) Render PDF in the browser
      const blob = await pdf(<InvoicePDF data={data} />).toBlob();

      // 2) Trigger local download immediately
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // 3) Upload + email in the background
      const fd = new FormData();
      fd.append("pdf", blob, `${invoiceNumber}.pdf`);
      fd.append("invoiceNumber", invoiceNumber);
      fd.append("customerName", customerName);
      fd.append("customerEmail", trimmedEmail);
      fd.append("total", `${CURRENCY} ${total.toFixed(2)}`);

      const res = await fetch("/api/invoice", { method: "POST", body: fd });
      const result = (await res.json()) as {
        ok: boolean;
        blobUrl: string | null;
        blobError: string | null;
        emailId: string | null;
        emailError: string | null;
      };

      if (result.blobUrl) {
        toast.success("Saved to Vercel Blob", {
          description: "Invoice PDF uploaded.",
          action: {
            label: "Open",
            onClick: () => window.open(result.blobUrl!, "_blank"),
          },
        });
      } else if (result.blobError) {
        toast.warning("Blob storage skipped", { description: result.blobError });
      }

      if (trimmedEmail) {
        if (result.emailId) {
          toast.success("Email sent", { description: `Sent to ${trimmedEmail}` });
        } else if (result.emailError) {
          toast.error("Email failed", { description: result.emailError });
        }
      }
    } catch (e) {
      toast.error("Something went wrong", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <SiteHeader logoDataUrl={logoDataUrl} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Till — Invoice Generator</CardTitle>
            <CardDescription>
              Tap an item tile to add it to the ticket. Tap the same tile again
              to bump quantity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice + customer details — kept compact above the till. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice #</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  readOnly
                  aria-readonly
                  className="bg-muted/40 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Date</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer name</Label>
                <Input
                  id="customer-name"
                  placeholder="Walk-in customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Customer email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="customer@example.com (optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer-address">Customer address</Label>
                <Input
                  id="customer-address"
                  placeholder="Optional"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Tile picker — always visible, touch-first. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <span className="text-xs text-muted-foreground">
                  Tap to add · tap again to bump qty
                </span>
              </div>
              <ProductTiles
                onPickCatalog={addCatalogItem}
                onPickCustom={() => setCustomDialogOpen(true)}
              />
            </div>

            {/* Receipt — selected lines with stepper + rate + amount. */}
            <div className="space-y-2">
              <Label>Ticket</Label>
              {lines.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nothing on the ticket yet. Tap an item tile above to start.
                </div>
              ) : (
                <ul className="divide-y rounded-md border">
                  {lines.map((l) => {
                    const qty = Number(l.qty) || 0;
                    const rate = Number(l.rate) || 0;
                    const amount = qty * rate;
                    return (
                      <li key={l.uid} className="space-y-2 p-3">
                        {/* Top row — thumbnail, name, total, remove. */}
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted bg-cover bg-center text-2xl"
                            style={
                              l.image
                                ? { backgroundImage: `url(${assetUrl(l.image)})` }
                                : undefined
                            }
                          >
                            {l.image ? null : (l.emoji ?? "🧾")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {l.name}
                            </p>
                            {l.itemId == null ? (
                              <p className="text-[11px] uppercase tracking-wide text-primary">
                                Custom
                              </p>
                            ) : null}
                          </div>

                          <div className="text-right text-base font-semibold tabular-nums">
                            {CURRENCY} {amount.toFixed(2)}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(l.uid)}
                            aria-label={`Remove ${l.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Bottom row — qty/weight input, unit selector, rate. */}
                        <div className="flex flex-wrap items-center gap-2 pl-[60px]">
                          {/* Weight units (kg/g): plain typed input, matching the rate field UX.
                              Count units (bunch/single): integer stepper with +/− buttons. */}
                          {l.unit === "kg" || l.unit === "g" ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {l.unit === "kg" ? "kg" : "g"}
                              </span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step={l.unit === "kg" ? "0.001" : "1"}
                                placeholder={l.unit === "kg" ? "0.000" : "0"}
                                value={l.qty}
                                onChange={(e) =>
                                  updateLine(l.uid, { qty: e.target.value })
                                }
                                className="h-11 w-28 text-base tabular-nums"
                                aria-label={`Weight in ${l.unit} for ${l.name}`}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-11 w-11"
                                onClick={() => bumpQty(l.uid, -1)}
                                disabled={qty <= 1}
                                aria-label={`Decrease ${l.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={1}
                                step="1"
                                placeholder="1"
                                value={l.qty}
                                onChange={(e) =>
                                  updateLine(l.uid, { qty: e.target.value })
                                }
                                className="h-11 w-20 text-center text-base tabular-nums"
                                aria-label={`Quantity for ${l.name}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-11 w-11"
                                onClick={() => bumpQty(l.uid, +1)}
                                aria-label={`Increase ${l.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <UnitSelector
                            value={l.unit}
                            onChange={(unit) => updateLine(l.uid, { unit })}
                            label={`Unit for ${l.name}`}
                          />

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {CURRENCY}
                            </span>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              value={l.rate}
                              onChange={(e) =>
                                updateLine(l.uid, { rate: e.target.value })
                              }
                              className="h-11 w-24 text-base tabular-nums"
                              aria-label={`Rate for ${l.name}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              / {unitLabel(l.unit)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="text-sm text-muted-foreground">
                {validLines.length} valid line
                {validLines.length === 1 ? "" : "s"}
              </div>
              <div className="text-xl font-semibold tabular-nums">
                Total: {CURRENCY} {total.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="lg"
                className="h-12 text-base"
              >
                <FileDown className="h-4 w-4" />
                {generating ? "Generating…" : "Submit & download PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <CustomItemDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onConfirm={addCustomItem}
      />
    </>
  );
}
