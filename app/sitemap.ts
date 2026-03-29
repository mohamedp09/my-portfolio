import type { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { getSiteOrigin } from "@/lib/env";
import { getAllPosts, type Post } from "@/lib/posts";

const IGNORED_DIRS = new Set([
  "api",
  "admin",
  "_components",
  "_lib",
  "_hooks",
  "[...catchAll]",
]);

const APP_DIR = path.join(process.cwd(), "app");
const MAX_URLS = 50_000;

type Segment = string;

function isDynamicSegment(segment: Segment): boolean {
  return /^\[[^\]]+\]$/.test(segment);
}

function isOptionalCatchAll(segment: Segment): boolean {
  return /^\[\[\.\.\.[^\]]+\]\]$/.test(segment);
}

function normalizeSegment(segment: Segment): Segment | null {
  if (segment.startsWith("(") && segment.endsWith(")")) return null;
  if (segment.startsWith("(") && segment.includes(")")) return null;
  return segment;
}

function fileToSegments(filePath: string): Segment[] {
  const relative = path.relative(APP_DIR, path.dirname(filePath));
  if (!relative || relative === ".") return [];
  return relative
    .split(path.sep)
    .map(normalizeSegment)
    .filter((s): s is Segment => s !== null && s.length > 0);
}

let postsCache: Post[] | null = null;

async function getPublishedPosts(): Promise<Post[]> {
  if (!postsCache) {
    postsCache = await getAllPosts();
  }
  return postsCache;
}

async function resolveBlogSlugs(): Promise<string[][]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => [post.slug]);
}

async function lastModForBlogSlug(slug: string): Promise<Date> {
  const posts = await getPublishedPosts();
  const post = posts.find((p) => p.slug === slug);
  if (post?.date) return new Date(post.date);
  return new Date();
}

async function findPageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...(await findPageFiles(fullPath)));
    } else if (entry.name === "page.tsx" || entry.name === "page.jsx") {
      files.push(fullPath);
    }
  }
  return files;
}

function buildUrl(baseUrl: string, segments: Segment[], dynamicValues: string[]): string | null {
  let valueIndex = 0;
  const pathParts: string[] = [];

  for (const seg of segments) {
    if (isDynamicSegment(seg) || isOptionalCatchAll(seg)) {
      if (valueIndex >= dynamicValues.length) return null;
      const value = dynamicValues[valueIndex++];
      if (!value && isOptionalCatchAll(seg)) continue;
      pathParts.push(encodeURIComponent(value));
    } else {
      pathParts.push(encodeURIComponent(seg));
    }
  }

  if (valueIndex !== dynamicValues.length) return null;
  const urlPath = pathParts.length ? `/${pathParts.join("/")}` : "";
  return `${baseUrl}${urlPath}`;
}

async function expandPageToEntries(
  pageFile: string,
  baseUrl: string
): Promise<MetadataRoute.Sitemap> {
  const segments = fileToSegments(pageFile);
  const hasDynamic =
    segments.some(isDynamicSegment) || segments.some(isOptionalCatchAll);

  if (!hasDynamic) {
    const url = buildUrl(baseUrl, segments, []);
    if (!url) return [];
    return [{ url, lastModified: new Date() }];
  }

  const pattern = segments.join("/");
  if (pattern !== "blog/[slug]") {
    return [];
  }

  const valueSets = await resolveBlogSlugs();
  if (valueSets.length === 0) return [];

  const entries: MetadataRoute.Sitemap = [];
  for (const valueRow of valueSets) {
    const url = buildUrl(baseUrl, segments, valueRow);
    if (!url) continue;
    const slug = valueRow[0];
    const lastModified = slug ? await lastModForBlogSlug(slug) : new Date();
    entries.push({ url, lastModified });
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();

  try {
    const pageFiles = await findPageFiles(APP_DIR);

    const allEntriesArrays = await Promise.all(
      pageFiles.map((file) =>
        expandPageToEntries(file, baseUrl).catch((): MetadataRoute.Sitemap => [])
      )
    );

    const merged = allEntriesArrays.flat();
    const uniqueMap = new Map<string, MetadataRoute.Sitemap[number]>();
    for (const entry of merged) {
      if (!uniqueMap.has(entry.url)) {
        uniqueMap.set(entry.url, entry);
      }
    }
    let unique = Array.from(uniqueMap.values());
    unique.sort((a, b) => a.url.localeCompare(b.url));

    if (unique.length > MAX_URLS) {
      unique = unique.slice(0, MAX_URLS);
    }

    return unique;
  } catch {
    return [];
  }
}
