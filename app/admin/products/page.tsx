"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/products";

const inputClass =
  "rounded-lg border border-[#8b5cf6]/20 bg-[#08080c] px-3 py-2 text-sm text-[#e8e8ef] placeholder:text-[#e8e8ef]/35 focus:border-[#8b5cf6]/50 focus:outline-none";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [emoji, setEmoji] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d: { products?: Product[]; error?: string }) => {
        if (d.error) setError(d.error);
        else setRows(Array.isArray(d.products) ? d.products : []);
      })
      .catch(() => setError("Failed to load."));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  function openAdd() {
    setEditing(null);
    setEmoji("📦");
    setTitle("");
    setPrice("");
    setDesc("");
    setTags("");
    setLink("");
    setOrder(rows.length);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setEmoji(p.emoji);
    setTitle(p.title);
    setPrice(p.price);
    setDesc(p.desc);
    setTags(p.tags.join(", "));
    setLink(p.link);
    setOrder(p.order);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = {
        emoji,
        title,
        price,
        desc,
        tags,
        link,
        order,
      };
      const url = editing ? `/api/admin/products/${encodeURIComponent(editing.id)}` : "/api/admin/products";
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
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d as { error?: string }).error ?? "Delete failed.");
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
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#e8e8ef]">Products</h1>
          <p className="mt-2 text-sm text-[#e8e8ef]/45">Manage homepage products (content/products.json).</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-full bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c3aed]"
        >
          Add Product
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#8b5cf6]/15 text-[#e8e8ef]/45">
              <th className="py-3 pr-3">Emoji</th>
              <th className="py-3 pr-3">Title</th>
              <th className="py-3 pr-3">Price</th>
              <th className="py-3 pr-3">Link</th>
              <th className="py-3 pr-3">Order</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
              .map((p) => (
                <tr key={p.id} className="border-b border-[#8b5cf6]/8">
                  <td className="py-3 pr-3 text-2xl">{p.emoji}</td>
                  <td className="py-3 pr-3 font-medium text-[#e8e8ef]">{p.title}</td>
                  <td className="py-3 pr-3 text-[#8b5cf6]">{p.price}</td>
                  <td className="max-w-[200px] truncate py-3 pr-3 font-mono text-xs text-[#e8e8ef]/55">
                    {p.link}
                  </td>
                  <td className="py-3 pr-3 text-[#e8e8ef]/65">{p.order}</td>
                  <td className="py-3">
                    <button type="button" onClick={() => openEdit(p)} className="text-[#8b5cf6] hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(p.id)}
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
              {editing ? "Edit product" : "Add product"}
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Emoji
                <input className={`${inputClass} mt-1 w-full`} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Title
                <input className={`${inputClass} mt-1 w-full`} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Price
                <input className={`${inputClass} mt-1 w-full`} value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Description
                <textarea
                  className={`${inputClass} mt-1 min-h-[100px] w-full resize-y`}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Tags (comma separated)
                <input className={`${inputClass} mt-1 w-full`} value={tags} onChange={(e) => setTags(e.target.value)} />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">
                Link
                <input className={`${inputClass} mt-1 w-full`} value={link} onChange={(e) => setLink(e.target.value)} />
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
                disabled={saving}
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
