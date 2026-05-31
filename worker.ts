// @ts-ignore
import handler from "./.open-next/worker.js";
import { SyncRoom } from "./src/lib/SyncRoom";

export { SyncRoom };

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      return await handler.fetch(request, env, ctx);
    } catch (error: any) {
      // Securely log unhandled fatal exceptions to console.error (which hooks directly into Cloudflare Logpush)
      console.error("[Fatal Edge Worker Error]:", error);

      // Asynchronously log unhandled failures in background thread using ctx.waitUntil
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(
          Promise.resolve().then(() => {
            console.warn("[Edge Telemetry Log]: Securely recorded unhandled request failure.");
          })
        );
      }

      // Return generic 500 Internal Server Error without exposing sensitive stack trace
      return new Response("Internal Server Error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
        },
      });
    }
  }
};

