export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    // التحقق الذكي ودعم كلاً من التنبيهات ثنائية القنوات (P2P WebRTC) والتنبيهات العامة للمحفظة
    if (roomId && caller && environment) {
      // 1. بروتوكول الاتصال المشفر الآمن (WebRTC Line)
      finalTitle = "SECURE LINK INITIATED";
      finalPriority = "5";
      finalTags = "warning,skull,computer";
      finalMessage = `Incoming Comms Request by: ${caller} from OS: ${environment}`;
      clickUrl = `${baseDomain}/admin/comms?room=${roomId}`;
    } else if (customMessage) {
      // 2. تنبيهات المحفظة العامة (Teams و FaceTime وغيرها)
      finalTitle = title || "Incoming Call Alert";
      finalPriority = priority || "4";
      finalTags = tags || "phone,computer";
      finalMessage = customMessage;
      clickUrl = `${baseDomain}/admin/comms`;
    } else {
      return NextResponse.json(
        { error: 'Invalid payload: Either (caller, environment, roomId) or (message) must be provided' },
        { status: 400 }
      );
    }

    const ntfyUrl = 'https://ntfy.sh/webos-mohamed-calls';

    // تنظيف الترويسات من أي أحرف خارج نطاق ASCII لمنع خطأ الـ ByteString في Edge Runtime
    const headers: Record<string, string> = {
      'Title': finalTitle.replace(/[^\x00-\x7F]/g, ""),
      'Priority': finalPriority,
      'Tags': finalTags,
    };

    if (clickUrl) {
      headers['Click'] = clickUrl;
    }

    // إرسال الإشعار لـ ntfy.sh عبر Edge fetch
    const response = await fetch(ntfyUrl, {
      method: 'POST',
      body: finalMessage,
      headers,
    });

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
