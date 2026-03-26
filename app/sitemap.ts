
// app/sitemap.ts
import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getAllPosts, Post } from '@/lib/posts';
import { getProjects, Project } from '@/lib/projects';

// ======================
// 1. التكوين الأساسي
// ======================
const CONFIG = {
  baseUrl: 'https://mohamedbuilds.org',
  appDir: path.join(process.cwd(), 'app'),
  ignoredDirectories: ['api', '_components', '_lib', '_hooks', '[...catchAll]'],
  // أقصى عدد من الروابط في خريطة واحدة (لـ sitemap splitting)
  maxUrlsPerSitemap: 50000,
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
  // تجاهل مسارات المجموعات (group routes)
  if (segment.startsWith('(') && segment.endsWith(')')) return null;
  // تجاهل مسارات الـ interceptors (مثلاً (.)profile)
  if (segment.startsWith('(') && segment.includes(')')) return null;
  return segment;
}

function segmentsToPatternKey(segments: Segment[]): string {
  return segments.join('/');
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
      if (CONFIG.ignoredDirectories.includes(entry.name)) continue;
      files.push(...(await findPageFiles(fullPath)));
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
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
// 4. حل المسارات الديناميكية مع التخزين المؤقت
// ======================
type DynamicValueSet = string[][]; // كل مصفوفة داخلية تمثل قيم المسارات الديناميكية بالترتيب

class DynamicRouteResolver {
  private static postsCache: Post[] | null = null;
  private static projectsCache: Project[] | null = null;

  private static async getPosts(): Promise<Post[]> {
    if (!this.postsCache) {
      this.postsCache = await getAllPosts({ includeDrafts: true });
    }
    return this.postsCache;
  }

  private static async getProjects(): Promise<Project[]> {
    if (!this.projectsCache) {
      this.projectsCache = await getProjects();
    }
    return this.projectsCache;
  }

  static async resolve(pattern: string): Promise<DynamicValueSet> {
    // blog/[slug]
    if (pattern === 'blog/[slug]') {
      const posts = await this.getPosts();
      return posts.map(post => [post.slug]);
    }

    // admin/projects/edit/[id]
    if (pattern === 'admin/projects/edit/[id]') {
      const projects = await this.getProjects();
      return projects.map(project => [String(project.id)]);
    }

    // admin/posts/edit/[slug]
    if (pattern === 'admin/posts/edit/[slug]') {
      const posts = await this.getPosts();
      return posts.map(post => [post.slug]);
    }

    // يمكن إضافة أنماط أخرى هنا (مثلاً: products/[category]/[id])

    return []; // لا توجد بيانات لهذا النمط
  }

  static async getLastModifiedForPattern(pattern: string, valueRow: string[]): Promise<Date> {
    // هنا يمكن استرجاع تاريخ آخر تعديل بناءً على النمط والقيم
    // مثلاً للمقالات: نبحث عن آخر تاريخ تحديث للمقالة نفسها
    if (pattern === 'blog/[slug]') {
      const posts = await this.getPosts();
      const slug = valueRow[0];
      const post = posts.find(p => p.slug === slug);
      if (post?.updatedAt) return new Date(post.updatedAt);
      if (post?.date) return new Date(post.date);
    }

if (pattern === 'admin/projects/edit/[id]') {
      const projects = await this.getProjects();
      const id = valueRow[0];
      const project = projects.find(p => String(p.id) === id);
      if (project?.updatedAt) return new Date(project.updatedAt);
    }

    if (pattern === 'admin/posts/edit/[slug]') {
      const posts = await this.getPosts();
      const slug = valueRow[0];
      const post = posts.find(p => p.slug === slug);
      if (post?.updatedAt) return new Date(post.updatedAt);
    }

    return new Date(); // fallback
  }
}

// ======================
// 5. بناء الروابط
// ======================
function buildUrl(segments: Segment[], dynamicValues: string[]): string | null {
  let valueIndex = 0;
  const pathParts: string[] = [];

  for (const seg of segments) {
    if (isDynamicSegment(seg) || isOptionalCatchAll(seg)) {
      if (valueIndex >= dynamicValues.length) return null;
      // تجاهل القيم الفارغة للمسارات الاختيارية
      const value = dynamicValues[valueIndex++];
      if (!value && isOptionalCatchAll(seg)) continue;
      pathParts.push(encodeURIComponent(value));
    } else {
      pathParts.push(encodeURIComponent(seg));
    }
  }

  if (valueIndex !== dynamicValues.length) return null;
  const urlPath = pathParts.length ? /${pathParts.join('/')} : '';
  return ${CONFIG.baseUrl}${urlPath};
}

// ======================
// 6. توسيع صفحة واحدة إلى روابط متعددة
// ======================
async function expandPageToEntries(pageFile: string): Promise<MetadataRoute.Sitemap> {
  const segments = fileToSegments(pageFile);
  const hasDynamic = segments.some(isDynamicSegment) || segments.some(isOptionalCatchAll);

  // صفحة ثابتة
  if (!hasDynamic) {
    const url = buildUrl(segments, []);
    if (!url) return [];
    return [{ url, lastModified: new Date() }];
  }

  // صفحة ديناميكية
  const pattern = segmentsToPatternKey(segments);
  const valueSets = await DynamicRouteResolver.resolve(pattern);
  if (valueSets.length === 0) return [];

  const entries: MetadataRoute.Sitemap = [];
  for (const valueRow of valueSets) {
    const url = buildUrl(segments, valueRow);
    if (!url) continue;
    const lastModified = await DynamicRouteResolver.getLastModifiedForPattern(pattern, valueRow);
    entries.push({ url, lastModified });
  }
  return entries;
}

// ======================
// 7. الوظيفة الرئيسية (توليد sitemap.xml)
// ======================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const startTime = Date.now();
  console.log('[sitemap] Generating sitemap...');

  try {
    const pageFiles = await findPageFiles(CONFIG.appDir);
    console.log(`[sitemap] Found ${pageFiles.length} page files`);

    // معالجة الصفحات بالتوازي لتحسين الأداء
    const allEntriesArrays = await Promise.all(
      pageFiles.map(file => expandPageToEntries(file).catch(err => {
        console.error(`[sitemap] Error expanding ${file}:`, err);
        return [] as MetadataRoute.Sitemap;
      }))
    );

    const merged = allEntriesArrays.flat();

    // إزالة التكرار (باستخدام Map للحفاظ على الترتيب)
    const uniqueMap = new Map<string, MetadataRoute.Sitemap[number]>();
    for (const entry of merged) {
      if (!uniqueMap.has(entry.url)) {
        uniqueMap.set(entry.url, entry);
      }
    }
    const unique = Array.from(uniqueMap.values());

    // ترتيب الروابط أبجدياً
    unique.sort((a, b) => a.url.localeCompare(b.url));

    console.log(`[sitemap] Generated ${unique.length} unique URLs in ${Date.now() - startTime}ms`);
    return unique;
  } catch (error) {
    console.error('[sitemap] Fatal error:', error);
    // في حالة الفشل الكامل، نعيد خريطة فارغة حتى لا يتعطل الموقع
    return [];
  }
}
