// app/our-method/page.tsx
import type { Metadata } from "next";
import OurMethodClient from "./OurMethodClient";

export const metadata: Metadata = {
  title: "Our Method for freestyle | freeswimming.org",
  description:
    "Learn. Drill. Swim. A clear step-by-step freestyle method for adult learners — calm technique, less effort, and real progress.",
  alternates: {
    canonical: "/our-method",
  },
  openGraph: {
    title: "Our Method for freestyle | freeswimming.org",
    description:
      "Learn. Drill. Swim. A clear step-by-step freestyle method for adult learners — calm technique, less effort, and real progress.",
    url: "/our-method",
    siteName: "freeswimming.org",
    type: "website",
  },
};

export default function OurMethodPage() {
  return <OurMethodClient />;
}
