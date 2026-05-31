import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const appId = process.env.CLOUDFLARE_CALLS_APP_ID || process.env.CLOUDFLARE_APP_ID;
    const appSecret = process.env.CLOUDFLARE_CALLS_APP_SECRET || process.env.CLOUDFLARE_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('[Cloudflare Calls Backend Error]: Credentials process.env.CLOUDFLARE_CALLS_APP_ID or process.env.CLOUDFLARE_CALLS_APP_SECRET are not defined.');
      return NextResponse.json(
        { error: 'Cloudflare Calls credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${appId}`;

    if (action === 'createSession') {
      const { offerSdp } = body;
      const res = await fetch(`${baseUrl}/sessions/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionDescription: {
            type: 'offer',
            sdp: offerSdp,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `Cloudflare Calls Session Error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'addTrack') {
      const { sessionId, offerSdp, trackName, mid } = body;
      const res = await fetch(`${baseUrl}/sessions/${sessionId}/tracks/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionDescription: {
            type: 'offer',
            sdp: offerSdp,
          },
          tracks: [
            {
              location: 'local',
              trackName,
              mid,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `Cloudflare Calls Add Track Error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'pullTrack') {
      const { sessionId, offerSdp, remoteSessionId, trackName } = body;
      const res = await fetch(`${baseUrl}/sessions/${sessionId}/tracks/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionDescription: {
            type: 'offer',
            sdp: offerSdp,
          },
          tracks: [
            {
              location: 'remote',
              sessionId: remoteSessionId,
              trackName,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `Cloudflare Calls Pull Track Error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Cloudflare Calls API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
