import { getApprovedCommentCountForPost } from "@/lib/comments";
import { getPostLikeCount } from "@/lib/likes";

export function getEngagementForSlug(slug: string): { likes: number; comments: number } {
  return {
    likes: getPostLikeCount(slug),
    comments: getApprovedCommentCountForPost(slug),
  };
}
