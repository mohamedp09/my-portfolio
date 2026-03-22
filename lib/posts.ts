import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { ensureDir, writeFileUtf8 } from "@/lib/fsWrite";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string[];
  published: boolean;
  views: number;
};

export type Post = PostMeta & {
  content: string;
};

/**
 * Safe basename for `content/posts/{slug}.md`.
 * Allows Arabic and other Unicode (for URLs use encodeURIComponent).
 * Blocks path traversal and obvious abuse.
 */
export function isSafePostSlug(slug: string): boolean {
  if (!slug || slug.length > 200) return false;
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) return false;
  return true;
}

/** @deprecated Use isSafePostSlug — kept for older imports */
export const isValidSlug = isSafePostSlug;

function normalizeMeta(data: Record<string, unknown>, fallbackSlug: string): PostMeta {
  const tagsRaw = data.tags;
  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    tags = tagsRaw.map((t) => String(t));
  } else if (typeof tagsRaw === "string") {
    tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const status = data.status;
  const published =
    Boolean(data.published) ||
    (typeof status === "string" && String(status).toLowerCase() === "published");

  return {
    title: String(data.title ?? "Untitled"),
    slug: String(data.slug ?? fallbackSlug),
    excerpt: String(data.excerpt ?? ""),
    date: typeof data.date === "string" ? data.date : new Date().toISOString(),
    tags,
    published,
    views: typeof data.views === "number" && !Number.isNaN(data.views) ? data.views : 0,
  };
}

export function stringifyPost(meta: PostMeta, body: string): string {
  const dump = yaml.dump(meta as Record<string, unknown>, { lineWidth: -1 }).trim();
  return `---\n${dump}\n---\n\n${body.trim()}\n`;
}

export async function listPostFiles(): Promise<string[]> {
  ensureDir(POSTS_DIR);
  const names = await fs.readdir(POSTS_DIR);
  return names.filter((n) => n.endsWith(".md"));
}

/** Load post from disk (any file). Respects `published` only when `onlyPublished` is true. */
export async function readPostFile(
  slug: string,
  opts?: { onlyPublished?: boolean }
): Promise<Post | null> {
  if (!isSafePostSlug(slug)) return null;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const meta = normalizeMeta(data as Record<string, unknown>, slug);
    if (opts?.onlyPublished && !meta.published) return null;
    return { ...meta, content };
  } catch {
    return null;
  }
}

export async function getAllPosts(opts?: { includeDrafts?: boolean }): Promise<Post[]> {
  const files = await listPostFiles();
  const posts: Post[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/i, "");
    const p = await readPostFile(slug, { onlyPublished: !opts?.includeDrafts });
    if (!p) continue;
    posts.push(p);
  }
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return readPostFile(slug, { onlyPublished: true });
}

export async function incrementViews(slug: string): Promise<Post | null> {
  const post = await readPostFile(slug, { onlyPublished: false });
  if (!post || !post.published) return null;
  const next: PostMeta = { ...post, views: post.views + 1 };
  const body = stringifyPost(next, post.content);
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  await writeFileUtf8(filePath, body);
  return { ...next, content: post.content };
}

export async function deletePost(slug: string): Promise<boolean> {
  if (!isSafePostSlug(slug)) return false;
  try {
    await fs.unlink(path.join(POSTS_DIR, `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

export async function savePost(meta: PostMeta, content: string): Promise<void> {
  if (!isSafePostSlug(meta.slug)) throw new Error("Invalid slug");
  const body = stringifyPost(meta, content);
  await writeFileUtf8(path.join(POSTS_DIR, `${meta.slug}.md`), body);
}

export async function createPost(meta: Omit<PostMeta, "views"> & { views?: number }, content: string): Promise<void> {
  const full: PostMeta = {
    ...meta,
    views: meta.views ?? 0,
  };
  if (!isSafePostSlug(full.slug)) throw new Error("Invalid slug");
  const filePath = path.join(POSTS_DIR, `${full.slug}.md`);
  try {
    await fs.access(filePath);
    throw new Error("Post already exists");
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Post already exists") throw e;
    const code =
      e && typeof e === "object" && "code" in e ? (e as NodeJS.ErrnoException).code : undefined;
    if (code === "ENOENT") {
      await savePost(full, content);
      return;
    }
    throw e;
  }
}

/** Rename file when slug changes (admin edit). */
export async function renamePostFile(oldSlug: string, newSlug: string): Promise<void> {
  if (!isSafePostSlug(oldSlug) || !isSafePostSlug(newSlug)) throw new Error("Invalid slug");
  const from = path.join(POSTS_DIR, `${oldSlug}.md`);
  const to = path.join(POSTS_DIR, `${newSlug}.md`);
  await fs.rename(from, to);
}
