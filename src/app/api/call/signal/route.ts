export const runtime = 'edge';

import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const { roomId, role, type, payload } = await req.json();

    if (!roomId || !type) {
      return NextResponse.json({ error: 'Missing roomId or type' }, { status: 400 });
    }

    // Broadcast WebRTC signaling data securely
    await pusher.trigger(`call-${roomId}`, 'signal', {
      role,
      type,
      payload
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pusher signal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
