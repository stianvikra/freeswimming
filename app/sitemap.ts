import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://freeswimming.org";

  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/course`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/programs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/analysis`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/how-we-teach`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
