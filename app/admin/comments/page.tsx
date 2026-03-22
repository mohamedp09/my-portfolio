"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommentRow } from "@/lib/comments";

export default function AdminCommentsPage() {
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/comments")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((d: { comments?: CommentRow[] }) =>
        setRows(Array.isArray(d.comments) ? d.comments : [])
      )
      .catch(() => setError("Failed to load."));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function approve(slug: string, id: string) {
    const res = await fetch(`/api/admin/comments/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Update failed.");
      return;
    }
    load();
  }

  async function remove(slug: string, id: string) {
    if (!confirm("Delete this comment and its replies?")) return;
    const res = await fetch(`/api/admin/comments/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Delete failed.");
      return;
    }
    load();
  }

  async function removeReply(slug: string, parentId: string, replyId: string) {
    if (!confirm("Delete this reply?")) return;
    const res = await fetch(
      `/api/admin/comments/${encodeURIComponent(slug)}/${encodeURIComponent(parentId)}/replies/${encodeURIComponent(replyId)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Delete failed.");
      return;
    }
    load();
  }

  if (error) return <p className="text-red-400">{error}</p>;

  const pending = rows.filter((r) => !r.approved);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Comments</h1>
      <p className="mt-2 text-sm text-[#e8e8ef]/45">
        Pending: {pending.length} · Total: {rows.length}
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">Pending moderation</h2>
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-[#e8e8ef]/45">No pending comments.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pending.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-[#8b5cf6]/10 bg-[rgb(15,13,28)]/80 px-4 py-3 text-sm"
                >
                  <p className="text-xs text-[#e8e8ef]/45">
                    {c.postSlug} · {c.parentId ? "Reply" : "Comment"} ·{" "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 font-medium text-[#e8e8ef]">{c.authorName}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[#e8e8ef]/75">{c.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void approve(c.postSlug, c.id)}
                      className="rounded-full bg-[#8b5cf6]/90 px-4 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        c.parentId
                          ? void removeReply(c.postSlug, c.parentId, c.id)
                          : void remove(c.postSlug, c.id)
                      }
                      className="rounded-full border border-red-500/40 px-4 py-1.5 text-xs text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">All comments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#8b5cf6]/15 text-[#e8e8ef]/45">
                  <th className="py-2 pr-2">Post</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Author</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-[#8b5cf6]/8">
                    <td className="py-2 pr-2 font-mono text-xs text-[#e8e8ef]/80">{c.postSlug}</td>
                    <td className="py-2 pr-2 text-[#e8e8ef]/65">{c.parentId ? "Reply" : "Comment"}</td>
                    <td className="py-2 pr-2 text-[#e8e8ef]">{c.authorName}</td>
                    <td className="py-2 pr-2 text-[#e8e8ef]/65">{c.approved ? "Approved" : "Pending"}</td>
                    <td className="py-2">
                      {!c.approved ? (
                        <button
                          type="button"
                          onClick={() => void approve(c.postSlug, c.id)}
                          className="text-[#8b5cf6] hover:underline"
                        >
                          Approve
                        </button>
                      ) : null}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          c.parentId
                            ? void removeReply(c.postSlug, c.parentId, c.id)
                            : void remove(c.postSlug, c.id)
                        }
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
