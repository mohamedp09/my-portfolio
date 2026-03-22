import { NextResponse } from "next/server";
import { createPost, getAllPosts, isValidSlug } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getAllPosts({ includeDrafts: true });
  const list = posts.map(({ content, ...rest }) => ({ ...rest, content }));
  return NextResponse.json({ posts: list });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const published = Boolean(body.published);
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t));
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    if (!title || !slug || !excerpt) {
      return NextResponse.json({ error: "title, slug, and excerpt are required." }, { status: 400 });
    }
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
    }

    await createPost(
      {
        title,
        slug,
        excerpt,
        date: new Date().toISOString(),
        tags,
        published,
      },
      content
    );

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create post.";
    const status = msg === "Post already exists" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
