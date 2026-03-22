import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addPostLike, getPostLikes } from "@/lib/likes";
import { postLikeCookieName } from "@/lib/likeCookie";
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
  const jar = await cookies();
  const liked = Boolean(jar.get(postLikeCookieName(slug))?.value);
  const likes = getPostLikes(slug).map(({ id, name, createdAt }) => ({ id, name, createdAt }));
  return NextResponse.json({
    count: likes.length,
    likes,
    liked,
  });
}

export async function POST(request: Request, context: Ctx) {
  const { slug: raw } = await context.params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jar = await cookies();
  const cname = postLikeCookieName(slug);
  if (jar.get(cname)?.value) {
    const likes = getPostLikes(slug).map(({ id, name, createdAt }) => ({ id, name, createdAt }));
    return NextResponse.json(
      {
        count: likes.length,
        likes,
        liked: true,
        error: "Already liked.",
      },
      { status: 409 }
    );
  }

  let name = "";
  try {
    const body = await request.json();
    if (body && typeof body === "object" && typeof (body as { name?: string }).name === "string") {
      name = (body as { name: string }).name.trim();
    }
  } catch {
    /* empty body */
  }
  if (!name) {
    const fromCookie = jar.get("visitor_name")?.value;
    if (fromCookie) {
      try {
        name = decodeURIComponent(fromCookie).trim();
      } catch {
        name = fromCookie.trim();
      }
    }
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required (at least 2 characters)." }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 });
  }

  const result = addPostLike(slug, name);
  const payload = {
    count: result.count,
    likes: result.likes.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    })),
    liked: true,
  };
  const res = NextResponse.json(payload);
  res.cookies.set(cname, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return res;
}
