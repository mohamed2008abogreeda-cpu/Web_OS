import { NextResponse } from 'next/server';

const NTFY_TOPIC = 'web_os_admin_alerts_982b'; // A unique topic for this specific portfolio

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, tags, priority } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Send push notification to ntfy.sh
    const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: message,
      headers: {
        'Title': title || 'Web OS Alert',
        'Tags': tags || 'computer', // comma-separated emojis or tags (e.g., 'warning,skull')
        'Priority': priority || '3', // 1 (min) to 5 (max)
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return NextResponse.json({ success: true, topic: NTFY_TOPIC });
  } catch (error) {
    console.error('Ntfy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
