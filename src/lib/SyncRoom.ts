/**
 * SyncRoom Durable Object
 * Handles native WebSocket connections for signaling and real-time state sync.
 * Restructured to support Cloudflare Durable Objects WebSocket Hibernation API for zero idle costs.
 */
export class SyncRoom {
  private sessions = new Map<any, { role: string; sessionId?: string; roomId?: string }>();
  private rateLimiters = new WeakMap<any, { lastReset: number; messageCount: number }>();

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

    let role = url.searchParams.get("role") || "visitor";
    const authToken = url.searchParams.get("auth_token") || "";
    const sessionId = url.searchParams.get("sessionId") || "";
    const roomId = url.searchParams.get("roomId") || "";

    // Zero-Trust Enforce Socket Role Authentication for Admin Role
    if (role === "admin") {
      const adminSecret = this.env.ADMIN_SECRET || "admin-secret-passcode";
      if (!authToken || authToken !== adminSecret) {
        role = "visitor"; // Gracefully downgrade unverified sessions to prevent spoofing
      }
    }

    // Build tags for accepted WebSocket to enable O(1) targeted broadcasting
    const tags: string[] = [];
    if (roomId) {
      tags.push(roomId);
    } else {
      tags.push("global-sync");
    }
    if (role === "admin") {
      tags.push("admin");
    } else {
      tags.push("visitor");
    }

    // Register WebSocket connection in Durable Object Hibernation context with tags
    this.state.acceptWebSocket(server, tags);

    // Persist per-connection metadata using structured clone attachment
    const sessionInfo = { role, sessionId, roomId, lastReset: 0, messageCount: 0 };
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

      // 1. Fetch connection attachment metadata
      const senderInfo = ws.deserializeAttachment() || this.sessions.get(ws);
      if (!senderInfo) return;

      // 2. WeakMap-based Rate Limiter (5 messages per 1000ms) with hibernation safety
      const now = Date.now();
      let limiter = this.rateLimiters.get(ws);
      if (!limiter) {
        limiter = {
          lastReset: senderInfo.lastReset || now,
          messageCount: senderInfo.messageCount || 0
        };
        this.rateLimiters.set(ws, limiter);
      }

      if (now - limiter.lastReset >= 1000) {
        limiter.lastReset = now;
        limiter.messageCount = 1;
      } else {
        limiter.messageCount += 1;
        if (limiter.messageCount > 5) {
          console.warn(`[SyncRoom Rate Limiter] Session ${senderInfo.sessionId || 'N/A'} exceeded limit: ${limiter.messageCount} msg/sec. Dropping packet.`);
          // Sync rate limiting state to persistent DO hibernation attachment
          senderInfo.lastReset = limiter.lastReset;
          senderInfo.messageCount = limiter.messageCount;
          ws.serializeAttachment(senderInfo);
          this.sessions.set(ws, senderInfo);
          return; // Instantly silently drop the flood packet to protect V8 CPU
        }
      }

      // Sync rate limiting state to persistent DO hibernation attachment
      senderInfo.lastReset = limiter.lastReset;
      senderInfo.messageCount = limiter.messageCount;
      ws.serializeAttachment(senderInfo);
      this.sessions.set(ws, senderInfo);

      // Parse JSON inside try-catch to handle client malformation gracefully
      let data: any;
      try {
        data = JSON.parse(message);
      } catch (err) {
        console.error("[SyncRoom] Failed to parse message JSON:", err);
        return; // Silently drop malformed JSON packets
      }

      if (!data || typeof data !== "object") return;

      // 3. Zero-Trust Command Authentication Guard
      // Prevent any role spoofing by inspecting message type against trusted attachment role
      const typeLower = (data.type || "").toLowerCase();
      const isAdministrative = 
        typeLower.includes("intervene") || 
        typeLower.includes("spectate") || 
        typeLower.includes("bsod") || 
        typeLower.includes("admin");

      if (isAdministrative && senderInfo.role !== "admin") {
        console.error(`[SyncRoom Security Alert] Unauthorized administrative payload spoofing attempt detected from session ${senderInfo.sessionId || 'N/A'} (role: ${senderInfo.role}). Severing connection.`);
        ws.close(1008, "Policy Violation: Unauthorized Administrative Command");
        return;
      }

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

      // Admin sending spectate command
      if (data.type === "SPECTATE_COMMAND" && senderInfo.role === "admin") {
        const { targetSessionId, action } = data;
        this.sendSpectateCommand(targetSessionId, action);
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

      // Unified Text Chat Message exchange
      if (data.type === "CHAT_MESSAGE" && senderInfo.roomId) {
        this.broadcastToRoom(senderInfo.roomId, senderInfo.role, {
          type: "CHAT_MESSAGE",
          payload: data.payload
        });
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

  // Helper: Transmit a spectate command directly to a specific guest socket
  private sendSpectateCommand(sessionId: string, action: 'START' | 'STOP') {
    const msg = JSON.stringify({
      type: 'SPECTATE_COMMAND',
      action
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

  // Helper: Broadcast WebRTC signal payload between opposite role in the same room using O(1) tags
  private broadcastSignal(roomId: string, role: string, type: string, payload: any) {
    const msg = JSON.stringify({
      type: "signal",
      role,
      signalType: type,
      payload
    });
    const roomSockets = this.state.getWebSockets(roomId);
    for (const socket of roomSockets) {
      const info = this.sessions.get(socket) || socket.deserializeAttachment();
      if (info && info.role !== role) {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }

  // Helper: Broadcast unified text chat message to the opposite role in the same room using O(1) tags
  private broadcastToRoom(roomId: string, role: string, payload: any) {
    const msg = JSON.stringify(payload);
    const roomSockets = this.state.getWebSockets(roomId);
    for (const socket of roomSockets) {
      const info = this.sessions.get(socket) || socket.deserializeAttachment();
      if (info && info.role !== role) {
        try {
          socket.send(msg);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }
}
