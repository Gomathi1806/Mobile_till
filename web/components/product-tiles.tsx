"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG, CURRENCY, type CatalogItem } from "@/lib/catalog";

type Props = {
  /** Tap a catalog tile → add (or increment) the matching line. */
  onPickCatalog: (item: CatalogItem) => void;
  /** Tap the "Custom item" tile → open the custom-item dialog. */
  onPickCustom: () => void;
};

/**
 * POS-style always-visible product picker. Each catalog item is rendered as a
 * touch-sized tile (≥ 44pt tap target) with an emoji thumbnail, name, and
 * price. A search bar filters the grid in-memory. The first tile is a fixed
 * "Custom item" CTA so cashiers can enter ad-hoc items without scrolling.
 */
export function ProductTiles({ onPickCatalog, onPickCustom }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          inputMode="search"
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Bigger tap target than the default Input.
          className="h-12 pl-9 pr-10 text-base"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        <CustomTile onClick={onPickCustom} />
        {filtered.map((item) => (
          <ProductTile
            key={item.id}
            item={item}
            onClick={() => onPickCatalog(item)}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="col-span-full px-1 py-6 text-center text-sm text-muted-foreground">
            No items match &ldquo;{query}&rdquo;. Tap{" "}
            <span className="font-medium text-foreground">Custom item</span> to
            add it manually.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ProductTile({
  item,
  onClick,
}: {
  item: CatalogItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Touch-first: comfy minimum height, no hover-only states, big text.
        "group flex min-h-[124px] flex-col items-center justify-between gap-1 rounded-lg border border-border bg-card p-2 text-center",
        "transition-colors active:bg-accent active:scale-[0.98] sm:hover:border-primary/50 sm:hover:bg-accent",
        // Stop iOS from highlighting the whole tile on tap.
        "touch-manipulation select-none",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-md bg-muted text-3xl",
          // Real images, when added, fill the same square via background-image.
          item.image && "bg-cover bg-center",
        )}
        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
      >
        {item.image ? null : <span>{item.emoji}</span>}
      </div>
      <span className="line-clamp-2 text-xs font-medium leading-tight">
        {item.name}
      </span>
      {item.defaultRate != null ? (
        <span className="text-xs tabular-nums text-muted-foreground">
          {CURRENCY}
          {item.defaultRate.toFixed(2)}
        </span>
      ) : null}
    </button>
  );
}

function CustomTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[124px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-2 text-center text-primary",
        "transition-colors active:bg-primary/10 active:scale-[0.98] sm:hover:bg-primary/10",
        "touch-manipulation select-none",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
        <Plus className="h-6 w-6" />
      </div>
      <span className="text-xs font-semibold">Custom item</span>
      <span className="text-[10px] text-primary/70">Type a name</span>
    </button>
  );
}
