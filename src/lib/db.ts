import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Safely resolves the D1 Database binding inside the Edge/OpenNext context.
 * Offers graceful fallbacks for local Next.js node environments.
 */
export function getD1Database() {
  try {
    const { env } = getCloudflareContext();
    if (env && (env as any).DB) {
      return (env as any).DB;
    }
  } catch (error) {
    // Graceful catch for SSG, static compile, and dev environments
  }

  // Fallback to process.env during local next dev if injected there
  if (typeof process !== "undefined" && process.env.DB) {
    return process.env.DB as any;
  }

  return null;
}

/**
 * Safely resolves the R2 Bucket binding inside the Edge/OpenNext context.
 */
export function getR2Bucket() {
  try {
    const { env } = getCloudflareContext();
    if (env && (env as any).BUCKET) {
      return (env as any).BUCKET;
    }
  } catch (error) {
    // Graceful catch for static generation environments
  }

  if (typeof process !== "undefined" && process.env.BUCKET) {
    return process.env.BUCKET as any;
  }

  return null;
}
