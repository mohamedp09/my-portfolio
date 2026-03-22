"use client";

import { AdminLocaleShell } from "@/components/AdminLocaleShell";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  badge?: boolean;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [pendingComments, setPendingComments] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isLogin) return;
    void Promise.resolve().then(() => {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((d: { pendingComments?: number; error?: string }) => {
          if (typeof d.pendingComments === "number") setPendingComments(d.pendingComments);
        })
        .catch(() => {});
    });
  }, [isLogin, pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return <AdminLocaleShell>{children}</AdminLocaleShell>;
  }

  const nav: NavItem[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/posts", label: "Posts" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/banners", label: "Banners" },
    { href: "/admin/comments", label: "Comments", badge: true },
    { href: "/admin/subscribers", label: "Subscribers" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/site-settings", label: "Site Settings" },
    { href: "/admin/account", label: "Account" },
    { href: "/", label: "View site", external: true },
  ];

  function navClass(href: string) {
    const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
    return `rounded-lg px-3 py-2 transition ${active ? "bg-[#8b5cf6]/15 text-[#8b5cf6]" : "text-[#e8e8ef]/65 hover:bg-[#8b5cf6]/10"}`;
  }

  function renderNavLink(item: NavItem) {
    const showBadge = item.badge && pendingComments !== null && pendingComments > 0;
    const inner = (
      <span className="flex items-center gap-2">
        {item.label}
        {showBadge ? (
          <span className="rounded-full bg-[#8b5cf6]/25 px-2 py-0.5 text-[11px] font-semibold text-[#c4b5fd]">
            {pendingComments}
          </span>
        ) : null}
      </span>
    );

    if (item.external) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-3 py-2 text-[#e8e8ef]/65 transition hover:bg-[#8b5cf6]/10"
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={navClass(item.href)}
        onClick={() => setMobileNavOpen(false)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <AdminLocaleShell>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0a0a12] text-[#e8e8ef] md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-[#8b5cf6]/10 bg-[#08080c] px-4 py-6 md:flex">
          <div className="font-[family-name:var(--font-syne)] text-lg font-extrabold text-[#8b5cf6]">
            mohamed<span className="text-[#e8e8ef]">builds</span>
          </div>
          <p className="mt-1 text-xs text-[#e8e8ef]/35">Admin</p>
          <nav className="mt-8 flex flex-col gap-1 text-sm">{nav.map(renderNavLink)}</nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-auto rounded-lg border border-[#8b5cf6]/20 px-3 py-2 text-left text-sm text-[#e8e8ef]/55 transition hover:border-[#8b5cf6]/40"
          >
            Log out
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-40 border-b border-[#8b5cf6]/10 bg-[#08080c]/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-expanded={mobileNavOpen}
                aria-controls="admin-mobile-nav"
                onClick={() => setMobileNavOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#8b5cf6]/20 text-lg leading-none text-[#e8e8ef] transition hover:border-[#8b5cf6]/40"
              >
                <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
                <span aria-hidden>{mobileNavOpen ? "✕" : "☰"}</span>
              </button>
              <span className="font-[family-name:var(--font-syne)] font-bold text-[#8b5cf6]">Admin</span>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-sm text-[#e8e8ef]/55 transition hover:text-[#e8e8ef]"
              >
                Log out
              </button>
            </div>
            {mobileNavOpen ? (
              <>
                <div
                  className="fixed inset-0 top-[57px] z-30 bg-black/50"
                  aria-hidden
                  onClick={() => setMobileNavOpen(false)}
                />
                <nav
                  id="admin-mobile-nav"
                  className="relative z-40 mt-3 max-h-[min(70vh,calc(100dvh-120px))] overflow-y-auto rounded-xl border border-[#8b5cf6]/15 bg-[#0d0b14] p-3 text-sm shadow-xl"
                >
                  <div className="flex flex-col gap-1">{nav.map(renderNavLink)}</div>
                </nav>
              </>
            ) : null}
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-10">{children}</main>
        </div>
      </div>
    </AdminLocaleShell>
  );
}
