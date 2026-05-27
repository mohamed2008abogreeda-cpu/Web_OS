// ============================================================
// API: POST /api/discord-call — Discord bridge simulation
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caller, timestamp } = body;

    // ── In production, this would use discord.js: ──
    //
    // import { Client, GatewayIntentBits } from 'discord.js';
    //
    // const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    // await client.login(process.env.DISCORD_BOT_TOKEN);
    //
    // const channel = await client.channels.fetch(process.env.DISCORD_VOICE_CHANNEL_ID);
    // // Send a webhook notification
    // await fetch(process.env.DISCORD_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     content: `📞 **Incoming Call** from portfolio visitor!\nCaller: ${caller}\nTime: ${timestamp}`,
    //     username: 'WebOS Comms',
    //   }),
    // });

    console.log(`[Discord Bridge] Call from ${caller} at ${timestamp}`);

    return NextResponse.json({
      success: true,
      message: 'Discord notification sent',
      bridge: {
        status: 'connected',
        channelId: 'mock-voice-channel',
        botPing: Math.floor(Math.random() * 30) + 10,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Bridge connection failed' },
      { status: 500 }
    );
  }
}
