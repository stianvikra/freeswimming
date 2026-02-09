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
    // Add when available:
    // images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "freeswimming.org" }],
  },
  twitter: {
    card: "summary_large_image",
    // Add when available:
    // images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}