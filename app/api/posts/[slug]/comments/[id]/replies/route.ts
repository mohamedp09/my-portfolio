import { NextResponse } from "next/server";
import { addReply } from "@/lib/comments";
import { readPostFile } from "@/lib/posts";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string; id: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(request: Request, context: Ctx) {
  const { slug: raw, id: parentId } = await context.params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const authorName = typeof body.authorName === "string" ? body.authorName : "";
    const text = typeof body.body === "string" ? body.body : "";
    if (authorName.trim().length < 2 || text.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a name and reply." }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: "Reply is too long." }, { status: 400 });
    }
    const row = addReply(slug, parentId, { authorName, body: text, approved: false });
    return NextResponse.json({ ok: true, id: row.id, pendingApproval: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to post reply.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
