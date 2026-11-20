import React from "react";
import { NumberTicker } from "../magic/NumberTicker";

const stats = [
  { n: 100, suffix: "+", label: "Retailer Partners" },
  { n: 50, suffix: "+", label: "Imported SKUs" },
  { n: 4.9, decimals: 1, suffix: "★", label: "Average Rating" },
  { n: 24, suffix: "/7", label: "WhatsApp Support" },
];

const StatsStrip = () => (
  <section
    className="relative overflow-hidden bg-stone-900 dark:bg-stone-950 text-white"
    aria-label="Company stats"
    data-testid="stats-strip"
  >
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
    />
    <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-center"
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="font-display font-extrabold text-3xl sm:text-5xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              <NumberTicker value={s.n} decimals={s.decimals || 0} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-[12px] sm:text-[13px] uppercase tracking-wide font-medium text-stone-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsStrip;
