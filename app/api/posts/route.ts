import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("limit");
    const limit = raw ? Math.min(Math.max(parseInt(raw, 10) || 10, 1), 50) : 10;

    const all = await getAllPosts({ includeDrafts: false });
    const posts = all.slice(0, limit).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
    }));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
  }
}
