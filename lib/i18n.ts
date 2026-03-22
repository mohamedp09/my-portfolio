import translations from "@/content/translations.json";

export type Locale = "en" | "ar";

export type UITranslations = (typeof translations)["en"];

export function getTranslations(locale: Locale): UITranslations {
  return translations[locale] ?? translations.en;
}

export function resolveLocale(cookieLocale: string | undefined): Locale {
  if (cookieLocale === "ar" || cookieLocale === "en") return cookieLocale;
  return "en";
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
