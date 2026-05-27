// ============================================================
// API: POST /api/admin — Admin authentication
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === ADMIN_PASSWORD) {
      // In production: generate a secure JWT with Cloudflare Workers
      const mockToken = Buffer.from(
        JSON.stringify({ role: 'admin', iat: Date.now(), exp: Date.now() + 3600000 })
      ).toString('base64');

      return NextResponse.json({
        success: true,
        token: mockToken,
        message: 'Authentication successful',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
