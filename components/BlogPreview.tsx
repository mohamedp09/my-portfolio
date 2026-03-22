"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export function BlogPreview() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/posts?limit=3")
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => setPosts([]))
      .finally(() => setReady(true));
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[100px] md:px-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Blog</span>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-extrabold tracking-tight text-[var(--text-primary)]">
            Latest posts
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
        >
          View All Posts →
        </Link>
      </div>

      {!ready ? (
        <p className="text-[var(--text-muted)]">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--glass)] px-8 py-12 text-center text-[var(--text-muted)]">
          Coming soon…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${encodeURIComponent(post.slug)}`}
              className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--glass)] p-6 transition hover:border-[var(--border-hover)]"
            >
              <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold text-[var(--text-primary)]">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm font-light text-[var(--text-secondary)]">{post.excerpt}</p>
              <p className="mt-4 text-xs text-[var(--text-muted)]">
                {post.date ? new Date(post.date).toLocaleDateString("en-US") : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
