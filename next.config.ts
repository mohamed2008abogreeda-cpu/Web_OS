import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable local Cloudflare bindings emulation (D1/KV/R2) during development
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["webos.foggystorm.dpdns.org"],
};

export default nextConfig;
