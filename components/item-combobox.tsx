"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATALOG, CURRENCY, type CatalogItem } from "@/lib/catalog";

type Props = {
  /** Currently selected display name (catalog item or custom). */
  value: string;
  /** Called when a catalog item is chosen. */
  onSelectCatalog: (item: CatalogItem) => void;
  /** Called when the user commits a free-typed name that isn't in the catalog. */
  onSelectCustom: (name: string) => void;
};

export function ItemCombobox({ value, onSelectCatalog, onSelectCustom }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const hasExactMatch =
    !!trimmed &&
    CATALOG.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());

  function commitCustom() {
    if (!trimmed) return;
    onSelectCustom(trimmed);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || "Select or type an item"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Type to filter or add new…"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              // Enter when no match → commit typed value as a custom item.
              if (e.key === "Enter" && trimmed && !hasExactMatch) {
                e.preventDefault();
                commitCustom();
              }
            }}
          />
          <CommandList>
            <CommandEmpty className="p-0">
              {trimmed ? (
                <button
                  type="button"
                  onClick={commitCustom}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    Use <span className="font-medium">&ldquo;{trimmed}&rdquo;</span>{" "}
                    as custom item
                  </span>
                </button>
              ) : (
                <div className="p-3 text-sm text-muted-foreground">
                  No items. Start typing to search or add new.
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {CATALOG.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelectCatalog(item);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.name ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.defaultRate != null ? (
                    <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                      {CURRENCY}
                      {item.defaultRate.toFixed(2)}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
              {trimmed && !hasExactMatch ? (
                <CommandItem
                  value={`__custom__${trimmed}`}
                  onSelect={commitCustom}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Use &ldquo;{trimmed}&rdquo; as custom item
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
