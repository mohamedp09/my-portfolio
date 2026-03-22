"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Banner } from "@/lib/banners";

type Props = { banners: Banner[] };

export function BannerSlider({ banners }: Props) {
  const [index, setIndex] = useState(0);
  const n = banners.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  useEffect(() => {
    if (n <= 1) return;
    const t = window.setInterval(next, 6500);
    return () => window.clearInterval(t);
  }, [n, next]);

  if (n === 0) return null;

  const b = banners[index];
  const inner = (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--glass)] shadow-[0_20px_50px_rgba(139,92,246,0.08)] md:aspect-[3/1]">
      <Image
        src={b.imageUrl}
        alt={b.title || "Banner"}
        fill
        className="object-cover transition duration-700 ease-out"
        sizes="(max-width: 768px) 100vw, min(1100px, 92vw)"
        priority={index === 0}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/40 to-transparent" />
      {b.title ? (
        <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white drop-shadow md:text-base">
          {b.title}
        </p>
      ) : null}
    </div>
  );

  return (
    <section className="mx-auto max-w-[1100px] px-6 pb-4 pt-2 md:px-12" aria-roledescription="carousel">
      <div className="relative">
        {b.link ? (
          <a href={b.link} target="_blank" rel="noopener noreferrer" className="block outline-none ring-[var(--accent)] focus-visible:ring-2">
            {inner}
          </a>
        ) : (
          inner
        )}

        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border-hover)] bg-[var(--glass)]/90 px-3 py-2 text-sm text-[var(--text-primary)] shadow backdrop-blur transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] md:left-3"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border-hover)] bg-[var(--glass)]/90 px-3 py-2 text-sm text-[var(--text-primary)] shadow backdrop-blur transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] md:right-3"
              aria-label="Next slide"
            >
              ›
            </button>
            <div className="mt-4 flex justify-center gap-2">
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition ${i === index ? "w-8 bg-[var(--accent)]" : "w-2 bg-[var(--text-muted)] hover:bg-[var(--accent)]/50"}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
