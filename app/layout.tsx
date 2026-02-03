import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "freeswimming.org",
  description: "Free, step-by-step freestyle swimming for adult learners.",
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