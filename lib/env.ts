/** Strip optional surrounding quotes from .env values (e.g. KEY="value") */
export function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null || raw === "") return undefined;
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
}

export function requireEnv(name: string): string {
  const v = readEnv(name);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

/** Base URL for absolute Open Graph / canonical URLs (Vercel + local). */
export function getMetadataBaseUrl(): URL {
  const explicit = readEnv("NEXT_PUBLIC_SITE_URL");
  if (explicit) {
    try {
      return new URL(explicit.startsWith("http") ? explicit : `https://${explicit}`);
    } catch {
      /* fall through */
    }
  }
  const vercel = readEnv("VERCEL_URL");
  if (vercel) {
    try {
      return new URL(`https://${vercel.replace(/^https?:\/\//, "")}`);
    } catch {
      /* fall through */
    }
  }
  return new URL("http://localhost:3000");
}
