"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subscriber } from "@/lib/subscribers";

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/subscribers")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((d: { subscribers?: Subscriber[] }) =>
        setRows(Array.isArray(d.subscribers) ? d.subscribers : [])
      )
      .catch(() => setError("Failed to load."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const csv = () => {
    const header = "email,name,subscribedAt,id\n";
    const body = rows
      .map((r) =>
        [r.email, r.name.replace(/"/g, '""'), r.subscribedAt, r.id].map((c) => `"${String(c)}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function remove(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    const res = await fetch(`/api/admin/subscribers/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Subscribers</h1>
          <p className="mt-2 text-sm text-[#e8e8ef]/45">Total: {rows.length}</p>
        </div>
        <button
          type="button"
          onClick={csv}
          className="rounded-full border border-[#8b5cf6]/30 px-5 py-2 text-sm font-semibold text-[#e8e8ef] hover:bg-[#8b5cf6]/10"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#8b5cf6]/15 text-[#e8e8ef]/45">
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[#8b5cf6]/8">
                <td className="py-3 pr-4 text-[#e8e8ef]">{r.email}</td>
                <td className="py-3 pr-4 text-[#e8e8ef]/65">{r.name || "—"}</td>
                <td className="py-3 pr-4 text-[#e8e8ef]/45">{new Date(r.subscribedAt).toLocaleString()}</td>
                <td className="py-3">
                  <button type="button" onClick={() => void remove(r.id)} className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
