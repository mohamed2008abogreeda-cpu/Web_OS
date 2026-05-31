// ============================================================
// API: /api/sync — Bidirectional State Sync Router
// Handles GET (native WebSocket upgrades to Durable Object)
// Handles POST (HTTP fallback from visitors during connection setup)
// ============================================================
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. Upgrade request to native Edge WebSocket if Upgrade header is present
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const doNamespace = process.env.SYNC_ROOM;
    if (!doNamespace) {
      return new Response("SYNC_ROOM Durable Object binding not configured", { status: 500 });
    }

    // Connect to a single global Durable Object instance for real-time synchronization
    const id = doNamespace.idFromName("global");
    const stub = doNamespace.get(id);

    // Secure GET Handshake interceptor: Validate admin cookies/tokens before letting them request admin role
    const url = new URL(req.url);
    const role = url.searchParams.get("role") || "visitor";

    if (role === "admin") {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
          const parts = c.trim().split("=");
          return [parts[0], parts.slice(1).join("=")];
        })
      );
      const adminSession = cookies["admin_session"];
      const expectedToken = process.env.ADMIN_HASH || '0e2df64939a0f3ffff872b1e534018c73ec22765f27ae16e05398717662674d7';
      const adminSecret = process.env.ADMIN_SECRET || 'admin-secret-passcode';

      // If valid, append the auth_token parameter so the DO knows it is verified
      if (adminSession && timingSafeEqual(adminSession, expectedToken)) {
        url.searchParams.set("auth_token", adminSecret);
      }
    }

    // Create a modified Request object with the updated query parameters to pass to the DO stub
    const requestOptions: RequestInit = {
      headers: req.headers,
      method: req.method,
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      requestOptions.body = req.body;
    }
    // @ts-ignore
    if (req.cf) {
      // @ts-ignore
      requestOptions.cf = req.cf;
    }

    const modifiedReq = new Request(url.toString(), requestOptions);

    return stub.fetch(modifiedReq);
  } catch (err: any) {
    console.error("[WebSocket Sync Upgrade Error]:", err.message);
    return new Response(err.message || "Failed to upgrade WebSocket", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, x, y, viewportWidth, viewportHeight, activeWindows } = await req.json();

    // 2. Validate payload attributes
    if (
      typeof x !== 'number' || typeof y !== 'number' ||
      typeof viewportWidth !== 'number' || typeof viewportHeight !== 'number' ||
      !Array.isArray(activeWindows)
    ) {
      return NextResponse.json(
        { error: "Invalid payload: coordinates and activeWindows must match normalized schema" },
        { status: 400 }
      );
    }

    const doNamespace = process.env.SYNC_ROOM;
    if (doNamespace) {
      const id = doNamespace.idFromName("global");
      const stub = doNamespace.get(id);

      // Route the HTTP fallback sync command to the Durable Object via internal loopback
      await stub.fetch(new Request("http://internal/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          x,
          y,
          viewportWidth,
          viewportHeight,
          activeWindows,
        })
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[HTTP Sync Fallback Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Fully Edge and Cloudflare Workers compatible (O(N) runtime based on string length).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
