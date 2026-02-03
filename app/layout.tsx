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
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}