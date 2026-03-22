import { NextResponse } from "next/server";
import { getSiteSettings, mergeSiteSettings, type SiteSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function isValidSettingsPatch(body: unknown): body is Partial<SiteSettings> {
  return body !== null && typeof body === "object";
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: getSiteSettings() });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!isValidSettingsPatch(body)) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }
    const settings = mergeSiteSettings(body);
    return NextResponse.json({ ok: true, settings });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save settings.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
