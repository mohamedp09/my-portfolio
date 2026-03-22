import fs from "fs";
import path from "path";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const ANALYTICS_PATH = path.join(process.cwd(), "content", "analytics.json");

export type AnalyticsData = {
  pageViews: Record<string, number>;
  dailyViews: Record<string, number>;
  referrers: Record<string, number>;
  countries: Record<string, number>;
  browsers: Record<string, number>;
};

function defaultData(): AnalyticsData {
  return {
    pageViews: {},
    dailyViews: {},
    referrers: {},
    countries: {},
    browsers: {},
  };
}

function readStore(): AnalyticsData {
  try {
    const raw = fs.readFileSync(ANALYTICS_PATH, "utf8");
    const j = JSON.parse(raw) as Partial<AnalyticsData>;
    return { ...defaultData(), ...j };
  } catch {
    return defaultData();
  }
}

function writeStore(d: AnalyticsData): void {
  writeFileSyncUtf8(ANALYTICS_PATH, `${JSON.stringify(d, null, 2)}\n`);
}

function referrerKey(ref: string | undefined): string {
  if (!ref || !ref.trim()) return "direct";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "") || "direct";
  } catch {
    return "direct";
  }
}

export function trackPageView(pagePath: string, referrer?: string): void {
  const data = readStore();
  data.pageViews[pagePath] = (data.pageViews[pagePath] ?? 0) + 1;
  const today = new Date().toISOString().slice(0, 10);
  data.dailyViews[today] = (data.dailyViews[today] ?? 0) + 1;
  const key = referrerKey(referrer);
  data.referrers[key] = (data.referrers[key] ?? 0) + 1;
  writeStore(data);
}

export function getPageViews(): Record<string, number> {
  return { ...readStore().pageViews };
}

export function getDailyViews(days = 30): { date: string; views: number }[] {
  const { dailyViews } = readStore();
  const out: { date: string; views: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    out.push({ date, views: dailyViews[date] ?? 0 });
  }
  return out;
}

export function getTotalViews(): number {
  const { pageViews } = readStore();
  return Object.values(pageViews).reduce((a, b) => a + b, 0);
}

export function getTopPages(limit = 10): { path: string; views: number }[] {
  const { pageViews } = readStore();
  return Object.entries(pageViews)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function getReferrers(): Record<string, number> {
  return { ...readStore().referrers };
}

export function getTodayViews(): number {
  const today = new Date().toISOString().slice(0, 10);
  return readStore().dailyViews[today] ?? 0;
}

export function getWeekViews(): number {
  const { dailyViews } = readStore();
  const now = new Date();
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    sum += dailyViews[date] ?? 0;
  }
  return sum;
}
