import { NextResponse } from "next/server";
import { createBanner, getAllBanners } from "@/lib/banners";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ banners: getAllBanners() });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required." }, { status: 400 });
    }

    const link = typeof body.link === "string" ? body.link.trim() : "";
    const active = Boolean(body.active);
    const order = typeof body.order === "number" && !Number.isNaN(body.order) ? body.order : 999;

    const banner = createBanner({ title, imageUrl, link, active, order });
    return NextResponse.json({ banner });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create banner.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
