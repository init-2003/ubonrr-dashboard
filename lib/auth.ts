import { AuthUser } from "./types";

export const COOKIE_NAME = "ubonrr_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const SECRET_KEY = process.env.AUTH_SECRET || "ubonrr_financial_analytics_secret_2026_key";

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  // Browser/Edge fallback
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(base64)));
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

interface SessionPayload {
  user: AuthUser;
  exp: number; // Expiration timestamp in seconds
  iat: number; // Issued at timestamp in seconds
}

export async function createSessionToken(
  user: AuthUser,
  maxAge: number = SESSION_MAX_AGE
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    user,
    iat: now,
    exp: now + maxAge,
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload)
  );

  let binary = "";
  const bytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const encodedSignature = base64UrlEncode(binary);

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token || !token.includes(".")) return null;
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature) return null;

    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    
    // Decode signature
    const sigBinary = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(encodedPayload)
    );

    if (!isValid) return null;

    const payloadString = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadString);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload.user;
  } catch (err) {
    console.error("Session verification error:", err);
    return null;
  }
}

export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE, isSecure?: boolean) {
  // Only set secure: true when explicitly requested or accessed over HTTPS,
  // allowing HTTP intranet access (e.g. http://192.168.x.x:8083) to store cookies without browser rejection
  const secure = isSecure !== undefined
    ? isSecure
    : process.env.COOKIE_SECURE === "true";

  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAge,
  };
}
