import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret-passcode';

    if (!passcode || passcode !== adminSecret) {
      return NextResponse.json({ error: 'Access Denied: Invalid Passcode' }, { status: 401 });
    }

    // Compute session token via browser-standard Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(adminSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const response = NextResponse.json({ success: true });
    
    // Set HttpOnly, Secure, SameSite cookie safely at the edge
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours session TTL
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Authentication Failure' },
      { status: 500 }
    );
  }
}
