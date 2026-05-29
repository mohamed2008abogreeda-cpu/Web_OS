// ============================================================
// API: POST /api/call/signal — WebRTC signaling relay via Pusher
// ============================================================
import { NextResponse } from "next/server";
import { triggerPusherEdge } from "@/lib/pusherEdge";

export async function POST(req: Request) {
  try {
    const { roomId, role, type, payload } = await req.json();

    if (!roomId || !type) {
      return NextResponse.json(
        { error: "Missing roomId or type" },
        { status: 400 }
      );
    }

    await triggerPusherEdge(`call-${roomId}`, "signal", {
      role,
      type,
      payload,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Pusher signal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
