"use client";

import { useEffect, useRef, useState } from "react";
import { formatRelativeTimeEn } from "@/lib/formatRelativeTime";

export type LikeRow = { id: string; name: string; createdAt: string };

function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 50% 42%)`;
}

function initialChar(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t[0]!.toUpperCase();
}

export function PostLikesListPopover({
  slug,
  countLabel,
  likesWord = "likes",
  title = "People who liked this",
  emptyText = "No likes yet",
}: {
  slug: string;
  countLabel: number;
  likesWord?: string;
  title?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [likes, setLikes] = useState<LikeRow[]>([]);
  const [count, setCount] = useState(countLabel);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(countLabel);
  }, [countLabel]);

  useEffect(() => {
    if (!open) return;
    void fetch(`/api/posts/${encodeURIComponent(slug)}/likes`)
      .then((r) => r.json())
      .then((d: { likes?: LikeRow[]; count?: number }) => {
        if (Array.isArray(d.likes)) setLikes(d.likes);
        if (typeof d.count === "number") setCount(d.count);
      });
  }, [open, slug]);

  useEffect(() => {
    if (!open) return;
    function down(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="text-[var(--text-muted)] underline decoration-[var(--border-hover)] underline-offset-2 hover:text-[var(--accent)]"
      >
        {count} {likesWord}
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,18rem)] rounded-xl border border-[rgba(139,92,246,0.35)] bg-[color-mix(in_srgb,var(--glass)_96%,transparent)] px-3 py-3 shadow-[0_12px_48px_rgba(0,0,0,0.5)] backdrop-blur-md"
          role="dialog"
          aria-label={title}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
            {likes.length === 0 ? (
              <li className="text-xs text-[var(--text-muted)]">{emptyText}</li>
            ) : (
              likes.map((row) => (
                <li key={row.id} className="flex items-center gap-2 text-[11px] leading-tight text-[var(--text-secondary)]">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-inner"
                    style={{ background: colorForName(row.name) }}
                  >
                    {initialChar(row.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-[var(--text-primary)]">{row.name}</span>
                  <span className="shrink-0 whitespace-nowrap text-[10px] text-[var(--text-muted)]">
                    {formatRelativeTimeEn(row.createdAt)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
