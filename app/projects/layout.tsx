import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getTranslations, resolveLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";
import { resolveTheme } from "@/lib/theme";
import { cookies } from "next/headers";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const theme = resolveTheme(jar.get("theme")?.value);
  const t = getTranslations(locale);
  const settings = getSiteSettings();

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="grain-overlay" aria-hidden />
      <Navbar locale={locale} theme={theme} t={t} />
      <div className="pt-16 md:pt-[72px]">{children}</div>
      <Footer copyrightTemplate={settings.footer.copyright} social={settings.social} />
    </div>
  );
}
