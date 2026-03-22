import { NextResponse } from "next/server";
import { deleteBanner, updateBanner } from "@/lib/banners";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const banner = updateBanner(id, {
      title: typeof body.title === "string" ? body.title : undefined,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
      link: typeof body.link === "string" ? body.link : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
      order: typeof body.order === "number" && !Number.isNaN(body.order) ? body.order : undefined,
    });
    if (!banner) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ banner });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = deleteBanner(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
