"use client";

import { useState } from "react";

export function Contact({
  sectionLabel,
  heading,
  subtitle,
}: {
  sectionLabel: string;
  heading: string;
  subtitle: string;
}) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setError("Network error. Try again.");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-[800px] px-6 py-[100px] text-center md:px-12">
      <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{sectionLabel}</span>
      <h2 className="mt-3 font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.625rem)] font-extrabold tracking-tight text-[var(--text-primary)]">
        {heading}
      </h2>
      <p className="mt-3 text-base font-light text-[var(--text-muted)]">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-12 text-left">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-[18px] py-3.5 text-[15px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            required
            type="email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-[18px] py-3.5 text-[15px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <textarea
          required
          rows={5}
          className="mt-4 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-[18px] py-3.5 text-[15px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-[var(--accent)] px-12 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send Message →"}
          </button>
          {status === "success" && (
            <p className="text-sm font-medium text-emerald-400">Message sent. Thank you!</p>
          )}
          {status === "error" && error && <p className="text-sm font-medium text-red-400">{error}</p>}
        </div>
      </form>
    </section>
  );
}
