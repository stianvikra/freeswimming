// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
