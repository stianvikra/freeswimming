import type { MetadataRoute } from "next";
import { isSiteLockEnabled } from "@/lib/site-lock/config";

export default function robots(): MetadataRoute.Robots {
  if (isSiteLockEnabled()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://freeswimming.org/sitemap.xml",
  };
}
