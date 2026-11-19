import React from "react";
import { Zap, BadgeCheck, Wallet, Headphones } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "30-second WhatsApp orders",
    desc: "Skip the cart — message us, confirm, get a quote, done. No login, no friction.",
  },
  {
    icon: BadgeCheck,
    title: "Verified imports only",
    desc: "Every SKU sourced through verified channels with traceable batch info.",
  },
  {
    icon: Wallet,
    title: "True wholesale pricing",
    desc: "Bulk-tier pricing tailored for retailers, supermarkets and resellers.",
  },
  {
    icon: Headphones,
    title: "Real human support",
    desc: "WhatsApp & phone support 7 days a week — no ticket queues, no bots.",
  },
];

const WhyAZ = () => (
  <section
    id="why"
    className="bg-stone-50 dark:bg-stone-900/40 py-14 sm:py-20 border-y border-stone-200/70 dark:border-stone-800"
    data-testid="why-section"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[12px] font-bold tracking-wide uppercase text-orange-600 dark:text-amber-400">
          Why AZ Distribution
        </p>
        <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
          Built for{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
            Pakistan&apos;s retailers
          </span>
        </h2>
        <p className="mt-3 text-[14px] sm:text-[15px] text-stone-500 dark:text-stone-400">
          Faster ordering, tighter prices, and a partner who actually picks up
          the phone.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="group p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:shadow-md hover:-translate-y-1 transition-all"
            data-testid={`why-card-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
          >
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-sm group-hover:rotate-3 transition-transform">
              <f.icon size={20} />
            </span>
            <h3 className="mt-4 font-display font-bold text-[16px] text-stone-900 dark:text-white leading-tight">
              {f.title}
            </h3>
            <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyAZ;
