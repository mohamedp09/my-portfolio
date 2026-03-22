import type { SiteSettings } from "@/lib/settings";

type Props = {
  hero: SiteSettings["hero"];
  social: SiteSettings["social"];
};

export function Hero({ hero, social }: Props) {
  const stats = hero.stats?.length ? hero.stats : [];

  return (
    <section
      id="hero"
      className="relative mx-auto flex min-h-screen max-w-[1200px] items-center px-6 pb-20 pt-[120px] md:px-12"
    >
      <div className="pointer-events-none absolute -left-[120px] -top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_18%,transparent)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[10%] -right-[60px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_10%,transparent)_0%,transparent_70%)]" />

      <div className="relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{hero.subtitle}</p>
          <h1 className="font-[family-name:var(--font-syne)] text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--text-primary)]">
            {hero.titleLine1}
            <br />
            <span className="text-[var(--accent)]">{hero.titleLine2}</span>
          </h1>
          <p className="mt-6 max-w-[480px] text-lg font-light leading-relaxed text-[var(--text-secondary)]">{hero.description}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#products"
              className="inline-flex rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
            >
              {hero.primaryButtonText}
            </a>
            <a
              href="#contact"
              className="inline-flex rounded-full border border-[var(--border-hover)] bg-transparent px-7 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
            >
              {hero.secondaryButtonText}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {social.map((s) => (
              <a
                key={s.name + s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-2 text-[13px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <span className="text-[13px] font-bold">{s.icon}</span>
                {s.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-8 rounded-[20px] border border-[var(--border)] bg-[var(--glass)] px-9 py-10">
            {stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className={`flex items-baseline gap-4 ${i < stats.length - 1 ? "border-b border-[var(--border)] pb-7" : ""}`}
              >
                <span className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-none text-[var(--accent)]">
                  {stat.value}
                </span>
                <span className="text-sm font-light text-[var(--text-muted)]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
