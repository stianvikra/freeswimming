// app/how-we-teach/page.tsx
import type { Metadata } from "next";
import HowWeTeachClient from "./HowWeTeachClient";

export const metadata: Metadata = {
  title: "How we teach freestyle | freeswimming.org",
  description:
    "Learn. Drill. Swim. A clear step-by-step freestyle method for adult learners — calm technique, less effort, and real progress.",
  alternates: {
    canonical: "/how-we-teach",
  },
  openGraph: {
    title: "How we teach freestyle | freeswimming.org",
    description:
      "Learn. Drill. Swim. A clear step-by-step freestyle method for adult learners — calm technique, less effort, and real progress.",
    url: "/how-we-teach",
    siteName: "freeswimming.org",
    type: "website",
  },
};

export default function HowWeTeachPage() {
  return <HowWeTeachClient />;
}