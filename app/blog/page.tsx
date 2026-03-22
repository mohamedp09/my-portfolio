import Link from "next/link";
import type { Metadata } from "next";
import { PostLikesListPopover } from "@/components/PostLikesListPopover";
import { getMetadataBaseUrl } from "@/lib/env";
import { getAllPosts } from "@/lib/posts";
import { getEngagementForSlug } from "@/lib/engagement";
import { getTranslations, resolveLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = getSiteSettings();
  const title = `Blog | ${seo.siteTitle}`;
  const description = "Articles, notes, and product updates.";
  const base = getMetadataBaseUrl();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL("/blog", base),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts({ includeDrafts: false });
  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const t = getTranslations(locale);

  return (
    <div className="bg-[var(--bg-primary)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-[var(--text-primary)]">
          {t.blog.pageTitle ?? "Blog"}
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          {t.blog.pageSubtitle ?? "Articles, notes, and product updates."}
        </p>

        {posts.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--glass)] px-8 py-12 text-center text-[var(--text-muted)]">
            {t.blog.noPosts ?? "No posts yet."}
          </p>
        ) : (
          <ul className="mt-12 space-y-6">
            {posts.map((post) => {
              const { likes, comments } = getEngagementForSlug(post.slug);
              return (
                <li key={post.slug}>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--glass)] p-6 transition hover:border-[var(--border-hover)]">
                    <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                      <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--text-primary)]">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">{post.excerpt}</p>
                    </Link>
                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--text-muted)]">
                      <span>{new Date(post.date).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        <PostLikesListPopover slug={post.slug} countLabel={likes} />
                        <span aria-hidden>·</span>
                        <span>
                          {comments} comments
                        </span>
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          {t.blog.backHome ?? "← Back home"}
        </Link>
      </div>
    </div>
  );
}
