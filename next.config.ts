// next.config.ts
import type { NextConfig } from "next";

const nextDistDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig: NextConfig = {
  ...(nextDistDir ? { distDir: nextDistDir } : {}),
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/how-we-teach",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
