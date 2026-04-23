"use client";

import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Plus, Trash2, FileDown } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CATALOG, CURRENCY } from "@/lib/catalog";
import { InvoicePDF, type InvoiceData, type InvoiceLine } from "@/components/invoice-pdf";

type DraftLine = {
  uid: string;
  itemId: string;
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
  const [invoiceNumber, setInvoiceNumber] = useState(newInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(todayISO);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { uid: makeUid(), itemId: "", qty: "1", rate: "" },
  ]);
  const [generating, setGenerating] = useState(false);

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

  function addLine() {
    setLines((prev) => [
      ...prev,
      { uid: makeUid(), itemId: "", qty: "1", rate: "" },
    ]);
  }

  function removeLine(uid: string) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.uid !== uid)));
  }

  const validLines: InvoiceLine[] = lines
    .map((l): InvoiceLine | null => {
      const item = CATALOG.find((c) => c.id === l.itemId);
      const qty = Number(l.qty);
      const rate = Number(l.rate);
      if (
        !item ||
        !Number.isFinite(qty) ||
        qty <= 0 ||
        !Number.isFinite(rate) ||
        rate < 0
      ) {
        return null;
      }
      return { id: l.uid, name: item.name, qty, rate };
    })
    .filter((x): x is InvoiceLine => x !== null);

  const canSubmit = validLines.length > 0 && !generating;

  async function handleSubmit() {
    if (!canSubmit) return;
    setGenerating(true);
    try {
      const data: InvoiceData = {
        invoiceNumber,
        invoiceDate,
        customerName,
        customerAddress,
        lines: validLines,
      };
      const blob = await pdf(<InvoicePDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mobile Till — Invoice Generator</CardTitle>
          <CardDescription>
            Pick items, enter quantity and rate, then generate a PDF invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice #</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
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
              <Label htmlFor="customer-address">Customer address</Label>
              <Input
                id="customer-address"
                placeholder="Optional"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line items</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLine}>
                <Plus className="h-4 w-4" />
                Add row
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Item</TableHead>
                    <TableHead className="w-[15%]">Qty</TableHead>
                    <TableHead className="w-[20%]">Rate ({CURRENCY})</TableHead>
                    <TableHead className="w-[15%] text-right">Amount</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((l) => {
                    const qty = Number(l.qty) || 0;
                    const rate = Number(l.rate) || 0;
                    const amount = qty * rate;
                    return (
                      <TableRow key={l.uid}>
                        <TableCell>
                          <Select
                            value={l.itemId}
                            onValueChange={(v) => updateLine(l.uid, { itemId: v })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATALOG.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            value={l.qty}
                            onChange={(e) => updateLine(l.uid, { qty: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                            value={l.rate}
                            onChange={(e) => updateLine(l.uid, { rate: e.target.value })}
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {CURRENCY} {amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeLine(l.uid)}
                            disabled={lines.length === 1}
                            aria-label="Remove row"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              {validLines.length} valid line{validLines.length === 1 ? "" : "s"}
            </div>
            <div className="text-lg font-semibold tabular-nums">
              Total: {CURRENCY} {total.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
              <FileDown className="h-4 w-4" />
              {generating ? "Generating…" : "Submit & download PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
