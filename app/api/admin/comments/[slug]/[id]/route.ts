import { NextResponse } from "next/server";
import { deleteCommentCascade, setApproved } from "@/lib/comments";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string; id: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function PATCH(request: Request, context: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: raw, id } = await context.params;
  const slug = decodeSlug(raw);
  const body = await request.json().catch(() => ({}));
  const approved = typeof body.approved === "boolean" ? body.approved : undefined;
  if (approved === undefined) {
    return NextResponse.json({ error: "Missing approved." }, { status: 400 });
  }
  const row = setApproved(slug, id, approved);
  if (!row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, comment: row });
}

export async function DELETE(_request: Request, context: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: raw, id } = await context.params;
  const slug = decodeSlug(raw);
  const ok = deleteCommentCascade(slug, id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
