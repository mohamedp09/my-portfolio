import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ projects: getAllProjects() });
  } catch {
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
}
