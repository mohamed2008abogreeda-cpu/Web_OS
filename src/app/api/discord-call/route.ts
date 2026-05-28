// ============================================================
// API: POST /api/discord-call — Real phone notification via ntfy
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

const NTFY_TOPIC = 'webos-mohamed-calls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caller, timestamp, visitorName } = body;

    const callerName = visitorName || caller || 'Anonymous Visitor';
    const callTime = timestamp
      ? new Date(timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

    // ── Send REAL notification to phone via ntfy ──
    // Priority 5 (max/urgent) = phone rings loudly even on silent!
    const ntfyResponse = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': '📞 Incoming Call — WebOS Portfolio',
        'Priority': 'urgent',
        'Tags': 'phone,rotating_light',
        'Actions': `view, Open Portfolio, https://webos.foggystorm.dpdns.org/, clear=true`,
      },
      body: `🔔 ${callerName} is trying to call you!\n⏰ Time: ${callTime}\n\nOpen your portfolio to respond.`,
    });

    const ntfyOk = ntfyResponse.ok;

    console.log(
      `[Comms Bridge] Call from ${callerName} at ${callTime} — ntfy: ${ntfyOk ? 'SENT ✅' : 'FAILED ❌'}`
    );

    return NextResponse.json({
      success: ntfyOk,
      message: ntfyOk
        ? 'Ring notification sent to phone!'
        : 'Failed to reach notification service',
      bridge: {
        status: ntfyOk ? 'connected' : 'error',
        service: 'ntfy',
        topic: NTFY_TOPIC,
      },
    });
  } catch (err) {
    console.error('[Comms Bridge] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Bridge connection failed' },
      { status: 500 }
    );
  }
}
