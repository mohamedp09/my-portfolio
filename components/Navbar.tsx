"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Locale } from "@/lib/i18n";
import type { UITranslations } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const SECTION_IDS = ["hero", "about", "products", "contact"] as const;

export function Navbar({
  locale,
  theme,
  t,
}: {
  locale: Locale;
  theme: Theme;
  t: UITranslations;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const navLinks = useMemo(
    () =>
      [
        { label: t.nav.about, href: "#about", section: "about" as const },
        { label: t.nav.products, href: "#products", section: "products" as const },
        { label: t.nav.projects, href: "/projects" as const, section: null },
        { label: t.nav.blog, href: "/blog" as const, section: null },
        { label: t.nav.contact, href: "#contact", section: "contact" as const },
      ] as const,
    [t.nav]
  );

  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
    if (pathname !== "/") return;
    const y = window.scrollY + 120;
    for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
      const id = SECTION_IDS[i];
      const el = document.getElementById(id);
      if (!el) continue;
      if (y >= el.offsetTop) {
        setActiveSection(id);
        return;
      }
    }
    setActiveSection("hero");
  }, [pathname]);

  useEffect(() => {
    const id = requestAnimationFrame(() => updateScroll());
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", updateScroll);
    };
  }, [updateScroll]);

  function sectionHref(hash: string): string {
    return pathname === "/" ? hash : `/${hash}`;
  }

  function isActive(item: (typeof navLinks)[number]): boolean {
    if (item.href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
    if (item.href === "/projects") return pathname === "/projects" || pathname.startsWith("/projects/");
    if (item.section) return pathname === "/" && activeSection === item.section;
    return false;
  }

  function linkClass(item: (typeof navLinks)[number]) {
    const active = isActive(item);
    return `relative inline-block pb-0.5 text-sm font-normal transition-colors duration-200 ${
      active ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--accent-hover)]"
    } after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--accent)] after:transition-transform after:duration-200 ${
      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;
  }

  return (
    <nav
      className={`fixed top-0 z-[100] flex h-16 w-full items-center justify-between px-6 transition-[background,border,backdrop-filter,box-shadow] duration-300 md:h-[72px] md:px-12 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--glass)_95%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href={sectionHref("#hero")}
        className="group cursor-pointer font-[family-name:var(--font-syne)] text-[22px] font-extrabold tracking-tight text-[var(--accent)] transition-transform duration-200 hover:scale-[1.02]"
        onClick={() => setMenuOpen(false)}
      >
        mohamed<span className="text-[var(--text-primary)]">builds</span>
      </a>

      <div className="hidden items-center gap-5 md:flex">
        <div className="flex items-center gap-9">
          {navLinks.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.href} href={sectionHref(item.href)} className={linkClass(item)}>
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={linkClass(item)}>
                {item.label}
              </Link>
            )
          )}
        </div>
        <LanguageToggle locale={locale} />
        <ThemeToggle initial={theme} />
        <a
          href={sectionHref("#contact")}
          className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,0.2)] transition duration-200 hover:-translate-y-px hover:bg-[var(--accent-hover)]"
        >
          {t.nav.getInTouch}
        </a>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <LanguageToggle locale={locale} />
        <ThemeToggle initial={theme} />
        <button
          type="button"
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className="block h-0.5 w-[22px] rounded-sm bg-[var(--text-primary)] transition"
            style={menuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : undefined}
          />
          <span
            className="block h-0.5 w-[22px] rounded-sm bg-[var(--text-primary)] transition"
            style={menuOpen ? { opacity: 0 } : undefined}
          />
          <span
            className="block h-0.5 w-[22px] rounded-sm bg-[var(--text-primary)] transition"
            style={menuOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : undefined}
          />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed left-0 right-0 top-16 z-[99] max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-primary)_96%,transparent)] px-6 py-6 backdrop-blur-xl md:hidden">
          {navLinks.map((item) =>
            item.href.startsWith("#") ? (
              <a
                key={item.href}
                href={sectionHref(item.href)}
                className="block py-3 text-lg font-normal text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-hover)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-lg font-normal text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-hover)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <a
            href={sectionHref("#contact")}
            className="mt-4 block rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-white"
            onClick={() => setMenuOpen(false)}
          >
            {t.nav.getInTouch}
          </a>
        </div>
      )}
    </nav>
  );
}
