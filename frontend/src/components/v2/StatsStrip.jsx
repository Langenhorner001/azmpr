import React from "react";

const stats = [
  { value: "100+", label: "Retailer Partners" },
  { value: "50+", label: "Imported SKUs" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "WhatsApp Support" },
];

const StatsStrip = () => (
  <section
    className="bg-stone-900 dark:bg-stone-950 text-white"
    aria-label="Company stats"
    data-testid="stats-strip"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-center"
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="font-display font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              {s.value}
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
