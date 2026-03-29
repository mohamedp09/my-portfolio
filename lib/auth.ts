import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAccount, hasStoredPassword, verifyStoredPassword } from "@/lib/account";
import { readEnv } from "@/lib/env";

/** Must match `proxy.ts` cookie name */
export const SESSION_COOKIE_NAME = "admin_session";

function getSecret(): Uint8Array {
  const secret = readEnv("JWT_SECRET");
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function signToken(payload: { sub: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) throw new Error("Invalid token");
  return { sub };
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

export async function requireAdmin(): Promise<{ username: string } | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const { sub } = await verifyToken(token);
    return { username: sub };
  } catch {
    return null;
  }
}

export function isJwtSecretConfigured(): boolean {
  const s = readEnv("JWT_SECRET");
  return Boolean(s && s.length >= 16);
}

/** True when username is set and a password exists (env or hashed in account.json). */
export function isAdminLoginConfigured(): boolean {
  const u = readEnv("ADMIN_USERNAME")?.trim();
  if (!u) return false;
  if (hasStoredPassword()) return true;
  const p = readEnv("ADMIN_PASSWORD");
  return Boolean(p && p.length > 0);
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const u = readEnv("ADMIN_USERNAME")?.trim();
  if (!u || username.trim() !== u) return false;
  const acc = getAccount();
  if (acc?.password?.hash && acc?.password?.salt) {
    return verifyStoredPassword(password);
  }
  const p = readEnv("ADMIN_PASSWORD");
  if (!p) return false;
  return password === p;
}
