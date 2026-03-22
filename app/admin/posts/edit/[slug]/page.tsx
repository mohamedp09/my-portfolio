"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = typeof params.slug === "string" ? params.slug : "";

  const [originalSlug, setOriginalSlug] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!slugParam) return;
    setLoading(true);
    fetch(`/api/admin/posts/${encodeURIComponent(slugParam)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.post) {
          setError(d.error ?? "Not found.");
          return;
        }
        const p = d.post as {
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          tags: string[];
          published: boolean;
        };
        setOriginalSlug(p.slug);
        setTitle(p.title);
        setSlug(p.slug);
        setExcerpt(p.excerpt);
        setContent(p.content);
        setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
        setPublished(p.published);
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [slugParam]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(originalSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          tags: tagList,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to save.");
        return;
      }
      if (slug !== originalSlug) {
        router.replace(`/admin/posts/edit/${encodeURIComponent(slug)}`);
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[#e8e8ef]/45">Loading…</p>;
  if (error && !title) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Edit post</h1>
      <p className="mt-1 text-sm text-[#e8e8ef]/45">Update frontmatter and markdown body.</p>

      <form onSubmit={handleSubmit} className="mt-10 max-w-3xl space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">Title</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 px-3 py-2 text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">Slug</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 px-3 py-2 font-mono text-sm text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">Excerpt</label>
          <textarea
            required
            rows={2}
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 px-3 py-2 text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">
            Tags (comma separated)
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 px-3 py-2 text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">Content (Markdown)</label>
          <textarea
            required
            rows={18}
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 px-3 py-2 font-mono text-sm text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#e8e8ef]/75">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
