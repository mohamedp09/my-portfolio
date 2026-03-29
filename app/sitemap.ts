import type { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { getSiteOrigin } from "@/lib/env";
import { getAllPosts, type Post } from "@/lib/posts";
import { getProjects as fetchProjects, type Project } from "@/lib/projects";

// ======================
// 1. التكوين الأساسي
// ======================
const IGNORED_DIRS = new Set([
  "api",
  "admin",
  "_components",
  "_lib",
  "_hooks",
  "[...catchAll]",
]);

const CONFIG = {
  appDir: path.join(process.cwd(), "app"),
  maxUrlsPerSitemap: 50_000,
} as const;

// ======================
// 2. مساعدات المسارات
// ======================
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

function segmentsToPatternKey(segments: Segment[]): string {
  return segments.join("/");
}

// ======================
// 3. ماسح الصفحات
// ======================
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

function fileToSegments(filePath: string): Segment[] {
  const relative = path.relative(CONFIG.appDir, path.dirname(filePath));
  if (!relative) return [];
  return relative
    .split(path.sep)
    .map(normalizeSegment)
    .filter((s): s is Segment => s !== null && s.length > 0);
}

// ======================
// 4. حل المسارات الديناميكية
// ======================
type DynamicValueSet = string[][];

class DynamicRouteResolver {
  private static postsCache: Post[] | null = null;
  private static projectsCache: Project[] | null = null;

  private static async getPosts(): Promise<Post[]> {
    if (!this.postsCache) {
      this.postsCache = await getAllPosts();
    }
    return this.postsCache;
  }

  private static async getProjects(): Promise<Project[]> {
    if (!this.projectsCache) {
      this.projectsCache = await fetchProjects();
    }
    return this.projectsCache;
  }

  static async resolve(pattern: string): Promise<DynamicValueSet> {
    if (pattern === "blog/[slug]") {
      const posts = await this.getPosts();
      return posts.map((post) => [post.slug]);
    }

    if (pattern === "admin/projects/edit/[id]") {
      const projects = await this.getProjects();
      return projects.map((project) => [String(project.id)]);
    }

    if (pattern === "admin/posts/edit/[slug]") {
      const posts = await getAllPosts({ includeDrafts: true });
      return posts.map((post) => [post.slug]);
    }

    return [];
  }

  static async getLastModifiedForPattern(pattern: string, valueRow: string[]): Promise<Date> {
    if (pattern === "blog/[slug]") {
      const posts = await this.getPosts();
      const slug = valueRow[0];
      const post = posts.find((p) => p.slug === slug);
      if (post?.date) return new Date(post.date);
    }

    if (pattern === "admin/projects/edit/[id]") {
      const projects = await this.getProjects();
      const id = valueRow[0];
      const project = projects.find((p) => String(p.id) === id);
      if (project?.date) return new Date(project.date);
    }

    if (pattern === "admin/posts/edit/[slug]") {
      const posts = await getAllPosts({ includeDrafts: true });
      const slug = valueRow[0];
      const post = posts.find((p) => p.slug === slug);
      if (post?.date) return new Date(post.date);
    }

    return new Date();
  }
}

// ======================
// 5. بناء الروابط
// ======================
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

// ======================
// 6. توسيع صفحة واحدة إلى روابط متعددة
// ======================
async function expandPageToEntries(pageFile: string, baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const segments = fileToSegments(pageFile);
  const hasDynamic =
    segments.some(isDynamicSegment) || segments.some(isOptionalCatchAll);

  if (!hasDynamic) {
    const url = buildUrl(baseUrl, segments, []);
    if (!url) return [];
    return [{ url, lastModified: new Date() }];
  }

  const pattern = segmentsToPatternKey(segments);
  const valueSets = await DynamicRouteResolver.resolve(pattern);
  if (valueSets.length === 0) return [];

  const entries: MetadataRoute.Sitemap = [];
  for (const valueRow of valueSets) {
    const url = buildUrl(baseUrl, segments, valueRow);
    if (!url) continue;
    const lastModified = await DynamicRouteResolver.getLastModifiedForPattern(pattern, valueRow);
    entries.push({ url, lastModified });
  }
  return entries;
}

// ======================
// 7. الوظيفة الرئيسية
// ======================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();
  const cap = CONFIG.maxUrlsPerSitemap;

  try {
    const pageFiles = await findPageFiles(CONFIG.appDir);

    const allEntriesArrays = await Promise.all(
      pageFiles.map((file) =>
        expandPageToEntries(file, baseUrl).catch(() => [] as MetadataRoute.Sitemap)
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

    if (unique.length > cap) {
      unique = unique.slice(0, cap);
    }

    return unique;
  } catch {
    return [];
  }
}
