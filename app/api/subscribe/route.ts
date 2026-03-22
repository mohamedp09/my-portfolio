import { NextResponse } from "next/server";
import { addSubscriber, isSubscribed, isValidEmail } from "@/lib/subscribers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const name = typeof o.name === "string" ? o.name.trim() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (isSubscribed(email)) {
    return NextResponse.json({ ok: true, already: true });
  }

  try {
    addSubscriber(email, name);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed.";
    if (msg.includes("Already")) {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
