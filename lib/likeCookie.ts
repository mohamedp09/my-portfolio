import { createHash } from "crypto";

/** Short stable id for cookie names (slug length / charset safe). */
export function slugCookieKey(slug: string): string {
  return createHash("sha256").update(slug).digest("hex").slice(0, 32);
}

export function postLikeCookieName(slug: string): string {
  return `pl_${slugCookieKey(slug)}`;
}

export function commentLikeCookieName(commentId: string): string {
  return `cl_${commentId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)}`;
}

export function replyLikeCookieName(replyId: string): string {
  return `rl_${replyId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)}`;
}
