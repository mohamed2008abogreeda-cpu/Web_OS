// ============================================================
// API: POST /api/discord-call — Dual-channel notification (Discord + ntfy)
// ============================================================
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, sessionId } = await req.json();
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const spectateLink = `${protocol}://${host}/?spectate=${sessionId}`;

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    const discordPromise = discordWebhookUrl
      ? fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "🚨 INCOMING SECURE CALL",
                description: `**Visitor:** ${username || "Unknown"}\n**Session ID:** ${sessionId}\n\n**Action Required:**\n[Click here to Spectate & Answer](${spectateLink})`,
                color: 0x10b981,
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        })
      : Promise.resolve();

    const ntfyPromise = fetch("https://ntfy.sh/webos-mohamed-calls", {
      method: "POST",
      headers: {
        Priority: "5",
        Tags: "warning,rotating_light",
      },
      body: `Incoming Call from ${username || "Visitor"}! Link: ${spectateLink}`,
    });

    await Promise.allSettled([discordPromise, ntfyPromise]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
