// Session token = base64url(payload) "." base64url(HMAC-SHA256(payload)).
// Uses Web Crypto so the SAME code runs in the Node route handler (signing)
// and the Edge middleware (verifying).

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  label: string;
  iat: number;
  exp: number;
}

export async function signToken(payload: SessionPayload, secret: string): Promise<string> {
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return `${body}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyToken(token: string, secret: string): Promise<SessionPayload | null> {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const key = await importKey(secret);
  let ok = false;
  try {
    ok = await crypto.subtle.verify("HMAC", key, b64urlDecode(sig), enc.encode(body));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const payload = JSON.parse(dec.decode(b64urlDecode(body))) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ACCESS_CODES = "label:code,label2:code2" (labelled) or "code1,code2" (bare).
// Returns Map<code, label>. A bare code uses the code itself as its label.
export function parseAccessCodes(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const idx = part.indexOf(":");
    if (idx > -1) {
      const label = part.slice(0, idx).trim();
      const code = part.slice(idx + 1).trim();
      if (code) map.set(code, label || code);
    } else {
      map.set(part, part);
    }
  }
  return map;
}

export const SESSION_COOKIE = "lm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
