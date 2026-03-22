import { NextResponse } from "next/server";
import { getTodayViews, getTotalViews } from "@/lib/analytics";
import { getAllPosts } from "@/lib/posts";
import { getMessages } from "@/lib/messages";
import { getSubscriberCount } from "@/lib/subscribers";
import { getPendingCommentCount, getTotalCommentCount } from "@/lib/comments";
import { getTotalPostLikes } from "@/lib/likes";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await getAllPosts({ includeDrafts: true });
    const messages = await getMessages();
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const recentMessages = messages.slice(0, 5);
    const subscriberCount = getSubscriberCount();
    const siteTotalViews = getTotalViews();
    const siteTodayViews = getTodayViews();
    const totalLikes = getTotalPostLikes();
    const totalComments = getTotalCommentCount();
    const pendingComments = getPendingCommentCount();

    return NextResponse.json({
      totalPosts: posts.length,
      totalViews,
      totalMessages: messages.length,
      recentMessages,
      subscriberCount,
      siteTotalViews,
      siteTodayViews,
      totalLikes,
      totalComments,
      pendingComments,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stats." }, { status: 500 });
  }
}
