// ============================================================
// API: POST /api/sync — Broadcast state to spectating admin via Pusher
// Designed for Cloudflare Pages with Node.js compatibility shims.
// ============================================================
import { NextResponse } from "next/server";
import { triggerPusherEdge } from "@/lib/pusherEdge";

export async function POST(req: Request) {
  try {
    const { x, y, activeWindows } = await req.json();

    // Verify coordinates are numeric and windows is an array
    if (typeof x !== 'number' || typeof y !== 'number' || !Array.isArray(activeWindows)) {
      return NextResponse.json(
        { error: "Invalid payload: x, y must be numbers and activeWindows must be an array" },
        { status: 400 }
      );
    }

    // Broadcast the cursor coordinates and window state to Pusher channel
    await triggerPusherEdge("os-sync-channel", "os-state-update", {
      x,
      y,
      activeWindows,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Pusher sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
