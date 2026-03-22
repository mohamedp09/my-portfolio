import { NextResponse } from "next/server";
import { getMessages } from "@/lib/messages";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await getMessages();
  return NextResponse.json({ messages });
}
