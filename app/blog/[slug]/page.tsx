import { BlogPostEngagement } from "@/components/BlogPostEngagement";
import { BlogPostSubscribe } from "@/components/BlogPostSubscribe";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getMetadataBaseUrl } from "@/lib/env";
import { incrementViews, readPostFile } from "@/lib/posts";
import { getTranslations, resolveLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeSlug(raw);
  const post = await readPostFile(slug, { onlyPublished: true });
  if (!post) return { title: "Post not found" };
  const base = getMetadataBaseUrl();
  const { seo } = getSiteSettings();
  const title = `${post.title} | ${seo.siteTitle}`;
  const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, base);
  return {
    title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeSlug(raw);
  const post = await incrementViews(slug);
  if (!post) notFound();

  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const t = getTranslations(locale);

  return (
    <div className="bg-[var(--bg-primary)] px-6 py-12 md:px-12 md:py-16">
      <article className="mx-auto max-w-[720px]">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          {t.blog.backToBlog}
        </Link>
        <header className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {new Date(post.date).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {post.title}
          </h1>
          <p className="mt-4 text-[var(--text-secondary)]">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
        <div className="markdown-body mt-12 text-[var(--text-primary)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <BlogPostSubscribe labels={t.newsletter} />
        <BlogPostEngagement slug={slug} />
      </article>
    </div>
  );
}
