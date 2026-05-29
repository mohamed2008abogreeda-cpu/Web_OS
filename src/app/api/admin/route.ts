// ============================================================
// API: POST /api/admin — Admin authentication
// Password validated against environment variable, never client-bundled.
// ============================================================
import { NextRequest, NextResponse } from "next/server";

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

    if (password === adminPassword) {
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
    }

    return NextResponse.json(
      { success: false, message: "Invalid password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
