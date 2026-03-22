import { About } from "@/components/About";
import { BannerSlider } from "@/components/BannerSlider";
import { BlogPreview } from "@/components/BlogPreview";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Newsletter } from "@/components/Newsletter";
import { Products } from "@/components/Products";
import { getActiveBanners } from "@/lib/banners";
import { getTranslations, resolveLocale } from "@/lib/i18n";
import { getProductsForSite } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import { resolveTheme } from "@/lib/theme";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const theme = resolveTheme(jar.get("theme")?.value);
  const t = getTranslations(locale);
  const settings = getSiteSettings();
  const products = getProductsForSite();
  const banners = getActiveBanners();

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="grain-overlay" aria-hidden />
      <Navbar locale={locale} theme={theme} t={t} />
      <main>
        <Hero hero={settings.hero} social={settings.social} />
        {banners.length > 0 ? (
          <>
            <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
            <BannerSlider banners={banners} />
          </>
        ) : null}
        <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
        <Products products={products} />
        <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
        <About about={settings.about} />
        <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
        <BlogPreview />
        <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
        <Newsletter labels={t.newsletter} />
        <div className="mx-auto h-px w-4/5 max-w-[960px] bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
        <Contact
          sectionLabel={settings.contact.sectionLabel}
          heading={settings.contact.heading}
          subtitle={settings.contact.subtitle}
        />
      </main>
      <Footer copyrightTemplate={settings.footer.copyright} social={settings.social} />
    </div>
  );
}
