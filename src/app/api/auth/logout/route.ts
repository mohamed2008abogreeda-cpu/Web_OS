import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST: Secure session termination (Logout)
 * Cryptographically purges the HttpOnly admin_session cookie.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json({
      success: true,
      message: 'Session terminated'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
