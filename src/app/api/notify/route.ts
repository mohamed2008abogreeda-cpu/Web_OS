export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caller, environment, roomId } = body;

    // التحقق الصارم من المدخلات المطلوبة للاتصال الآمن
    if (!caller || !environment || !roomId) {
      return NextResponse.json(
        { error: 'Missing required parameters: caller, environment, and roomId are required' },
        { status: 400 }
      );
    }

    // بناء الرابط التفاعلي ديناميكياً ليعمل في البيئة المحلية والإنتاجية
    const reqUrl = new URL(request.url);
    const protocol = request.headers.get('x-forwarded-proto') || (reqUrl.protocol.includes('https') ? 'https' : 'http');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || reqUrl.host;
    
    // دعم استخدام المتغير البيئي المخصص للبيئات المحلية المتصلة بشبكات خارجية أو خدمات الأنفاق مثل ngrok/LocalIP
    const baseDomain = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const clickUrl = `${baseDomain}/admin/comms?room=${roomId}`;

    const ntfyUrl = 'https://ntfy.sh/webos-mohamed-calls';
    const message = `Incoming Comms Request by: ${caller} from OS: ${environment}`;

    // إرسال الإشعار الحرج عبر ntfy.sh باستخدام fetch القياسي المتوافق مع Edge
    const response = await fetch(ntfyUrl, {
      method: 'POST',
      body: message,
      headers: {
        'Title': 'SECURE LINK INITIATED',
        'Priority': '5',
        'Tags': 'warning,skull,computer',
        'Click': clickUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification via ntfy: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Secure link pinged successfully',
      roomId,
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
