import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { likeReply } from "@/lib/comments";
import { replyLikeCookieName } from "@/lib/likeCookie";
import { readPostFile } from "@/lib/posts";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string; id: string; replyId: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(_request: Request, context: Ctx) {
  const { slug: raw, id: parentId, replyId } = await context.params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jar = await cookies();
  const cname = replyLikeCookieName(replyId);
  if (jar.get(cname)?.value) {
    return NextResponse.json({ error: "Already liked." }, { status: 409 });
  }

  try {
    const likes = likeReply(slug, parentId, replyId);
    const res = NextResponse.json({ ok: true, likes });
    res.cookies.set(cname, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }
}
