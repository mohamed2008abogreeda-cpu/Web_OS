// ============================================================
// API: POST /api/intervene — Send command payload to visitor Pusher channel
// ============================================================
import { NextResponse } from "next/server";
import { triggerPusherEdge } from "@/lib/pusherEdge";

export async function POST(req: Request) {
  try {
    const { sessionId, type, payload } = await req.json();

    if (!sessionId || !type) {
      return NextResponse.json(
        { error: "Invalid payload: sessionId and type parameters are required." },
        { status: 400 }
      );
    }

    const channelName = `visitor-channel-${sessionId}`;

    // Broadcast command to visitor's dedicated channel
    await triggerPusherEdge(channelName, "admin-command", {
      type,
      payload,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Intervention transmission failed." },
      { status: 500 }
    );
  }
}
