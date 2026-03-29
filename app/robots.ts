import type { MetadataRoute } from "next";
import { getMetadataBaseUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getMetadataBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/api"],
    },
    sitemap: `${base.origin}/sitemap.xml`,
  };
}
