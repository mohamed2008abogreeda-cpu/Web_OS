// ============================================================
// API: POST /api/sync — Broadcast state to spectating admin via Pusher
// Designed for Cloudflare Pages with Node.js compatibility shims.
// Accepts normalized coordinates (0.0–1.0 viewport ratios).
// ============================================================
import { NextResponse } from "next/server";
import { triggerPusherEdge } from "@/lib/pusherEdge";

export async function POST(req: Request) {
  try {
    const { x, y, screenWidth, screenHeight, activeWindows } = await req.json();

    // Validate: x,y must be numbers in [0,1] range, activeWindows must be an array
    if (
      typeof x !== 'number' || typeof y !== 'number' ||
      !Array.isArray(activeWindows) ||
      x < 0 || x > 1 || y < 0 || y > 1
    ) {
      return NextResponse.json(
        { error: "Invalid payload: x, y must be numbers in [0,1] range and activeWindows must be an array" },
        { status: 400 }
      );
    }

    // Broadcast the normalized cursor coordinates and window state to Pusher channel
    await triggerPusherEdge("os-sync-channel", "os-state-update", {
      x,
      y,
      screenWidth: typeof screenWidth === 'number' ? screenWidth : null,
      screenHeight: typeof screenHeight === 'number' ? screenHeight : null,
      activeWindows,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Pusher sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
