import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/catalog";

/**
 * Web App Manifest — turns the page into an installable PWA.
 *
 * On iOS/iPadOS: "Add to Home Screen" creates a fullscreen icon (no Safari
 * chrome). On Android: Chrome shows an "Install" prompt.
 *
 * Brand color matches the green-900 used in the site header so the splash
 * and status bar feel of-a-piece with the page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Mobile Till`,
    short_name: "FM Till",
    description: "Invoice generator and mobile till for Friendly Mart.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#14532d",
    categories: ["business", "productivity", "shopping"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Same source files reused as maskable icons. Real maskable icons should
      // have safe-zone padding (~10% on each side); revisit when we ship a
      // dedicated PWA-art asset.
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
