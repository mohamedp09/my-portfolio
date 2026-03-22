import { NextResponse } from "next/server";
import { trackPageView } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body as { path?: string; referrer?: string };
  const path = typeof o.path === "string" ? o.path.trim() : "";
  const referrer = typeof o.referrer === "string" ? o.referrer : undefined;

  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  trackPageView(path, referrer);
  return NextResponse.json({ ok: true });
}
