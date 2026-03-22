import type { Metadata } from "next";
import { ProjectsView } from "@/components/ProjectsView";
import { getMetadataBaseUrl } from "@/lib/env";
import { getAllProjects } from "@/lib/projects";
import { getTranslations, resolveLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = getSiteSettings();
  const title = `Projects | ${seo.siteTitle}`;
  const description = seo.siteDescription;
  const base = getMetadataBaseUrl();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL("/projects", base),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectsPage() {
  const projects = getAllProjects();
  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const t = getTranslations(locale);

  return (
    <div className="bg-[var(--bg-primary)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-[var(--text-primary)]">
          {t.projects.pageTitle}
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">{t.projects.pageSubtitle}</p>
        <ProjectsView projects={projects} labels={t.projects} />
      </div>
    </div>
  );
}
