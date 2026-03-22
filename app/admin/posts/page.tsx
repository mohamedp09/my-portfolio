"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  published: boolean;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPosts(Array.isArray(d.posts) ? d.posts : []);
      })
      .catch(() => setError("Failed to load posts."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function remove(slug: string) {
    if (!confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Delete failed.");
      return;
    }
    load();
  }

  if (loading) return <p className="text-[#e8e8e8]/45">Loading…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Posts</h1>
          <p className="mt-1 text-sm text-[#e8e8e8]/45">Create, edit, or delete markdown posts.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex rounded-full bg-gradient-to-br from-[#ff6622] to-[#e85518] px-6 py-2.5 text-sm font-semibold text-white"
        >
          New post
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-[#ff6622]/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[#ff6622]/10 bg-[rgb(15,15,22)]/80 text-[#e8e8e8]/55">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug} className="border-b border-[#ff6622]/6 last:border-0">
                <td className="px-4 py-3 font-medium text-[#e8e8e8]">{p.title}</td>
                <td className="px-4 py-3 text-[#e8e8e8]/55">{p.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-emerald-500/15 text-emerald-400" : "bg-[#8b5cf6]/15 text-[#c4b5fd]"}`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#e8e8e8]/45">
                  {new Date(p.date).toLocaleDateString("en-US")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/edit/${encodeURIComponent(p.slug)}`}
                    className="mr-3 text-[#ff6622] hover:underline"
                  >
                    Edit
                  </Link>
                  <button type="button" onClick={() => void remove(p.slug)} className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="px-4 py-8 text-center text-[#e8e8e8]/45">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
