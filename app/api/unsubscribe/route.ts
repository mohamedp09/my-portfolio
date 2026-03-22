import { NextResponse } from "next/server";
import { isValidEmail, removeSubscriber } from "@/lib/subscribers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = typeof (body as { email?: string }).email === "string" ? (body as { email: string }).email.trim() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  const ok = removeSubscriber(email);
  return NextResponse.json({ ok: true, removed: ok });
}
