/**
 * SyncRoom Durable Object
 * Handles native WebSocket connections for signaling and real-time state sync.
 * Maintains an in-memory map of connected clients for fast broadcasting without D1 database calls.
 */
export class SyncRoom {
  private sessions = new Map<any, { role: string; sessionId?: string; roomId?: string }>();

  constructor(private state: any, private env: any) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. Handle HTTP POST fallbacks from Next.js serverless API routes
    if (request.method === "POST") {
      if (url.pathname === "/sync" || url.pathname.endsWith("/sync")) {
        const data = await request.json();
        this.broadcastToAdmins({
          type: "os-state-update",
          sessionId: data.sessionId,
          x: data.x,
          y: data.y,
          viewportWidth: data.viewportWidth,
          viewportHeight: data.viewportHeight,
          activeWindows: data.activeWindows
        });
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      if (url.pathname === "/intervene" || url.pathname.endsWith("/intervene")) {
        const data = await request.json();
        this.sendIntervention(data.sessionId, data.type, data.payload);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      if (url.pathname === "/call-signal" || url.pathname.endsWith("/call-signal")) {
        const data = await request.json();
        this.broadcastSignal(data.roomId, data.role, data.type, data.payload);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. Handle standard WebSocket Upgrade handshake
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket Upgrade", { status: 400 });
    }

    // @ts-ignore
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [any, any];

    const role = url.searchParams.get("role") || "visitor";
    const sessionId = url.searchParams.get("sessionId") || "";
    const roomId = url.searchParams.get("roomId") || "";

    // Accept and register the WebSocket connection in the Durable Object context
    this.state.acceptWebSocket(server);
    this.sessions.set(server, { role, sessionId, roomId });

    // Send instant handshake acknowledgement
    server.send(JSON.stringify({ type: "handshake", status: "connected" }));

    return new Response(null, {
      status: 101,
      // @ts-ignore
      webSocket: client
    });
  }

  // Handle incoming messages on a WebSocket connection
  async webSocketMessage(ws: any, message: string | ArrayBuffer) {
    try {
      if (typeof message !== "string") return;
      const data = JSON.parse(message);

      const senderInfo = this.sessions.get(ws);
      if (!senderInfo) return;

      // Visitor sending state/coordinates updates
      if (data.type === "sync" && senderInfo.role === "visitor") {
        const payload = data.payload;
        this.broadcastToAdmins({
          type: "os-state-update",
          sessionId: senderInfo.sessionId,
          x: payload.x,
          y: payload.y,
          viewportWidth: payload.viewportWidth,
          viewportHeight: payload.viewportHeight,
          activeWindows: payload.activeWindows
        });
      }

      // Admin sending intervention command
      if (data.type === "intervene" && senderInfo.role === "admin") {
        const { sessionId, type, payload } = data.payload;
        this.sendIntervention(sessionId, type, payload);
      }

      // WebRTC Signal exchange
      if (data.type === "signal" && senderInfo.roomId) {
        this.broadcastSignal(
          senderInfo.roomId,
          senderInfo.role,
          data.signalType || data.type,
          data.payload
        );
      }
    } catch (err) {
      console.error("[DurableObject SyncRoom] webSocketMessage error:", err);
    }
  }

  // Handle connection closure
  async webSocketClose(ws: any, code: number, reason: string, wasClean: boolean) {
    this.sessions.delete(ws);
  }

  // Handle connection error
  async webSocketError(ws: any, error: any) {
    this.sessions.delete(ws);
  }

  // Helper: Broadcast state updates to all active Admin sessions
  private broadcastToAdmins(payload: any) {
    const msg = JSON.stringify(payload);
    for (const [socket, info] of this.sessions.entries()) {
      if (info.role === "admin") {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }

  // Helper: Transmit an intervention payload directly to a specific guest socket
  private sendIntervention(sessionId: string, type: string, payload: any) {
    const msg = JSON.stringify({
      type: "admin-command",
      payload: { type, payload }
    });
    for (const [socket, info] of this.sessions.entries()) {
      if (info.role === "visitor" && info.sessionId === sessionId) {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }

  // Helper: Broadcast WebRTC signal payload between opposite role in the same room
  private broadcastSignal(roomId: string, role: string, type: string, payload: any) {
    const msg = JSON.stringify({
      type: "signal",
      role,
      signalType: type,
      payload
    });
    for (const [socket, info] of this.sessions.entries()) {
      if (info.roomId === roomId && info.role !== role) {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }
}
