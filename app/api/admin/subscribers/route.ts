import { NextResponse } from "next/server";
import { getAllSubscribers } from "@/lib/subscribers";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ subscribers: getAllSubscribers() });
}
