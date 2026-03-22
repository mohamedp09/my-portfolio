import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const locale = (body as { locale?: string }).locale;
  if (locale !== "en" && locale !== "ar") {
    return NextResponse.json({ error: "locale must be en or ar" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set("locale", locale, COOKIE);
  return res;
}
