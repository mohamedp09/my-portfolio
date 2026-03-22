"use client";

import { useCallback, useEffect, useState } from "react";
import type { HeroStat, SiteSettings, SocialLink, TechStackRow } from "@/lib/settings";

const inputClass =
  "rounded-lg border border-[#8b5cf6]/20 bg-[#08080c] px-3 py-2 text-sm text-[#e8e8ef] placeholder:text-[#e8e8ef]/35 focus:border-[#8b5cf6]/50 focus:outline-none";

function Section({
  title,
  children,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[#8b5cf6]/15 bg-[#08080c]/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#8b5cf6]/10 pb-4">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-[#e8e8ef]">{title}</h2>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-full bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save section"}
        </button>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

export default function AdminSiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [hero, setHero] = useState<SiteSettings["hero"] | null>(null);
  const [about, setAbout] = useState<SiteSettings["about"] | null>(null);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [contact, setContact] = useState<SiteSettings["contact"] | null>(null);
  const [footer, setFooter] = useState<SiteSettings["footer"] | null>(null);
  const [seo, setSeo] = useState<SiteSettings["seo"] | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { settings?: SiteSettings; error?: string }) => {
        if (!d.settings) return;
        const s = d.settings;
        setHero(s.hero);
        setAbout(s.about);
        setSocial(s.social ?? []);
        setContact(s.contact);
        setFooter(s.footer);
        setSeo(s.seo);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  async function savePartial(key: keyof SiteSettings, data: unknown) {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: data }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast((d as { error?: string }).error ?? "Save failed.");
        return;
      }
      setToast("Saved successfully.");
      load();
    } finally {
      setSavingKey(null);
    }
  }

  if (loading || !hero || !about || !contact || !footer || !seo) {
    return <p className="text-[#e8e8ef]/45">Loading…</p>;
  }

  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#e8e8ef]">Site settings</h1>
        <p className="mt-2 text-sm text-[#e8e8ef]/45">content/settings.json — save each section independently.</p>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[200] rounded-xl border border-[#8b5cf6]/35 bg-[#0c0c14] px-4 py-3 text-sm text-[#e8e8ef] shadow-xl">
          {toast}
        </div>
      ) : null}

      <Section title="Hero Section" onSave={() => void savePartial("hero", hero)} saving={savingKey === "hero"}>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Subtitle
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={hero.subtitle}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Title line 1
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={hero.titleLine1}
            onChange={(e) => setHero({ ...hero, titleLine1: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Title line 2 (accent)
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={hero.titleLine2}
            onChange={(e) => setHero({ ...hero, titleLine2: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Description
          <textarea
            className={`${inputClass} mt-1 min-h-[100px] w-full max-w-2xl resize-y`}
            value={hero.description}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
          />
        </label>
        <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
            Primary button text
            <input
              className={`${inputClass} mt-1 w-full`}
              value={hero.primaryButtonText}
              onChange={(e) => setHero({ ...hero, primaryButtonText: e.target.value })}
            />
          </label>
          <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
            Secondary button text
            <input
              className={`${inputClass} mt-1 w-full`}
              value={hero.secondaryButtonText}
              onChange={(e) => setHero({ ...hero, secondaryButtonText: e.target.value })}
            />
          </label>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[#e8e8ef]/45">Stats (value + label)</p>
          <div className="mt-2 space-y-2">
            {hero.stats.map((row: HeroStat, i: number) => (
              <div key={i} className="flex flex-wrap gap-2">
                <input
                  className={`${inputClass} w-24`}
                  value={row.value}
                  onChange={(e) => {
                    const next = [...hero.stats];
                    next[i] = { ...next[i], value: e.target.value };
                    setHero({ ...hero, stats: next });
                  }}
                />
                <input
                  className={`${inputClass} flex-1 min-w-[160px]`}
                  value={row.label}
                  onChange={(e) => {
                    const next = [...hero.stats];
                    next[i] = { ...next[i], label: e.target.value };
                    setHero({ ...hero, stats: next });
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg border border-red-500/30 px-2 text-xs text-red-400"
                  onClick={() => {
                    const next = hero.stats.filter((_, j) => j !== i);
                    setHero({ ...hero, stats: next });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-[#8b5cf6] hover:underline"
              onClick={() => setHero({ ...hero, stats: [...hero.stats, { value: "", label: "" }] })}
            >
              + Add stat row
            </button>
          </div>
        </div>
      </Section>

      <Section title="About Section" onSave={() => void savePartial("about", about)} saving={savingKey === "about"}>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Section label (small)
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={about.sectionLabel}
            onChange={(e) => setAbout({ ...about, sectionLabel: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Heading line 1
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={about.heading}
            onChange={(e) => setAbout({ ...about, heading: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Heading highlight
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={about.headingHighlight}
            onChange={(e) => setAbout({ ...about, headingHighlight: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Bio
          <textarea
            className={`${inputClass} mt-1 min-h-[140px] w-full max-w-2xl resize-y`}
            value={about.bio}
            onChange={(e) => setAbout({ ...about, bio: e.target.value })}
          />
        </label>
        <div>
          <p className="text-xs font-medium uppercase text-[#e8e8ef]/45">Tech stack</p>
          <div className="mt-2 space-y-2">
            {about.techStack.map((row: TechStackRow, i: number) => (
              <div key={i} className="flex flex-wrap gap-2">
                <input
                  placeholder="Label"
                  className={`${inputClass} w-32`}
                  value={row.label}
                  onChange={(e) => {
                    const next = [...about.techStack];
                    next[i] = { ...next[i], label: e.target.value };
                    setAbout({ ...about, techStack: next });
                  }}
                />
                <input
                  placeholder="Tools"
                  className={`${inputClass} flex-1 min-w-[200px]`}
                  value={row.tools}
                  onChange={(e) => {
                    const next = [...about.techStack];
                    next[i] = { ...next[i], tools: e.target.value };
                    setAbout({ ...about, techStack: next });
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg border border-red-500/30 px-2 text-xs text-red-400"
                  onClick={() => {
                    const next = about.techStack.filter((_, j) => j !== i);
                    setAbout({ ...about, techStack: next });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-[#8b5cf6] hover:underline"
              onClick={() =>
                setAbout({ ...about, techStack: [...about.techStack, { label: "", tools: "" }] })
              }
            >
              + Add row
            </button>
          </div>
        </div>
      </Section>

      <Section title="Social Links" onSave={() => void savePartial("social", social)} saving={savingKey === "social"}>
        <div className="space-y-2">
          {social.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                placeholder="Name"
                className={`${inputClass} w-28`}
                value={row.name}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], name: e.target.value };
                  setSocial(next);
                }}
              />
              <input
                placeholder="URL"
                className={`${inputClass} flex-1 min-w-[200px]`}
                value={row.url}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], url: e.target.value };
                  setSocial(next);
                }}
              />
              <input
                placeholder="Icon"
                className={`${inputClass} w-20`}
                value={row.icon}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], icon: e.target.value };
                  setSocial(next);
                }}
              />
              <button
                type="button"
                className="rounded-lg border border-red-500/30 px-2 text-xs text-red-400"
                onClick={() => setSocial(social.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-xs font-semibold text-[#8b5cf6] hover:underline"
            onClick={() => setSocial([...social, { name: "", url: "", icon: "" }])}
          >
            + Add social link
          </button>
        </div>
      </Section>

      <Section title="Contact Section" onSave={() => void savePartial("contact", contact)} saving={savingKey === "contact"}>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Section label
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={contact.sectionLabel}
            onChange={(e) => setContact({ ...contact, sectionLabel: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Heading
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={contact.heading}
            onChange={(e) => setContact({ ...contact, heading: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Subtitle
          <textarea
            className={`${inputClass} mt-1 min-h-[80px] w-full max-w-2xl resize-y`}
            value={contact.subtitle}
            onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
          />
        </label>
      </Section>

      <Section title="Footer" onSave={() => void savePartial("footer", footer)} saving={savingKey === "footer"}>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Copyright text (use {"{year}"} for current year)
          <input
            className={`${inputClass} mt-1 w-full max-w-2xl`}
            value={footer.copyright}
            onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
          />
        </label>
      </Section>

      <Section title="SEO" onSave={() => void savePartial("seo", seo)} saving={savingKey === "seo"}>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Site title
          <input
            className={`${inputClass} mt-1 w-full max-w-xl`}
            value={seo.siteTitle}
            onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Site description
          <textarea
            className={`${inputClass} mt-1 min-h-[80px] w-full max-w-2xl resize-y`}
            value={seo.siteDescription}
            onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium uppercase text-[#e8e8ef]/45">
          Default language
          <select
            className={`${inputClass} mt-1 block w-full max-w-xs`}
            value={seo.defaultLanguage}
            onChange={(e) => setSeo({ ...seo, defaultLanguage: e.target.value as "en" | "ar" })}
          >
            <option value="en">English (en)</option>
            <option value="ar">Arabic (ar)</option>
          </select>
        </label>
      </Section>
    </div>
  );
}
