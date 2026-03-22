import { NextResponse } from "next/server";
import { addComment, getPublicCommentsForPost } from "@/lib/comments";
import { readPostFile } from "@/lib/posts";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { slug: raw } = await context.params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const comments = getPublicCommentsForPost(slug);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, context: Ctx) {
  const { slug: raw } = await context.params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const authorName = typeof body.authorName === "string" ? body.authorName : "";
    const authorEmail = typeof body.authorEmail === "string" ? body.authorEmail : undefined;
    const text = typeof body.body === "string" ? body.body : "";
    if (authorName.trim().length < 2 || text.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a name and comment." }, { status: 400 });
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: "Comment is too long." }, { status: 400 });
    }
    const row = addComment({
      postSlug: slug,
      authorName,
      authorEmail,
      body: text,
      approved: false,
    });
    return NextResponse.json({ ok: true, id: row.id, pendingApproval: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to post comment.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
