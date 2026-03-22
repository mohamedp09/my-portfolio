import { NextResponse } from "next/server";
import {
  deletePost,
  isValidSlug,
  readPostFile,
  renamePostFile,
  savePost,
  type PostMeta,
} from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const post = await readPostFile(slug, { onlyPublished: false });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: oldSlug } = await context.params;

  try {
    const existing = await readPostFile(oldSlug, { onlyPublished: false });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : existing.title;
    const newSlug = typeof body.slug === "string" ? body.slug.trim() : oldSlug;
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : existing.excerpt;
    const content = typeof body.content === "string" ? body.content : existing.content;
    const published = typeof body.published === "boolean" ? body.published : existing.published;
    let tags: string[] = existing.tags;
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t));
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    if (!isValidSlug(newSlug)) {
      return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
    }

    if (newSlug !== oldSlug) {
      const clash = await readPostFile(newSlug, { onlyPublished: false });
      if (clash) {
        return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
      }
      await renamePostFile(oldSlug, newSlug);
    }

    const meta: PostMeta = {
      title,
      slug: newSlug,
      excerpt,
      date: existing.date,
      tags,
      published,
      views: existing.views,
    };

    await savePost(meta, content);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update post.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const ok = await deletePost(slug);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
