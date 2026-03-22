import { NextResponse } from "next/server";
import {
  getDailyViews,
  getReferrers,
  getTodayViews,
  getTopPages,
  getTotalViews,
  getWeekViews,
} from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daily = getDailyViews(30);
  const topPages = getTopPages(10);
  const total = getTotalViews();
  const referrers = getReferrers();
  const today = getTodayViews();
  const week = getWeekViews();

  const topRef = Object.entries(referrers)
    .map(([source, views]) => ({ source, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const topPage = topPages[0]?.path ?? "—";

  return NextResponse.json({
    totalViews: total,
    todayViews: today,
    weekViews: week,
    topPage,
    daily,
    topPages,
    topReferrers: topRef,
    referrers,
  });
}
