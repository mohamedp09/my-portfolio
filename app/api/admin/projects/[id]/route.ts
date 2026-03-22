import { NextResponse } from "next/server";
import type { Project } from "@/lib/projects";
import { deleteProject, updateProject } from "@/lib/projects";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const patch: Partial<Project> = {};
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.description === "string") patch.description = body.description;
    if (typeof body.longDescription === "string") patch.longDescription = body.longDescription;
    if (typeof body.image === "string") patch.image = body.image;
    if (typeof body.liveUrl === "string") patch.liveUrl = body.liveUrl.trim();
    if (typeof body.githubUrl === "string") patch.githubUrl = body.githubUrl.trim();
    if (body.status === "launched" || body.status === "building" || body.status === "planned") {
      patch.status = body.status;
    }
    if (typeof body.featured === "boolean") patch.featured = body.featured;
    if (typeof body.date === "string") patch.date = body.date.trim();
    if (typeof body.order === "number" && !Number.isNaN(body.order)) patch.order = body.order;
    if (Array.isArray(body.tags)) {
      patch.tags = body.tags.map((t: unknown) => String(t));
    } else if (typeof body.tags === "string") {
      patch.tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const project = updateProject(id, patch);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const ok = deleteProject(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
