export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { triggerPusherEdge } from '@/lib/pusherEdge';

export async function POST(req: Request) {
  try {
    const { sessionId, cursor, windows } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    await triggerPusherEdge(`sync-${sessionId}`, 'state-update', {
      windows,
      cursor
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pusher sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
