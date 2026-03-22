"use client";

import type { Project } from "@/lib/projects";
import type { UITranslations } from "@/lib/i18n";
import { useMemo, useState } from "react";

type Filter = "all" | "launched" | "building" | "planned";

export function ProjectsView({
  projects,
  labels,
}: {
  projects: Project[];
  labels: UITranslations["projects"];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: labels.filterAll },
    { key: "launched", label: labels.filterLaunched },
    { key: "building", label: labels.filterBuilding },
    { key: "planned", label: labels.filterPlanned },
  ];

  function badge(p: Project) {
    if (p.status === "launched")
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    if (p.status === "building")
      return "bg-[#8b5cf6]/15 text-[#c4b5fd] border-[#8b5cf6]/25";
    return "bg-[var(--text-muted)]/15 text-[var(--text-secondary)] border-[var(--border)]";
  }

  function statusLabel(p: Project) {
    if (p.status === "launched") return labels.statusLaunched;
    if (p.status === "building") return labels.statusBuilding;
    return labels.statusPlanned;
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filter === t.key
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-[var(--text-muted)]">{labels.noProjects}</p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--glass)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)]"
            >
              {p.featured && (
                <span className="absolute right-4 top-4 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                  {labels.featured}
                </span>
              )}
              <h2 className="pr-20 font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--text-primary)]">
                {p.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-[var(--text-secondary)]">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--border)] bg-[var(--bg-primary)]/50 px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className={`rounded-full border px-2 py-0.5 ${badge(p)}`}>{statusLabel(p)}</span>
                <time>{p.date}</time>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {p.liveUrl ? (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                  >
                    {labels.live} →
                  </a>
                ) : null}
                {p.githubUrl ? (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  >
                    {labels.github} →
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
