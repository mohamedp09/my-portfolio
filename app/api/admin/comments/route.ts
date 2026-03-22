import { NextResponse } from "next/server";
import { getAllCommentsForAdmin } from "@/lib/comments";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const comments = getAllCommentsForAdmin();
  return NextResponse.json({ comments });
}
