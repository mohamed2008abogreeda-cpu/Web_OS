/**
 * SyncRoom Durable Object
 * Handles native WebSocket connections for signaling and real-time state sync.
 * Restructured to support Cloudflare Durable Objects WebSocket Hibernation API for zero idle costs.
 */
export class SyncRoom {
  private sessions = new Map<any, { role: string; sessionId?: string; roomId?: string }>();

  constructor(private state: any, private env: any) {
    // Restore active sessions map on wake up/re-instantiation from the persistent DO state
    try {
      const activeSockets = this.state.getWebSockets();
      for (const ws of activeSockets) {
        const attachment = ws.deserializeAttachment();
        if (attachment) {
          this.sessions.set(ws, attachment);
        }
      }
    } catch (e) {
      console.error("[SyncRoom Constructor Restore Error]:", e);
    }
  }

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

    // Register WebSocket connection in Durable Object Hibernation context
    this.state.acceptWebSocket(server);

    // Persist per-connection metadata using structured clone attachment
    const sessionInfo = { role, sessionId, roomId };
    server.serializeAttachment(sessionInfo);
    this.sessions.set(server, sessionInfo);

    // Send instant handshake acknowledgement
    server.send(JSON.stringify({ type: "handshake", status: "connected" }));

    return new Response(null, {
      status: 101,
      // @ts-ignore
      webSocket: client
    });
  }

  // Handle incoming messages on a WebSocket connection (Hibernation Lifecycle)
  async webSocketMessage(ws: any, message: string | ArrayBuffer) {
    try {
      if (typeof message !== "string") return;
      const data = JSON.parse(message);

      const senderInfo = this.sessions.get(ws) || ws.deserializeAttachment();
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

  // Handle connection closure (Hibernation Lifecycle)
  async webSocketClose(ws: any, code: number, reason: string, wasClean: boolean) {
    this.sessions.delete(ws);
  }

  // Handle connection error (Hibernation Lifecycle)
  async webSocketError(ws: any, error: any) {
    this.sessions.delete(ws);
  }

  // Helper: Broadcast state updates to all active Admin sessions
  private broadcastToAdmins(payload: any) {
    const msg = JSON.stringify(payload);
    const activeSockets = this.state.getWebSockets();
    for (const socket of activeSockets) {
      const info = this.sessions.get(socket) || socket.deserializeAttachment();
      if (info && info.role === "admin") {
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
    const activeSockets = this.state.getWebSockets();
    for (const socket of activeSockets) {
      const info = this.sessions.get(socket) || socket.deserializeAttachment();
      if (info && info.role === "visitor" && info.sessionId === sessionId) {
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
    const activeSockets = this.state.getWebSockets();
    for (const socket of activeSockets) {
      const info = this.sessions.get(socket) || socket.deserializeAttachment();
      if (info && info.roomId === roomId && info.role !== role) {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }
}
