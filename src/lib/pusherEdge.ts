// ============================================================
// Pusher Edge Client — Zero-dependency Pusher REST API trigger
// Uses Web Crypto API (native in Cloudflare Workers & all browsers)
// ============================================================

/**
 * Trigger a Pusher event via the HTTP REST API.
 * No external dependencies — uses only Web standard APIs.
 */
export async function triggerPusherEdge(
  channel: string,
  event: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const appId = process.env.PUSHER_APP_ID || "dummy_app_id";
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key";
  const secret = process.env.PUSHER_SECRET || "dummy_secret";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify({
    name: event,
    channels: [channel],
    data: JSON.stringify(payload),
  });

  const bodyMd5 = md5Hex(bodyString);
  const method = "POST";
  const path = `/apps/${appId}/events`;
  const queryString = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;

  const signData = [method, path, queryString].join("\n");
  const authSignature = await hmacSHA256Hex(signData, secret);

  const url = `https://api-${cluster}.pusher.com${path}?${queryString}&auth_signature=${authSignature}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyString,
  });

  if (!res.ok) {
    throw new Error(`Pusher fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

// ── HMAC-SHA256 via Web Crypto API ──────────────────────────
async function hmacSHA256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return bufToHex(new Uint8Array(signature));
}

// ── MD5 (pure JS — crypto.subtle does not support MD5) ──────
// Based on RFC 1321. Compact, well-tested implementation.
// Required because Pusher REST API mandates body_md5 in the query.
function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const words = bytesToWords(bytes);
  const len = bytes.length * 8;

  words[len >>> 5] |= 0x80 << len % 32;
  words[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < words.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;

    a = ff(a, b, c, d, words[i + 0] ?? 0, 7, 0xd76aa478);
    d = ff(d, a, b, c, words[i + 1] ?? 0, 12, 0xe8c7b756);
    c = ff(c, d, a, b, words[i + 2] ?? 0, 17, 0x242070db);
    b = ff(b, c, d, a, words[i + 3] ?? 0, 22, 0xc1bdceee);
    a = ff(a, b, c, d, words[i + 4] ?? 0, 7, 0xf57c0faf);
    d = ff(d, a, b, c, words[i + 5] ?? 0, 12, 0x4787c62a);
    c = ff(c, d, a, b, words[i + 6] ?? 0, 17, 0xa8304613);
    b = ff(b, c, d, a, words[i + 7] ?? 0, 22, 0xfd469501);
    a = ff(a, b, c, d, words[i + 8] ?? 0, 7, 0x698098d8);
    d = ff(d, a, b, c, words[i + 9] ?? 0, 12, 0x8b44f7af);
    c = ff(c, d, a, b, words[i + 10] ?? 0, 17, 0xffff5bb1);
    b = ff(b, c, d, a, words[i + 11] ?? 0, 22, 0x895cd7be);
    a = ff(a, b, c, d, words[i + 12] ?? 0, 7, 0x6b901122);
    d = ff(d, a, b, c, words[i + 13] ?? 0, 12, 0xfd987193);
    c = ff(c, d, a, b, words[i + 14] ?? 0, 17, 0xa679438e);
    b = ff(b, c, d, a, words[i + 15] ?? 0, 22, 0x49b40821);

    a = gg(a, b, c, d, words[i + 1] ?? 0, 5, 0xf61e2562);
    d = gg(d, a, b, c, words[i + 6] ?? 0, 9, 0xc040b340);
    c = gg(c, d, a, b, words[i + 11] ?? 0, 14, 0x265e5a51);
    b = gg(b, c, d, a, words[i + 0] ?? 0, 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, words[i + 5] ?? 0, 5, 0xd62f105d);
    d = gg(d, a, b, c, words[i + 10] ?? 0, 9, 0x02441453);
    c = gg(c, d, a, b, words[i + 15] ?? 0, 14, 0xd8a1e681);
    b = gg(b, c, d, a, words[i + 4] ?? 0, 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, words[i + 9] ?? 0, 5, 0x21e1cde6);
    d = gg(d, a, b, c, words[i + 14] ?? 0, 9, 0xc33707d6);
    c = gg(c, d, a, b, words[i + 3] ?? 0, 14, 0xf4d50d87);
    b = gg(b, c, d, a, words[i + 8] ?? 0, 20, 0x455a14ed);
    a = gg(a, b, c, d, words[i + 13] ?? 0, 5, 0xa9e3e905);
    d = gg(d, a, b, c, words[i + 2] ?? 0, 9, 0xfcefa3f8);
    c = gg(c, d, a, b, words[i + 7] ?? 0, 14, 0x676f02d9);
    b = gg(b, c, d, a, words[i + 12] ?? 0, 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, words[i + 5] ?? 0, 4, 0xfffa3942);
    d = hh(d, a, b, c, words[i + 8] ?? 0, 11, 0x8771f681);
    c = hh(c, d, a, b, words[i + 11] ?? 0, 16, 0x6d9d6122);
    b = hh(b, c, d, a, words[i + 14] ?? 0, 23, 0xfde5380c);
    a = hh(a, b, c, d, words[i + 1] ?? 0, 4, 0xa4beea44);
    d = hh(d, a, b, c, words[i + 4] ?? 0, 11, 0x4bdecfa9);
    c = hh(c, d, a, b, words[i + 7] ?? 0, 16, 0xf6bb4b60);
    b = hh(b, c, d, a, words[i + 10] ?? 0, 23, 0xbebfbc70);
    a = hh(a, b, c, d, words[i + 13] ?? 0, 4, 0x289b7ec6);
    d = hh(d, a, b, c, words[i + 0] ?? 0, 11, 0xeaa127fa);
    c = hh(c, d, a, b, words[i + 3] ?? 0, 16, 0xd4ef3085);
    b = hh(b, c, d, a, words[i + 6] ?? 0, 23, 0x04881d05);
    a = hh(a, b, c, d, words[i + 9] ?? 0, 4, 0xd9d4d039);
    d = hh(d, a, b, c, words[i + 12] ?? 0, 11, 0xe6db99e5);
    c = hh(c, d, a, b, words[i + 15] ?? 0, 16, 0x1fa27cf8);
    b = hh(b, c, d, a, words[i + 2] ?? 0, 23, 0xc4ac5665);

    a = ii(a, b, c, d, words[i + 0] ?? 0, 6, 0xf4292244);
    d = ii(d, a, b, c, words[i + 7] ?? 0, 10, 0x432aff97);
    c = ii(c, d, a, b, words[i + 14] ?? 0, 15, 0xab9423a7);
    b = ii(b, c, d, a, words[i + 5] ?? 0, 21, 0xfc93a039);
    a = ii(a, b, c, d, words[i + 12] ?? 0, 6, 0x655b59c3);
    d = ii(d, a, b, c, words[i + 3] ?? 0, 10, 0x8f0ccc92);
    c = ii(c, d, a, b, words[i + 10] ?? 0, 15, 0xffeff47d);
    b = ii(b, c, d, a, words[i + 1] ?? 0, 21, 0x85845dd1);
    a = ii(a, b, c, d, words[i + 8] ?? 0, 6, 0x6fa87e4f);
    d = ii(d, a, b, c, words[i + 15] ?? 0, 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, words[i + 6] ?? 0, 15, 0xa3014314);
    b = ii(b, c, d, a, words[i + 13] ?? 0, 21, 0x4e0811a1);
    a = ii(a, b, c, d, words[i + 4] ?? 0, 6, 0xf7537e82);
    d = ii(d, a, b, c, words[i + 11] ?? 0, 10, 0xbd3af235);
    c = ii(c, d, a, b, words[i + 2] ?? 0, 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, words[i + 9] ?? 0, 21, 0xeb86d391);

    a = add(a, aa);
    b = add(b, bb);
    c = add(c, cc);
    d = add(d, dd);
  }

  return wordsToHex([a, b, c, d]);
}

// ── MD5 helper functions ────────────────────────────────────
function add(x: number, y: number): number {
  return (x + y) | 0;
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  a = add(add(a, q), add(x, t));
  return add((a << s) | (a >>> (32 - s)), b);
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function bytesToWords(bytes: Uint8Array): number[] {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] |= bytes[i] << ((i % 4) * 8);
  }
  return words;
}

function wordsToHex(words: number[]): string {
  const hex: string[] = [];
  for (const word of words) {
    for (let j = 0; j < 4; j++) {
      hex.push(((word >>> (j * 8)) & 0xff).toString(16).padStart(2, "0"));
    }
  }
  return hex.join("");
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
