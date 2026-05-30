import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable local Cloudflare bindings emulation (D1/KV/R2) during development
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["webos.foggystorm.dpdns.org", "192.168.1.6"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.yourdomain.com',
      },
    ],
  },
};

export default nextConfig;
