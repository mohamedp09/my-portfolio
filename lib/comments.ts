import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const COMMENTS_PATH = path.join(process.cwd(), "content", "comments.json");

export type CommentRow = {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmail?: string;
  body: string;
  createdAt: string;
  approved: boolean;
  likes: number;
};

function readAll(): CommentRow[] {
  try {
    const raw = fs.readFileSync(COMMENTS_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as CommentRow[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CommentRow[]): void {
  writeFileSyncUtf8(COMMENTS_PATH, `${JSON.stringify(rows, null, 2)}\n`);
}

export function getTotalCommentCount(): number {
  return readAll().length;
}

export function getPendingCommentCount(): number {
  return readAll().filter((c) => !c.approved).length;
}

export function getApprovedCommentCountForPost(slug: string): number {
  return readAll().filter((c) => c.postSlug === slug && c.approved).length;
}

export type CommentWithReplies = CommentRow & { replies: CommentWithReplies[] };

export function getPublicCommentsForPost(slug: string): CommentWithReplies[] {
  const rows = readAll().filter((c) => c.postSlug === slug && c.approved);
  const top = rows.filter((r) => r.parentId === null);
  const children = rows.filter((r) => r.parentId !== null);
  const byParent = new Map<string, CommentRow[]>();
  for (const r of children) {
    const pid = r.parentId as string;
    const list = byParent.get(pid) ?? [];
    list.push(r);
    byParent.set(pid, list);
  }
  function nest(row: CommentRow): CommentWithReplies {
    const kids = (byParent.get(row.id) ?? []).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
    return {
      ...row,
      replies: kids.map(nest),
    };
  }
  return top.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(nest);
}

export function addComment(input: {
  postSlug: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  approved?: boolean;
}): CommentRow {
  const rows = readAll();
  const row: CommentRow = {
    id: randomUUID(),
    postSlug: input.postSlug,
    parentId: null,
    authorName: input.authorName.trim(),
    authorEmail: input.authorEmail?.trim() || undefined,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    approved: input.approved ?? false,
    likes: 0,
  };
  if (!row.authorName || !row.body) throw new Error("Name and comment are required.");
  rows.push(row);
  writeAll(rows);
  return row;
}

export function addReply(
  postSlug: string,
  parentId: string,
  input: { authorName: string; body: string; approved?: boolean }
): CommentRow {
  const rows = readAll();
  const parent = rows.find((r) => r.id === parentId && r.postSlug === postSlug);
  if (!parent || parent.parentId !== null) throw new Error("Invalid parent comment.");
  const row: CommentRow = {
    id: randomUUID(),
    postSlug,
    parentId,
    authorName: input.authorName.trim(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    approved: input.approved ?? false,
    likes: 0,
  };
  if (!row.authorName || !row.body) throw new Error("Name and reply are required.");
  rows.push(row);
  writeAll(rows);
  return row;
}

export function likeComment(postSlug: string, commentId: string): number {
  const rows = readAll();
  const idx = rows.findIndex(
    (r) => r.id === commentId && r.postSlug === postSlug && r.parentId === null
  );
  if (idx === -1) throw new Error("Comment not found.");
  rows[idx] = { ...rows[idx], likes: rows[idx].likes + 1 };
  writeAll(rows);
  return rows[idx].likes;
}

export function likeReply(postSlug: string, parentId: string, replyId: string): number {
  const rows = readAll();
  const idx = rows.findIndex(
    (r) =>
      r.id === replyId &&
      r.postSlug === postSlug &&
      r.parentId === parentId
  );
  if (idx === -1) throw new Error("Reply not found.");
  rows[idx] = { ...rows[idx], likes: rows[idx].likes + 1 };
  writeAll(rows);
  return rows[idx].likes;
}

export function getAllCommentsForAdmin(): CommentRow[] {
  return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function setApproved(postSlug: string, id: string, approved: boolean): CommentRow | null {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id && r.postSlug === postSlug);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], approved };
  if (approved && rows[idx].parentId) {
    const pIdx = rows.findIndex((r) => r.id === rows[idx].parentId && r.postSlug === postSlug);
    if (pIdx !== -1) {
      rows[pIdx] = { ...rows[pIdx], approved: true };
    }
  }
  writeAll(rows);
  return rows[idx];
}

export function deleteCommentCascade(postSlug: string, id: string): boolean {
  const rows = readAll();
  const ids = new Set<string>();
  function collect(cid: string) {
    ids.add(cid);
    for (const r of rows) {
      if (r.parentId === cid) collect(r.id);
    }
  }
  const root = rows.find((r) => r.id === id && r.postSlug === postSlug);
  if (!root) return false;
  collect(id);
  const next = rows.filter((r) => !ids.has(r.id));
  writeAll(next);
  return true;
}

export function deleteReply(postSlug: string, parentId: string, replyId: string): boolean {
  const rows = readAll();
  const idx = rows.findIndex(
    (r) => r.id === replyId && r.postSlug === postSlug && r.parentId === parentId
  );
  if (idx === -1) return false;
  rows.splice(idx, 1);
  writeAll(rows);
  return true;
}
