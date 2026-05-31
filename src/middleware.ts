import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Step A: Maintenance Mode Check (KV Kill Switch)
  try {
    const kv = process.env.GLOBAL_STATE;
    if (kv) {
      const maintenanceMode = await kv.get('MAINTENANCE_MODE');
      if (maintenanceMode === 'true') {
        // Exempt admin panel, auth APIs, next assets, login page, and favicon
        if (
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/login') &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/_next') &&
          pathname !== '/favicon.ico'
        ) {
          return new NextResponse(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SYSTEM_MAINTENANCE_ACTIVE</title>
              <style>
                body { background: #050505; color: #10b981; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
                .container { border: 1px solid #064e3b; background: #000; padding: 40px; border-radius: 8px; max-width: 500px; box-shadow: 0 0 30px rgba(16,185,129,0.05); }
                h1 { font-size: 20px; margin-top: 0; color: #fff; text-shadow: 0 0 10px rgba(16,185,129,0.3); letter-spacing: 2px; }
                p { font-size: 13px; color: #a1a1aa; line-height: 1.6; }
                .pulse { display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; margin-right: 8px; }
                @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.5; } }
              </style>
             </head>
             <body>
               <div class="container">
                 <h1><span class="pulse"></span>SYSTEM_MAINTENANCE</h1>
                 <p>Our virtual OS environment is currently undergoing core system updates. Security patches and database sync operations are in progress.</p>
                 <p style="font-size: 11px; color: #047857; margin-top: 30px;">STATUS_CODE: 503_SERVICE_TEMPORARILY_UNAVAILABLE</p>
               </div>
             </body>
             </html>`,
            {
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            }
          );
        }
      }
    }
  } catch (err) {
    console.error('[Edge Middleware] KV read failure:', err);
  }

  // 2. Step B: Admin Authentication Guard
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session')?.value;
    const expectedToken = process.env.ADMIN_HASH || '0e2df64939a0f3ffff872b1e534018c73ec22765f27ae16e05398717662674d7';

    // Timing-Attack Resistant Comparison
    const isSessionValid = adminSession && timingSafeEqual(adminSession, expectedToken);

    if (!isSessionValid) {
      // Redirect unauthenticated user to the /login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercept all routes except static assets and icons
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Fully Edge and Cloudflare Workers compatible (O(N) runtime based on string length).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
