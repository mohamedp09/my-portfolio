import { NextResponse } from "next/server";
import { createProduct, getAllProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ products: getAllProducts() });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }

    const emoji = typeof body.emoji === "string" ? body.emoji : "📦";
    const price = typeof body.price === "string" ? body.price : "";
    const desc = typeof body.desc === "string" ? body.desc : "";
    const link = typeof body.link === "string" ? body.link : "";
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    const order = typeof body.order === "number" && !Number.isNaN(body.order) ? body.order : 999;

    const product = createProduct({ emoji, title, price, desc, tags, link, order });
    return NextResponse.json({ product });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create product.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
