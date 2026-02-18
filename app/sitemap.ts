import type { MetadataRoute } from "next";
import { isSiteLockEnabled } from "@/lib/site-lock/config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isSiteLockEnabled()) {
    return [];
  }

  const baseUrl = "https://freeswimming.org";

  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/course`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/programs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/analysis`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/our-method`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cookies`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
