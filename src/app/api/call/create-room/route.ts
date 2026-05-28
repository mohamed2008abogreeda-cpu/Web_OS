import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { visitorName, roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const NTFY_TOPIC = 'webos-mohamed-calls';
    const adminJoinUrl = `https://webos.foggystorm.dpdns.org/admin/comms?roomId=${roomId}`;
    
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: {
          'Title': 'Incoming Call - WebOS Portfolio',
          'Priority': 'urgent',
          'Tags': 'phone,rotating_light',
          'Click': adminJoinUrl
        },
        body: `Call from ${visitorName || 'Anonymous'}. Click here to join.`
      });
      console.log('ntfy Triggered successfully');
    } catch (err) {
      console.warn('Failed to ring ntfy:', err);
    }

    return NextResponse.json({ success: true, url: adminJoinUrl });
  } catch (err) {
    console.error('[IFTTT Ring Error]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
