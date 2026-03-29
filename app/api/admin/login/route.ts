import { NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  isAdminLoginConfigured,
  isJwtSecretConfigured,
  SESSION_COOKIE_NAME,
  signToken,
  validateAdminCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!isJwtSecretConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server misconfigured: set JWT_SECRET (at least 16 characters) in environment variables.",
        },
        { status: 503 }
      );
    }

    if (!isAdminLoginConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Admin login is not configured: set ADMIN_USERNAME and ADMIN_PASSWORD on the server (or set a password in Account after deploying with a persisted content/ folder).",
        },
        { status: 503 }
      );
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signToken({ sub: username.trim() });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (e) {
    console.error("[admin/login]", e);
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
