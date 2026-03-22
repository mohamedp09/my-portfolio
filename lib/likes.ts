import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const LIKES_PATH = path.join(process.cwd(), "content", "likes.json");

export type PostLike = {
  id: string;
  name: string;
  createdAt: string;
};

type LikesFile = {
  posts: Record<string, PostLike[] | number | unknown>;
};

function defaultData(): LikesFile {
  return { posts: {} };
}

function normalizeLikesForSlug(raw: unknown): PostLike[] {
  if (Array.isArray(raw)) {
    return raw
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const o = row as Record<string, unknown>;
        const id = typeof o.id === "string" ? o.id : randomUUID();
        const name = typeof o.name === "string" ? o.name.trim() : "Anonymous";
        const createdAt = typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString();
        return { id, name: name || "Anonymous", createdAt };
      })
      .filter((x): x is PostLike => x !== null);
  }
  if (typeof raw === "number" && raw > 0) {
    return Array.from({ length: raw }, (_, i) => ({
      id: randomUUID(),
      name: "Anonymous",
      createdAt: new Date(Date.now() - i * 1000).toISOString(),
    }));
  }
  return [];
}

function readAll(): LikesFile {
  try {
    const raw = fs.readFileSync(LIKES_PATH, "utf8");
    const j = JSON.parse(raw) as Partial<LikesFile>;
    const posts =
      typeof j.posts === "object" && j.posts !== null ? { ...j.posts } : {};
    let migrated = false;
    for (const key of Object.keys(posts)) {
      const v = posts[key];
      if (Array.isArray(v)) continue;
      if (typeof v === "number" || v === undefined) {
        posts[key] = normalizeLikesForSlug(v);
        migrated = true;
      } else {
        posts[key] = normalizeLikesForSlug(v);
        migrated = true;
      }
    }
    if (migrated) {
      writeAll({ posts: posts as Record<string, PostLike[]> });
    }
    return { posts: posts as Record<string, PostLike[] | unknown> };
  } catch {
    return defaultData();
  }
}

function writeAll(d: { posts: Record<string, PostLike[]> }): void {
  writeFileSyncUtf8(LIKES_PATH, `${JSON.stringify(d, null, 2)}\n`);
}

function getRows(slug: string): PostLike[] {
  const d = readAll();
  const raw = d.posts[slug];
  return normalizeLikesForSlug(raw);
}

export function getPostLikes(slug: string): PostLike[] {
  return [...getRows(slug)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPostLikeCount(slug: string): number {
  return getRows(slug).length;
}

export function addPostLike(slug: string, name: string): { likes: PostLike[]; count: number } {
  const trimmed = name.trim();
  const displayName = trimmed.length > 0 ? trimmed.slice(0, 80) : "Anonymous";
  const d = readAll();
  const posts = { ...(typeof d.posts === "object" && d.posts !== null ? d.posts : {}) } as Record<
    string,
    PostLike[] | unknown
  >;
  const prev = normalizeLikesForSlug(posts[slug]);
  const row: PostLike = {
    id: randomUUID(),
    name: displayName,
    createdAt: new Date().toISOString(),
  };
  prev.push(row);
  posts[slug] = prev;
  writeAll({ posts: posts as Record<string, PostLike[]> });
  const likes = getPostLikes(slug);
  return { likes, count: likes.length };
}

export function getTotalPostLikes(): number {
  const d = readAll();
  const posts = typeof d.posts === "object" && d.posts !== null ? d.posts : {};
  let sum = 0;
  for (const k of Object.keys(posts)) {
    sum += normalizeLikesForSlug(posts[k]).length;
  }
  return sum;
}
