import type { SocialLink } from "@/lib/settings";
import { formatFooterCopyright } from "@/lib/settings";

export function Footer({
  copyrightTemplate,
  social,
}: {
  copyrightTemplate: string;
  social: SocialLink[];
}) {
  const copyright = formatFooterCopyright(copyrightTemplate);

  return (
    <footer className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-6 py-10 md:px-12">
      <div className="font-[family-name:var(--font-syne)] text-lg font-extrabold text-[var(--accent)]">
        mohamed<span className="text-[var(--text-primary)]">builds</span>
      </div>
      <div className="flex flex-wrap gap-6">
        {social.map((s) => (
          <a
            key={s.name + s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--text-muted)] transition hover:text-[var(--accent)]"
          >
            {s.name}
          </a>
        ))}
      </div>
      <span className="w-full text-center text-[13px] text-[var(--text-muted)] sm:w-auto sm:text-left">{copyright}</span>
    </footer>
  );
}
