import type { Metadata } from "next";
import { Outfit, Syne, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { getMetadataBaseUrl } from "@/lib/env";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";
import { resolveTheme } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = getSiteSettings();
  const base = getMetadataBaseUrl();
  return {
    metadataBase: base,
    title: seo.siteTitle,
    description: seo.siteDescription,
    openGraph: {
      title: seo.siteTitle,
      description: seo.siteDescription,
      type: "website",
      url: base,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.siteDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("locale")?.value);
  const theme = resolveTheme(jar.get("theme")?.value);
  const dir = getDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${outfit.variable} ${syne.variable} ${notoArabic.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-full overflow-x-hidden bg-transparent antialiased ${locale === "ar" ? "font-[family-name:var(--font-noto-arabic)]" : "font-sans"}`}
      >
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
