"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitSelector } from "@/components/unit-selector";
import { CURRENCY, type Unit } from "@/lib/catalog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with a non-empty trimmed name, finite non-negative rate, and unit. */
  onConfirm: (name: string, rate: number, unit: Unit) => void;
};

/**
 * Touch-friendly free-text item entry. Used when a cashier needs to ring up
 * something not in the catalog. Tall inputs and a wide primary action so it
 * works on a phone or a counter tablet alike.
 */
export function CustomItemDialog({ open, onOpenChange, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [unit, setUnit] = useState<Unit>("single");

  // Reset on close so the next open starts clean — avoids stale typed values.
  useEffect(() => {
    if (!open) {
      setName("");
      setRate("");
      setUnit("single");
    }
  }, [open]);

  const trimmedName = name.trim();
  const numericRate = Number(rate);
  const canSubmit =
    !!trimmedName && Number.isFinite(numericRate) && numericRate >= 0;

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm(trimmedName, numericRate, unit);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add custom item</DialogTitle>
          <DialogDescription>
            Anything not in the catalog. Name, rate, and unit go straight onto
            the invoice.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="custom-item-name">Item name</Label>
            <Input
              id="custom-item-name"
              autoFocus
              placeholder="e.g. Pomegranate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <UnitSelector value={unit} onChange={setUnit} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-item-rate">Rate ({CURRENCY} per {unit})</Label>
            <Input
              id="custom-item-rate"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-12 text-base tabular-nums"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="h-11">
              Add to invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
