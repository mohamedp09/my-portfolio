import type { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { getAllPosts } from "@/lib/posts";

const baseUrl = "https://mohamedbuilds.org";

const APP_DIR = path.join(process.cwd(), "app");

async function findPageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "api") continue;
      results.push(...(await findPageFiles(full)));
    } else if (entry.name === "page.tsx") {
      results.push(full);
    }
  }
  return results;
}

function normalizeSegment(segment: string): string | null {
  if (segment.startsWith("(") && segment.endsWith(")")) return null;
  return segment;
}

function fileToSegments(filePath: string): string[] {
  const rel = path.relative(APP_DIR, path.dirname(filePath));
  if (!rel) return [];
  return rel
    .split(path.sep)
    .map(normalizeSegment)
    .filter((s): s is string => s !== null && s.length > 0);
}

function patternKey(segments: string[]): string {
  return segments.join("/");
}

function isDynamicSegment(segment: string): boolean {
  return /^\[[^\]]+\]$/.test(segment);
}

async function loadProjectIds(): Promise<string[]> {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "projects.json"), "utf8");
  const projects = JSON.parse(raw) as { id: string }[];
  return projects.map((p) => String(p.id));
}

/** One inner array = values for each dynamic segment in path order (left to right). */
async function resolveDynamicValueSets(pattern: string): Promise<string[][]> {
  if (pattern === "blog/[slug]") {
    const posts = await getAllPosts();
    return posts.map((p) => [p.slug]);
  }
  if (pattern === "admin/projects/edit/[id]") {
    const ids = await loadProjectIds();
    return ids.map((id) => [id]);
  }
  if (pattern === "admin/posts/edit/[slug]") {
    const posts = await getAllPosts({ includeDrafts: true });
    return posts.map((p) => [p.slug]);
  }
  return [];
}

function buildUrlFromSegments(segments: string[], valueRow: string[]): string | null {
  let vi = 0;
  const parts: string[] = [];
  for (const seg of segments) {
    if (isDynamicSegment(seg)) {
      if (vi >= valueRow.length) return null;
      parts.push(encodeURIComponent(valueRow[vi++]));
    } else {
      parts.push(encodeURIComponent(seg));
    }
  }
  if (vi !== valueRow.length) return null;
  if (parts.length === 0) return baseUrl;
  return `${baseUrl}/${parts.join("/")}`;
}

async function expandPageToEntries(pageFile: string): Promise<MetadataRoute.Sitemap> {
  const segments = fileToSegments(pageFile);
  const hasDynamic = segments.some(isDynamicSegment);

  if (!hasDynamic) {
    const url = buildUrlFromSegments(segments, []);
    if (!url) return [];
    return [{ url, lastModified: new Date() }];
  }

  const pattern = patternKey(segments);
  const valueSets = await resolveDynamicValueSets(pattern);
  if (valueSets.length === 0) {
    return [];
  }

  const out: MetadataRoute.Sitemap = [];
  for (const row of valueSets) {
    const url = buildUrlFromSegments(segments, row);
    if (url) out.push({ url, lastModified: new Date() });
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageFiles = await findPageFiles(APP_DIR);
  const merged: MetadataRoute.Sitemap = [];
  for (const file of pageFiles) {
    merged.push(...(await expandPageToEntries(file)));
  }

  const seen = new Set<string>();
  const unique = merged.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  unique.sort((a, b) => a.url.localeCompare(b.url));
  return unique;
}
