"use client";

import { useEffect, useState } from "react";

type Daily = { date: string; views: number };

type AnalyticsPayload = {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  topPage: string;
  daily: Daily[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load analytics."));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#e8e8ef]/45">Loading…</p>;

  const maxV = Math.max(1, ...data.daily.map((x) => x.views));
  const points = data.daily.map((d, i) => {
    const x = (i / Math.max(1, data.daily.length - 1)) * 100;
    const y = 100 - (d.views / maxV) * 100;
    return `${x},${y}`;
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Analytics</h1>
      <p className="mt-2 text-sm text-[#e8e8ef]/45">Site traffic from JSON analytics store.</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total views", value: data.totalViews },
          { label: "Today", value: data.todayViews },
          { label: "This week", value: data.weekViews },
          { label: "Top page", value: data.topPage },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[#8b5cf6]/10 bg-gradient-to-br from-[rgb(20,18,35)]/70 to-[rgb(15,13,28)]/50 p-6"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/45">{c.label}</p>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-extrabold text-[#8b5cf6] break-all">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#8b5cf6]/10 bg-[rgb(15,13,28)]/80 p-6">
        <h2 className="text-lg font-semibold text-[#e8e8ef]">Daily views (30 days)</h2>
        <svg viewBox="0 0 100 100" className="mt-4 h-48 w-full text-[#8b5cf6]" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            points={points.join(" ")}
          />
        </svg>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">Top pages</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b5cf6]/15 text-left text-[#e8e8ef]/45">
                <th className="py-2">Path</th>
                <th className="py-2">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((row) => {
                const pct = data.totalViews ? Math.round((row.views / data.totalViews) * 100) : 0;
                return (
                  <tr key={row.path} className="border-b border-[#8b5cf6]/8">
                    <td className="py-2 font-mono text-xs text-[#e8e8ef]/80">{row.path}</td>
                    <td className="py-2 text-[#e8e8ef]">
                      {row.views}{" "}
                      <span className="text-[#e8e8ef]/35">({pct}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">Referrers</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b5cf6]/15 text-left text-[#e8e8ef]/45">
                <th className="py-2">Source</th>
                <th className="py-2">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.topReferrers.map((row) => (
                <tr key={row.source} className="border-b border-[#8b5cf6]/8">
                  <td className="py-2 text-[#e8e8ef]/80">{row.source}</td>
                  <td className="py-2 text-[#e8e8ef]">{row.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
