// ============================================================
// API: POST /api/intervene — Send command payload to visitor via Durable Object
// ============================================================
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, type, payload } = await req.json();

    if (!sessionId || !type) {
      return NextResponse.json(
        { error: "Invalid payload: sessionId and type parameters are required." },
        { status: 400 }
      );
    }

    const doNamespace = process.env.SYNC_ROOM;
    if (doNamespace) {
      const id = doNamespace.idFromName("global");
      const stub = doNamespace.get(id);

      // Route the intervention payload to the Durable Object stub via internal loopback
      await stub.fetch(new Request("http://internal/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type,
          payload
        })
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Intervention transmission failed." },
      { status: 500 }
    );
  }
}
