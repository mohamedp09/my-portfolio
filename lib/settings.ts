import fs from "fs";
import path from "path";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const PATH = path.join(process.cwd(), "content", "settings.json");

export type HeroStat = { value: string; label: string };

export type TechStackRow = { label: string; tools: string };

export type SocialLink = { name: string; url: string; icon: string };

export type SiteSettings = {
  hero: {
    subtitle: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    stats: HeroStat[];
  };
  about: {
    sectionLabel: string;
    heading: string;
    headingHighlight: string;
    bio: string;
    techStack: TechStackRow[];
  };
  social: SocialLink[];
  contact: {
    sectionLabel: string;
    heading: string;
    subtitle: string;
  };
  footer: {
    copyright: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    defaultLanguage: "en" | "ar";
  };
};

export const defaultSiteSettings: SiteSettings = {
  hero: {
    subtitle: "Indie Developer • Solo Builder",
    titleLine1: "Hello, I am",
    titleLine2: "Mohamed",
    description:
      "I build and ship digital products as a solo developer. From SaaS templates to developer tools — I turn ideas into real products that solve real problems.",
    primaryButtonText: "View Products",
    secondaryButtonText: "Hire Me",
    stats: [
      { value: "2+", label: "Products Shipped" },
      { value: "22", label: "Files in Bot Template" },
      { value: "∞", label: "Lines of Code" },
      { value: "1", label: "Builder, Full Stack" },
    ],
  },
  about: {
    sectionLabel: "About Me",
    heading: "Building in public,",
    headingHighlight: "shipping fast.",
    bio: "I'm an indie developer who believes in shipping real products over chasing perfection. My workflow is simple: idea → build → ship → iterate. I use modern tools like Cursor AI to build full-stack projects rapidly — from Telegram bots to SaaS templates. Every product I ship is battle-tested and production-ready.",
    techStack: [
      { label: "Frontend", tools: "Next.js, React, TypeScript" },
      { label: "Backend", tools: "Node.js, Express, SQLite" },
      { label: "AI/ML", tools: "OpenAI API, GPT-4o-mini" },
      { label: "Tools", tools: "Cursor AI, Vercel, Gumroad" },
    ],
  },
  social: [
    { name: "GitHub", url: "https://github.com/mohamedp09", icon: "⌂" },
    { name: "X", url: "https://twitter.com/mohamedbuilds", icon: "𝕏" },
    { name: "Gumroad", url: "https://mohamedp2.gumroad.com", icon: "G" },
    { name: "Dev.to", url: "https://dev.to/mohamedp09", icon: "D" },
  ],
  contact: {
    sectionLabel: "Get in Touch",
    heading: "Contact Me",
    subtitle: "Got a question or proposal, or just want to say hello? Go ahead.",
  },
  footer: {
    copyright: "© {year} Mohamed. Built with ☕ and code.",
  },
  seo: {
    siteTitle: "Mohamed | Indie Developer",
    siteDescription: "Portfolio, products, and blog — built with Next.js.",
    defaultLanguage: "en",
  },
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch)) {
    const pv = (patch as Record<string, unknown>)[k];
    if (pv === undefined) continue;
    const bv = out[k];
    if (
      pv !== null &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      bv !== null &&
      typeof bv === "object" &&
      !Array.isArray(bv)
    ) {
      out[k] = deepMerge(bv as Record<string, unknown>, pv as Record<string, unknown>);
    } else {
      out[k] = pv;
    }
  }
  return out as T;
}

function readFile(): SiteSettings | null {
  try {
    const raw = fs.readFileSync(PATH, "utf8");
    return JSON.parse(raw) as SiteSettings;
  } catch {
    return null;
  }
}

export function getSiteSettings(): SiteSettings {
  const base = JSON.parse(JSON.stringify(defaultSiteSettings)) as unknown as Record<string, unknown>;
  const file = readFile();
  if (!file || (typeof file === "object" && file !== null && Object.keys(file).length === 0)) {
    return JSON.parse(JSON.stringify(defaultSiteSettings)) as SiteSettings;
  }
  return deepMerge(base, file as unknown as Record<string, unknown>) as SiteSettings;
}

export function saveSiteSettings(next: SiteSettings): void {
  writeFileSyncUtf8(PATH, `${JSON.stringify(next, null, 2)}\n`);
}

export function mergeSiteSettings(patch: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const merged = deepMerge(current as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>) as SiteSettings;
  saveSiteSettings(merged);
  return merged;
}

/** Resolve footer copyright with {year} */
export function formatFooterCopyright(template: string): string {
  return template.replace(/\{year\}/g, String(new Date().getFullYear()));
}
