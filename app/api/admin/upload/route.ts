import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 3MB)." }, { status: 400 });
    }

    const type = file.type || "";
    if (!type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    const ext =
      type === "image/png"
        ? "png"
        : type === "image/jpeg" || type === "image/jpg"
          ? "jpg"
          : type === "image/webp"
            ? "webp"
            : type === "image/gif"
              ? "gif"
              : null;
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const name = `${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const full = path.join(dir, name);
    await fs.writeFile(full, buf);

    const url = `/uploads/${name}`;
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
