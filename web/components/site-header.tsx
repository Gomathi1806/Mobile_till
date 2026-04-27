"use client";

import { BUSINESS } from "@/lib/catalog";

type Props = {
  /**
   * Base64 data URL of the logo, loaded once by the parent page. When absent,
   * the header shows an "FM" monogram instead — no broken <img> flash.
   */
  logoDataUrl?: string;
};

export function SiteHeader({ logoDataUrl }: Props) {
  return (
    <header className="mx-auto w-full max-w-4xl px-4 pt-8 pb-4">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt={`${BUSINESS.name} logo`}
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          ) : (
            <div
              aria-label={`${BUSINESS.name} monogram`}
              className="flex h-20 w-20 items-center justify-center rounded-md bg-green-900 text-base font-bold text-white sm:h-24 sm:w-24"
            >
              FM
            </div>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold tracking-wide text-green-900 sm:text-2xl">
            {BUSINESS.name}
          </h1>
          <p className="text-xs text-muted-foreground">{BUSINESS.addressLine1}</p>
          <p className="text-xs text-muted-foreground">{BUSINESS.addressLine2}</p>
          <p className="text-xs text-muted-foreground">{BUSINESS.phone}</p>
        </div>
      </div>
    </header>
  );
}
