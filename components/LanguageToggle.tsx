"use client";

import type { Locale } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const next: Locale = locale === "ar" ? "en" : "ar";

  async function switchLocale() {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={() => void switchLocale()}
      className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
