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
  const theme = (body as { theme?: string }).theme;
  if (theme !== "dark" && theme !== "light") {
    return NextResponse.json({ error: "theme must be dark or light" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, theme });
  res.cookies.set("theme", theme, COOKIE);
  return res;
}
