import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friendly Mart — Mobile Till",
  description: "Invoice generator for Friendly Mart",
  applicationName: "FM Till",
  // iOS PWA: makes "Add to Home Screen" launch fullscreen with no Safari
  // chrome and emits the right <meta name="apple-mobile-web-app-*"> tags.
  appleWebApp: {
    capable: true,
    title: "FM Till",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    // The phone in the header isn't meant to be auto-linked.
    telephone: false,
  },
};

// Viewport must be a separate export per Next.js 16. Disable user-scaling so
// double-tapping a tile doesn't accidentally zoom the till on mobile.
export const viewport: Viewport = {
  themeColor: "#14532d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
