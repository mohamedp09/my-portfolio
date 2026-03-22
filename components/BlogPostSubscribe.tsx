"use client";

import type { UITranslations } from "@/lib/i18n";
import { useState } from "react";

export function BlogPostSubscribe({ labels }: { labels: UITranslations["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "already" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = (await res.json()) as { already?: boolean; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setStatus(j.already ? "already" : "ok");
      if (!j.already) setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--glass)] p-6">
      <p className="text-sm font-medium text-[var(--text-primary)]">{labels.postCta}</p>
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={labels.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[44px] w-full flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {status === "loading" ? "…" : labels.cta}
        </button>
      </form>
      {status === "ok" && <p className="mt-3 text-sm text-emerald-500">{labels.success}</p>}
      {status === "already" && <p className="mt-3 text-sm text-[#c4b5fd]">{labels.already}</p>}
      {status === "err" && <p className="mt-3 text-sm text-red-400">{labels.error}</p>}
    </div>
  );
}
