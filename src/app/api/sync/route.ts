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
    const { sessionId, cursor, windows } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    await pusher.trigger(`sync-${sessionId}`, 'state-update', {
      windows,
      cursor
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pusher sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
