"use client";

import type { Theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--glass)] text-[var(--text-primary)] transition-all duration-300 hover:border-[var(--border-hover)]"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute text-lg transition-all duration-300 ${theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
        aria-hidden
      >
        🌙
      </span>
      <span
        className={`absolute text-lg transition-all duration-300 ${theme === "light" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`}
        aria-hidden
      >
        ☀️
      </span>
    </button>
  );
}
