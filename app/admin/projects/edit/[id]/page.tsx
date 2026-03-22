"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/lib/projects";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Project | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((d: { projects?: Project[] }) => {
        const p = d.projects?.find((x) => x.id === id);
        setForm(p ?? null);
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed.");
        return;
      }
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-[#e8e8ef]/45">{loading ? "Loading…" : "Not found."}</p>;
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/projects" className="text-sm text-[#8b5cf6] hover:underline">
        ← Projects
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold">Edit project</h1>

      <form onSubmit={(e) => void submit(e)} className="mt-8 grid gap-4">
        <label className="block text-sm text-[#e8e8ef]/65">
          Title
          <input
            required
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Description
          <textarea
            required
            rows={2}
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Long description
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.longDescription}
            onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Tags (comma-separated)
          <input
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.tags.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Live URL
          <input
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          GitHub URL
          <input
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Project["status"] })
            }
          >
            <option value="launched">launched</option>
            <option value="building">building</option>
            <option value="planned">planned</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[#e8e8ef]/65">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Date
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="block text-sm text-[#e8e8ef]/65">
          Order
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef]"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
