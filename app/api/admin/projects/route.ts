import { NextResponse } from "next/server";
import { createProject, getAllProjects } from "@/lib/projects";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ projects: getAllProjects() });
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

    const description = typeof body.description === "string" ? body.description : "";
    const longDescription = typeof body.longDescription === "string" ? body.longDescription : "";
    const image = typeof body.image === "string" ? body.image : "";
    const liveUrl = typeof body.liveUrl === "string" ? body.liveUrl.trim() : "";
    const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";
    const status =
      body.status === "launched" || body.status === "building" || body.status === "planned"
        ? body.status
        : "planned";
    const featured = Boolean(body.featured);
    const date =
      typeof body.date === "string" && body.date.trim()
        ? body.date.trim()
        : new Date().toISOString().slice(0, 10);
    const order = typeof body.order === "number" && !Number.isNaN(body.order) ? body.order : 999;

    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t));
    } else if (typeof body.tags === "string") {
      tags = body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const project = createProject({
      title,
      description,
      longDescription,
      tags,
      image,
      liveUrl,
      githubUrl,
      status,
      featured,
      date,
      order,
    });
    return NextResponse.json({ project });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create project.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
