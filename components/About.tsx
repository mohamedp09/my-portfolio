import type { SiteSettings } from "@/lib/settings";

export function About({ about }: { about: SiteSettings["about"] }) {
  const stack = about.techStack?.length ? about.techStack : [];

  return (
    <section id="about" className="mx-auto max-w-[1200px] px-6 py-[100px] md:px-12">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {about.sectionLabel}
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.625rem)] font-extrabold tracking-tight text-[var(--text-primary)]">
            {about.heading}
            <br />
            <span className="text-[var(--accent)]">{about.headingHighlight}</span>
          </h2>
          <p className="mt-6 text-base font-light leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
            {about.bio}
          </p>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--glass)] p-9">
          <h3 className="mb-6 text-lg font-semibold text-[var(--accent)]">Tech Stack</h3>
          {stack.map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between gap-4 py-3.5 text-sm ${i < stack.length - 1 ? "border-b border-[var(--border)]" : ""}`}
            >
              <span className="font-medium text-[var(--text-primary)]">{row.label}</span>
              <span className="text-right font-light text-[var(--text-muted)]">{row.tools}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
