// ============================================================
// API: POST /api/notify — Unified notification endpoint (ntfy.sh)
// Handles both WebRTC secure link alerts and general app calls.
// Runtime managed by @opennextjs/cloudflare — no explicit runtime export.
// ============================================================
import { NextResponse } from 'next/server';

/**
 * Sanitize a string to ASCII-only (removes non-ASCII chars that cause
 * ByteString errors in Edge/Workers HTTP headers).
 */
function asciiSafe(str: string): string {
  return str.replace(/[^\x20-\x7E]/g, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Cloudflare Turnstile CAPTCHA Verification
    const turnstileToken = body['cf-turnstile-response'];
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: 'Security verification failed: CAPTCHA token is missing. Please solve Turnstile.' },
        { status: 400 }
      );
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(String(turnstileToken))}`
    });

    const verifyData = await verifyRes.json() as any;

    if (!verifyData.success) {
      return NextResponse.json(
        { success: false, error: 'Security verification failed: Invalid Turnstile CAPTCHA token.' },
        { status: 401 }
      );
    }

    const { caller, environment, roomId, message: customMessage, title, tags, priority } = body;

    let finalMessage = "";
    let finalTitle = "Web OS Alert";
    let finalTags = "computer";
    let finalPriority = "3";
    let clickUrl = "";

    const reqUrl = new URL(request.url);
    const protocol = request.headers.get('x-forwarded-proto') || (reqUrl.protocol.includes('https') ? 'https' : 'http');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || reqUrl.host;
    const baseDomain = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    if (roomId && caller && environment) {
      // 1. Secure WebRTC P2P call notification
      finalTitle = "SECURE LINK INITIATED";
      finalPriority = "5";
      finalTags = "warning,skull,computer";
      finalMessage = `Incoming Comms Request by: ${asciiSafe(String(caller))} from OS: ${asciiSafe(String(environment))}`;
      clickUrl = `${baseDomain}/admin/comms?room=${encodeURIComponent(String(roomId))}`;
    } else if (customMessage) {
      // 2. General app notifications (Teams, FaceTime, etc.)
      finalTitle = title || "Incoming Call Alert";
      finalPriority = priority || "4";
      finalTags = tags || "phone,computer";
      finalMessage = asciiSafe(String(customMessage));
      clickUrl = `${baseDomain}/admin/comms`;
    } else {
      return NextResponse.json(
        { error: 'Invalid payload: Either (caller, environment, roomId) or (message) must be provided' },
        { status: 400 }
      );
    }

    // ntfy topic is configurable via env, with sensible default
    const ntfyTopic = process.env.NTFY_TOPIC || 'webos-mohamed-calls';
    const ntfyUrl = `https://ntfy.sh/${ntfyTopic}`;

    const headers: Record<string, string> = {
      'Title': asciiSafe(finalTitle),
      'Priority': finalPriority,
      'Tags': finalTags,
    };

    if (clickUrl) {
      headers['Click'] = clickUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(ntfyUrl, {
      method: 'POST',
      body: finalMessage,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to send notification via ntfy: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      roomId: roomId || null,
      clickUrl,
    });
  } catch (error) {
    console.error('Error in secure notify route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
