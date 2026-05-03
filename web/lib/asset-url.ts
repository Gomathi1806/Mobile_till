/**
 * Per-deploy cache-buster for static assets in /public.
 *
 * Browser problem: assets like /items/drumstick.jpg have stable URLs forever,
 * so when we replace the file's contents the browser keeps showing the old
 * cached version — even after Vercel serves the new file at the same path.
 *
 * Fix: append `?v=<deployKey>` to each URL. The key changes on every deploy,
 * so the URL is unique per deploy → browsers refetch automatically.
 *
 * The key comes from `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, which Vercel
 * auto-injects at build time. Locally (no Vercel build) it falls back to
 * "dev", which is fine — Next.js dev mode disables caching anyway.
 */
const DEPLOY_KEY =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev";

export function assetUrl(path: string): string {
  // Defensive: only append when the path starts with `/` and lacks a query.
  // Full URLs (https://…) and paths that already carry a `?` are passed
  // through untouched.
  if (!path.startsWith("/") || path.includes("?")) return path;
  return `${path}?v=${DEPLOY_KEY}`;
}
