"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Banner } from "@/lib/banners";

const inputClass =
  "rounded-lg border border-[#8b5cf6]/20 bg-[#08080c] px-3 py-2 text-sm text-[#e8e8ef] placeholder:text-[#e8e8ef]/35 focus:border-[#8b5cf6]/50 focus:outline-none";

export default function AdminBannersPage() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d: { banners?: Banner[]; error?: string }) => {
        if (d.error) setError(d.error);
        else setRows(Array.isArray(d.banners) ? d.banners : []);
      })
      .catch(() => setError("Failed to load."));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  function openAdd() {
    setEditing(null);
    setTitle("");
    setImageUrl("");
    setLink("");
    setActive(true);
    setOrder(rows.length);
    setModalOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setLink(b.link);
    setActive(b.active);
    setOrder(b.order);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert((d as { error?: string }).error ?? "Upload failed.");
        return;
      }
      const url = (d as { url?: string }).url;
      if (url) setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = { title, imageUrl, link, active, order };
      const url = editing ? `/api/admin/banners/${encodeURIComponent(editing.id)}` : "/api/admin/banners";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((d as { error?: string }).error ?? "Save failed.");
        return;
      }
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Delete failed.");
      return;
    }
    load();
  }

  async function setActiveFlag(id: string, next: boolean) {
    const res = await fetch(`/api/admin/banners/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Update failed.");
      return;
    }
    load();
  }

  if (error && rows.length === 0 && !modalOpen) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#e8e8ef]">Banners</h1>
          <p className="mt-2 text-sm text-[#e8e8ef]/45">Manage promotional banners (content/banners.json).</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-full bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c3aed]"
        >
          Add Banner
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#8b5cf6]/15 text-[#e8e8ef]/45">
              <th className="py-3 pr-3">Thumbnail</th>
              <th className="py-3 pr-3">Title</th>
              <th className="py-3 pr-3">Active</th>
              <th className="py-3 pr-3">Order</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
              .map((b) => (
                <tr key={b.id} className="border-b border-[#8b5cf6]/8">
                  <td className="py-3 pr-3">
                    <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-[#8b5cf6]/20 bg-[#08080c]">
                      {b.imageUrl ? (
                        <Image
                          src={b.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized={b.imageUrl.startsWith("/uploads/")}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-medium text-[#e8e8ef]">{b.title}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        b.active ? "text-emerald-400" : "text-[#e8e8ef]/35"
                      }
                    >
                      {b.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[#e8e8ef]/65">{b.order}</td>
                  <td className="py-3">
                    <button type="button" onClick={() => openEdit(b)} className="text-[#8b5cf6] hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void setActiveFlag(b.id, !b.active)}
                      className="ml-3 text-[#e8e8ef]/65 hover:text-[#e8e8ef]"
                    >
                      {b.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(b.id)}
                      className="ml-3 text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#8b5cf6]/25 bg-[#0c0c14] p-6 shadow-xl">
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[#e8e8ef]">
              {editing ? "Edit banner" : "Add banner"}
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Title
                <input className={`${inputClass} mt-1 w-full`} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">Image</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-full border border-[#8b5cf6]/40 px-4 py-2 text-xs font-semibold text-[#8b5cf6] hover:bg-[#8b5cf6]/10">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadFile(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {imageUrl ? (
                    <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-[#8b5cf6]/20">
                      <Image src={imageUrl} alt="" fill className="object-cover" unoptimized={imageUrl.startsWith("/uploads/")} />
                    </div>
                  ) : null}
                </div>
                <input
                  className={`${inputClass} mt-2 w-full font-mono text-xs`}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/uploads/..."
                />
              </div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Link (optional)
                <input className={`${inputClass} mt-1 w-full`} value={link} onChange={(e) => setLink(e.target.value)} />
              </label>
              <label className="flex flex-wrap items-center gap-3 text-sm text-[#e8e8ef]/65">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Order
                <input
                  type="number"
                  className={`${inputClass} mt-1 w-full`}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="mt-8 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#8b5cf6]/30 px-5 py-2 text-sm text-[#e8e8ef]/65"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || uploading}
                onClick={() => void save()}
                className="rounded-full bg-[#8b5cf6] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
