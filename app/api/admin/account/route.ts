import { NextResponse } from "next/server";
import { requireAdmin, validateAdminCredentials } from "@/lib/auth";
import { getAccount, setAvatarUrl, setPasswordHash } from "@/lib/account";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const acc = getAccount();
    return NextResponse.json({
      username: admin.username,
      avatarUrl: acc?.avatarUrl ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load account." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      if (!validateAdminCredentials(admin.username, currentPassword)) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }
      setPasswordHash(newPassword);
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && !avatarUrl.startsWith("/")) {
        return NextResponse.json({ error: "Avatar URL must be a site path starting with /." }, { status: 400 });
      }
      setAvatarUrl(avatarUrl);
    }

    const acc = getAccount();
    return NextResponse.json({
      ok: true,
      username: admin.username,
      avatarUrl: acc?.avatarUrl ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update account." }, { status: 500 });
  }
}
