import React from "react";
import { Truck, MessageCircle, ShieldCheck, Banknote } from "lucide-react";
import { SpotlightCard } from "../magic/SpotlightCard";

const SPOT = {
  amber: "rgba(245,158,11,0.14)",
  emerald: "rgba(16,185,129,0.14)",
  rose: "rgba(244,63,94,0.12)",
  sky: "rgba(14,165,233,0.13)",
};

const items = [
  {
    icon: Truck,
    title: "Pakistan-wide Delivery",
    desc: "Fast dispatch to retailers across all major cities.",
    tone: "amber",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    desc: "Direct line for quotes, stock checks and bulk orders.",
    tone: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Quality Verified",
    desc: "100% authentic imported stock with full traceability.",
    tone: "rose",
  },
  {
    icon: Banknote,
    title: "Best Wholesale Prices",
    desc: "Transparent bulk pricing — better margins for retailers.",
    tone: "sky",
  },
];

const toneMap = {
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
};

const TrustBadges = () => (
  <section
    className="bg-stone-50 dark:bg-stone-900/40 border-y border-stone-200/70 dark:border-stone-800"
    data-testid="trust-strip"
    aria-label="Why shop with us"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((it) => (
          <SpotlightCard
            as="li"
            key={it.title}
            color={SPOT[it.tone]}
            className="rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:-translate-y-0.5 transition-[transform,border-color] duration-300"
            innerClassName="flex items-start gap-3 sm:gap-4 p-3 sm:p-4"
            data-testid={`trust-tile-${it.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <span
              className={`shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${toneMap[it.tone]} transition-transform duration-300 group-hover/spot:scale-110 group-hover/spot:-rotate-6`}
              aria-hidden
            >
              <it.icon size={19} />
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-[14px] sm:text-[15px] text-stone-900 dark:text-white leading-tight">
                {it.title}
              </div>
              <div className="mt-1 text-[12px] sm:text-[13px] text-stone-500 dark:text-stone-400 leading-snug">
                {it.desc}
              </div>
            </div>
          </SpotlightCard>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustBadges;
