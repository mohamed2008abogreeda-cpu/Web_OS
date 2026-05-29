import md5 from 'crypto-js/md5';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

export async function triggerPusherEdge(channel: string, event: string, payload: any) {
  const appId = process.env.PUSHER_APP_ID || 'dummy_app_id';
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy_key';
  const secret = process.env.PUSHER_SECRET || 'dummy_secret';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify({
    name: event,
    channels: [channel],
    data: JSON.stringify(payload) // Pusher REST API expects data to be a JSON string
  });

  const bodyMd5 = md5(bodyString).toString(Hex);
  const method = 'POST';
  const path = `/apps/${appId}/events`;
  const queryString = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
  
  const signData = [method, path, queryString].join('\n');
  const authSignature = hmacSHA256(signData, secret).toString(Hex);

  const url = `https://api-${cluster}.pusher.com${path}?${queryString}&auth_signature=${authSignature}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyString
  });
  
  if (!res.ok) {
    throw new Error(`Pusher fetch failed: ${res.status} ` + await res.text());
  }
  return res.json();
}
