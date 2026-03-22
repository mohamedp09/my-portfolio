"use client";

import type { UITranslations } from "@/lib/i18n";
import { useState } from "react";

export function Newsletter({ labels }: { labels: UITranslations["newsletter"] }) {
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
    <section className="mx-auto max-w-[1200px] px-6 py-[80px] md:px-12">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-hover)] bg-[var(--glass)] p-8 shadow-[0_20px_60px_rgba(139,92,246,0.08)] md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 25%, transparent), transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-[var(--text-primary)] md:text-3xl">
            {labels.title}
          </h2>
          <p className="mt-2 max-w-xl text-[var(--text-secondary)]">{labels.subtitle}</p>
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={labels.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[48px] w-full flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] sm:max-w-md"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="min-h-[48px] shrink-0 rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {status === "loading" ? "…" : labels.cta}
            </button>
          </form>
          {status === "ok" && <p className="mt-4 text-sm font-medium text-emerald-500">{labels.success}</p>}
          {status === "already" && (
            <p className="mt-4 text-sm font-medium text-[#c4b5fd]">{labels.already}</p>
          )}
          {status === "err" && <p className="mt-4 text-sm text-red-400">{labels.error}</p>}
        </div>
      </div>
    </section>
  );
}
