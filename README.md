# Friendly Mart — Mobile Till

Multi-platform mobile till (POS) and invoice generator for **FRIENDLY MART**,
59B London Road, Grantham, NG31 6ET.

## Repository layout

```
.
├── web/      ← Next.js website + Progressive Web App
└── mobile/   ← (planned) Capacitor wrapper for iOS + Android app stores
```

The two packages are independent — `web/` deploys to Vercel as a normal
Next.js app, while `mobile/` will eventually consume the same UI inside a
native iOS / Android shell.

### `web/` — Next.js site + PWA

Runs the till in any modern browser, and installs to the home screen as a
fullscreen PWA on iPhone, iPad, and Android.

```bash
cd web
npm install
npm run dev      # local dev server
npm run build    # production build
```

Key bits:

- Next.js 16 (App Router, Turbopack)
- React 19, Tailwind v4, shadcn/ui
- `@react-pdf/renderer` for client-side PDF generation
- `/api/invoice` route — uploads to Vercel Blob + emails via Resend
- `app/manifest.ts` + `app/icon.png` + `app/apple-icon.png` make it
  installable as a PWA

See [`web/README.md`](./web/README.md) for the original Next.js bootstrap
notes and [`web/AGENTS.md`](./web/AGENTS.md) for agent-specific guidance.

### `mobile/` — Capacitor wrapper *(not yet scaffolded)*

When we're ready to ship to the App Store and Play Store, this folder will
hold a Capacitor project that wraps the deployed `web/` build inside a
native shell. The web code is reused verbatim — no React Native rewrite.

Until then, the PWA in `web/` is the way to install the till on a phone or
tablet (Safari → Share → *Add to Home Screen*; Chrome → *Install app*).
