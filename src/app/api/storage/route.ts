// ============================================================
// API: POST & GET /api/storage — Native Cloudflare R2 Upload & Retreival
// falling back gracefully to static mock assets if R2 is not active.
// ============================================================
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Guard: Check if R2 Bucket storage binding exists
    if (!process.env.BUCKET) {
      console.warn("[R2Storage] R2 BUCKET binding not found. Falling back to mock URL.");
      return NextResponse.json({
        success: true,
        mock: true,
        fileUrl: `/wallpapers/porsche_dark_wallpaper.png`,
        message: "Mock uploaded successfully (No native R2 Bucket bound yet)."
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: "No file found in request payload" }, { status: 400 });
    }

    // Convert file to ArrayBuffer for R2 compatibility
    const arrayBuffer = await file.arrayBuffer();
    // Create an elegant, unique key under the wallpapers namespace
    const key = `wallpapers/${crypto.randomUUID()}-${file.name.replace(/[^\x00-\x7F]/g, "")}`;

    // Upload securely to Cloudflare R2 Object Storage
    await process.env.BUCKET.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type }
    });

    return NextResponse.json({
      success: true,
      fileUrl: `/api/storage?key=${encodeURIComponent(key)}`,
      key,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("R2 storage put error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: "Storage key parameter is required" }, { status: 400 });
    }

    // 1. If R2 is not bound, redirect/serve fallback local image
    if (!process.env.BUCKET) {
      return NextResponse.redirect(new URL('/wallpapers/dark-grid.svg', req.url));
    }

    // 2. Fetch object from R2 bucket
    const object = await process.env.BUCKET.get(key);
    if (!object) {
      return NextResponse.json({ error: "Object not found in storage" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("R2 storage get error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
