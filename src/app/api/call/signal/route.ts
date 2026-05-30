// ============================================================
// API: POST /api/call/signal — WebRTC signaling relay via Durable Object
// ============================================================
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roomId, role, type, payload } = await req.json();

    if (!roomId || !type) {
      return NextResponse.json(
        { error: "Missing roomId or type" },
        { status: 400 }
      );
    }

    const doNamespace = process.env.SYNC_ROOM;
    if (doNamespace) {
      const id = doNamespace.idFromName("global");
      const stub = doNamespace.get(id);

      // Route the signaling payload to the Durable Object stub via internal loopback
      await stub.fetch(new Request("http://internal/call-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          role,
          type,
          payload
        })
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[HTTP Signaling Relay Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
