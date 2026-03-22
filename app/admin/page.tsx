"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalPosts: number;
  totalViews: number;
  totalMessages: number;
  subscriberCount: number;
  siteTotalViews: number;
  siteTodayViews: number;
  totalLikes: number;
  totalComments: number;
  pendingComments: number;
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch(() => setError("Failed to load stats."));
  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!stats) {
    return <p className="text-[#e8e8ef]/45">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Dashboard</h1>
      <p className="mt-2 text-sm text-[#e8e8ef]/45">Overview of your site.</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Posts", value: stats.totalPosts },
          { label: "Views today", value: stats.siteTodayViews },
          { label: "Total likes", value: stats.totalLikes },
          { label: "Total comments", value: stats.totalComments },
          { label: "Pending comments", value: stats.pendingComments },
          { label: "Subscribers", value: stats.subscriberCount },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#8b5cf6]/10 bg-gradient-to-br from-[rgb(20,18,35)]/70 to-[rgb(15,13,28)]/50 p-6"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#8b5cf6]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-[#e8e8ef]">Recent messages</h2>
        {stats.recentMessages.length === 0 ? (
          <p className="mt-4 text-sm text-[#e8e8ef]/45">No messages yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {stats.recentMessages.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-[#8b5cf6]/10 bg-[rgb(15,13,28)]/80 px-4 py-3 text-sm"
              >
                <span className="font-medium text-[#e8e8ef]">{m.name}</span>
                <span className="text-[#e8e8ef]/35"> · {m.email}</span>
                <p className="mt-1 line-clamp-2 text-[#e8e8ef]/55">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white"
        >
          New post
        </Link>
        <Link href="/" target="_blank" className="rounded-full border border-[#8b5cf6]/25 px-6 py-2.5 text-sm text-[#e8e8ef]">
          View site
        </Link>
      </div>
    </div>
  );
}
