export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { triggerPusherEdge } from '@/lib/pusherEdge';

export async function POST(req: Request) {
  try {
    const { roomId, role, type, payload } = await req.json();

    if (!roomId || !type) {
      return NextResponse.json({ error: 'Missing roomId or type' }, { status: 400 });
    }

    await triggerPusherEdge(`call-${roomId}`, 'signal', {
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
