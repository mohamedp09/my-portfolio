"use client";

import { useCallback, useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setMessages(Array.isArray(d.messages) ? d.messages : []);
      })
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function toggleRead(id: string, read: boolean) {
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !read }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Update failed.");
      return;
    }
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "DELETE" });
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
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Messages</h1>
      <p className="mt-1 text-sm text-[#e8e8e8]/45">Contact form submissions.</p>

      <div className="mt-10 space-y-4">
        {messages.length === 0 ? (
          <p className="text-[#e8e8e8]/45">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border px-4 py-4 ${m.read ? "border-[#ff6622]/6 bg-[rgb(15,15,22)]/40" : "border-[#ff6622]/25 bg-[#ff6622]/5"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-[#e8e8e8]">{m.name}</span>
                  <span className="text-[#e8e8e8]/35"> · {m.email}</span>
                  <p className="mt-1 text-xs text-[#e8e8e8]/35">
                    {new Date(m.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleRead(m.id, m.read)}
                    className="text-xs font-medium text-[#ff6622] hover:underline"
                  >
                    Mark as {m.read ? "unread" : "read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(m.id)}
                    className="text-xs font-medium text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[#e8e8e8]/75">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
