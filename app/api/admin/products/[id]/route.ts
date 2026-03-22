import { NextResponse } from "next/server";
import { deleteProduct, updateProduct } from "@/lib/products";
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
    let tags: string[] | undefined;
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const product = updateProduct(id, {
      emoji: typeof body.emoji === "string" ? body.emoji : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      price: typeof body.price === "string" ? body.price : undefined,
      desc: typeof body.desc === "string" ? body.desc : undefined,
      link: typeof body.link === "string" ? body.link : undefined,
      tags,
      order: typeof body.order === "number" && !Number.isNaN(body.order) ? body.order : undefined,
    });
    if (!product) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
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
  const ok = deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
