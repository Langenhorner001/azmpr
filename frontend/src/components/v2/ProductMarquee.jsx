import React from "react";
import { ArrowRight } from "lucide-react";
import { Marquee } from "../magic/Marquee";

const CHIP_W = 252;

const fillRow = (arr) => {
  const out = [];
  while (out.length * CHIP_W < 2200) out.push(...arr);
  return out;
};

const Chip = ({ p }) => (
  <a
    href="#products"
    className="flex items-center gap-3 w-[240px] shrink-0 p-2 pr-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/60 transition-colors"
  >
    <img src={p.image_url} alt="" loading="lazy" className="w-14 h-14 shrink-0 rounded-xl object-cover bg-white" />
    <span className="min-w-0">
      <span className="block text-[13px] font-semibold leading-snug text-stone-900 dark:text-white line-clamp-2">{p.product_name}</span>
      <span className="mt-0.5 block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">In stock · Deal on WhatsApp</span>
    </span>
  </a>
);

// Only visible, in-stock products (public API already excludes hidden ones).
const ProductMarquee = ({ products }) => {
  const items = products.filter((p) => p.image_url && !p.hidden && p.stock_status !== "Out of Stock" && p.stock !== 0).slice(0, 24);
  if (items.length < 4) return null;
  const half = Math.ceil(items.length / 2);
  const rows = items.length >= 12 ? [items.slice(0, half), items.slice(half)] : [items];

  return (
    <section className="bg-white dark:bg-stone-950 pt-12 sm:pt-16 overflow-hidden" data-testid="product-marquee">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold tracking-wide uppercase text-orange-600 dark:text-amber-400">Trending right now</p>
          <h2 className="mt-1.5 font-display font-extrabold text-2xl sm:text-3xl text-stone-900 dark:text-white tracking-tight">
            Fresh stock,{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">just landed</span>
          </h2>
        </div>
        <a href="#products" className="group hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-700 dark:text-stone-200 hover:text-orange-600" data-testid="product-marquee-view-all">
          View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
      <div className="space-y-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, i) => (
          <Marquee key={i} reverse={i === 1} duration={55}>
            {fillRow(row).map((p, j) => (
              <Chip key={`${p.id}-${j}`} p={p} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
};

export default ProductMarquee;
