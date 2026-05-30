// ============================================================
// API: POST /api/admin — Admin authentication
// Password validated against environment variable with timing-safe comparison.
// ============================================================
import { NextRequest, NextResponse } from "next/server";

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 * Returns true only if both strings are identical, without leaking
 * information about which characters differ.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set.");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    if (typeof password !== 'string' || !timingSafeEqual(password, adminPassword)) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate a base64-encoded token using the Web API btoa()
    const mockToken = btoa(
      JSON.stringify({
        role: "admin",
        iat: Date.now(),
        exp: Date.now() + 3600000,
      })
    );

    return NextResponse.json({
      success: true,
      token: mockToken,
      message: "Authentication successful",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
