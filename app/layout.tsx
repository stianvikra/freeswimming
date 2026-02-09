import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://freeswimming.org"),
  title: {
    default: "freeswimming.org",
    template: "%s | freeswimming.org",
  },
  description: "Free, step-by-step freestyle swimming for adult learners.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-transparent">{children}</body>
    </html>
  );
}