import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable local Cloudflare bindings emulation (D1/KV/R2) during development
initOpenNextCloudflareForDev();

let assetsHostname = 'assets.yourdomain.com';
if (process.env.NEXT_PUBLIC_CDN_DOMAIN) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_CDN_DOMAIN);
    assetsHostname = url.hostname;
  } catch {
    assetsHostname = process.env.NEXT_PUBLIC_CDN_DOMAIN.replace(/^https?:\/\//, '').split('/')[0];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["webos.foggystorm.dpdns.org", "192.168.1.6"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: assetsHostname,
      },
    ],
  },
};

export default nextConfig;
