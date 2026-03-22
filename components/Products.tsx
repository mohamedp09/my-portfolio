import type { Product } from "@/lib/products";

export function Products({ products }: { products: Product[] }) {
  const list = [...products].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return (
    <section id="products" className="mx-auto max-w-[1200px] px-6 py-[100px] md:px-12">
      <div className="mb-14">
        <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">What I&apos;ve Built</span>
        <h2 className="mt-3 font-[family-name:var(--font-syne)] text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-[var(--text-primary)]">
          Products
        </h2>
      </div>

      {list.length === 0 ? (
        <p className="text-[var(--text-muted)]">No products to show yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">
          {list.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col rounded-[20px] border border-[var(--border)] bg-[var(--glass)] p-8 transition duration-300 hover:-translate-y-1.5 hover:border-[var(--border-hover)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)]"
            >
              <div className="relative mb-5 text-5xl grayscale-[0.2] transition group-hover:grayscale-0">
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                {product.emoji}
              </div>
              <div className="mb-3 flex items-start justify-between gap-4">
                <h3 className="flex-1 text-[22px] font-bold leading-snug tracking-tight text-[var(--text-primary)]">
                  {product.title}
                </h3>
                <span className="font-[family-name:var(--font-syne)] shrink-0 text-2xl font-extrabold text-[var(--accent)]">
                  {product.price}
                </span>
              </div>
              <p className="mb-5 text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">{product.desc}</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                <span className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]">
                  View on Gumroad →
                </span>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
