import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { InstallProvider } from "@/components/install/install-context";
import "./globals.css";

const brandSans = localFont({
  src: "./fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-brand-sans",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freeswimming.org"),
  manifest: "/manifest.webmanifest",
  title: {
    default: "freeswimming.org",
    template: "%s | freeswimming.org",
  },
  description: "Free, step-by-step freestyle swimming for adult learners.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "freeswimming.org",
    type: "website",
    title: "freeswimming.org",
    description: "Free, step-by-step freestyle swimming for adult learners.",
    // images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "freeswimming.org" }],
  },
  twitter: {
    card: "summary_large_image",
    // images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1f5da9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${brandSans.variable} min-h-screen bg-transparent`}>
        <InstallProvider>{children}</InstallProvider>
      </body>
    </html>
  );
}
