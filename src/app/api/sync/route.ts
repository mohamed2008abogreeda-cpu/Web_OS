// ============================================================
// API: POST /api/sync — Broadcast state to spectating admin via Pusher
// Designed for Cloudflare Pages with Node.js compatibility shims.
// Accepts raw coordinates normalized mathematically on the client.
// ============================================================
import { NextResponse } from "next/server";
import { triggerPusherEdge } from "@/lib/pusherEdge";

export async function POST(req: Request) {
  try {
    const { sessionId, x, y, viewportWidth, viewportHeight, activeWindows } = await req.json();

    // Validate: x,y and viewports must be numbers, activeWindows must be an array
    if (
      typeof x !== 'number' || typeof y !== 'number' ||
      typeof viewportWidth !== 'number' || typeof viewportHeight !== 'number' ||
      !Array.isArray(activeWindows)
    ) {
      return NextResponse.json(
        { error: "Invalid payload: x, y, viewports must be numbers and activeWindows must be an array" },
        { status: 400 }
      );
    }

    // Broadcast the coordinates and window state to Pusher channel
    await triggerPusherEdge("os-sync-channel", "os-state-update", {
      sessionId,
      x,
      y,
      viewportWidth,
      viewportHeight,
      activeWindows,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Pusher sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
