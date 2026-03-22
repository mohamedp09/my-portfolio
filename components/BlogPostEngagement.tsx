"use client";

import { useCallback, useEffect, useState } from "react";
import { PostLikesListPopover } from "@/components/PostLikesListPopover";

type CommentWithReplies = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  likes: number;
  replies: CommentWithReplies[];
};

function totalThreadCount(nodes: CommentWithReplies[]): number {
  let n = 0;
  for (const c of nodes) {
    n += 1 + totalThreadCount(c.replies);
  }
  return n;
}

type Labels = {
  likePost: string;
  likes: string;
  comments: string;
  leaveComment: string;
  yourName: string;
  emailOptional: string;
  comment: string;
  submit: string;
  pendingModeration: string;
  reply: string;
  postReply: string;
  like: string;
  loading: string;
  peopleWhoLiked: string;
  noLikesYet: string;
  likeButton: string;
};

const defaultLabels: Labels = {
  likePost: "Like this post",
  likes: "likes",
  comments: "comments",
  leaveComment: "Leave a comment",
  yourName: "Your name",
  emailOptional: "Email (optional)",
  comment: "Comment",
  submit: "Submit",
  pendingModeration: "Thanks! Your comment will appear after moderation.",
  reply: "Reply",
  postReply: "Post reply",
  like: "Like",
  loading: "Loading…",
  peopleWhoLiked: "People who liked this",
  noLikesYet: "No likes yet",
  likeButton: "Like",
};

function setVisitorNameCookie(name: string): void {
  document.cookie = `visitor_name=${encodeURIComponent(name)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function getVisitorNameCookie(): string {
  const parts = document.cookie.split("; ");
  for (const p of parts) {
    if (p.startsWith("visitor_name=")) {
      try {
        return decodeURIComponent(p.slice("visitor_name=".length));
      } catch {
        return p.slice("visitor_name=".length);
      }
    }
  }
  return "";
}

function CommentBlock({
  slug,
  node,
  depth,
  labels,
  onRefresh,
}: {
  slug: string;
  node: CommentWithReplies;
  depth: number;
  labels: Labels;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function likeThis() {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(node.id)}/like`,
        { method: "POST" }
      );
      if (res.ok) onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function likeReply(replyId: string) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(node.id)}/replies/${encodeURIComponent(replyId)}/like`,
        { method: "POST" }
      );
      if (res.ok) onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (replyName.trim().length < 2 || replyBody.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(node.id)}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorName: replyName, body: replyBody }),
        }
      );
      if (res.ok) {
        setReplyName("");
        setReplyBody("");
        setOpen(false);
        alert(labels.pendingModeration);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={depth ? "mt-4 border-l border-[var(--border)] pl-4" : ""}>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-semibold text-[var(--text-primary)]">{node.authorName}</p>
          <span className="text-xs text-[var(--text-muted)]">
            {new Date(node.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{node.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={busy}
            onClick={() => void likeThis()}
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-50"
          >
            {labels.like} ({node.likes})
          </button>
          {depth < 4 ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {labels.reply}
            </button>
          ) : null}
        </div>
        {open ? (
          <form className="mt-4 space-y-2 border-t border-[var(--border)] pt-4" onSubmit={submitReply}>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder={labels.yourName}
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              required
            />
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder={labels.comment}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {labels.postReply}
            </button>
          </form>
        ) : null}
      </div>
      {node.replies.map((r) => (
        <div key={r.id} className="mt-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-[var(--text-primary)]">{r.authorName}</p>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{r.body}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void likeReply(r.id)}
              className="mt-3 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-50"
            >
              {labels.like} ({r.likes})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogPostEngagement({
  slug,
  labels: labelsProp,
}: {
  slug: string;
  labels?: Partial<Labels>;
}) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [comments, setComments] = useState<CommentWithReplies[] | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLikeNameInput, setShowLikeNameInput] = useState(false);
  const [likeNameDraft, setLikeNameDraft] = useState("");
  const [commentAuthorName, setCommentAuthorName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const refresh = useCallback(() => {
    void fetch(`/api/posts/${encodeURIComponent(slug)}/comments`)
      .then((r) => r.json())
      .then((d: { comments?: CommentWithReplies[] }) =>
        setComments(Array.isArray(d.comments) ? d.comments : [])
      );
    void fetch(`/api/posts/${encodeURIComponent(slug)}/likes`)
      .then((r) => r.json())
      .then((d: { count?: number; liked?: boolean }) => {
        if (typeof d.count === "number") setLikeCount(d.count);
        setLiked(Boolean(d.liked));
      });
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submitPostLike(displayName: string) {
    const n = displayName.trim();
    if (n.length < 2) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        count?: number;
        liked?: boolean;
      };
      if (res.ok && typeof d.count === "number") {
        setLikeCount(d.count);
        setLiked(Boolean(d.liked));
        setVisitorNameCookie(n);
        setShowLikeNameInput(false);
        setLikeNameDraft("");
        return;
      }
      if (res.status === 409 && typeof d.count === "number") {
        setLikeCount(d.count);
        setLiked(true);
        setShowLikeNameInput(false);
      }
    } finally {
      setBusy(false);
    }
  }

  function onHeartClick() {
    if (liked) return;
    const fromCookie = getVisitorNameCookie().trim();
    if (fromCookie.length >= 2) {
      void submitPostLike(fromCookie);
      return;
    }
    setShowLikeNameInput(true);
  }

  function onInlineLikeSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitPostLike(likeNameDraft);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (commentAuthorName.trim().length < 2 || commentBody.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: commentAuthorName,
          authorEmail: commentEmail || undefined,
          body: commentBody,
        }),
      });
      if (res.ok) {
        setCommentAuthorName("");
        setCommentEmail("");
        setCommentBody("");
        alert(labels.pendingModeration);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-[var(--border)] pt-12">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy || liked}
            onClick={() => onHeartClick()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--glass)] text-lg text-[var(--text-primary)] transition hover:border-[var(--border-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={labels.likePost}
          >
            <span aria-hidden>{liked ? "♥" : "♡"}</span>
          </button>
          {showLikeNameInput && !liked ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={onInlineLikeSubmit}
            >
              <input
                className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)]"
                placeholder={labels.yourName}
                value={likeNameDraft}
                onChange={(e) => setLikeNameDraft(e.target.value)}
                autoFocus
                minLength={2}
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {labels.likeButton}
              </button>
            </form>
          ) : null}
        </div>
        <PostLikesListPopover
          slug={slug}
          countLabel={likeCount}
          likesWord={labels.likes}
          title={labels.peopleWhoLiked}
          emptyText={labels.noLikesYet}
        />
        <span className="text-[var(--text-muted)]">·</span>
        <span>
          {comments === null ? "—" : totalThreadCount(comments)} {labels.comments}
        </span>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-syne)] text-2xl font-extrabold text-[var(--text-primary)]">
        {labels.leaveComment}
      </h2>

      {comments === null ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">{labels.loading}</p>
      ) : (
        <div className="mt-6 space-y-6">
          {comments.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <CommentBlock
                key={c.id}
                slug={slug}
                node={c}
                depth={0}
                labels={labels}
                onRefresh={refresh}
              />
            ))
          )}
        </div>
      )}

      <form className="mt-10 space-y-3" onSubmit={submitComment}>
        <input
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          placeholder={labels.yourName}
          value={commentAuthorName}
          onChange={(e) => setCommentAuthorName(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          placeholder={labels.emailOptional}
          type="email"
          value={commentEmail}
          onChange={(e) => setCommentEmail(e.target.value)}
        />
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          placeholder={labels.comment}
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {labels.submit}
        </button>
      </form>
    </section>
  );
}
