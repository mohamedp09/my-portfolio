"use client";

import { useEffect } from "react";

/** Forces English + LTR for the admin UI while mounted (restores on unmount). */
export function AdminLocaleShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const prevLang = html.getAttribute("lang") ?? "";
    const prevDir = html.getAttribute("dir") ?? "";
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");
    return () => {
      if (prevLang) html.setAttribute("lang", prevLang);
      else html.removeAttribute("lang");
      if (prevDir) html.setAttribute("dir", prevDir);
      else html.removeAttribute("dir");
    };
  }, []);
  return <>{children}</>;
}
