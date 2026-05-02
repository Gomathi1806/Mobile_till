"use client";

import { cn } from "@/lib/utils";
import { UNITS, type Unit } from "@/lib/catalog";

type Props = {
  value: Unit;
  onChange: (unit: Unit) => void;
  /** Optional aria label for the group, defaults to "Unit". */
  label?: string;
  className?: string;
};

/**
 * Segmented control for picking between kg / g / bunch / single. Sized for
 * touch (~36pt buttons) and visually neutral so it doesn't fight the qty
 * stepper next to it on a receipt line.
 */
export function UnitSelector({ value, onChange, label = "Unit", className }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-md border bg-muted/40 p-0.5",
        className,
      )}
    >
      {UNITS.map((u) => {
        const selected = u === value;
        return (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(u)}
            className={cn(
              "h-9 min-w-[40px] rounded px-2 text-xs font-medium transition-colors",
              "touch-manipulation select-none",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground active:text-foreground sm:hover:text-foreground",
            )}
          >
            {u}
          </button>
        );
      })}
    </div>
  );
}
